package com.example.financeTracker.AOP.Transaction;

import com.example.financeTracker.Exception.BadRequestException;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Repository.TransactionRepository;
import com.example.financeTracker.Repository.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionReadValidationAspect {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Before("execution(* com.example.financeTracker.Service.TransactionService.getTransactionResponsesByUserId(..)) && args(userId)")
    public void validateGetByUser(JoinPoint joinPoint, UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        log.debug("Validated get transactions by user request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }

    @Before("execution(* com.example.financeTracker.Service.TransactionService.getTransactionResponsesByAccountId(..)) && args(accountId, userId)")
    public void validateGetByAccount(JoinPoint joinPoint, UUID accountId, UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (accountId == null) {
            throw new BadRequestException("accountId is required");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        if (accountRepository.findByIdAndUserId(accountId, userId).isEmpty()) {
            throw new ResourceNotFoundException("Account not found for this user");
        }
        log.debug("Validated get transactions by account request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }

    @Before("execution(* com.example.financeTracker.Service.TransactionService.getTransactionResponseById(..)) && args(transactionId, userId)")
    public void validateGetByTransactionId(JoinPoint joinPoint, UUID transactionId, UUID userId) {
        if (userId == null) {
            throw new BadRequestException("userId is required");
        }
        if (transactionId == null) {
            throw new BadRequestException("transactionId is required");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        if (transactionRepository.findByIdAndUserId(transactionId, userId).isEmpty()) {
            throw new ResourceNotFoundException("Transaction not found for this user");
        }
        log.debug("Validated get transaction by id request for user {} in {}", userId, joinPoint.getSignature().toShortString());
    }
}
