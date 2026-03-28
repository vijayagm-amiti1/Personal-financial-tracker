package com.example.financeTracker.DTO.ResponseDTO;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutomationRuleResponse {

    private UUID id;
    private UUID userId;
    private String name;
    private boolean enabled;
    private int priority;
    private String conditionField;
    private String conditionOperator;
    private String conditionValue;
    private String actionType;
    private String actionValue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
