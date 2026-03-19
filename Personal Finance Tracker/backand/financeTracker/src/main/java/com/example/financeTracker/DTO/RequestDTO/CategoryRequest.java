package com.example.financeTracker.DTO.RequestDTO;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {

    @NotBlank(message = "name is required")
    private String name;

    @NotBlank(message = "type is required")
    private String type;

    private String color;

    private String icon;

    @Builder.Default
    private Boolean isArchived = false;

    @AssertTrue(message = "type must be income or expense")
    public boolean isTypeSupported() {
        if (type == null || type.isBlank()) {
            return true;
        }
        return "income".equalsIgnoreCase(type) || "expense".equalsIgnoreCase(type);
    }
}
