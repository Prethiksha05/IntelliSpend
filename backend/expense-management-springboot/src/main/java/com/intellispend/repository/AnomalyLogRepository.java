package com.intellispend.repository;

import com.intellispend.model.AnomalyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnomalyLogRepository extends JpaRepository<AnomalyLog, Long> {
    List<AnomalyLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<AnomalyLog> findByExpenseId(Long expenseId);
}
