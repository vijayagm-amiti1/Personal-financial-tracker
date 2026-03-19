package com.example.financeTracker.AOP.Notification;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class NotificationLoggingAspect {

    @Pointcut("execution(* com.example.financeTracker.controller.NotificationController.*(..))")
    public void notificationControllerMethods() {
    }

    @Pointcut("execution(* com.example.financeTracker.ServiceImpl.NotificationServiceImpl.*(..))")
    public void notificationServiceMethods() {
    }

    @Around("notificationControllerMethods() || notificationServiceMethods()")
    public Object logNotificationFlow(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().toShortString();

        log.info("Entering {}", methodName);
        Object result = joinPoint.proceed();
        log.info("Completed {} in {} ms", methodName, System.currentTimeMillis() - startTime);
        return result;
    }
}
