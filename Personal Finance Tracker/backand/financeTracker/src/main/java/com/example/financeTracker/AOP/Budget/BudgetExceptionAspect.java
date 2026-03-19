package com.example.financeTracker.AOP.Budget;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class BudgetExceptionAspect {

    @AfterThrowing(
            pointcut = "execution(* com.example.financeTracker.controller.BudgetController.*(..)) || execution(* com.example.financeTracker.ServiceImpl.BudgetServiceImpl.*(..))",
            throwing = "exception")
    public void logBudgetException(JoinPoint joinPoint, Throwable exception) {
        log.error("Budget flow failed in {}: {}", joinPoint.getSignature().toShortString(), exception.getMessage(), exception);
    }
}
