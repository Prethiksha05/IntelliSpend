package com.intellispend.repository;

import com.intellispend.model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    Page<Expense> findByUserIdOrderByExpenseDateDescExpenseTimeDesc(Long userId, Pageable pageable);

    List<Expense> findByUserIdOrderByExpenseDateDesc(Long userId);

    List<Expense> findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND e.isAnomaly = true ORDER BY e.expenseDate DESC")
    List<Expense> findAnomaliesByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.expenseDate BETWEEN :start AND :end")
    BigDecimal sumTotalByUserIdAndPeriod(@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT e.category.name, SUM(e.amount), e.category.colorCode FROM Expense e WHERE e.user.id = :userId AND e.expenseDate BETWEEN :start AND :end GROUP BY e.category.name, e.category.colorCode")
    List<Object[]> sumByCategoryForPeriod(@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT e.expenseDate, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.expenseDate BETWEEN :start AND :end GROUP BY e.expenseDate ORDER BY e.expenseDate ASC")
    List<Object[]> sumDailyByPeriod(@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
