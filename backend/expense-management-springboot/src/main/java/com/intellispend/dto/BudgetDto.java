package com.intellispend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private BigDecimal monthlyLimit;
    private BigDecimal currentSpent;
    private BigDecimal remaining;
    private Double percentageUsed;
    private Integer month;
    private Integer year;
    private Integer alertThresholdPercentage;
    private Boolean isOverBudget;
}
