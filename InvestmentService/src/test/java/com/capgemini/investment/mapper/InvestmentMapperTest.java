package com.capgemini.investment.mapper;

import com.capgemini.investment.dto.InvestmentResponse;
import com.capgemini.investment.entity.Investment;
import com.capgemini.investment.enums.InvestmentStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class InvestmentMapperTest {

    private final InvestmentMapper mapper = new InvestmentMapper();

    @Test
    void toResponse_shouldMapAllFields() {
        Investment investment = Investment.builder()
                .id(1L)
                .startupId(10L)
                .investorId(5L)
                .amount(new BigDecimal("50000.00"))
                .status(InvestmentStatus.PENDING)
                .createdAt(LocalDateTime.of(2024, 1, 15, 10, 0))
                .build();

        InvestmentResponse response = mapper.toResponse(investment);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getStartupId()).isEqualTo(10L);
        assertThat(response.getInvestorId()).isEqualTo(5L);
        assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(response.getStatus()).isEqualTo(InvestmentStatus.PENDING);
        assertThat(response.getCreatedAt()).isEqualTo(LocalDateTime.of(2024, 1, 15, 10, 0));
    }

    @Test
    void toResponse_withApprovedStatus_shouldMapStatusCorrectly() {
        Investment investment = Investment.builder()
                .id(2L)
                .startupId(3L)
                .investorId(7L)
                .amount(new BigDecimal("100000.00"))
                .status(InvestmentStatus.APPROVED)
                .createdAt(LocalDateTime.now())
                .build();

        InvestmentResponse response = mapper.toResponse(investment);

        assertThat(response.getStatus()).isEqualTo(InvestmentStatus.APPROVED);
    }
}
