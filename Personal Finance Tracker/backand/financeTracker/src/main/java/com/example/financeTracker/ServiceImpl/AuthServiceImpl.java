package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.RequestDTO.ForgotPasswordRequest;
import com.example.financeTracker.DTO.RequestDTO.LoginRequest;
import com.example.financeTracker.DTO.RequestDTO.RegisterRequest;
import com.example.financeTracker.DTO.RequestDTO.CompleteSignupRequest;
import com.example.financeTracker.DTO.RequestDTO.ResetPasswordRequest;
import com.example.financeTracker.DTO.RequestDTO.VerifyOtpRequest;
import com.example.financeTracker.DTO.ResponseDTO.AuthMessageResponse;
import com.example.financeTracker.DTO.ResponseDTO.AuthUserResponse;
import com.example.financeTracker.Entity.PendingSignup;
import com.example.financeTracker.Entity.PasswordResetToken;
import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.BadRequestException;
import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Exception.UnauthorizedException;
import com.example.financeTracker.Repository.PendingSignupRepository;
import com.example.financeTracker.Repository.PasswordResetTokenRepository;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Security.JwtService;
import com.example.financeTracker.Service.AuthMailService;
import com.example.financeTracker.Service.AuthService;
import com.example.financeTracker.Service.UserSettingsService;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PendingSignupRepository pendingSignupRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuthMailService authMailService;
    private final UserSettingsService userSettingsService;

    @Value("${app.auth.reset_password_base_url}")
    private String resetPasswordBaseUrl;

    @Override
    @Transactional
    public AuthMessageResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User existingUser = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (existingUser != null && existingUser.getPasswordHash() != null && !existingUser.getPasswordHash().isBlank()) {
            throw new BadRequestException("User already exists. Please login.");
        }

        String otp = generateOtp();
        pendingSignupRepository.deleteByEmail(normalizedEmail);
        pendingSignupRepository.save(PendingSignup.builder()
                .email(normalizedEmail)
                .displayName(request.displayName().trim())
                .otpCode(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build());

        authMailService.sendOtpEmail(normalizedEmail, request.displayName().trim(), otp);
        return new AuthMessageResponse("OTP sent to email. Verify within 5 minutes.");
    }

    @Override
    @Transactional
    public AuthMessageResponse verifyOtp(VerifyOtpRequest request) {
        PendingSignup pendingSignup = findPendingSignupByEmail(request.email());

        if (pendingSignup.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP expired");
        }

        if (!pendingSignup.getOtpCode().equals(request.otp())) {
            throw new BadRequestException("Invalid OTP");
        }

        pendingSignup.setVerifiedAt(LocalDateTime.now());
        return new AuthMessageResponse("Email verified successfully. Set your password to finish signup.");
    }

    @Override
    @Transactional
    public AuthMessageResponse completeSignup(CompleteSignupRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new BadRequestException("Password and confirm password must match");
        }

        String normalizedEmail = request.email().trim().toLowerCase();
        PendingSignup pendingSignup = findPendingSignupByEmail(normalizedEmail);
        if (pendingSignup.getVerifiedAt() == null) {
            throw new BadRequestException("Verify OTP before setting password");
        }

        User existingUser = userRepository.findByEmail(normalizedEmail).orElse(null);
        User savedUser;
        if (existingUser != null) {
            if (existingUser.getPasswordHash() != null && !existingUser.getPasswordHash().isBlank()) {
                throw new BadRequestException("User already exists. Please login.");
            }
            existingUser.setPasswordHash(passwordEncoder.encode(request.password()));
            existingUser.setDisplayName(pendingSignup.getDisplayName());
            existingUser.setIsActive(Boolean.TRUE);
            existingUser.setEmailVerifiedAt(pendingSignup.getVerifiedAt());
            savedUser = userRepository.save(existingUser);
        } else {
            User user = User.builder()
                    .email(normalizedEmail)
                    .passwordHash(passwordEncoder.encode(request.password()))
                    .displayName(pendingSignup.getDisplayName())
                    .isActive(Boolean.TRUE)
                    .emailVerifiedAt(pendingSignup.getVerifiedAt())
                    .build();
            savedUser = userRepository.save(user);
            userSettingsService.createDefaultSettingsForUser(savedUser);
        }

        pendingSignupRepository.delete(pendingSignup);
        return new AuthMessageResponse("Signup completed successfully.");
    }

    @Override
    public AuthUserResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = findUserByEmail(normalizedEmail);
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new UnauthorizedException("This account uses Google login. Sign up to set a password first.");
        }
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );
        } catch (DisabledException exception) {
            throw new UnauthorizedException("Verify your email before logging in");
        } catch (BadCredentialsException exception) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Verify your email before logging in");
        }
        return mapUser(user);
    }

    @Override
    @Transactional
    public AuthUserResponse loginWithGoogle(String email, String displayName) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .map(existingUser -> {
                    if (existingUser.getDisplayName() == null || existingUser.getDisplayName().isBlank()) {
                        existingUser.setDisplayName(displayName);
                    }
                    existingUser.setIsActive(Boolean.TRUE);
                    if (existingUser.getEmailVerifiedAt() == null) {
                        existingUser.setEmailVerifiedAt(LocalDateTime.now());
                    }
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    User createdUser = userRepository.save(User.builder()
                            .email(normalizedEmail)
                            .passwordHash(null)
                            .displayName(displayName == null || displayName.isBlank() ? normalizedEmail : displayName.trim())
                            .isActive(Boolean.TRUE)
                            .emailVerifiedAt(LocalDateTime.now())
                            .build());
                    userSettingsService.createDefaultSettingsForUser(createdUser);
                    return createdUser;
                });

        return mapUser(user);
    }

    public String generateJwtForUser(String email) {
        User user = findUserByEmail(email);
        return jwtService.generateToken(user.getId(), user.getEmail());
    }

    @Override
    public String generateRefreshTokenForUser(String email) {
        User user = findUserByEmail(email);
        return jwtService.generateRefreshToken(user.getId(), user.getEmail());
    }

    @Override
    public AuthUserResponse getCurrentUser(String email) {
        return mapUser(findUserByEmail(email));
    }

    @Override
    @Transactional
    public AuthMessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = findUserByEmail(request.email());
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new BadRequestException("This account uses Google login. Sign up to set a password first.");
        }
        passwordResetTokenRepository.deleteByUser(user);

        PasswordResetToken token = passwordResetTokenRepository.save(PasswordResetToken.builder()
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(2))
                .build());

        String resetLink = "%s?token=%s".formatted(resetPasswordBaseUrl, token.getId());
        authMailService.sendResetPasswordEmail(user.getEmail(), user.getDisplayName(), resetLink);
        return new AuthMessageResponse("Reset password link sent to your email.");
    }

    @Override
    @Transactional
    public AuthMessageResponse resetPassword(ResetPasswordRequest request) {
        UUID tokenId;
        try {
            tokenId = UUID.fromString(request.token());
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("Invalid reset token");
        }

        PasswordResetToken token = passwordResetTokenRepository.findById(tokenId)
                .orElseThrow(() -> new BadRequestException("Reset token not found"));
        if (!token.getExpiresAt().isAfter(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(token);
            throw new BadRequestException("Reset token expired");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        passwordResetTokenRepository.delete(token);
        return new AuthMessageResponse("Password reset successfully.");
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private PendingSignup findPendingSignupByEmail(String email) {
        return pendingSignupRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Signup request not found"));
    }

    private AuthUserResponse mapUser(User user) {
        return new AuthUserResponse(user.getId(), user.getEmail(), user.getDisplayName());
    }

    private String generateOtp() {
        return String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
    }
}
