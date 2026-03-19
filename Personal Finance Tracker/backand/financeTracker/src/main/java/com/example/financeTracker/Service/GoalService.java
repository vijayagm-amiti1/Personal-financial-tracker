package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.RequestDTO.GoalContributionRequest;
import com.example.financeTracker.DTO.RequestDTO.GoalRequest;
import com.example.financeTracker.DTO.ResponseDTO.GoalResponse;
import com.example.financeTracker.Entity.Goal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GoalService {

    GoalResponse createGoal(GoalRequest request, UUID userId);

    GoalResponse contributeToGoal(GoalContributionRequest request, UUID userId);

    Goal saveGoal(Goal goal);

    List<Goal> getGoalsByUserId(UUID userId);

    Optional<Goal> getGoalByIdAndUserId(UUID goalId, UUID userId);

    void deleteGoal(UUID goalId, UUID userId);
}
