package com.example.financeTracker.AOP.Goal;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class GoalExceptionAspect {

    @AfterThrowing(
            pointcut = "execution(* com.example.financeTracker.controller.GoalController.*(..)) || execution(* com.example.financeTracker.ServiceImpl.GoalServiceImpl.*(..))",
            throwing = "exception")
    public void logGoalException(JoinPoint joinPoint, Throwable exception) {
        log.error("Goal flow failed in {}: {}", joinPoint.getSignature().toShortString(), exception.getMessage(), exception);
    }
}
