package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.RequestDTO.ForgotPasswordRequest;
import com.example.financeTracker.DTO.RequestDTO.LoginRequest;
import com.example.financeTracker.DTO.RequestDTO.RegisterRequest;
import com.example.financeTracker.DTO.RequestDTO.CompleteSignupRequest;
import com.example.financeTracker.DTO.RequestDTO.ResetPasswordRequest;
import com.example.financeTracker.DTO.RequestDTO.VerifyOtpRequest;
import com.example.financeTracker.DTO.ResponseDTO.AuthMessageResponse;
import com.example.financeTracker.DTO.ResponseDTO.AuthUserResponse;

public interface AuthService {

    AuthMessageResponse register(RegisterRequest request);

    AuthMessageResponse verifyOtp(VerifyOtpRequest request);

    AuthMessageResponse completeSignup(CompleteSignupRequest request);

    AuthUserResponse login(LoginRequest request);

    AuthUserResponse loginWithGoogle(String email, String displayName);

    String generateJwtForUser(String email);

    String generateRefreshTokenForUser(String email);

    AuthUserResponse getCurrentUser(String email);

    AuthMessageResponse forgotPassword(ForgotPasswordRequest request);

    AuthMessageResponse resetPassword(ResetPasswordRequest request);
}
