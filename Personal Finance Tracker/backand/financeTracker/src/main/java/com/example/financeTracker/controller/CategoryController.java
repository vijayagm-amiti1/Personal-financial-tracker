package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.RequestDTO.CategoryRequest;
import com.example.financeTracker.DTO.ResponseDTO.CategoryResponse;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.CategoryService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;
    private final CurrentUserProvider currentUserProvider;

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request,
                                                           Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received create category request for user {}", userId);
        CategoryResponse response = categoryService.createCategory(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategoriesByUserId(Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received get categories request for user {}", userId);
        List<CategoryResponse> responses = categoryService.getCategoryResponsesByUserId(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable UUID categoryId,
                                                            Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received get category request for user {} and category {}", userId, categoryId);
        CategoryResponse response = categoryService.getCategoryResponseById(categoryId, userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable UUID categoryId,
                                                           @Valid @RequestBody CategoryRequest request,
                                                           Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received update category request for user {} and category {}", userId, categoryId);
        CategoryResponse response = categoryService.updateCategory(categoryId, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID categoryId,
                                               Authentication authentication) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received delete category request for user {} and category {}", userId, categoryId);
        categoryService.deleteCategory(categoryId, userId);
        return ResponseEntity.noContent().build();
    }
}
