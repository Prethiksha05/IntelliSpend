package com.intellispend.controller;

import com.intellispend.dto.CategoryDto;
import com.intellispend.security.UserPrincipal;
import com.intellispend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getCategories(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(categoryService.getCategoriesForUser(user.getId()));
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody CategoryDto categoryDto) {
        return ResponseEntity.ok(categoryService.createCustomCategory(user.getId(), categoryDto));
    }
}
