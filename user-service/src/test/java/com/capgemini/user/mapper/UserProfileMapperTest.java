package com.capgemini.user.mapper;

import com.capgemini.user.dto.UserProfileResponse;
import com.capgemini.user.entity.UserProfile;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class UserProfileMapperTest {

    private final UserProfileMapper mapper = new UserProfileMapper();

    @Test
    void toResponse_shouldMapAllFields() {
        LocalDateTime created = LocalDateTime.now().minusDays(1);
        LocalDateTime updated = LocalDateTime.now();

        UserProfile profile = UserProfile.builder()
                .id(10L)
                .userId(1L)
                .name("Alice Founder")
                .email("alice@example.com")
                .bio("Building the future")
                .skills("Java, Spring")
                .experience("5 years")
                .portfolioLinks("https://alice.dev")
                .createdAt(created)
                .updatedAt(updated)
                .build();

        UserProfileResponse response = mapper.toResponse(profile);

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Alice Founder");
        assertThat(response.getEmail()).isEqualTo("alice@example.com");
        assertThat(response.getBio()).isEqualTo("Building the future");
        assertThat(response.getSkills()).isEqualTo("Java, Spring");
        assertThat(response.getExperience()).isEqualTo("5 years");
        assertThat(response.getPortfolioLinks()).isEqualTo("https://alice.dev");
        assertThat(response.getCreatedAt()).isEqualTo(created);
        assertThat(response.getUpdatedAt()).isEqualTo(updated);
    }

    @Test
    void toResponse_withNullOptionalFields_shouldMapWithNulls() {
        UserProfile profile = UserProfile.builder()
                .id(1L)
                .userId(2L)
                .name("Bob")
                .email("bob@example.com")
                .build();

        UserProfileResponse response = mapper.toResponse(profile);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getBio()).isNull();
        assertThat(response.getSkills()).isNull();
        assertThat(response.getExperience()).isNull();
        assertThat(response.getPortfolioLinks()).isNull();
    }
}
