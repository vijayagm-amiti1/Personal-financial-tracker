package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.CreateTransactionRequest;
import com.example.financeTracker.DTO.TransactionResponse;
import com.example.financeTracker.Entity.Account;
import com.example.financeTracker.Entity.Category;
import com.example.financeTracker.Entity.Transaction;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Repository.CategoryRepository;
import com.example.financeTracker.Repository.TransactionRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.TransactionService;
import com.example.financeTracker.exception.BadRequestException;
import com.example.financeTracker.exception.ResourceNotFoundException;
import java.time.LocalDate;
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
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TransactionResponse createTransaction(CreateTransactionRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Account account = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("accountId does not exist for this user"));

        Category category = resolveCategory(request.getCategoryId(), userId);
        String normalizedType = request.getType().trim().toLowerCase(Locale.ROOT);

        Transaction transaction = Transaction.builder()
                .user(user)
                .account(account)
                .category(category)
                .type(normalizedType)
                .amount(request.getAmount())
                .transactionDate(request.getDate())
                .merchant(request.getMerchant())
                .note(request.getNote())
                .paymentMethod(request.getPaymentMethod())
                .build();

        switch (normalizedType) {
            case "expense" -> account.setCurrentBalance(account.getCurrentBalance().subtract(request.getAmount()));
            case "income" -> account.setCurrentBalance(account.getCurrentBalance().add(request.getAmount()));
            case "transfer" -> {
                Account toAccount = accountRepository.findByIdAndUserId(request.getToAccountId(), userId)
                        .orElseThrow(() -> new ResourceNotFoundException("toAccountId does not exist for this user"));
                account.setCurrentBalance(account.getCurrentBalance().subtract(request.getAmount()));
                toAccount.setCurrentBalance(toAccount.getCurrentBalance().add(request.getAmount()));
                transaction.setToAccount(toAccount);
                accountRepository.save(toAccount);
            }
            default -> throw new BadRequestException("Unsupported transaction type: " + request.getType());
        }

        if (account.getCurrentBalance().signum() < 0) {
            throw new BadRequestException("Insufficient balance in source account");
        }

        accountRepository.save(account);
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
    public Transaction saveTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    @Override
    public List<Transaction> getTransactionsByUserId(UUID userId) {
        return transactionRepository.findAllByUserIdOrderByTransactionDateDesc(userId);
    }

    @Override
    public List<Transaction> getTransactionsByUserIdAndDateRange(UUID userId, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findAllByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                userId, startDate, endDate);
    }

    @Override
    public Optional<Transaction> getTransactionByIdAndUserId(UUID transactionId, UUID userId) {
        return transactionRepository.findByIdAndUserId(transactionId, userId);
    }

    @Override
    @Transactional
    public void deleteTransaction(UUID transactionId, UUID userId) {
        transactionRepository.findByIdAndUserId(transactionId, userId)
                .ifPresent(transactionRepository::delete);
    }

    private Category resolveCategory(UUID categoryId, UUID userId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("categoryId does not exist for this user"));
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .userId(transaction.getUser().getId())
                .accountId(transaction.getAccount().getId())
                .toAccountId(transaction.getToAccount() != null ? transaction.getToAccount().getId() : null)
                .categoryId(transaction.getCategory() != null ? transaction.getCategory().getId() : null)
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
}
