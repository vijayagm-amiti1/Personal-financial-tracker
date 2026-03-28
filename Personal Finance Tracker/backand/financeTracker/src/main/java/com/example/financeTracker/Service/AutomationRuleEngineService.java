package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.RequestDTO.TransactionRequest;
import com.example.financeTracker.Entity.AutomationRule;
import java.util.List;
import java.util.UUID;

public interface AutomationRuleEngineService {

    List<AutomationRule> findMatchingRules(UUID userId, TransactionRequest request);
}
