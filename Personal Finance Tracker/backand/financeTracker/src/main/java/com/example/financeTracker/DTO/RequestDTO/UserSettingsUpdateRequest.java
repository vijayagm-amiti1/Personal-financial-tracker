package com.example.financeTracker.DTO.RequestDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserSettingsUpdateRequest(
        @NotBlank @Size(max = 120) String displayName,
        boolean allowSendEmailNotification,
        boolean allowBudgetThresholdAlert,
        boolean allowBudgetExceededAlert,
        boolean allowGoalNotification,
        boolean allowGoalCompletionBeforeTargetDateNotification,
        boolean allowGoalMissedTargetDateNotification,
        boolean allowMonthlyBudgetReport,
        boolean navbarVerticalEnabled
) {
}
