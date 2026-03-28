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
public class NetWorthPointDTO {

    private String periodKey;
    private String periodLabel;
    private LocalDate date;
    private double netWorth;
    private double totalAssets;
}
