package com.intellispend.controller;

import com.intellispend.dto.ExpenseRequest;
import com.intellispend.dto.ExpenseResponse;
import com.intellispend.security.UserPrincipal;
import com.intellispend.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.createExpense(user.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAllExpenses(
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(expenseService.getAllExpenses(user.getId()));
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<ExpenseResponse>> getExpensesPaged(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(expenseService.getExpensesPaged(user.getId(), PageRequest.of(page, size)));
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<ExpenseResponse>> getAnomalies(
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(expenseService.getAnomalies(user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        expenseService.deleteExpense(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
