package com.intellispend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private BigDecimal totalSpentThisMonth;
    private BigDecimal monthlyBudgetLimit;
    private BigDecimal budgetRemaining;
    private Double budgetUsagePercentage;
    private Long totalTransactions;
    private Long anomalyCount;
    private BigDecimal highestExpenseAmount;
    private String topSpendingCategory;
    private List<CategoryBreakdown> categoryBreakdowns;
    private List<DailySpend> recentDailySpending;
    private List<ExpenseResponse> recentAnomalies;
    private List<ExpenseResponse> recentTransactions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private String category;
        private BigDecimal amount;
        private Double percentage;
        private String colorCode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySpend {
        private String date;
        private BigDecimal amount;
    }
}
