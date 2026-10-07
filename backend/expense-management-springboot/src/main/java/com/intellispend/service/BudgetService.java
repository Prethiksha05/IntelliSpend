package com.intellispend.service;

import com.intellispend.dto.BudgetDto;
import com.intellispend.model.Budget;
import com.intellispend.model.Category;
import com.intellispend.model.User;
import com.intellispend.repository.BudgetRepository;
import com.intellispend.repository.CategoryRepository;
import com.intellispend.repository.ExpenseRepository;
import com.intellispend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    @Transactional(readOnly = true)
    public List<BudgetDto> getBudgetsForMonth(Long userId, Integer month, Integer year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);

        return budgets.stream().map(b -> {
            BigDecimal spent;
            if (b.getCategory() != null) {
                spent = expenseRepository.sumTotalByUserIdAndPeriod(userId, start, end);
                if (spent == null) spent = BigDecimal.ZERO;
            } else {
                spent = expenseRepository.sumTotalByUserIdAndPeriod(userId, start, end);
                if (spent == null) spent = BigDecimal.ZERO;
            }

            BigDecimal limit = b.getMonthlyLimit();
            BigDecimal remaining = limit.subtract(spent);
            double percentage = limit.compareTo(BigDecimal.ZERO) > 0
                    ? spent.divide(limit, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue()
                    : 0.0;

            return BudgetDto.builder()
                    .id(b.getId())
                    .categoryId(b.getCategory() != null ? b.getCategory().getId() : null)
                    .categoryName(b.getCategory() != null ? b.getCategory().getName() : "Total Budget")
                    .monthlyLimit(limit)
                    .currentSpent(spent)
                    .remaining(remaining)
                    .percentageUsed(percentage)
                    .month(month)
                    .year(year)
                    .alertThresholdPercentage(b.getAlertThresholdPercentage())
                    .isOverBudget(spent.compareTo(limit) > 0)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public BudgetDto setBudget(Long userId, BudgetDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
        }

        Budget budget = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                userId, dto.getCategoryId(), dto.getMonth(), dto.getYear()
        ).orElse(Budget.builder()
                .user(user)
                .category(category)
                .month(dto.getMonth())
                .year(dto.getYear())
                .build());

        budget.setMonthlyLimit(dto.getMonthlyLimit());
        budget.setAlertThresholdPercentage(dto.getAlertThresholdPercentage() != null ? dto.getAlertThresholdPercentage() : 80);

        Budget saved = budgetRepository.save(budget);
        return BudgetDto.builder()
                .id(saved.getId())
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getName() : "Total Budget")
                .monthlyLimit(saved.getMonthlyLimit())
                .month(saved.getMonth())
                .year(saved.getYear())
                .alertThresholdPercentage(saved.getAlertThresholdPercentage())
                .build();
    }
}
