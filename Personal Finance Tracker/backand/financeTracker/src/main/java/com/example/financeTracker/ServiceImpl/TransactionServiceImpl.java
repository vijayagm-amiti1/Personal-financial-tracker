package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.RequestDTO.TransactionRequest;
import com.example.financeTracker.DTO.ResponseDTO.TransactionResponse;
import com.example.financeTracker.Entity.Account;
import com.example.financeTracker.Entity.Budget;
import com.example.financeTracker.Entity.Category;
import com.example.financeTracker.Entity.NotificationType;
import com.example.financeTracker.Entity.Transaction;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Repository.BudgetRepository;
import com.example.financeTracker.Repository.CategoryRepository;
import com.example.financeTracker.Repository.NotificationRepository;
import com.example.financeTracker.Repository.TransactionRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.NotificationEmailService;
import com.example.financeTracker.Service.NotificationService;
import com.example.financeTracker.Service.TransactionService;
import com.example.financeTracker.Exception.BadRequestException;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Locale;
import java.util.List;
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
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final NotificationEmailService notificationEmailService;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String normalizedType = request.getType().trim().toLowerCase(Locale.ROOT);
        Account account = getRequiredAccount(request.getAccountId(), userId, "accountId");
        Account toAccount = resolveToAccount(request, userId, normalizedType);
        Category category = resolveCategory(request.getCategoryId(), userId);

        Transaction transaction = buildTransaction(user, account, toAccount, category, request, normalizedType);
        applyTransactionEffect(transaction, true);
        applyBudgetImpact(transaction, transaction.getAmount());
        persistTouchedAccounts(account, toAccount);
        Transaction savedTransaction = transactionRepository.save(transaction);

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            log.info("Transaction {} received tags {} but tags are not persisted in the current schema",
                    savedTransaction.getId(), request.getTags());
        }

        log.info("Created {} transaction {} for user {}", normalizedType, savedTransaction.getId(), userId);
        return mapToResponse(savedTransaction);
    }

    @Override
    @Transactional
    public TransactionResponse updateTransaction(UUID transactionId, TransactionRequest request, UUID userId) {
        Transaction existingTransaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found for this user"));

        String normalizedType = request.getType().trim().toLowerCase(Locale.ROOT);
        Account newAccount = getRequiredAccount(request.getAccountId(), userId, "accountId");
        Account newToAccount = resolveToAccount(request, userId, normalizedType);
        Category newCategory = resolveCategory(request.getCategoryId(), userId);
        Account previousAccount = existingTransaction.getAccount();
        Account previousToAccount = existingTransaction.getToAccount();
        Category previousCategory = existingTransaction.getCategory();
        LocalDate previousDate = existingTransaction.getTransactionDate();
        String previousType = existingTransaction.getType();
        BigDecimal previousAmount = existingTransaction.getAmount();

        revertTransactionEffect(existingTransaction);
        revertBudgetImpact(previousType, previousCategory, previousDate, userId, previousAmount);

        existingTransaction.setAccount(newAccount);
        existingTransaction.setToAccount(newToAccount);
        existingTransaction.setCategory(newCategory);
        existingTransaction.setGoal(null);
        existingTransaction.setType(normalizedType);
        existingTransaction.setAmount(request.getAmount());
        existingTransaction.setTransactionDate(request.getDate());
        existingTransaction.setMerchant(request.getMerchant());
        existingTransaction.setNote(request.getNote());
        existingTransaction.setPaymentMethod(request.getPaymentMethod());

        applyTransactionEffect(existingTransaction, false);
        applyBudgetImpact(existingTransaction, existingTransaction.getAmount());
        persistTouchedAccounts(previousAccount, previousToAccount, existingTransaction.getAccount(), existingTransaction.getToAccount());

        Transaction updatedTransaction = transactionRepository.save(existingTransaction);

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            log.info("Transaction {} received tags {} during update but tags are not persisted in the current schema",
                    updatedTransaction.getId(), request.getTags());
        }

        log.info("Updated transaction {} for user {}", updatedTransaction.getId(), userId);
        return mapToResponse(updatedTransaction);
    }

    private Transaction buildTransaction(User user,
                                         Account account,
                                         Account toAccount,
                                         Category category,
                                         TransactionRequest request,
                                         String normalizedType) {
        return Transaction.builder()
                .user(user)
                .account(account)
                .toAccount(toAccount)
                .category(category)
                .goal(null)
                .type(normalizedType)
                .amount(request.getAmount())
                .transactionDate(request.getDate())
                .merchant(request.getMerchant())
                .note(request.getNote())
                .paymentMethod(request.getPaymentMethod())
                .build();
    }

    @Override
    @Transactional
    public Transaction saveTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    @Override
    public List<TransactionResponse> getTransactionResponsesByUserId(UUID userId) {
        validateUserExists(userId);
        List<Transaction> transactions = transactionRepository.findAllByUserIdAndAccountIsActiveTrueOrderByTransactionDateDesc(userId);
        return mapToResponses(transactions);
    }

    @Override
    public List<TransactionResponse> getTransactionResponsesByAccountId(UUID accountId, UUID userId) {
        validateUserExists(userId);
        getRequiredAccount(accountId, userId, "accountId");
        List<Transaction> transactions = transactionRepository
                .findAllByAccountIdAndUserIdAndAccountIsActiveTrueOrderByTransactionDateDesc(accountId, userId);
        return mapToResponses(transactions);
    }

    @Override
    public TransactionResponse getTransactionResponseById(UUID transactionId, UUID userId) {
        validateUserExists(userId);
        Transaction transaction = transactionRepository.findByIdAndUserIdAndAccountIsActiveTrue(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found for this user"));
        return mapToResponse(transaction);
    }

    @Override
    public List<Transaction> getTransactionsByUserId(UUID userId) {
        return transactionRepository.findAllByUserIdAndAccountIsActiveTrueOrderByTransactionDateDesc(userId);
    }

    @Override
    public List<Transaction> getTransactionsByUserIdAndDateRange(UUID userId, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findAllByUserIdAndAccountIsActiveTrueAndTransactionDateBetweenOrderByTransactionDateDesc(
                userId, startDate, endDate);
    }

    @Override
    public Optional<Transaction> getTransactionByIdAndUserId(UUID transactionId, UUID userId) {
        return transactionRepository.findByIdAndUserIdAndAccountIsActiveTrue(transactionId, userId);
    }

    @Override
    @Transactional
    public void deleteTransaction(UUID transactionId, UUID userId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found for this user"));

        revertTransactionEffect(transaction);
        revertBudgetImpact(transaction.getType(), transaction.getCategory(), transaction.getTransactionDate(), userId, transaction.getAmount());
        persistTouchedAccounts(transaction.getAccount(), transaction.getToAccount());
        transactionRepository.delete(transaction);
        log.info("Deleted transaction {} for user {}", transactionId, userId);
    }

    private Category resolveCategory(UUID categoryId, UUID userId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("categoryId does not exist for this user"));
    }

    private Account resolveToAccount(TransactionRequest request, UUID userId, String normalizedType) {
        if (!"transfer".equals(normalizedType)) {
            return null;
        }
        return getRequiredAccount(request.getToAccountId(), userId, "toAccountId");
    }

    private Account getRequiredAccount(UUID accountId, UUID userId, String fieldName) {
        return accountRepository.findByIdAndUserIdAndIsActiveTrue(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(fieldName + " does not exist for this user"));
    }

    private void validateUserExists(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
    }

    private void applyTransactionEffect(Transaction transaction, boolean enforceNonNegativeBalance) {
        switch (transaction.getType()) {
            case "expense" -> {
                transaction.getAccount().setCurrentBalance(
                        transaction.getAccount().getCurrentBalance().subtract(transaction.getAmount()));
                if (enforceNonNegativeBalance) {
                    ensureNonNegativeBalance(transaction.getAccount(), "source");
                }
            }
            case "goal_contribution" -> {
                if (transaction.getToAccount() != null
                        && !transaction.getAccount().getId().equals(transaction.getToAccount().getId())) {
                    transaction.getAccount().setCurrentBalance(
                            transaction.getAccount().getCurrentBalance().subtract(transaction.getAmount()));
                    transaction.getToAccount().setCurrentBalance(
                            transaction.getToAccount().getCurrentBalance().add(transaction.getAmount()));
                    if (enforceNonNegativeBalance) {
                        ensureNonNegativeBalance(transaction.getAccount(), "source");
                    }
                }
            }
            case "income" -> transaction.getAccount().setCurrentBalance(
                    transaction.getAccount().getCurrentBalance().add(transaction.getAmount()));
            case "transfer" -> {
                if (transaction.getToAccount() == null) {
                    throw new BadRequestException("toAccountId is required when type is transfer");
                }
                transaction.getAccount().setCurrentBalance(
                        transaction.getAccount().getCurrentBalance().subtract(transaction.getAmount()));
                transaction.getToAccount().setCurrentBalance(
                        transaction.getToAccount().getCurrentBalance().add(transaction.getAmount()));
                if (enforceNonNegativeBalance) {
                    ensureNonNegativeBalance(transaction.getAccount(), "source");
                }
            }
            default -> throw new BadRequestException("Unsupported transaction type: " + transaction.getType());
        }
    }

    private void revertTransactionEffect(Transaction transaction) {
        switch (transaction.getType()) {
            case "expense" -> transaction.getAccount().setCurrentBalance(
                    transaction.getAccount().getCurrentBalance().add(transaction.getAmount()));
            case "income" -> transaction.getAccount().setCurrentBalance(
                    transaction.getAccount().getCurrentBalance().subtract(transaction.getAmount()));
            case "transfer" -> {
                if (transaction.getToAccount() == null) {
                    throw new BadRequestException("Stored transfer transaction is missing destination account");
                }
                transaction.getAccount().setCurrentBalance(
                        transaction.getAccount().getCurrentBalance().add(transaction.getAmount()));
                transaction.getToAccount().setCurrentBalance(
                        transaction.getToAccount().getCurrentBalance().subtract(transaction.getAmount()));
            }
            case "goal_contribution" -> {
                if (transaction.getToAccount() != null
                        && !transaction.getAccount().getId().equals(transaction.getToAccount().getId())) {
                    transaction.getAccount().setCurrentBalance(
                            transaction.getAccount().getCurrentBalance().add(transaction.getAmount()));
                    transaction.getToAccount().setCurrentBalance(
                            transaction.getToAccount().getCurrentBalance().subtract(transaction.getAmount()));
                }
            }
            default -> throw new BadRequestException("Unsupported transaction type: " + transaction.getType());
        }
    }

    private void ensureNonNegativeBalance(Account account, String accountRole) {
        if (account.getCurrentBalance().signum() < 0) {
            throw new BadRequestException("Insufficient balance in " + accountRole + " account");
        }
    }

    private void applyBudgetImpact(Transaction transaction, BigDecimal deltaAmount) {
        if (!"expense".equalsIgnoreCase(transaction.getType())) {
            return;
        }
        adjustBudgetMoneySpent(
                transaction.getUser().getId(),
                transaction.getCategory(),
                transaction.getTransactionDate(),
                deltaAmount);
    }

    private void revertBudgetImpact(String transactionType,
                                    Category category,
                                    LocalDate transactionDate,
                                    UUID userId,
                                    BigDecimal deltaAmount) {
        if (!"expense".equalsIgnoreCase(transactionType)) {
            return;
        }
        adjustBudgetMoneySpent(userId, category, transactionDate, deltaAmount.negate());
    }

    private void adjustBudgetMoneySpent(UUID userId, Category category, LocalDate transactionDate, BigDecimal deltaAmount) {
        if (category == null || category.getId() == null || transactionDate == null || deltaAmount == null) {
            return;
        }

        budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                        userId,
                        category.getId(),
                        transactionDate.getMonthValue(),
                        transactionDate.getYear())
                .ifPresent(budget -> {
                    BigDecimal previousMoneySpent = budget.getMoneySpent() != null ? budget.getMoneySpent() : BigDecimal.ZERO;
                    BigDecimal nextMoneySpent = previousMoneySpent.add(deltaAmount);
                    if (nextMoneySpent.signum() < 0) {
                        nextMoneySpent = BigDecimal.ZERO;
                    }
                    budget.setMoneySpent(nextMoneySpent);
                    Budget savedBudget = budgetRepository.save(budget);

                    log.info(
                            "Updated budget {} for user {} category {} period {}/{} from {} to {} after transaction delta {}",
                            savedBudget.getId(),
                            userId,
                            savedBudget.getCategory().getName(),
                            savedBudget.getMonth(),
                            savedBudget.getYear(),
                            previousMoneySpent,
                            nextMoneySpent,
                            deltaAmount);

                    if (deltaAmount.signum() > 0) {
                        triggerBudgetNotifications(savedBudget, previousMoneySpent, nextMoneySpent);
                    }
                });

        if (budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                userId,
                category.getId(),
                transactionDate.getMonthValue(),
                transactionDate.getYear()).isEmpty()) {
            log.info(
                    "No budget found for user {} category {} period {}/{} while applying transaction delta {}",
                    userId,
                    category.getName(),
                    transactionDate.getMonthValue(),
                    transactionDate.getYear(),
                    deltaAmount);
        }
    }

    private void triggerBudgetNotifications(Budget budget, BigDecimal previousMoneySpent, BigDecimal currentMoneySpent) {
        if (budget.getUser() == null || budget.getCategory() == null || budget.getAmount() == null) {
            return;
        }

        BigDecimal amount = budget.getAmount();
        if (amount.signum() <= 0) {
            return;
        }

        UUID userId = budget.getUser().getId();
        String categoryName = budget.getCategory().getName();
        String periodLabel = String.format("%02d/%d", budget.getMonth(), budget.getYear());
        int thresholdPercent = budget.getAlertThresholdPercent() != null ? budget.getAlertThresholdPercent() : 80;

        BigDecimal previousPercent = previousMoneySpent.multiply(BigDecimal.valueOf(100))
                .divide(amount, 2, RoundingMode.HALF_UP);
        BigDecimal currentPercent = currentMoneySpent.multiply(BigDecimal.valueOf(100))
                .divide(amount, 2, RoundingMode.HALF_UP);

        log.info(
                "Budget notification check for user {} category {} period {} previous={} current={} previousPercent={} currentPercent={} threshold={}",
                userId,
                categoryName,
                periodLabel,
                previousMoneySpent,
                currentMoneySpent,
                previousPercent,
                currentPercent,
                thresholdPercent);

        if (currentPercent.compareTo(BigDecimal.valueOf(thresholdPercent)) >= 0) {
            String title = String.format("Budget threshold reached: %s %s", categoryName, periodLabel);
            String message = String.format(
                    "%s budget crossed the %d%% alert for %s. Spent %s out of %s (%s%%).",
                    categoryName,
                    thresholdPercent,
                    periodLabel,
                    currentMoneySpent,
                    amount,
                    currentPercent.stripTrailingZeros().toPlainString());
            boolean alreadyExists = notificationRepository.existsByUserIdAndTypeAndTitle(
                    userId,
                    NotificationType.BUDGET_WARNING,
                    title);
            notificationService.createNotificationIfAbsent(userId, title, message, NotificationType.BUDGET_WARNING);
            if (!alreadyExists) {
                notificationEmailService.sendBudgetThresholdAlertIfEnabled(
                        budget.getUser(),
                        budget,
                        currentMoneySpent,
                        thresholdPercent,
                        currentPercent);
            }
        }

        if (currentPercent.compareTo(BigDecimal.valueOf(100)) >= 0) {
            String title = String.format("Budget exceeded: %s %s", categoryName, periodLabel);
            String message = String.format(
                    "%s budget has reached %s%% for %s. Spent %s out of %s.",
                    categoryName,
                    currentPercent.stripTrailingZeros().toPlainString(),
                    periodLabel,
                    currentMoneySpent,
                    amount);
            boolean alreadyExists = notificationRepository.existsByUserIdAndTypeAndTitle(
                    userId,
                    NotificationType.BUDGET_WARNING,
                    title);
            notificationService.createNotificationIfAbsent(userId, title, message, NotificationType.BUDGET_WARNING);
            if (!alreadyExists) {
                notificationEmailService.sendBudgetExceededAlertIfEnabled(
                        budget.getUser(),
                        budget,
                        currentMoneySpent,
                        currentPercent);
            }
        }
    }

    private void persistTouchedAccounts(Account... accounts) {
        for (Account account : accounts) {
            if (account == null) {
                continue;
            }
            accountRepository.save(account);
        }
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .userId(transaction.getUser().getId())
                .accountId(transaction.getAccount().getId())
                .toAccountId(transaction.getToAccount() != null ? transaction.getToAccount().getId() : null)
                .categoryId(transaction.getCategory() != null ? transaction.getCategory().getId() : null)
                .goalId(transaction.getGoal() != null ? transaction.getGoal().getId() : null)
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .date(transaction.getTransactionDate())
                .merchant(transaction.getMerchant())
                .note(transaction.getNote())
                .paymentMethod(transaction.getPaymentMethod())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }

    private List<TransactionResponse> mapToResponses(List<Transaction> transactions) {
        List<TransactionResponse> responses = new ArrayList<>();
        for (Transaction transaction : transactions) {
            responses.add(mapToResponse(transaction));
        }
        return responses;
    }
}
