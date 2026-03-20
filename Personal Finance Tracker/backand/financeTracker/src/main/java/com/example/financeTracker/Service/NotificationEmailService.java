package com.example.financeTracker.Service;

import com.example.financeTracker.Entity.Budget;
import com.example.financeTracker.Entity.Goal;
import com.example.financeTracker.Entity.RecurringTransaction;
import com.example.financeTracker.Entity.User;
import java.math.BigDecimal;
import java.time.LocalDate;

public interface NotificationEmailService {

    void sendRecurringReminderIfEnabled(User user, RecurringTransaction recurringTransaction);

    void sendRecurringProcessedIfEnabled(User user, RecurringTransaction recurringTransaction, LocalDate processedDate);

    void sendBudgetThresholdAlertIfEnabled(User user, Budget budget, BigDecimal currentMoneySpent, int thresholdPercent, BigDecimal currentPercent);

    void sendBudgetExceededAlertIfEnabled(User user, Budget budget, BigDecimal currentMoneySpent, BigDecimal currentPercent);

    void sendGoalReachedIfEnabled(User user, Goal goal, boolean completedBeforeTargetDate);
}
