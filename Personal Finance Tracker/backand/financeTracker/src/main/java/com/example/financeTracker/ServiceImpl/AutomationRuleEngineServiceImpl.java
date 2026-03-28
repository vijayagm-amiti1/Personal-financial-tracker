package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.RequestDTO.TransactionRequest;
import com.example.financeTracker.Entity.AutomationRule;
import com.example.financeTracker.Service.AutomationRuleEngineService;
import com.example.financeTracker.Service.AutomationRuleService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AutomationRuleEngineServiceImpl implements AutomationRuleEngineService {

    private final AutomationRuleService automationRuleService;

    @Override
    public List<AutomationRule> findMatchingRules(UUID userId, TransactionRequest request) {
        return automationRuleService.getEnabledRules(userId).stream()
                .filter(rule -> matches(rule, request))
                .toList();
    }

    private boolean matches(AutomationRule rule, TransactionRequest request) {
        return switch (rule.getConditionField()) {
            case "merchant" -> matchesText(request.getMerchant(), rule.getConditionOperator(), rule.getConditionValue());
            case "payment_method" -> matchesText(request.getPaymentMethod(), rule.getConditionOperator(), rule.getConditionValue());
            case "type" -> matchesText(request.getType(), rule.getConditionOperator(), rule.getConditionValue());
            case "category" -> request.getCategoryId() != null
                    && request.getCategoryId().toString().equalsIgnoreCase(rule.getConditionValue());
            case "amount" -> matchesAmount(request.getAmount(), rule.getConditionOperator(), rule.getConditionValue());
            default -> false;
        };
    }

    private boolean matchesText(String actual, String operator, String expected) {
        if (actual == null || actual.isBlank()) {
            return false;
        }
        String normalizedActual = actual.trim().toLowerCase(Locale.ROOT);
        return switch (operator) {
            case "equals" -> normalizedActual.equals(expected);
            case "contains" -> normalizedActual.contains(expected);
            case "starts_with" -> normalizedActual.startsWith(expected);
            default -> false;
        };
    }

    private boolean matchesAmount(BigDecimal actual, String operator, String expected) {
        if (actual == null) {
            return false;
        }
        BigDecimal expectedValue = new BigDecimal(expected);
        return switch (operator) {
            case "equals" -> actual.compareTo(expectedValue) == 0;
            case "greater_than" -> actual.compareTo(expectedValue) > 0;
            case "less_than" -> actual.compareTo(expectedValue) < 0;
            default -> false;
        };
    }
}
