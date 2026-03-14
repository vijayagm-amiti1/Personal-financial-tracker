package com.example.financeTracker.Service;

import com.example.financeTracker.Entity.Category;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryService {

    Category saveCategory(Category category);

    List<Category> getCategoriesByUserId(UUID userId);

    List<Category> getActiveCategoriesByUserId(UUID userId);

    Optional<Category> getCategoryByIdAndUserId(UUID categoryId, UUID userId);

    void deleteCategory(UUID categoryId, UUID userId);
}
