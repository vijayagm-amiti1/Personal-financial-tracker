package com.example.financeTracker.Security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationCookieService {

    @Value("${app.auth.cookie_name}")
    private String cookieName;

    @Value("${app.auth.refresh_cookie_name}")
    private String refreshCookieName;

    @Value("${app.auth.cookie_secure}")
    private boolean secureCookie;

    @Value("${app.auth.cookie_same_site:Lax}")
    private String sameSitePolicy;

    public ResponseCookie buildAuthCookie(String token) {
        return ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSitePolicy)
                .path("/")
                .build();
    }

    public ResponseCookie buildRefreshCookie(String token) {
        return ResponseCookie.from(refreshCookieName, token)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSitePolicy)
                .path("/")
                .build();
    }

    public ResponseCookie buildLogoutCookie() {
        return ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSitePolicy)
                .path("/")
                .maxAge(0)
                .build();
    }

    public ResponseCookie buildLogoutRefreshCookie() {
        return ResponseCookie.from(refreshCookieName, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSitePolicy)
                .path("/")
                .maxAge(0)
                .build();
    }

    public ResponseCookie buildLogoutSessionCookie() {
        return ResponseCookie.from("JSESSIONID", "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSitePolicy)
                .path("/")
                .maxAge(0)
                .build();
    }
}
