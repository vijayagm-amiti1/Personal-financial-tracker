package com.example.financeTracker.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsightItemDTO {

    private String type;
    private String severity;
    private String title;
    private String message;
    private Double changePercent;
    private Double amount;
}
