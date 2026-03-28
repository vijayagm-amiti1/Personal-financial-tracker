package com.example.financeTracker.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialHealthComponentDTO {

    private String key;
    private String label;
    private int score;
    private int weight;
    private String summary;
}
