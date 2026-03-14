package com.example.financeTracker.AOP.Transaction;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class TransactionExceptionAspect {

    @AfterThrowing(
            pointcut = "execution(* com.example.financeTracker.controller.TransactionController.*(..)) || execution(* com.example.financeTracker.ServiceImpl.TransactionServiceImpl.*(..))",
            throwing = "exception")
    public void logTransactionException(JoinPoint joinPoint, Throwable exception) {
        log.error("Transaction flow failed in {}: {}", joinPoint.getSignature().toShortString(), exception.getMessage(), exception);
    }
}
