package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.RequestDTO.AutomationRuleRequest;
import com.example.financeTracker.DTO.ResponseDTO.AutomationRuleResponse;
import com.example.financeTracker.Entity.AutomationRule;
import com.example.financeTracker.Entity.Category;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.BadRequestException;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.AutomationRuleRepository;
import com.example.financeTracker.Repository.CategoryRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.AutomationRuleService;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AutomationRuleServiceImpl implements AutomationRuleService {

    private final AutomationRuleRepository automationRuleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<AutomationRuleResponse> getRules(UUID userId) {
        validateUserExists(userId);
        return automationRuleRepository.findAllByUserIdOrderByPriorityAscCreatedAtAsc(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public AutomationRuleResponse createRule(AutomationRuleRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        NormalizedRule normalizedRule = normalizeAndValidate(request, userId, null);

        AutomationRule savedRule = automationRuleRepository.save(AutomationRule.builder()
                .user(user)
                .name(request.getName().trim())
                .enabled(request.isEnabled())
                .priority(request.getPriority())
                .conditionField(normalizedRule.conditionField)
                .conditionOperator(normalizedRule.conditionOperator)
                .conditionValue(normalizedRule.conditionValue)
                .actionType(normalizedRule.actionType)
                .actionValue(normalizedRule.actionValue)
                .build());

        return mapToResponse(savedRule);
    }

    @Override
    @Transactional
    public AutomationRuleResponse updateRule(UUID ruleId, AutomationRuleRequest request, UUID userId) {
        AutomationRule existingRule = automationRuleRepository.findByIdAndUserId(ruleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found for this user"));
        NormalizedRule normalizedRule = normalizeAndValidate(request, userId, ruleId);

        existingRule.setName(request.getName().trim());
        existingRule.setEnabled(request.isEnabled());
        existingRule.setPriority(request.getPriority());
        existingRule.setConditionField(normalizedRule.conditionField);
        existingRule.setConditionOperator(normalizedRule.conditionOperator);
        existingRule.setConditionValue(normalizedRule.conditionValue);
        existingRule.setActionType(normalizedRule.actionType);
        existingRule.setActionValue(normalizedRule.actionValue);

        return mapToResponse(automationRuleRepository.save(existingRule));
    }

    @Override
    @Transactional
    public void deleteRule(UUID ruleId, UUID userId) {
        AutomationRule rule = automationRuleRepository.findByIdAndUserId(ruleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found for this user"));
        automationRuleRepository.delete(rule);
    }

    @Override
    public List<AutomationRule> getEnabledRules(UUID userId) {
        validateUserExists(userId);
        return automationRuleRepository.findAllByUserIdAndEnabledTrueOrderByPriorityAscCreatedAtAsc(userId);
    }

    private NormalizedRule normalizeAndValidate(AutomationRuleRequest request, UUID userId, UUID currentRuleId) {
        String conditionField = normalizeKey(request.getConditionField());
        String conditionOperator = normalizeKey(request.getConditionOperator());
        String actionType = normalizeKey(request.getActionType());
        String conditionValue = normalizeConditionValue(conditionField, request.getConditionValue());
        String actionValue = request.getActionValue().trim();

        validateCondition(conditionField, conditionOperator, conditionValue);
        actionValue = validateAction(actionType, actionValue, userId);
        validateUniqueness(userId, conditionField, conditionOperator, conditionValue, actionType, currentRuleId);

        return new NormalizedRule(conditionField, conditionOperator, conditionValue, actionType, actionValue);
    }

    private void validateCondition(String conditionField, String conditionOperator, String conditionValue) {
        boolean isStringField = List.of("merchant", "category", "type", "payment_method").contains(conditionField);
        boolean isNumericField = "amount".equals(conditionField);

        if (!isStringField && !isNumericField) {
            throw new BadRequestException("Unsupported condition field");
        }

        if (isStringField && !List.of("equals", "contains", "starts_with").contains(conditionOperator)) {
            throw new BadRequestException("Unsupported operator for string field");
        }

        if (isNumericField && !List.of("equals", "greater_than", "less_than").contains(conditionOperator)) {
            throw new BadRequestException("Unsupported operator for numeric field");
        }

        if (isNumericField) {
            try {
                Double.parseDouble(conditionValue);
            } catch (NumberFormatException exception) {
                throw new BadRequestException("conditionValue must be numeric for amount rules");
            }
        }
    }

    private String validateAction(String actionType, String actionValue, UUID userId) {
        return switch (actionType) {
            case "set_category" -> {
                UUID categoryId;
                try {
                    categoryId = UUID.fromString(actionValue);
                } catch (IllegalArgumentException exception) {
                    throw new BadRequestException("actionValue must be a valid category id");
                }
                Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                        .orElseThrow(() -> new BadRequestException("Category does not belong to this user"));
                yield category.getId().toString();
            }
            case "add_tag" -> {
                if (actionValue.isBlank()) {
                    throw new BadRequestException("actionValue is required for add_tag");
                }
                yield actionValue;
            }
            case "create_alert" -> {
                if (actionValue.isBlank()) {
                    throw new BadRequestException("actionValue is required for create_alert");
                }
                yield actionValue;
            }
            default -> throw new BadRequestException("Unsupported action type");
        };
    }

    private void validateUniqueness(UUID userId,
                                    String conditionField,
                                    String conditionOperator,
                                    String conditionValue,
                                    String actionType,
                                    UUID currentRuleId) {
        List<AutomationRule> existingRules = automationRuleRepository.findAllByUserIdOrderByPriorityAscCreatedAtAsc(userId);
        boolean conflict = existingRules.stream()
                .filter(rule -> currentRuleId == null || !rule.getId().equals(currentRuleId))
                .anyMatch(rule ->
                        rule.getConditionField().equals(conditionField)
                                && rule.getConditionOperator().equals(conditionOperator)
                                && rule.getConditionValue().equals(conditionValue)
                                && rule.getActionType().equals(actionType));

        if (conflict) {
            throw new BadRequestException("A rule with the same condition and action type already exists");
        }
    }

    private void validateUserExists(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
    }

    private String normalizeKey(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeConditionValue(String conditionField, String value) {
        String trimmed = value == null ? "" : value.trim();
        if (List.of("merchant", "category", "type", "payment_method").contains(conditionField)) {
            return trimmed.toLowerCase(Locale.ROOT);
        }
        return trimmed;
    }

    private AutomationRuleResponse mapToResponse(AutomationRule rule) {
        return AutomationRuleResponse.builder()
                .id(rule.getId())
                .userId(rule.getUser().getId())
                .name(rule.getName())
                .enabled(rule.isEnabled())
                .priority(rule.getPriority())
                .conditionField(rule.getConditionField())
                .conditionOperator(rule.getConditionOperator())
                .conditionValue(rule.getConditionValue())
                .actionType(rule.getActionType())
                .actionValue(rule.getActionValue())
                .createdAt(rule.getCreatedAt())
                .updatedAt(rule.getUpdatedAt())
                .build();
    }

    private record NormalizedRule(
            String conditionField,
            String conditionOperator,
            String conditionValue,
            String actionType,
            String actionValue
    ) {
    }
}
