package com.intellispend.service;

import com.intellispend.dto.CategoryDto;
import com.intellispend.model.Category;
import com.intellispend.model.User;
import com.intellispend.repository.CategoryRepository;
import com.intellispend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategoriesForUser(Long userId) {
        return categoryRepository.findAllAvailableForUser(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDto createCustomCategory(Long userId, CategoryDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Category category = Category.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .colorCode(dto.getColorCode() != null ? dto.getColorCode() : "#6366F1")
                .icon(dto.getIcon() != null ? dto.getIcon() : "tag")
                .isSystemDefault(false)
                .user(user)
                .build();

        return mapToDto(categoryRepository.save(category));
    }

    public CategoryDto mapToDto(Category c) {
        return CategoryDto.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .colorCode(c.getColorCode())
                .icon(c.getIcon())
                .isSystemDefault(c.getIsSystemDefault())
                .build();
    }
}
