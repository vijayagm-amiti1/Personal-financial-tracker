package com.example.financeTracker.AOP.Transaction;

import com.example.financeTracker.Exception.UnauthorizedException;
import com.example.financeTracker.Security.CurrentUserContext;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class TransactionAuthenticationAspect {

    @Before("execution(* com.example.financeTracker.controller.TransactionController.*(..))"
            + " || execution(* com.example.financeTracker.Service.TransactionService.createTransaction(..))"
            + " || execution(* com.example.financeTracker.Service.TransactionService.updateTransaction(..))")
    public void ensureAuthenticatedTransactionAccess(JoinPoint joinPoint) {
        UUID currentUserId = CurrentUserContext.getUserId();
        if (currentUserId == null) {
            throw new UnauthorizedException("User authentication context is missing");
        }
        log.debug("Transaction auth check passed for user {} in {}", currentUserId, joinPoint.getSignature().toShortString());
    }
}
