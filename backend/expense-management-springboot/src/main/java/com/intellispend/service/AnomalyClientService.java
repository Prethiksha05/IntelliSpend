package com.intellispend.service;

import com.intellispend.model.Category;
import com.intellispend.model.Expense;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class AnomalyClientService {

    private final RestTemplate restTemplate;

    @Value("${app.ml-service.url:http://localhost:8000}")
    private String mlServiceUrl;

    public AnomalyClientService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofMillis(2000))
                .setReadTimeout(Duration.ofMillis(3000))
                .build();
    }

    public static class DetectionResult {
        public boolean isAnomaly;
        public BigDecimal score;
        public String severity;
        public String reason;

        public DetectionResult(boolean isAnomaly, BigDecimal score, String severity, String reason) {
            this.isAnomaly = isAnomaly;
            this.score = score;
            this.severity = severity;
            this.reason = reason;
        }
    }

    public DetectionResult evaluateExpense(Expense expense, BigDecimal userMonthlyAverage, BigDecimal categoryMedian) {
        // Try contacting Python FastAPI ML Service
        try {
            String endpoint = mlServiceUrl + "/api/v1/anomaly/detect";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> payload = new HashMap<>();
            payload.put("amount", expense.getAmount());
            payload.put("category", expense.getCategory() != null ? expense.getCategory().getName() : "General");
            payload.put("hour_of_day", expense.getExpenseTime() != null ? expense.getExpenseTime().getHour() : 12);
            payload.put("day_of_week", expense.getExpenseDate() != null ? expense.getExpenseDate().getDayOfWeek().getValue() : 1);
            payload.put("merchant", expense.getMerchant() != null ? expense.getMerchant() : "Unknown");
            payload.put("user_id", expense.getUser().getId());

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                boolean isAnomaly = Boolean.TRUE.equals(body.get("is_anomaly"));
                double scoreVal = body.containsKey("anomaly_score") ? Double.parseDouble(body.get("anomaly_score").toString()) : 0.0;
                String severity = body.getOrDefault("severity", isAnomaly ? "HIGH" : "NORMAL").toString();
                String reason = body.getOrDefault("reason", "Detected by ML Isolation Forest").toString();

                log.info("ML Service anomaly detection returned isAnomaly={} score={}", isAnomaly, scoreVal);
                return new DetectionResult(
                        isAnomaly,
                        BigDecimal.valueOf(scoreVal).setScale(4, RoundingMode.HALF_UP),
                        severity,
                        reason
                );
            }
        } catch (Exception e) {
            log.warn("FastAPI ML service unavailable ({}), executing intelligent local statistical fallback model", e.getMessage());
        }

        // Statistical / Heuristic local intelligent fallback model
        return computeStatisticalAnomaly(expense, userMonthlyAverage, categoryMedian);
    }

    private DetectionResult computeStatisticalAnomaly(Expense expense, BigDecimal userMonthlyAverage, BigDecimal categoryMedian) {
        BigDecimal amount = expense.getAmount() != null ? expense.getAmount() : BigDecimal.ZERO;
        LocalTime time = expense.getExpenseTime() != null ? expense.getExpenseTime() : LocalTime.of(12, 0);

        boolean isLateNight = time.getHour() >= 1 && time.getHour() <= 4;
        BigDecimal threshold = categoryMedian != null && categoryMedian.compareTo(BigDecimal.ZERO) > 0
                ? categoryMedian.multiply(new BigDecimal("3.5"))
                : new BigDecimal("1000.00");

        if (amount.compareTo(new BigDecimal("3000.00")) >= 0) {
            double score = Math.min(0.98, 0.85 + (amount.doubleValue() / 20000.0));
            String reason = String.format("Extreme high-value spike ($%.2f) exceeding standard variance threshold", amount.doubleValue());
            if (isLateNight) {
                reason += String.format(" during unusual midnight window (%02d:%02d)", time.getHour(), time.getMinute());
            }
            return new DetectionResult(true, BigDecimal.valueOf(score).setScale(4, RoundingMode.HALF_UP), "CRITICAL", reason);
        } else if (amount.compareTo(threshold) > 0) {
            double score = Math.min(0.85, 0.65 + (amount.doubleValue() / (threshold.doubleValue() * 3)));
            String reason = String.format("Purchase ($%.2f) is significantly higher than category benchmark ($%.2f)", amount.doubleValue(), categoryMedian.doubleValue());
            return new DetectionResult(true, BigDecimal.valueOf(score).setScale(4, RoundingMode.HALF_UP), "HIGH", reason);
        } else if (isLateNight && amount.compareTo(new BigDecimal("250.00")) > 0) {
            return new DetectionResult(true, new BigDecimal("0.7200"), "MEDIUM",
                    String.format("Uncharacteristic transaction timing at %02d:%02d for $%.2f", time.getHour(), time.getMinute(), amount.doubleValue()));
        }

        return new DetectionResult(false, new BigDecimal("0.0500"), "NORMAL", "Transaction fits routine baseline");
    }
}
