package com.intellispend.controller;

import com.intellispend.dto.AnomalyFeedbackRequest;
import com.intellispend.model.AnomalyLog;
import com.intellispend.repository.AnomalyLogRepository;
import com.intellispend.security.UserPrincipal;
import com.intellispend.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anomalies")
@RequiredArgsConstructor
public class AnomalyController {

    private final AnomalyLogRepository anomalyLogRepository;
    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<AnomalyLog>> getUserAnomalies(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(anomalyLogRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<Void> submitFeedback(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id,
            @RequestBody AnomalyFeedbackRequest request) {
        expenseService.submitAnomalyFeedback(user.getId(), id, request.getFeedback());
        return ResponseEntity.ok().build();
    }
}
