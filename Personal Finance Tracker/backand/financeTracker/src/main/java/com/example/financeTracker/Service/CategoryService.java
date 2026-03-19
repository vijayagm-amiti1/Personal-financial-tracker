package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.RequestDTO.CategoryRequest;
import com.example.financeTracker.DTO.ResponseDTO.CategoryResponse;
import com.example.financeTracker.Entity.Category;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request, UUID userId);

    CategoryResponse updateCategory(UUID categoryId, CategoryRequest request, UUID userId);

    Category saveCategory(Category category);

    List<CategoryResponse> getCategoryResponsesByUserId(UUID userId);

    CategoryResponse getCategoryResponseById(UUID categoryId, UUID userId);

    List<Category> getCategoriesByUserId(UUID userId);

    List<Category> getActiveCategoriesByUserId(UUID userId);

    Optional<Category> getCategoryByIdAndUserId(UUID categoryId, UUID userId);

    void deleteCategory(UUID categoryId, UUID userId);
}
