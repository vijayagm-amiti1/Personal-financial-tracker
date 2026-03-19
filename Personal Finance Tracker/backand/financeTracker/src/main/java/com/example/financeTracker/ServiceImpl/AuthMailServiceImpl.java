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
}
