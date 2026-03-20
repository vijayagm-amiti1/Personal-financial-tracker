package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.Entity.Budget;
import com.example.financeTracker.Entity.Goal;
import com.example.financeTracker.Entity.RecurringTransaction;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Service.AuthMailService;
import com.example.financeTracker.Service.NotificationEmailService;
import com.example.financeTracker.Service.UserSettingsService;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationEmailServiceImpl implements NotificationEmailService {

    private static final String EMAIL_ENABLED = "allowSendEmailNotification";
    private static final String BUDGET_THRESHOLD_ENABLED = "allowBudgetThresholdAlert";
    private static final String BUDGET_EXCEEDED_ENABLED = "allowBudgetExceededAlert";
    private static final String GOAL_ENABLED = "allowGoalNotification";
    private static final String GOAL_COMPLETION_BEFORE_TARGET_ENABLED = "allowGoalCompletionBeforeTargetDateNotification";

    private final UserSettingsService userSettingsService;
    private final AuthMailService authMailService;

    @Override
    public void sendRecurringReminderIfEnabled(User user, RecurringTransaction recurringTransaction) {
        if (!isEnabled(user, EMAIL_ENABLED)) {
            return;
        }

        runSafely(() -> authMailService.sendRecurringReminderEmail(
                user.getEmail(),
                getDisplayName(user),
                recurringTransaction.getTitle(),
                recurringTransaction.getFrequency(),
                String.valueOf(recurringTransaction.getNextRunDate()),
                formatMoney(recurringTransaction.getAmount())
        ), user.getId(), "recurring reminder");
    }

    @Override
    public void sendRecurringProcessedIfEnabled(User user, RecurringTransaction recurringTransaction, LocalDate processedDate) {
        if (!isEnabled(user, EMAIL_ENABLED)) {
            return;
        }

        runSafely(() -> authMailService.sendRecurringProcessedEmail(
                user.getEmail(),
                getDisplayName(user),
                recurringTransaction.getTitle(),
                recurringTransaction.getType(),
                String.valueOf(processedDate),
                formatMoney(recurringTransaction.getAmount())
        ), user.getId(), "recurring processed");
    }

    @Override
    public void sendBudgetThresholdAlertIfEnabled(User user,
                                                  Budget budget,
                                                  BigDecimal currentMoneySpent,
                                                  int thresholdPercent,
                                                  BigDecimal currentPercent) {
        if (!isEnabled(user, EMAIL_ENABLED) || !isEnabled(user, BUDGET_THRESHOLD_ENABLED)) {
            return;
        }

        runSafely(() -> authMailService.sendBudgetThresholdAlertEmail(
                user.getEmail(),
                getDisplayName(user),
                budget.getCategory().getName(),
                periodLabel(budget),
                formatMoney(currentMoneySpent),
                formatMoney(budget.getAmount()),
                thresholdPercent,
                strip(currentPercent)
        ), user.getId(), "budget threshold");
    }

    @Override
    public void sendBudgetExceededAlertIfEnabled(User user,
                                                 Budget budget,
                                                 BigDecimal currentMoneySpent,
                                                 BigDecimal currentPercent) {
        if (!isEnabled(user, EMAIL_ENABLED) || !isEnabled(user, BUDGET_EXCEEDED_ENABLED)) {
            return;
        }

        runSafely(() -> authMailService.sendBudgetExceededAlertEmail(
                user.getEmail(),
                getDisplayName(user),
                budget.getCategory().getName(),
                periodLabel(budget),
                formatMoney(currentMoneySpent),
                formatMoney(budget.getAmount()),
                strip(currentPercent)
        ), user.getId(), "budget exceeded");
    }

    @Override
    public void sendGoalReachedIfEnabled(User user, Goal goal, boolean completedBeforeTargetDate) {
        if (!isEnabled(user, EMAIL_ENABLED) || !isEnabled(user, GOAL_ENABLED)) {
            return;
        }

        if (completedBeforeTargetDate && !isEnabled(user, GOAL_COMPLETION_BEFORE_TARGET_ENABLED)) {
            return;
        }

        runSafely(() -> authMailService.sendGoalReachedEmail(
                user.getEmail(),
                getDisplayName(user),
                goal.getName(),
                formatMoney(goal.getTargetAmount()),
                formatMoney(goal.getCurrentAmount()),
                goal.getTargetDate() != null ? String.valueOf(goal.getTargetDate()) : "",
                completedBeforeTargetDate
        ), user.getId(), "goal reached");
    }

    private boolean isEnabled(User user, String key) {
        return user != null && user.getId() != null && userSettingsService.isSettingEnabled(user.getId(), key);
    }

    private String getDisplayName(User user) {
        if (user.getDisplayName() != null && !user.getDisplayName().isBlank()) {
            return user.getDisplayName().trim();
        }
        return user.getEmail();
    }

    private String formatMoney(BigDecimal amount) {
        return amount == null ? "0" : amount.stripTrailingZeros().toPlainString();
    }

    private String strip(BigDecimal value) {
        return value == null ? "0" : value.stripTrailingZeros().toPlainString();
    }

    private String periodLabel(Budget budget) {
        return String.format("%02d/%d", budget.getMonth(), budget.getYear());
    }

    private void runSafely(Runnable action, java.util.UUID userId, String emailType) {
        try {
            action.run();
        } catch (RuntimeException exception) {
            log.warn("Skipping {} email for user {} because mail send failed: {}", emailType, userId, exception.getMessage());
        }
    }
}
