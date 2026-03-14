package com.example.financeTracker.Service;

import com.example.financeTracker.Entity.RecurringTransaction;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecurringTransactionService {

    RecurringTransaction saveRecurringTransaction(RecurringTransaction recurringTransaction);

    List<RecurringTransaction> getRecurringTransactionsByUserId(UUID userId);

    List<RecurringTransaction> getRecurringTransactionsDueByDate(LocalDate nextRunDate);

    Optional<RecurringTransaction> getRecurringTransactionByIdAndUserId(UUID recurringTransactionId, UUID userId);

    void deleteRecurringTransaction(UUID recurringTransactionId, UUID userId);
}
