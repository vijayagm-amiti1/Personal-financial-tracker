package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.RequestDTO.CategoryRequest;
import com.example.financeTracker.DTO.ResponseDTO.CategoryResponse;
import com.example.financeTracker.Entity.Category;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.CategoryRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.CategoryService;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, UUID userId) {
        User user = getRequiredUser(userId);
        Category category = Category.builder()
                .user(user)
                .name(request.getName())
                .type(request.getType().trim().toLowerCase())
                .color(request.getColor())
                .icon(request.getIcon())
                .isArchived(Boolean.TRUE.equals(request.getIsArchived()))
                .build();

        Category savedCategory = categoryRepository.save(category);
        log.info("Created category {} for user {}", savedCategory.getId(), userId);
        return mapToResponse(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(UUID categoryId, CategoryRequest request, UUID userId) {
        Category existingCategory = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found for this user"));

        existingCategory.setName(request.getName());
        existingCategory.setType(request.getType().trim().toLowerCase());
        existingCategory.setColor(request.getColor());
        existingCategory.setIcon(request.getIcon());
        existingCategory.setIsArchived(Boolean.TRUE.equals(request.getIsArchived()));

        Category updatedCategory = categoryRepository.save(existingCategory);
        log.info("Updated category {} for user {}", updatedCategory.getId(), userId);
        return mapToResponse(updatedCategory);
    }

    @Override
    @Transactional
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public List<CategoryResponse> getCategoryResponsesByUserId(UUID userId) {
        List<Category> categories = categoryRepository.findAllByUserId(userId);
        List<CategoryResponse> responses = new ArrayList<>();
        for (Category category : categories) {
            responses.add(mapToResponse(category));
        }
        return responses;
    }

    @Override
    public CategoryResponse getCategoryResponseById(UUID categoryId, UUID userId) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found for this user"));
        return mapToResponse(category);
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
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found for this user"));
        categoryRepository.delete(category);
        log.info("Deleted category {} for user {}", categoryId, userId);
    }

    private User getRequiredUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .userId(category.getUser() != null ? category.getUser().getId() : null)
                .name(category.getName())
                .type(category.getType())
                .color(category.getColor())
                .icon(category.getIcon())
                .isArchived(category.getIsArchived())
                .build();
    }
}
