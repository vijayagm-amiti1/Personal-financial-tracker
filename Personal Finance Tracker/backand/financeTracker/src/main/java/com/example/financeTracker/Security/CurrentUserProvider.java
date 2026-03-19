package com.example.financeTracker.Security;

import com.example.financeTracker.Exception.UnauthorizedException;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    public UUID getCurrentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUserPrincipal principal)) {
            throw new UnauthorizedException("Authentication is required");
        }
        return principal.getId();
    }

    public String getCurrentEmail(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUserPrincipal principal)) {
            throw new UnauthorizedException("Authentication is required");
        }
        return principal.getEmail();
    }
}
