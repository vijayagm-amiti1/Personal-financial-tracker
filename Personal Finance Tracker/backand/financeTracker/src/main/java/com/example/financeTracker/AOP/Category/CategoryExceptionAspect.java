package com.example.financeTracker.AOP.Category;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class CategoryExceptionAspect {

    @AfterThrowing(
            pointcut = "execution(* com.example.financeTracker.controller.CategoryController.*(..)) || execution(* com.example.financeTracker.ServiceImpl.CategoryServiceImpl.*(..))",
            throwing = "exception")
    public void logCategoryException(JoinPoint joinPoint, Throwable exception) {
        log.error("Category flow failed in {}: {}", joinPoint.getSignature().toShortString(), exception.getMessage(), exception);
    }
}
