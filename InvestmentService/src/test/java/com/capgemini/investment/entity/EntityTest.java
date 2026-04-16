package com.capgemini.investment.entity;

import com.capgemini.investment.enums.InvestmentStatus;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class EntityTest {

    @Test
    void investment_prePersist_shouldSetCreatedAtAndDefaultStatus() throws Exception {
        Investment investment = new Investment();
        Method onCreate = Investment.class.getDeclaredMethod("onCreate");
        onCreate.setAccessible(true);
        onCreate.invoke(investment);

        assertThat(investment.getCreatedAt()).isNotNull();
        assertThat(investment.getStatus()).isEqualTo(InvestmentStatus.PENDING);
    }

    @Test
    void investment_prePersist_shouldNotOverrideExistingStatus() throws Exception {
        Investment investment = new Investment();
        investment.setStatus(InvestmentStatus.APPROVED);

        Method onCreate = Investment.class.getDeclaredMethod("onCreate");
        onCreate.setAccessible(true);
        onCreate.invoke(investment);

        assertThat(investment.getStatus()).isEqualTo(InvestmentStatus.APPROVED);
    }

    @Test
    void investment_builder_shouldSetAllFields() {
        Investment investment = Investment.builder()
                .id(1L)
                .startupId(10L)
                .investorId(20L)
                .amount(new BigDecimal("50000"))
                .status(InvestmentStatus.PENDING)
                .build();

        assertThat(investment.getId()).isEqualTo(1L);
        assertThat(investment.getStartupId()).isEqualTo(10L);
        assertThat(investment.getInvestorId()).isEqualTo(20L);
        assertThat(investment.getAmount()).isEqualTo(new BigDecimal("50000"));
        assertThat(investment.getStatus()).isEqualTo(InvestmentStatus.PENDING);
    }
}