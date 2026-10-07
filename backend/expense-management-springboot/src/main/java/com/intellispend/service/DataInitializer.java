package com.intellispend.service;

import com.intellispend.model.*;
import com.intellispend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final AnomalyLogRepository anomalyLogRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void init() {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data injection.");
            return;
        }

        log.info("Seeding IntelliSpend initial demo data for instant showcase...");

        // 1. Create Users
        User alex = User.builder()
                .username("alex_morgan")
                .email("alex@intellispend.io")
                .password(passwordEncoder.encode("Password123!"))
                .firstName("Alex")
                .lastName("Morgan")
                .role(Role.ROLE_USER)
                .currency("USD")
                .monthlyBudgetLimit(new BigDecimal("4500.00"))
                .isActive(true)
                .build();
        userRepository.save(alex);

        User admin = User.builder()
                .username("admin_sarah")
                .email("admin@intellispend.io")
                .password(passwordEncoder.encode("Password123!"))
                .firstName("Sarah")
                .lastName("Chen")
                .role(Role.ROLE_ADMIN)
                .currency("USD")
                .monthlyBudgetLimit(new BigDecimal("10000.00"))
                .isActive(true)
                .build();
        userRepository.save(admin);

        // 2. Default Categories
        Category catFood = categoryRepository.save(Category.builder().name("Food & Dining").colorCode("#10B981").icon("utensils").isSystemDefault(true).build());
        Category catTransit = categoryRepository.save(Category.builder().name("Transportation").colorCode("#3B82F6").icon("car").isSystemDefault(true).build());
        Category catHousing = categoryRepository.save(Category.builder().name("Housing & Utilities").colorCode("#8B5CF6").icon("home").isSystemDefault(true).build());
        Category catEnt = categoryRepository.save(Category.builder().name("Entertainment").colorCode("#EC4899").icon("film").isSystemDefault(true).build());
        Category catShop = categoryRepository.save(Category.builder().name("Shopping & Electronics").colorCode("#F59E0B").icon("shopping-bag").isSystemDefault(true).build());
        Category catHealth = categoryRepository.save(Category.builder().name("Health & Wellness").colorCode("#06B6D4").icon("heart-pulse").isSystemDefault(true).build());
        Category catEdu = categoryRepository.save(Category.builder().name("Education & Work").colorCode("#6366F1").icon("book-open").isSystemDefault(true).build());
        Category catTravel = categoryRepository.save(Category.builder().name("Travel & Flights").colorCode("#14B8A6").icon("plane").isSystemDefault(true).build());

        // 3. Budgets for Current Period
        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        budgetRepository.save(Budget.builder().user(alex).category(null).monthlyLimit(new BigDecimal("4500.00")).month(month).year(year).alertThresholdPercentage(80).build());
        budgetRepository.save(Budget.builder().user(alex).category(catFood).monthlyLimit(new BigDecimal("600.00")).month(month).year(year).alertThresholdPercentage(85).build());
        budgetRepository.save(Budget.builder().user(alex).category(catTransit).monthlyLimit(new BigDecimal("300.00")).month(month).year(year).alertThresholdPercentage(80).build());
        budgetRepository.save(Budget.builder().user(alex).category(catHousing).monthlyLimit(new BigDecimal("1700.00")).month(month).year(year).alertThresholdPercentage(95).build());
        budgetRepository.save(Budget.builder().user(alex).category(catEnt).monthlyLimit(new BigDecimal("250.00")).month(month).year(year).alertThresholdPercentage(80).build());
        budgetRepository.save(Budget.builder().user(alex).category(catShop).monthlyLimit(new BigDecimal("650.00")).month(month).year(year).alertThresholdPercentage(80).build());

        // 4. Sample Expenses
        createSampleExpense(alex, catFood, "42.50", now.minusDays(1), LocalTime.of(12, 30), "Trader Joe's Groceries", "Weekly groceries", "DEBIT_CARD", "Trader Joe's", false, "0.0400", "Normal", "NORMAL");
        createSampleExpense(alex, catTransit, "55.00", now.minusDays(2), LocalTime.of(8, 15), "Chevron Gas Station", "Refuel tank", "CREDIT_CARD", "Chevron", false, "0.0600", "Normal", "NORMAL");
        createSampleExpense(alex, catHousing, "1650.00", now.minusDays(5), LocalTime.of(9, 0), "Downtown Apartment Rent", "Monthly lease", "BANK_TRANSFER", "Skyline Mgmt", false, "0.1000", "Recurring Housing", "NORMAL");
        createSampleExpense(alex, catFood, "88.20", now.minusDays(6), LocalTime.of(19, 45), "Trattoria Bistro Dinner", "Team dinner", "CREDIT_CARD", "Trattoria", false, "0.1400", "Normal dining", "NORMAL");
        createSampleExpense(alex, catEnt, "19.99", now.minusDays(8), LocalTime.of(1, 0), "Netflix 4K Ultra", "Monthly subscription", "CREDIT_CARD", "Netflix", false, "0.0200", "Standard subscription", "NORMAL");
        createSampleExpense(alex, catHealth, "75.00", now.minusDays(10), LocalTime.of(11, 0), "Dental Cleaning", "Routine checkup", "DEBIT_CARD", "Dental Clinic", false, "0.1100", "Routine medical", "NORMAL");

        // CRITICAL ANOMALY 1: Midnight Luxury Watch $4,250.00
        Expense anomaly1 = createSampleExpense(alex, catShop, "4250.00", now.minusDays(3), LocalTime.of(3, 14), "Rolex Boutique Chronometer",
                "Flagged high-value transaction at unusual midnight hours", "CREDIT_CARD", "Rolex Official", true, "0.9650",
                "Extreme price deviation (>8.5x mean) & abnormal transaction hour (03:14 AM)", "CRITICAL");

        anomalyLogRepository.save(AnomalyLog.builder()
                .expense(anomaly1)
                .user(alex)
                .anomalyType("AMOUNT_OUTLIER_AND_TIME")
                .score(new BigDecimal("0.9650"))
                .severity("CRITICAL")
                .explanation("Transaction amount $4,250.00 is 12.3x higher than user historical Shopping median ($85.00), executed during low-activity window (03:14 AM).")
                .userFeedback("PENDING")
                .build());

        // HIGH ANOMALY 2: Electronics Spike $2,899.00
        Expense anomaly2 = createSampleExpense(alex, catShop, "2899.00", now.minusDays(7), LocalTime.of(16, 20), "Apple Studio Display Pro",
                "Major electronics equipment purchase", "CREDIT_CARD", "Apple Store", true, "0.8840",
                "Amount 5.4x above category standard deviation", "HIGH");

        anomalyLogRepository.save(AnomalyLog.builder()
                .expense(anomaly2)
                .user(alex)
                .anomalyType("CATEGORY_VOLUME_SPIKE")
                .score(new BigDecimal("0.8840"))
                .severity("HIGH")
                .explanation("Shopping spend exceeded monthly allocated limit in a single swipe ($2,899.00 vs $650.00 budget).")
                .userFeedback("CONFIRMED")
                .build());

        log.info("IntelliSpend showcase seed data initialized successfully! Ready for login: alex_morgan / Password123!");
    }

    private Expense createSampleExpense(User user, Category cat, String amount, LocalDate date, LocalTime time,
                                         String title, String desc, String method, String merchant,
                                         boolean isAnomaly, String score, String reason, String severity) {
        Expense expense = Expense.builder()
                .user(user)
                .category(cat)
                .amount(new BigDecimal(amount))
                .expenseDate(date)
                .expenseTime(time)
                .title(title)
                .description(desc)
                .paymentMethod(method)
                .merchant(merchant)
                .isAnomaly(isAnomaly)
                .anomalyScore(new BigDecimal(score))
                .anomalyReason(reason)
                .anomalySeverity(severity)
                .status("COMPLETED")
                .build();
        return expenseRepository.save(expense);
    }
}
