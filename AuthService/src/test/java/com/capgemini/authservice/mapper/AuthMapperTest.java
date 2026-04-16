package com.capgemini.authservice.mapper;

import com.capgemini.authservice.dto.UserSummaryDto;
import com.capgemini.authservice.entity.RoleEntity;
import com.capgemini.authservice.entity.UserEntity;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class AuthMapperTest {

    private final AuthMapper mapper = new AuthMapper();

    @Test
    void toUserSummaryDto_withRole_shouldMapAllFields() {
        RoleEntity role = RoleEntity.builder().id(1L).name("FOUNDER").build();
        UserEntity user = UserEntity.builder()
                .id(42L)
                .name("Alice")
                .email("alice@example.com")
                .password("hashed")
                .roles(Set.of(role))
                .build();

        UserSummaryDto dto = mapper.toUserSummaryDto(user);

        assertThat(dto.getUserId()).isEqualTo(42L);
        assertThat(dto.getName()).isEqualTo("Alice");
        assertThat(dto.getEmail()).isEqualTo("alice@example.com");
        assertThat(dto.getRole()).isEqualTo("FOUNDER");
    }

    @Test
    void toUserSummaryDto_withNoRoles_shouldReturnNullRole() {
        UserEntity user = UserEntity.builder()
                .id(1L)
                .name("Bob")
                .email("bob@example.com")
                .password("hashed")
                .roles(Set.of())
                .build();

        UserSummaryDto dto = mapper.toUserSummaryDto(user);

        assertThat(dto.getUserId()).isEqualTo(1L);
        assertThat(dto.getRole()).isNull();
    }
}