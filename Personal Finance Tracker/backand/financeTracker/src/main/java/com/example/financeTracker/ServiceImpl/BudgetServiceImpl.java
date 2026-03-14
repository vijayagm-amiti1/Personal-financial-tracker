package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.Entity.Budget;
import com.example.financeTracker.Repository.BudgetRepository;
import com.example.financeTracker.Service.BudgetService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;

    @Override
    @Transactional
    public Budget saveBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    @Override
    public List<Budget> getBudgetsByUserId(UUID userId) {
        return budgetRepository.findAllByUserId(userId);
    }

    @Override
    public Optional<Budget> getBudgetByIdAndUserId(UUID budgetId, UUID userId) {
        return budgetRepository.findByIdAndUserId(budgetId, userId);
    }

    @Override
    public Optional<Budget> getBudgetByCategoryAndPeriod(UUID userId, UUID categoryId, Integer month, Integer year) {
        return budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(userId, categoryId, month, year);
    }

    @Override
    @Transactional
    public void deleteBudget(UUID budgetId, UUID userId) {
        budgetRepository.findByIdAndUserId(budgetId, userId)
                .ifPresent(budgetRepository::delete);
    }
}
