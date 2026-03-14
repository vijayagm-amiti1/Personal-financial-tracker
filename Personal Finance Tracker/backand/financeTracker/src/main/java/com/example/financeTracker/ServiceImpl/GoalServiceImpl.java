package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.Entity.Goal;
import com.example.financeTracker.Repository.GoalRepository;
import com.example.financeTracker.Service.GoalService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;

    @Override
    @Transactional
    public Goal saveGoal(Goal goal) {
        return goalRepository.save(goal);
    }

    @Override
    public List<Goal> getGoalsByUserId(UUID userId) {
        return goalRepository.findAllByUserId(userId);
    }

    @Override
    public Optional<Goal> getGoalByIdAndUserId(UUID goalId, UUID userId) {
        return goalRepository.findByIdAndUserId(goalId, userId);
    }

    @Override
    @Transactional
    public void deleteGoal(UUID goalId, UUID userId) {
        goalRepository.findByIdAndUserId(goalId, userId)
                .ifPresent(goalRepository::delete);
    }
}
