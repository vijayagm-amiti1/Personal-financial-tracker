package com.example.financeTracker.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryTrendPointDTO {

    private String periodKey;
    private String periodLabel;
    private double expense;
}
