package com.example.financeTracker.Service;

import com.example.financeTracker.Entity.Budget;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetService {

    Budget saveBudget(Budget budget);

    List<Budget> getBudgetsByUserId(UUID userId);

    Optional<Budget> getBudgetByIdAndUserId(UUID budgetId, UUID userId);

    Optional<Budget> getBudgetByCategoryAndPeriod(UUID userId, UUID categoryId, Integer month, Integer year);

    void deleteBudget(UUID budgetId, UUID userId);
}
