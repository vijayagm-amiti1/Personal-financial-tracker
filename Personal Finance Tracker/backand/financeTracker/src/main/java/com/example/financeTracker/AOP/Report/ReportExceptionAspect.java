package com.example.financeTracker.AOP.Report;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class ReportExceptionAspect {

    @AfterThrowing(
            pointcut = "execution(* com.example.financeTracker.controller.ReportController.*(..)) || execution(* com.example.financeTracker.ServiceImpl.ReportServiceImpl.*(..))",
            throwing = "exception")
    public void logReportException(JoinPoint joinPoint, Throwable exception) {
        log.error("Report flow failed in {}: {}", joinPoint.getSignature().toShortString(), exception.getMessage(), exception);
    }
}
