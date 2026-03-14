package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.Entity.Category;
import com.example.financeTracker.Repository.CategoryRepository;
import com.example.financeTracker.Service.CategoryService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public List<Category> getCategoriesByUserId(UUID userId) {
        return categoryRepository.findAllByUserId(userId);
    }

    @Override
    public List<Category> getActiveCategoriesByUserId(UUID userId) {
        return categoryRepository.findAllByUserIdAndIsArchivedFalse(userId);
    }

    @Override
    public Optional<Category> getCategoryByIdAndUserId(UUID categoryId, UUID userId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId);
    }

    @Override
    @Transactional
    public void deleteCategory(UUID categoryId, UUID userId) {
        categoryRepository.findByIdAndUserId(categoryId, userId)
                .ifPresent(categoryRepository::delete);
    }
}
