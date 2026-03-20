package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.Service.AuthMailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthMailServiceImpl implements AuthMailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.support.issue_to_email}")
    private String issueReportToEmail;

    @Override
    public void sendOtpEmail(String toEmail, String displayName, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Verify your Finance Tracker account");
        message.setText("""
                Hi %s,

                Your Finance Tracker OTP is: %s

                This OTP expires in 5 minutes.
                """.formatted(displayName, otp));
        mailSender.send(message);
        log.info("Sent signup OTP email to {}", toEmail);
    }

    @Override
    public void sendResetPasswordEmail(String toEmail, String displayName, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Reset your Finance Tracker password");
        message.setText("""
                Hi %s,

                Use the link below to reset your password:
                %s

                This link expires in 2 minutes.
                """.formatted(displayName, resetLink));
        mailSender.send(message);
        log.info("Sent password reset email to {}", toEmail);
    }

    @Override
    public void sendIssueReportEmail(String reporterEmail,
                                     String displayName,
                                     String subject,
                                     String page,
                                     String messageBody) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(issueReportToEmail);
        message.setReplyTo(reporterEmail);
        message.setSubject("Finance Tracker issue report: " + subject);
        message.setText("""
                New issue report received from Finance Tracker.

                Reporter: %s
                Email: %s
                Page: %s
                Subject: %s

                Issue details:
                %s
                """.formatted(
                displayName,
                reporterEmail,
                page == null || page.isBlank() ? "Not provided" : page,
                subject,
                messageBody
        ));
        mailSender.send(message);
        log.info("Sent issue report email from {} to {}", reporterEmail, issueReportToEmail);
    }

    @Override
    public void sendRecurringReminderEmail(String toEmail,
                                           String displayName,
                                           String recurringTitle,
                                           String frequency,
                                           String dueDate,
                                           String amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Upcoming recurring payment: " + recurringTitle);
        message.setText("""
                Hi %s,

                This is a reminder that your recurring %s entry "%s" is due in 3 days.

                Due date: %s
                Amount: %s

                Finance Tracker sent this because recurring payment email reminders are enabled for your account.
                """.formatted(displayName, frequency, recurringTitle, dueDate, amount));
        mailSender.send(message);
        log.info("Sent recurring reminder email to {}", toEmail);
    }

    @Override
    public void sendRecurringProcessedEmail(String toEmail,
                                            String displayName,
                                            String recurringTitle,
                                            String transactionType,
                                            String processedDate,
                                            String amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Recurring payment processed: " + recurringTitle);
        message.setText("""
                Hi %s,

                Finance Tracker created your recurring %s transaction.

                Title: %s
                Processed on: %s
                Amount: %s

                You are receiving this because recurring payment email notifications are enabled for your account.
                """.formatted(displayName, transactionType, recurringTitle, processedDate, amount));
        mailSender.send(message);
        log.info("Sent recurring processed email to {}", toEmail);
    }

    @Override
    public void sendBudgetThresholdAlertEmail(String toEmail,
                                              String displayName,
                                              String categoryName,
                                              String periodLabel,
                                              String spentAmount,
                                              String budgetAmount,
                                              int thresholdPercent,
                                              String percentUsed) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Budget threshold reached: " + categoryName);
        message.setText("""
                Hi %s,

                Your %s budget has crossed the %d%% alert threshold for %s.

                Spent: %s
                Budget: %s
                Usage: %s%%

                Review the budget in Finance Tracker if you want to adjust upcoming spending.
                """.formatted(displayName, categoryName, thresholdPercent, periodLabel, spentAmount, budgetAmount, percentUsed));
        mailSender.send(message);
        log.info("Sent budget threshold email to {}", toEmail);
    }

    @Override
    public void sendBudgetExceededAlertEmail(String toEmail,
                                             String displayName,
                                             String categoryName,
                                             String periodLabel,
                                             String spentAmount,
                                             String budgetAmount,
                                             String percentUsed) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Budget exceeded: " + categoryName);
        message.setText("""
                Hi %s,

                Your %s budget has been exceeded for %s.

                Spent: %s
                Budget: %s
                Usage: %s%%

                Finance Tracker sent this alert because budget exceeded emails are enabled for your account.
                """.formatted(displayName, categoryName, periodLabel, spentAmount, budgetAmount, percentUsed));
        mailSender.send(message);
        log.info("Sent budget exceeded email to {}", toEmail);
    }

    @Override
    public void sendGoalReachedEmail(String toEmail,
                                     String displayName,
                                     String goalName,
                                     String targetAmount,
                                     String completedAmount,
                                     String targetDate,
                                     boolean completedBeforeTargetDate) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Goal reached: " + goalName);
        message.setText("""
                Hi %s,

                Congratulations. Your goal "%s" has reached its target.

                Target amount: %s
                Current amount: %s
                Target date: %s
                Status: %s

                Finance Tracker sent this because goal email notifications are enabled for your account.
                """.formatted(
                displayName,
                goalName,
                targetAmount,
                completedAmount,
                targetDate == null || targetDate.isBlank() ? "Not set" : targetDate,
                completedBeforeTargetDate ? "Completed on or before target date" : "Completed after target date or without a target date"
        ));
        mailSender.send(message);
        log.info("Sent goal reached email to {}", toEmail);
    }
}
