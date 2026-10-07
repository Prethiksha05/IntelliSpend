package com.intellispend.controller;

import com.intellispend.dto.BudgetDto;
import com.intellispend.security.UserPrincipal;
import com.intellispend.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetDto>> getBudgets(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        LocalDate now = LocalDate.now();
        int m = month != null ? month : now.getMonthValue();
        int y = year != null ? year : now.getYear();
        return ResponseEntity.ok(budgetService.getBudgetsForMonth(user.getId(), m, y));
    }

    @PostMapping
    public ResponseEntity<BudgetDto> setBudget(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody BudgetDto budgetDto) {
        return ResponseEntity.ok(budgetService.setBudget(user.getId(), budgetDto));
    }
}
