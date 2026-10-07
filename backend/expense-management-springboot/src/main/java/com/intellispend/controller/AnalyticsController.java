package com.intellispend.controller;

import com.intellispend.dto.DashboardSummaryDto;
import com.intellispend.security.UserPrincipal;
import com.intellispend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(analyticsService.getDashboardSummary(user.getId()));
    }
}
