package com.example.financeTracker.Security;

import com.example.financeTracker.Entity.User;
import com.example.financeTracker.Exception.UnauthorizedException;
import com.example.financeTracker.Repository.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public UUID getCurrentUserId(Authentication authentication) {
        String email = getCurrentEmail(authentication);
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Authentication is required"));
        return user.getId();
    }

    public String getCurrentEmail(Authentication authentication) {
        if (authentication == null) {
            throw new UnauthorizedException("Authentication is required");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof AuthUserPrincipal authUserPrincipal) {
            return authUserPrincipal.getEmail();
        }

        if (principal instanceof OAuth2User oauth2User) {
            Object emailAttribute = oauth2User.getAttributes().get("email");
            if (emailAttribute instanceof String email && !email.isBlank()) {
                return email;
            }
        }

        if (authentication.getName() != null && !authentication.getName().isBlank()
                && !"anonymousUser".equals(authentication.getName())) {
            return authentication.getName();
        }

        throw new UnauthorizedException("Authentication is required");
    }
}
