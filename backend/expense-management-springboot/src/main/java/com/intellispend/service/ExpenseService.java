package com.intellispend.service;

import com.intellispend.dto.ExpenseRequest;
import com.intellispend.dto.ExpenseResponse;
import com.intellispend.model.AnomalyLog;
import com.intellispend.model.Category;
import com.intellispend.model.Expense;
import com.intellispend.model.User;
import com.intellispend.repository.AnomalyLogRepository;
import com.intellispend.repository.CategoryRepository;
import com.intellispend.repository.ExpenseRepository;
import com.intellispend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AnomalyLogRepository anomalyLogRepository;
    private final AnomalyClientService anomalyClientService;

    @Transactional
    public ExpenseResponse createExpense(Long userId, ExpenseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        LocalTime time = request.getExpenseTime() != null ? request.getExpenseTime() : LocalTime.now();

        Expense expense = Expense.builder()
                .user(user)
                .category(category)
                .amount(request.getAmount())
                .expenseDate(request.getExpenseDate())
                .expenseTime(time)
                .title(request.getTitle())
                .description(request.getDescription())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CREDIT_CARD")
                .merchant(request.getMerchant())
                .location(request.getLocation())
                .isRecurring(Boolean.TRUE.equals(request.getIsRecurring()))
                .status("COMPLETED")
                .build();

        // Statistical context for anomaly analysis
        LocalDate startOfMonth = request.getExpenseDate().withDayOfMonth(1);
        LocalDate endOfMonth = request.getExpenseDate().withDayOfMonth(request.getExpenseDate().lengthOfMonth());
        BigDecimal monthlyTotal = expenseRepository.sumTotalByUserIdAndPeriod(userId, startOfMonth, endOfMonth);
        if (monthlyTotal == null) monthlyTotal = BigDecimal.ZERO;

        AnomalyClientService.DetectionResult detection = anomalyClientService.evaluateExpense(
                expense,
                monthlyTotal,
                new BigDecimal("80.00") // standard benchmark median
        );

        expense.setIsAnomaly(detection.isAnomaly);
        expense.setAnomalyScore(detection.score);
        expense.setAnomalySeverity(detection.severity);
        expense.setAnomalyReason(detection.reason);

        Expense saved = expenseRepository.save(expense);

        if (detection.isAnomaly) {
            AnomalyLog anomalyLog = AnomalyLog.builder()
                    .expense(saved)
                    .user(user)
                    .anomalyType(detection.score.compareTo(new BigDecimal("0.85")) >= 0 ? "HIGH_SEVERITY_OUTLIER" : "STATISTICAL_DEVIATION")
                    .score(detection.score)
                    .severity(detection.severity)
                    .explanation(detection.reason)
                    .userFeedback("PENDING")
                    .build();
            anomalyLogRepository.save(anomalyLog);
            log.info("Recorded anomaly log for expense id={}", saved.getId());
        }

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ExpenseResponse> getExpensesPaged(Long userId, Pageable pageable) {
        return expenseRepository.findByUserIdOrderByExpenseDateDescExpenseTimeDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpenses(Long userId) {
        return expenseRepository.findByUserIdOrderByExpenseDateDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAnomalies(Long userId) {
        return expenseRepository.findAnomaliesByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteExpense(Long userId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));

        if (!expense.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized access to expense");
        }
        expenseRepository.delete(expense);
    }

    @Transactional
    public void submitAnomalyFeedback(Long userId, Long anomalyId, String feedback) {
        AnomalyLog logEntry = anomalyLogRepository.findById(anomalyId)
                .orElseThrow(() -> new IllegalArgumentException("Anomaly not found"));

        if (!logEntry.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized access to anomaly");
        }

        logEntry.setUserFeedback(feedback);
        anomalyLogRepository.save(logEntry);
    }

    public ExpenseResponse mapToResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId())
                .categoryId(e.getCategory().getId())
                .categoryName(e.getCategory().getName())
                .categoryColor(e.getCategory().getColorCode())
                .categoryIcon(e.getCategory().getIcon())
                .amount(e.getAmount())
                .expenseDate(e.getExpenseDate())
                .expenseTime(e.getExpenseTime())
                .title(e.getTitle())
                .description(e.getDescription())
                .paymentMethod(e.getPaymentMethod())
                .merchant(e.getMerchant())
                .location(e.getLocation())
                .isAnomaly(e.getIsAnomaly())
                .anomalyScore(e.getAnomalyScore())
                .anomalyReason(e.getAnomalyReason())
                .anomalySeverity(e.getAnomalySeverity())
                .receiptUrl(e.getReceiptUrl())
                .isRecurring(e.getIsRecurring())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
