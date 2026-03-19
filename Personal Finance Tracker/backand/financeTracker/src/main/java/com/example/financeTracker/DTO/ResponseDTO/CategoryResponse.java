package com.example.financeTracker.DTO.ResponseDTO;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private UUID id;
    private UUID userId;
    private String name;
    private String type;
    private String color;
    private String icon;
    private Boolean isArchived;
}
