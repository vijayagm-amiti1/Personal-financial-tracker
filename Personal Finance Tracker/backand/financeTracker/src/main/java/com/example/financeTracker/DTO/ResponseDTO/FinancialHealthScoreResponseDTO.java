package com.example.financeTracker.DTO.ResponseDTO;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialHealthScoreResponseDTO {

    private int score;
    private String band;
    private String summary;
    private List<FinancialHealthComponentDTO> components;
}
