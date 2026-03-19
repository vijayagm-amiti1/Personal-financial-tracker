package com.example.financeTracker.Service;

public interface AuthMailService {

    void sendOtpEmail(String toEmail, String displayName, String otp);

    void sendResetPasswordEmail(String toEmail, String displayName, String resetLink);

    void sendIssueReportEmail(String fromEmail, String displayName, String subject, String page, String message);
}
