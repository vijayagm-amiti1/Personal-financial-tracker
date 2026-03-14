package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.Entity.RecurringTransaction;
import com.example.financeTracker.Repository.RecurringTransactionRepository;
import com.example.financeTracker.Service.RecurringTransactionService;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecurringTransactionServiceImpl implements RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;

    @Override
    @Transactional
    public RecurringTransaction saveRecurringTransaction(RecurringTransaction recurringTransaction) {
        return recurringTransactionRepository.save(recurringTransaction);
    }

    @Override
    public List<RecurringTransaction> getRecurringTransactionsByUserId(UUID userId) {
        return recurringTransactionRepository.findAllByUserId(userId);
    }

    @Override
    public List<RecurringTransaction> getRecurringTransactionsDueByDate(LocalDate nextRunDate) {
        return recurringTransactionRepository.findAllByNextRunDateLessThanEqual(nextRunDate);
    }

    @Override
    public Optional<RecurringTransaction> getRecurringTransactionByIdAndUserId(UUID recurringTransactionId, UUID userId) {
        return recurringTransactionRepository.findByIdAndUserId(recurringTransactionId, userId);
    }

    @Override
    @Transactional
    public void deleteRecurringTransaction(UUID recurringTransactionId, UUID userId) {
        recurringTransactionRepository.findByIdAndUserId(recurringTransactionId, userId)
                .ifPresent(recurringTransactionRepository::delete);
    }
}
