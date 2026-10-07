package com.intellispend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * IntelliSpend — Intelligent Expense Management and Anomaly Detection Platform
 * Main application entry point.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class ExpenseManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpenseManagementApplication.class, args);
    }
}
