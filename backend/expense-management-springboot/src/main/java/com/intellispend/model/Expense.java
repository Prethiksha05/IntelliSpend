package com.intellispend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "expense_time")
    @Builder.Default
    private LocalTime expenseTime = LocalTime.NOON;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "payment_method", length = 30)
    @Builder.Default
    private String paymentMethod = "CREDIT_CARD";

    @Column(length = 100)
    private String merchant;

    @Column(length = 100)
    private String location;

    @Column(name = "is_anomaly")
    @Builder.Default
    private Boolean isAnomaly = false;

    @Column(name = "anomaly_score", precision = 5, scale = 4)
    @Builder.Default
    private BigDecimal anomalyScore = BigDecimal.ZERO;

    @Column(name = "anomaly_reason", length = 255)
    private String anomalyReason;

    @Column(name = "anomaly_severity", length = 20)
    @Builder.Default
    private String anomalySeverity = "NORMAL";

    @Column(name = "receipt_url", length = 255)
    private String receiptUrl;

    @Column(name = "is_recurring")
    @Builder.Default
    private Boolean isRecurring = false;

    @Column(length = 20)
    @Builder.Default
    private String status = "COMPLETED";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
