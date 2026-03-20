package com.example.financeTracker.Security;

import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.Service.UserSettingsService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final UserSettingsService userSettingsService;
    private final JwtService jwtService;
    private final AuthenticationCookieService cookieService;

    @Value("${app.auth.google_success_redirect_url}")
    private String googleSuccessRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = String.valueOf(oauthUser.getAttributes().get("email"));
        String displayName = String.valueOf(oauthUser.getAttributes().getOrDefault("name", email));
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

        String jwt = jwtService.generateToken(user.getId(), user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        response.addHeader(HttpHeaders.SET_COOKIE, cookieService.buildAuthCookie(jwt).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cookieService.buildRefreshCookie(refreshToken).toString());
        response.sendRedirect(googleSuccessRedirectUrl);
    }
}
