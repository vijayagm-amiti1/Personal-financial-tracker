package com.example.financeTracker.DTO.ResponseDTO;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsightsResponseDTO {

    private LocalDate fromDate;
    private LocalDate toDate;
    private double currentSavingsRate;
    private double currentNetWorth;
    private List<InsightItemDTO> insights;
}
