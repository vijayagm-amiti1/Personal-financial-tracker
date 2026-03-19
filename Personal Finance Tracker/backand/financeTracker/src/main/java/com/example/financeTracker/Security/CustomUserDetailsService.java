package com.example.financeTracker.Security;

import com.example.financeTracker.Exception.ResourceNotFoundException;
import com.example.financeTracker.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username.toLowerCase())
                .map(AuthUserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public UserDetails loadActiveUserOrThrow(String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .map(AuthUserPrincipal::new)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
