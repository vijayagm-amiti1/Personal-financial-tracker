package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.RequestDTO.AccountInviteRequest;
import com.example.financeTracker.DTO.RequestDTO.AccountMemberRoleUpdateRequest;
import com.example.financeTracker.DTO.ResponseDTO.AccountInviteResponse;
import com.example.financeTracker.DTO.ResponseDTO.AccountMemberResponse;
import com.example.financeTracker.Entity.Account;
import com.example.financeTracker.Entity.AccountInvite;
import com.example.financeTracker.Entity.AccountInviteStatus;
import com.example.financeTracker.Entity.AccountMember;
import com.example.financeTracker.Entity.AccountMemberRole;
import com.example.financeTracker.Entity.NotificationType;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.BadRequestException;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Exception.UnauthorizedException;
import com.example.financeTracker.Repository.AccountInviteRepository;
import com.example.financeTracker.Repository.AccountMemberRepository;
import com.example.financeTracker.Repository.AccountRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.AccountSharingService;
import com.example.financeTracker.Service.AuthMailService;
import com.example.financeTracker.Service.NotificationService;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AccountSharingServiceImpl implements AccountSharingService {

    private static final DateTimeFormatter INVITE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy hh:mm a");

    private final AccountRepository accountRepository;
    private final AccountMemberRepository accountMemberRepository;
    private final AccountInviteRepository accountInviteRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuthMailService authMailService;

    @Value("${app.frontend.base_url}")
    private String frontendBaseUrl;

    @Override
    public List<AccountMemberResponse> getMembers(UUID accountId, UUID userId) {
        Account account = requireAccessibleAccount(accountId, userId);
        List<AccountMemberResponse> responses = new ArrayList<>();
        boolean ownerPresent = false;

        for (AccountMember member : accountMemberRepository.findAllByAccountIdOrderByCreatedAtAsc(accountId)) {
            if (account.getUser() != null && account.getUser().getId().equals(member.getUser().getId())) {
                ownerPresent = true;
            }
            responses.add(mapMember(member, account));
        }

        if (!ownerPresent && account.getUser() != null) {
            responses.add(0, AccountMemberResponse.builder()
                    .id(null)
                    .userId(account.getUser().getId())
                    .email(account.getUser().getEmail())
                    .displayName(account.getUser().getDisplayName())
                    .role(AccountMemberRole.OWNER)
                    .owner(true)
                    .createdAt(account.getCreatedAt())
                    .build());
        }

        return responses;
    }

    @Override
    @Transactional
    public AccountInviteResponse inviteMember(UUID accountId, AccountInviteRequest request, UUID userId) {
        Account account = requireOwnerAccount(accountId, userId);
        User inviter = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String recipientEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (inviter.getEmail().equalsIgnoreCase(recipientEmail)) {
            throw new BadRequestException("You already own this account");
        }
        if (accountInviteRepository.existsByAccountIdAndRecipientEmailIgnoreCaseAndStatus(
                accountId,
                recipientEmail,
                AccountInviteStatus.PENDING)) {
            throw new BadRequestException("A pending invite already exists for this email");
        }

        userRepository.findByEmail(recipientEmail).ifPresent(existingUser -> {
            if (accountMemberRepository.existsByAccountIdAndUserId(accountId, existingUser.getId())
                    || account.getUser().getId().equals(existingUser.getId())) {
                throw new BadRequestException("This user already has access to the account");
            }
        });

        AccountInvite invite = accountInviteRepository.save(AccountInvite.builder()
                .account(account)
                .invitedBy(inviter)
                .recipientEmail(recipientEmail)
                .role(request.getRole())
                .token(UUID.randomUUID().toString())
                .status(AccountInviteStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build());

        String recipientName = userRepository.findByEmail(recipientEmail)
                .map(User::getDisplayName)
                .orElse("there");
        String inviteLink = buildInviteLink(invite.getToken());
        authMailService.sendAccountInviteEmail(
                recipientEmail,
                recipientName,
                safeName(inviter),
                account.getName(),
                request.getRole().name(),
                inviteLink,
                invite.getExpiresAt().format(INVITE_TIME_FORMATTER));

        notificationService.createNotification(
                userId,
                "Invite sent: " + account.getName(),
                "An invite was sent to " + recipientEmail + " as " + request.getRole().name() + ".",
                NotificationType.SYSTEM_UPDATE);

        return mapInvite(invite);
    }

    @Override
    @Transactional
    public AccountMemberResponse updateMemberRole(UUID accountId,
                                                  UUID memberUserId,
                                                  AccountMemberRoleUpdateRequest request,
                                                  UUID userId) {
        Account account = requireOwnerAccount(accountId, userId);
        if (account.getUser().getId().equals(memberUserId)) {
            throw new BadRequestException("The account creator remains the owner");
        }

        AccountMember member = accountMemberRepository.findByAccountIdAndUserId(accountId, memberUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found for this account"));
        member.setRole(request.getRole());
        AccountMember savedMember = accountMemberRepository.save(member);

        notificationService.createNotification(
                memberUserId,
                "Role updated: " + account.getName(),
                "Your role for " + account.getName() + " is now " + request.getRole().name() + ".",
                NotificationType.SYSTEM_UPDATE);

        return mapMember(savedMember, account);
    }

    @Override
    @Transactional
    public void removeMember(UUID accountId, UUID memberUserId, UUID userId) {
        Account account = requireOwnerAccount(accountId, userId);
        if (account.getUser().getId().equals(memberUserId)) {
            throw new BadRequestException("The account creator cannot be removed");
        }

        AccountMember member = accountMemberRepository.findByAccountIdAndUserId(accountId, memberUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found for this account"));
        accountMemberRepository.delete(member);

        notificationService.createNotification(
                memberUserId,
                "Removed from account: " + account.getName(),
                "Your access to " + account.getName() + " was removed by the owner.",
                NotificationType.SYSTEM_UPDATE);
    }

    @Override
    @Transactional
    public AccountInviteResponse getInviteByToken(String token) {
        AccountInvite invite = getRequiredInvite(token);
        expireIfNeeded(invite);
        return mapInvite(invite);
    }

    @Override
    @Transactional
    public AccountInviteResponse respondToInvite(String token, UUID userId, boolean accepted) {
        AccountInvite invite = getRequiredInvite(token);
        expireIfNeeded(invite);
        if (invite.getStatus() != AccountInviteStatus.PENDING) {
            throw new BadRequestException("This invite has already been handled");
        }

        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!recipient.getEmail().equalsIgnoreCase(invite.getRecipientEmail())) {
            throw new UnauthorizedException("This invite belongs to a different email address");
        }

        if (accepted) {
            if (!accountMemberRepository.existsByAccountIdAndUserId(invite.getAccount().getId(), userId)
                    && !invite.getAccount().getUser().getId().equals(userId)) {
                accountMemberRepository.save(AccountMember.builder()
                        .account(invite.getAccount())
                        .user(recipient)
                        .role(invite.getRole())
                        .build());
            }
            invite.setStatus(AccountInviteStatus.ACCEPTED);
        } else {
            invite.setStatus(AccountInviteStatus.REJECTED);
        }
        invite.setRespondedAt(LocalDateTime.now());
        AccountInvite savedInvite = accountInviteRepository.save(invite);

        notificationService.createNotification(
                invite.getInvitedBy().getId(),
                accepted
                        ? recipient.getDisplayName() + " accepted your invite"
                        : recipient.getDisplayName() + " declined your invite",
                recipient.getEmail() + " "
                        + (accepted ? "accepted" : "declined")
                        + " the invite for "
                        + invite.getAccount().getName() + ".",
                NotificationType.SYSTEM_UPDATE);

        return mapInvite(savedInvite);
    }

    @Override
    public Account requireAccessibleAccount(UUID accountId, UUID userId) {
        return accountRepository.findAccessibleByIdAndUserId(accountId, userId)
                .orElseGet(() -> accountRepository.findByIdAndUserId(accountId, userId)
                        .orElseThrow(() -> new ResourceNotFoundException("Account not found for this user")));
    }

    @Override
    public Account requireOwnerAccount(UUID accountId, UUID userId) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new UnauthorizedException("Only the account owner can manage sharing"));
        if (Boolean.FALSE.equals(account.getIsActive())) {
            throw new ResourceNotFoundException("Account not found for this user");
        }
        return account;
    }

    @Override
    public AccountMemberRole getRoleForAccount(UUID accountId, UUID userId) {
        Account account = requireAccessibleAccount(accountId, userId);
        if (account.getUser() != null && account.getUser().getId().equals(userId)) {
            return AccountMemberRole.OWNER;
        }
        return accountMemberRepository.findByAccountIdAndUserId(accountId, userId)
                .map(AccountMember::getRole)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found for this account"));
    }

    private AccountInvite getRequiredInvite(String token) {
        return accountInviteRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));
    }

    private void expireIfNeeded(AccountInvite invite) {
        if (invite.getStatus() == AccountInviteStatus.PENDING && invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            invite.setStatus(AccountInviteStatus.EXPIRED);
            invite.setRespondedAt(LocalDateTime.now());
            accountInviteRepository.save(invite);
        }
    }

    private String buildInviteLink(String token) {
        return frontendBaseUrl + "/account-invites/" + token;
    }

    private String safeName(User user) {
        if (user.getDisplayName() != null && !user.getDisplayName().isBlank()) {
            return user.getDisplayName();
        }
        return user.getEmail();
    }

    private AccountMemberResponse mapMember(AccountMember member, Account account) {
        return AccountMemberResponse.builder()
                .id(member.getId())
                .userId(member.getUser().getId())
                .email(member.getUser().getEmail())
                .displayName(member.getUser().getDisplayName())
                .role(member.getRole())
                .owner(account.getUser() != null && account.getUser().getId().equals(member.getUser().getId()))
                .createdAt(member.getCreatedAt())
                .build();
    }

    private AccountInviteResponse mapInvite(AccountInvite invite) {
        return AccountInviteResponse.builder()
                .id(invite.getId())
                .accountId(invite.getAccount().getId())
                .accountName(invite.getAccount().getName())
                .accountType(invite.getAccount().getType())
                .institutionName(invite.getAccount().getInstitutionName())
                .recipientEmail(invite.getRecipientEmail())
                .role(invite.getRole())
                .status(invite.getStatus())
                .invitedByDisplayName(safeName(invite.getInvitedBy()))
                .invitedByEmail(invite.getInvitedBy().getEmail())
                .inviteLink(buildInviteLink(invite.getToken()))
                .expiresAt(invite.getExpiresAt())
                .respondedAt(invite.getRespondedAt())
                .createdAt(invite.getCreatedAt())
                .build();
    }
}
