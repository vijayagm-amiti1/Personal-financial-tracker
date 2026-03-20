package com.example.financeTracker.DTO.ResponseDTO;

public record UserSettingsResponse(
        String email,
        String displayName,
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
