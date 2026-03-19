package com.example.financeTracker.DTO.ResponseDTO;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringRunResponse {

    private LocalDate runDate;
    private Integer processedTransactions;
    private Integer advancedSchedules;
    private Integer deletedSchedules;
    private Integer failedSchedules;
}
