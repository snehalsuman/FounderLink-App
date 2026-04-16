package com.capgemini.startup.mapper;

import com.capgemini.startup.dto.StartupResponse;
import com.capgemini.startup.entity.Startup;
import com.capgemini.startup.enums.StartupStage;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class StartupMapperTest {

    private final StartupMapper mapper = new StartupMapper();

    @Test
    void toResponse_shouldMapAllFields() {
        LocalDateTime now = LocalDateTime.of(2024, 5, 10, 8, 0);
        Startup startup = Startup.builder()
                .id(1L)
                .name("TechVenture")
                .description("An innovative tech startup")
                .industry("Technology")
                .problemStatement("Lack of AI tools")
                .solution("Build an AI platform")
                .fundingGoal(new BigDecimal("500000.00"))
                .stage(StartupStage.MVP)
                .location("Bangalore")
                .founderId(10L)
                .isApproved(true)
                .isRejected(false)
                .createdAt(now)
                .updatedAt(now)
                .build();

        StartupResponse response = mapper.toResponse(startup);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("TechVenture");
        assertThat(response.getDescription()).isEqualTo("An innovative tech startup");
        assertThat(response.getIndustry()).isEqualTo("Technology");
        assertThat(response.getProblemStatement()).isEqualTo("Lack of AI tools");
        assertThat(response.getSolution()).isEqualTo("Build an AI platform");
        assertThat(response.getFundingGoal()).isEqualByComparingTo(new BigDecimal("500000.00"));
        assertThat(response.getStage()).isEqualTo(StartupStage.MVP);
        assertThat(response.getLocation()).isEqualTo("Bangalore");
        assertThat(response.getFounderId()).isEqualTo(10L);
        assertThat(response.getIsApproved()).isTrue();
        assertThat(response.getIsRejected()).isFalse();
        assertThat(response.getCreatedAt()).isEqualTo(now);
        assertThat(response.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    void toResponse_withRejectedStartup_shouldMapRejectedFlag() {
        Startup startup = Startup.builder()
                .id(2L)
                .name("FailedVenture")
                .industry("FinTech")
                .fundingGoal(new BigDecimal("100000.00"))
                .stage(StartupStage.EARLY_TRACTION)
                .founderId(5L)
                .isApproved(false)
                .isRejected(true)
                .build();

        StartupResponse response = mapper.toResponse(startup);

        assertThat(response.getIsApproved()).isFalse();
        assertThat(response.getIsRejected()).isTrue();
    }
}