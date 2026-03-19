package com.example.financeTracker.AOP.Category;

import com.example.financeTracker.DTO.RequestDTO.CategoryRequest;
import com.example.financeTracker.Exception.BadRequestException;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.CategoryRepository;
import com.example.financeTracker.Repository.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class CategoryValidationAspect {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    @Before("(execution(* com.example.financeTracker.Service.CategoryService.createCategory(..)) && args(request, userId))"
            + " || (execution(* com.example.financeTracker.Service.CategoryService.updateCategory(..)) && args(categoryId, request, userId))")
    public void validateCategoryRequest(JoinPoint joinPoint, CategoryRequest request, UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        if (request == null) {
            throw new BadRequestException("Category request cannot be null");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("name is required");
        }
        if (request.getType() == null || request.getType().isBlank()) {
            throw new BadRequestException("type is required");
        }
        if ("updateCategory".equals(joinPoint.getSignature().getName())) {
            UUID categoryId = (UUID) joinPoint.getArgs()[0];
            if (categoryId == null) {
                throw new BadRequestException("categoryId is required");
            }
            if (categoryRepository.findByIdAndUserId(categoryId, userId).isEmpty()) {
                throw new ResourceNotFoundException("Category not found for this user");
            }
        }

        log.debug("Validated category write request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }

    @Before("execution(* com.example.financeTracker.Service.CategoryService.getCategoryResponsesByUserId(..)) && args(userId)")
    public void validateGetCategoriesByUser(JoinPoint joinPoint, UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        log.debug("Validated get categories request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }

    @Before("(execution(* com.example.financeTracker.Service.CategoryService.getCategoryResponseById(..)) && args(categoryId, userId))"
            + " || (execution(* com.example.financeTracker.Service.CategoryService.deleteCategory(..)) && args(categoryId, userId))")
    public void validateCategoryByIdOperations(JoinPoint joinPoint, UUID categoryId, UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (categoryId == null) {
            throw new BadRequestException("categoryId is required");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        if (categoryRepository.findByIdAndUserId(categoryId, userId).isEmpty()) {
            throw new ResourceNotFoundException("Category not found for this user");
        }
        log.debug("Validated category by id request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }
}
