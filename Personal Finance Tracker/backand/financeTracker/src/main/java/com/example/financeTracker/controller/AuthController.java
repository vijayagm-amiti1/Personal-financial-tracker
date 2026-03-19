package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.RequestDTO.ForgotPasswordRequest;
import com.example.financeTracker.DTO.RequestDTO.LoginRequest;
import com.example.financeTracker.DTO.RequestDTO.RegisterRequest;
import com.example.financeTracker.DTO.RequestDTO.CompleteSignupRequest;
import com.example.financeTracker.DTO.RequestDTO.ResetPasswordRequest;
import com.example.financeTracker.DTO.RequestDTO.VerifyOtpRequest;
import com.example.financeTracker.DTO.ResponseDTO.AuthMessageResponse;
import com.example.financeTracker.DTO.ResponseDTO.AuthUserResponse;
import com.example.financeTracker.Security.AuthenticationCookieService;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Security.JwtService;
import com.example.financeTracker.Service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthenticationCookieService cookieService;
    private final CurrentUserProvider currentUserProvider;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthMessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthMessageResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/complete-signup")
    public ResponseEntity<AuthMessageResponse> completeSignup(@Valid @RequestBody CompleteSignupRequest request) {
        return ResponseEntity.ok(authService.completeSignup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthUserResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthUserResponse user = authService.login(request);
        String jwt = authService.generateJwtForUser(user.email());
        String refreshToken = authService.generateRefreshTokenForUser(user.email());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieService.buildAuthCookie(jwt).toString())
                .header(HttpHeaders.SET_COOKIE, cookieService.buildRefreshCookie(refreshToken).toString())
                .body(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthMessageResponse> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieService.buildLogoutCookie().toString())
                .header(HttpHeaders.SET_COOKIE, cookieService.buildLogoutRefreshCookie().toString())
                .body(new AuthMessageResponse("Logged out successfully."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthMessageResponse> refresh(HttpServletRequest request) {
        String refreshToken = extractCookieValue(request, "finance_tracker_refresh");
        if (refreshToken == null || !jwtService.isRefreshToken(refreshToken)) {
            return ResponseEntity.status(401).build();
        }

        String email = jwtService.extractEmail(refreshToken);
        String newAccessToken = authService.generateJwtForUser(email);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieService.buildAuthCookie(newAccessToken).toString())
                .body(new AuthMessageResponse("Session refreshed."));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(currentUserProvider.getCurrentEmail(authentication)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthMessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthMessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    private String extractCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
