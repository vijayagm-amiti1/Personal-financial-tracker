package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.RequestDTO.BudgetRequest;
import com.example.financeTracker.DTO.ResponseDTO.BudgetResponse;
import com.example.financeTracker.Entity.Budget;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetService {

    BudgetResponse createBudget(BudgetRequest request, UUID userId);

    BudgetResponse updateBudget(UUID budgetId, BudgetRequest request, UUID userId);

    Budget saveBudget(Budget budget);

    List<BudgetResponse> getBudgetResponsesByUserId(UUID userId);

    BudgetResponse getBudgetResponseById(UUID budgetId, UUID userId);

    List<Budget> getBudgetsByUserId(UUID userId);

    Optional<Budget> getBudgetByIdAndUserId(UUID budgetId, UUID userId);

    Optional<Budget> getBudgetByCategoryAndPeriod(UUID userId, UUID categoryId, Integer month, Integer year);

    void deleteBudget(UUID budgetId, UUID userId);
}
