package com.intellispend.repository;

import com.intellispend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    @Query("SELECT c FROM Category c WHERE c.isSystemDefault = true OR (c.user IS NOT NULL AND c.user.id = :userId)")
    List<Category> findAllAvailableForUser(@Param("userId") Long userId);

    List<Category> findByIsSystemDefaultTrue();
}
