package com.example.financeTracker.AOP.Notification;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class NotificationExceptionAspect {

    @AfterThrowing(
            pointcut = "execution(* com.example.financeTracker.controller.NotificationController.*(..)) || execution(* com.example.financeTracker.ServiceImpl.NotificationServiceImpl.*(..))",
            throwing = "exception")
    public void logNotificationException(JoinPoint joinPoint, Throwable exception) {
        log.error("Notification flow failed in {}: {}", joinPoint.getSignature().toShortString(), exception.getMessage(), exception);
    }
}
