package com.intellispend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private LocalTime expenseTime;
    private String title;
    private String description;
    private String paymentMethod;
    private String merchant;
    private String location;
    private Boolean isAnomaly;
    private BigDecimal anomalyScore;
    private String anomalyReason;
    private String anomalySeverity;
    private String receiptUrl;
    private Boolean isRecurring;
    private String status;
    private LocalDateTime createdAt;
}
