package com.intellispend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "anomaly_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnomalyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "anomaly_type", nullable = false, length = 50)
    private String anomalyType;

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal score;

    @Column(nullable = false, length = 20)
    private String severity;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "user_feedback", length = 20)
    @Builder.Default
    private String userFeedback = "PENDING";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
