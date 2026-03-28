package com.example.financeTracker.DTO.RequestDTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutomationRuleRequest {

    @NotBlank(message = "name is required")
    private String name;

    private boolean enabled;

    @Min(value = 1, message = "priority must be at least 1")
    @Max(value = 999, message = "priority must be at most 999")
    private int priority;

    @NotBlank(message = "conditionField is required")
    private String conditionField;

    @NotBlank(message = "conditionOperator is required")
    private String conditionOperator;

    @NotBlank(message = "conditionValue is required")
    private String conditionValue;

    @NotBlank(message = "actionType is required")
    private String actionType;

    @NotBlank(message = "actionValue is required")
    private String actionValue;
}
