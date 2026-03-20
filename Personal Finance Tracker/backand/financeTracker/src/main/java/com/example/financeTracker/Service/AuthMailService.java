package com.example.financeTracker.Service;

public interface AuthMailService {

    void sendOtpEmail(String toEmail, String displayName, String otp);

    void sendResetPasswordEmail(String toEmail, String displayName, String resetLink);

    void sendIssueReportEmail(String fromEmail, String displayName, String subject, String page, String message);

    void sendRecurringReminderEmail(String toEmail, String displayName, String recurringTitle, String frequency, String dueDate, String amount);

    void sendRecurringProcessedEmail(String toEmail, String displayName, String recurringTitle, String transactionType, String processedDate, String amount);

    void sendBudgetThresholdAlertEmail(String toEmail, String displayName, String categoryName, String periodLabel, String spentAmount, String budgetAmount, int thresholdPercent, String percentUsed);

    void sendBudgetExceededAlertEmail(String toEmail, String displayName, String categoryName, String periodLabel, String spentAmount, String budgetAmount, String percentUsed);

    void sendGoalReachedEmail(String toEmail, String displayName, String goalName, String targetAmount, String completedAmount, String targetDate, boolean completedBeforeTargetDate);
}
