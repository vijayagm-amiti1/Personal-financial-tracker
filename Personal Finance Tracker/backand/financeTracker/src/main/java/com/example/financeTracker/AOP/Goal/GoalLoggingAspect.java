package com.example.financeTracker.AOP.Goal;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class GoalLoggingAspect {

    @Pointcut("execution(* com.example.financeTracker.controller.GoalController.*(..))")
    public void goalControllerMethods() {
    }

    @Pointcut("execution(* com.example.financeTracker.ServiceImpl.GoalServiceImpl.*(..))")
    public void goalServiceMethods() {
    }

    @Around("goalControllerMethods() || goalServiceMethods()")
    public Object logGoalFlow(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().toShortString();

        log.info("Entering {}", methodName);
        Object result = joinPoint.proceed();
        log.info("Completed {} in {} ms", methodName, System.currentTimeMillis() - startTime);
        return result;
    }
}
