package com.intellispend.service;

import com.intellispend.dto.DashboardSummaryDto;
import com.intellispend.dto.ExpenseResponse;
import com.intellispend.model.Expense;
import com.intellispend.model.User;
import com.intellispend.repository.ExpenseRepository;
import com.intellispend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final ExpenseService expenseService;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        // Total Spent This Month
        BigDecimal totalSpent = expenseRepository.sumTotalByUserIdAndPeriod(userId, startOfMonth, endOfMonth);
        if (totalSpent == null) totalSpent = BigDecimal.ZERO;

        BigDecimal budgetLimit = user.getMonthlyBudgetLimit() != null ? user.getMonthlyBudgetLimit() : new BigDecimal("3500.00");
        BigDecimal budgetRemaining = budgetLimit.subtract(totalSpent);

        double budgetUsagePercentage = budgetLimit.compareTo(BigDecimal.ZERO) > 0
                ? totalSpent.divide(budgetLimit, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue()
                : 0.0;

        List<Expense> allMonthExpenses = expenseRepository.findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(userId, startOfMonth, endOfMonth);
        long totalTransactions = allMonthExpenses.size();

        // Anomalies
        List<Expense> anomalyExpenses = expenseRepository.findAnomaliesByUserId(userId);
        long anomalyCount = anomalyExpenses.size();

        // Highest Expense
        BigDecimal highestExpense = allMonthExpenses.stream()
                .map(Expense::getAmount)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        // Category Breakdown
        List<Object[]> categoryData = expenseRepository.sumByCategoryForPeriod(userId, startOfMonth, endOfMonth);
        List<DashboardSummaryDto.CategoryBreakdown> breakdowns = new ArrayList<>();
        String topCategory = "None";
        BigDecimal topCatAmount = BigDecimal.ZERO;

        for (Object[] row : categoryData) {
            String catName = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            String color = row[2] != null ? (String) row[2] : "#6366F1";
            double percentage = totalSpent.compareTo(BigDecimal.ZERO) > 0
                    ? amount.divide(totalSpent, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue()
                    : 0.0;

            if (amount.compareTo(topCatAmount) > 0) {
                topCatAmount = amount;
                topCategory = catName;
            }

            breakdowns.add(DashboardSummaryDto.CategoryBreakdown.builder()
                    .category(catName)
                    .amount(amount)
                    .percentage(percentage)
                    .colorCode(color)
                    .build());
        }

        // Daily Trend (last 14 days)
        LocalDate fourteenDaysAgo = now.minusDays(14);
        List<Object[]> dailyData = expenseRepository.sumDailyByPeriod(userId, fourteenDaysAgo, now);
        List<DashboardSummaryDto.DailySpend> dailySpends = new ArrayList<>();
        for (Object[] row : dailyData) {
            LocalDate date = (LocalDate) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            dailySpends.add(DashboardSummaryDto.DailySpend.builder()
                    .date(date.toString())
                    .amount(amount)
                    .build());
        }

        // Recent Transactions (top 5)
        List<ExpenseResponse> recent = expenseRepository.findByUserIdOrderByExpenseDateDescExpenseTimeDesc(userId, PageRequest.of(0, 5))
                .stream()
                .map(expenseService::mapToResponse)
                .collect(Collectors.toList());

        // Recent Anomalies (top 5)
        List<ExpenseResponse> topAnomalies = anomalyExpenses.stream()
                .limit(5)
                .map(expenseService::mapToResponse)
                .collect(Collectors.toList());

        return DashboardSummaryDto.builder()
                .totalSpentThisMonth(totalSpent)
                .monthlyBudgetLimit(budgetLimit)
                .budgetRemaining(budgetRemaining)
                .budgetUsagePercentage(budgetUsagePercentage)
                .totalTransactions(totalTransactions)
                .anomalyCount(anomalyCount)
                .highestExpenseAmount(highestExpense)
                .topSpendingCategory(topCategory)
                .categoryBreakdowns(breakdowns)
                .recentDailySpending(dailySpends)
                .recentAnomalies(topAnomalies)
                .recentTransactions(recent)
                .build();
    }
}
