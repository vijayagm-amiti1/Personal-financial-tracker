package com.example.financeTracker.AOP.Report;

import com.example.financeTracker.Exception.BadRequestException;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Repository.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class ReportValidationAspect {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    @Before("(execution(* com.example.financeTracker.Service.ReportService.getMonthlyDailyReport(..)) && args(userId, accountId, month, year))"
            + " || (execution(* com.example.financeTracker.Service.ReportService.getMonthlyCategorySpendingReport(..)) && args(userId, accountId, month, year))")
    public void validateReportRequest(JoinPoint joinPoint, UUID userId, UUID accountId, int month, int year) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (accountId == null) {
            throw new BadRequestException("accountId is required");
        }
        if (month < 1 || month > 12) {
            throw new BadRequestException("month must be between 1 and 12");
        }
        if (year < 2000) {
            throw new BadRequestException("year must be valid");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        if (accountRepository.findByIdAndUserId(accountId, userId).isEmpty()) {
            throw new ResourceNotFoundException("Account not found for this user");
        }

        log.debug("Validated report request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }
}
