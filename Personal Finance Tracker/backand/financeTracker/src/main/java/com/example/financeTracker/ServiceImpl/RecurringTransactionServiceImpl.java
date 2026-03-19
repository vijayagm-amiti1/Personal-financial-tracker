package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.RequestDTO.RecurringTransactionRequest;
import com.example.financeTracker.DTO.RequestDTO.TransactionRequest;
import com.example.financeTracker.DTO.ResponseDTO.RecurringTransactionResponse;
import com.example.financeTracker.Entity.Account;
import com.example.financeTracker.Entity.Category;
import com.example.financeTracker.Entity.NotificationType;
import com.example.financeTracker.Entity.RecurringTransaction;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Repository.CategoryRepository;
import com.example.financeTracker.Repository.RecurringTransactionRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.NotificationService;
import com.example.financeTracker.Service.RecurringTransactionService;
import com.example.financeTracker.Service.TransactionService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class RecurringTransactionServiceImpl implements RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final TransactionService transactionService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public RecurringTransactionResponse createRecurringTransaction(RecurringTransactionRequest request, UUID userId) {
        User user = getRequiredUser(userId);
        Category category = getRequiredCategory(request.getCategoryId(), userId);
        Account account = getRequiredAccount(request.getAccountId(), userId);

        RecurringTransaction recurringTransaction = RecurringTransaction.builder()
                .user(user)
                .title(request.getTitle().trim())
                .type(request.getType().trim().toLowerCase(Locale.ROOT))
                .amount(request.getAmount())
                .category(category)
                .account(account)
                .frequency(request.getFrequency().trim().toLowerCase(Locale.ROOT))
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .nextRunDate(request.getStartDate())
                .autoCreateTransaction(request.getAutoCreateTransaction() != null ? request.getAutoCreateTransaction() : Boolean.TRUE)
                .build();

        RecurringTransaction savedRecurringTransaction = recurringTransactionRepository.save(recurringTransaction);
        return mapToResponse(savedRecurringTransaction);
    }

    @Override
    @Transactional
    public RecurringTransactionResponse updateRecurringTransaction(UUID recurringTransactionId,
                                                                  RecurringTransactionRequest request,
                                                                  UUID userId) {
        RecurringTransaction recurringTransaction = recurringTransactionRepository.findByIdAndUserId(recurringTransactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found for this user"));

        recurringTransaction.setTitle(request.getTitle().trim());
        recurringTransaction.setType(request.getType().trim().toLowerCase(Locale.ROOT));
        recurringTransaction.setAmount(request.getAmount());
        recurringTransaction.setCategory(getRequiredCategory(request.getCategoryId(), userId));
        recurringTransaction.setAccount(getRequiredAccount(request.getAccountId(), userId));
        recurringTransaction.setFrequency(request.getFrequency().trim().toLowerCase(Locale.ROOT));
        recurringTransaction.setStartDate(request.getStartDate());
        recurringTransaction.setEndDate(request.getEndDate());
        recurringTransaction.setNextRunDate(request.getStartDate());
        recurringTransaction.setAutoCreateTransaction(request.getAutoCreateTransaction() != null ? request.getAutoCreateTransaction() : Boolean.TRUE);

        return mapToResponse(recurringTransactionRepository.save(recurringTransaction));
    }

    @Override
    @Transactional
    public RecurringTransaction saveRecurringTransaction(RecurringTransaction recurringTransaction) {
        return recurringTransactionRepository.save(recurringTransaction);
    }

    @Override
    public List<RecurringTransactionResponse> getRecurringTransactionResponsesByUserId(UUID userId) {
        List<RecurringTransactionResponse> responses = new ArrayList<>();
        for (RecurringTransaction recurringTransaction : recurringTransactionRepository.findAllByUserId(userId)) {
            responses.add(mapToResponse(recurringTransaction));
        }
        return responses;
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
    public int runDailyJob() {
        LocalDate today = LocalDate.now();
        sendUpcomingRecurringReminders(today);

        List<RecurringTransaction> dueRecurringTransactions =
                recurringTransactionRepository.findAllByNextRunDateLessThanEqual(today);

        int processedTransactions = 0;

        for (RecurringTransaction recurringTransaction : dueRecurringTransactions) {
            try {
                while (!recurringTransaction.getNextRunDate().isAfter(today)
                        && isWithinEndDate(recurringTransaction, recurringTransaction.getNextRunDate())) {
                    if (Boolean.TRUE.equals(recurringTransaction.getAutoCreateTransaction())) {
                        transactionService.createTransaction(TransactionRequest.builder()
                                .type(recurringTransaction.getType())
                                .amount(recurringTransaction.getAmount())
                                .date(recurringTransaction.getNextRunDate())
                                .accountId(recurringTransaction.getAccount().getId())
                                .categoryId(recurringTransaction.getCategory() != null ? recurringTransaction.getCategory().getId() : null)
                                .merchant(recurringTransaction.getTitle())
                                .note("Recurring " + recurringTransaction.getFrequency() + " transaction")
                                .paymentMethod("recurring_auto")
                                .build(), recurringTransaction.getUser().getId());
                        processedTransactions += 1;
                        createRecurringProcessedNotification(recurringTransaction);
                    }

                    LocalDate followingRunDate = calculateNextRunDate(recurringTransaction.getNextRunDate(), recurringTransaction.getFrequency());
                    if (recurringTransaction.getEndDate() != null
                            && followingRunDate.isAfter(recurringTransaction.getEndDate())) {
                        recurringTransactionRepository.delete(recurringTransaction);
                        recurringTransaction = null;
                        break;
                    }

                    recurringTransaction.setNextRunDate(followingRunDate);
                    recurringTransactionRepository.save(recurringTransaction);
                }
            } catch (RuntimeException exception) {
                log.warn("Failed to process recurring transaction {} for user {}: {}",
                        recurringTransaction.getId(), recurringTransaction.getUser().getId(), exception.getMessage());
            }
        }

        return processedTransactions;
    }

    @Override
    @Transactional
    public void deleteRecurringTransaction(UUID recurringTransactionId, UUID userId) {
        recurringTransactionRepository.findByIdAndUserId(recurringTransactionId, userId)
                .ifPresent(recurringTransactionRepository::delete);
    }

    private User getRequiredUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Category getRequiredCategory(UUID categoryId, UUID userId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found for this user"));
    }

    private Account getRequiredAccount(UUID accountId, UUID userId) {
        return accountRepository.findByIdAndUserIdAndIsActiveTrue(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for this user"));
    }

    private boolean isWithinEndDate(RecurringTransaction recurringTransaction, LocalDate candidateRunDate) {
        return recurringTransaction.getEndDate() == null || !candidateRunDate.isAfter(recurringTransaction.getEndDate());
    }

    private LocalDate calculateNextRunDate(LocalDate currentRunDate, String frequency) {
        return switch (frequency) {
            case "daily" -> currentRunDate.plusDays(1);
            case "weekly" -> currentRunDate.plusWeeks(1);
            case "monthly" -> currentRunDate.plusMonths(1);
            case "yearly" -> currentRunDate.plusYears(1);
            default -> throw new ResourceNotFoundException("Unsupported recurring frequency");
        };
    }

    private void sendUpcomingRecurringReminders(LocalDate today) {
        for (RecurringTransaction recurringTransaction : recurringTransactionRepository.findAll()) {
            if (!"monthly".equals(recurringTransaction.getFrequency()) && !"yearly".equals(recurringTransaction.getFrequency())) {
                continue;
            }

            if (recurringTransaction.getNextRunDate() != null
                    && recurringTransaction.getNextRunDate().minusDays(3).isEqual(today)) {
                notificationService.createNotificationIfAbsent(
                        recurringTransaction.getUser().getId(),
                        String.format("Upcoming recurring payment: %s %s",
                                recurringTransaction.getTitle(),
                                recurringTransaction.getNextRunDate()),
                        String.format("%s is due in 3 days on %s for %s.",
                                recurringTransaction.getTitle(),
                                recurringTransaction.getNextRunDate(),
                                recurringTransaction.getAmount()),
                        NotificationType.DAILY_REMINDER);
            }
        }
    }

    private void createRecurringProcessedNotification(RecurringTransaction recurringTransaction) {
        notificationService.createNotificationIfAbsent(
                recurringTransaction.getUser().getId(),
                String.format("Recurring processed: %s %s",
                        recurringTransaction.getTitle(),
                        recurringTransaction.getNextRunDate()),
                String.format("Recurring %s transaction for %s was created on %s.",
                        recurringTransaction.getType(),
                        recurringTransaction.getAmount(),
                        recurringTransaction.getNextRunDate()),
                NotificationType.SYSTEM_UPDATE);
    }

    private RecurringTransactionResponse mapToResponse(RecurringTransaction recurringTransaction) {
        return RecurringTransactionResponse.builder()
                .id(recurringTransaction.getId())
                .userId(recurringTransaction.getUser() != null ? recurringTransaction.getUser().getId() : null)
                .title(recurringTransaction.getTitle())
                .type(recurringTransaction.getType())
                .amount(recurringTransaction.getAmount())
                .categoryId(recurringTransaction.getCategory() != null ? recurringTransaction.getCategory().getId() : null)
                .categoryName(recurringTransaction.getCategory() != null ? recurringTransaction.getCategory().getName() : null)
                .accountId(recurringTransaction.getAccount() != null ? recurringTransaction.getAccount().getId() : null)
                .accountName(recurringTransaction.getAccount() != null ? recurringTransaction.getAccount().getName() : null)
                .frequency(recurringTransaction.getFrequency())
                .startDate(recurringTransaction.getStartDate())
                .endDate(recurringTransaction.getEndDate())
                .nextRunDate(recurringTransaction.getNextRunDate())
                .autoCreateTransaction(recurringTransaction.getAutoCreateTransaction())
                .build();
    }
}
