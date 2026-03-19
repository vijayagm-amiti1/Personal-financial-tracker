package com.example.financeTracker.DTO.RequestDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CompleteSignupRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8, max = 120)
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Password must include upper case, lower case, and a number")
        String password,
        @NotBlank String confirmPassword
) {
}
