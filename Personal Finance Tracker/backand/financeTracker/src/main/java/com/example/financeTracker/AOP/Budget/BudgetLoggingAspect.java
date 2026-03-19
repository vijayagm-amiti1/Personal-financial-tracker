package com.example.financeTracker.AOP.Budget;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class BudgetLoggingAspect {

    @Pointcut("execution(* com.example.financeTracker.controller.BudgetController.*(..))")
    public void budgetControllerMethods() {
    }

    @Pointcut("execution(* com.example.financeTracker.ServiceImpl.BudgetServiceImpl.*(..))")
    public void budgetServiceMethods() {
    }

    @Around("budgetControllerMethods() || budgetServiceMethods()")
    public Object logBudgetFlow(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().toShortString();

        log.info("Entering {}", methodName);
        Object result = joinPoint.proceed();
        log.info("Completed {} in {} ms", methodName, System.currentTimeMillis() - startTime);
        return result;
    }
}
