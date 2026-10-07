package com.intellispend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseRequest {
    @NotNull
    private Long categoryId;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal amount;

    @NotNull
    private LocalDate expenseDate;

    private LocalTime expenseTime;

    @NotBlank
    private String title;

    private String description;

    private String paymentMethod;

    private String merchant;

    private String location;

    private Boolean isRecurring;
}
