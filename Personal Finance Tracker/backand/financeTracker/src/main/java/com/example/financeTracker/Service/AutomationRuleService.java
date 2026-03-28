package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.RequestDTO.AutomationRuleRequest;
import com.example.financeTracker.DTO.ResponseDTO.AutomationRuleResponse;
import com.example.financeTracker.Entity.AutomationRule;
import java.util.List;
import java.util.UUID;

public interface AutomationRuleService {

    List<AutomationRuleResponse> getRules(UUID userId);

    AutomationRuleResponse createRule(AutomationRuleRequest request, UUID userId);

    AutomationRuleResponse updateRule(UUID ruleId, AutomationRuleRequest request, UUID userId);

    void deleteRule(UUID ruleId, UUID userId);

    List<AutomationRule> getEnabledRules(UUID userId);
}
