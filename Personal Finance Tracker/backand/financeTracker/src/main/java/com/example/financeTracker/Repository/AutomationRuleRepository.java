package com.example.financeTracker.Repository;

import com.example.financeTracker.Entity.AutomationRule;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AutomationRuleRepository extends JpaRepository<AutomationRule, UUID> {

    List<AutomationRule> findAllByUserIdOrderByPriorityAscCreatedAtAsc(UUID userId);

    List<AutomationRule> findAllByUserIdAndEnabledTrueOrderByPriorityAscCreatedAtAsc(UUID userId);

    Optional<AutomationRule> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndConditionFieldAndConditionOperatorAndConditionValueAndActionType(
            UUID userId,
            String conditionField,
            String conditionOperator,
            String conditionValue,
            String actionType);
}
