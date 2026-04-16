package com.capgemini.team.mapper;

import com.capgemini.team.dto.InvitationResponse;
import com.capgemini.team.dto.TeamMemberResponse;
import com.capgemini.team.entity.TeamInvitation;
import com.capgemini.team.entity.TeamMember;
import com.capgemini.team.enums.InvitationStatus;
import com.capgemini.team.enums.TeamRole;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class TeamMapperTest {

    private final TeamMapper mapper = new TeamMapper();

    @Test
    void toInvitationResponse_shouldMapAllFields() {
        TeamInvitation invitation = TeamInvitation.builder()
                .id(1L)
                .startupId(10L)
                .invitedUserId(5L)
                .role(TeamRole.CO_FOUNDER)
                .status(InvitationStatus.PENDING)
                .createdAt(LocalDateTime.of(2024, 3, 1, 9, 0))
                .build();

        InvitationResponse response = mapper.toInvitationResponse(invitation);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getStartupId()).isEqualTo(10L);
        assertThat(response.getInvitedUserId()).isEqualTo(5L);
        assertThat(response.getRole()).isEqualTo(TeamRole.CO_FOUNDER);
        assertThat(response.getStatus()).isEqualTo(InvitationStatus.PENDING);
        assertThat(response.getCreatedAt()).isEqualTo(LocalDateTime.of(2024, 3, 1, 9, 0));
    }

    @Test
    void toMemberResponse_shouldMapAllFields() {
        TeamMember member = TeamMember.builder()
                .id(2L)
                .startupId(10L)
                .userId(7L)
                .role(TeamRole.FOUNDER)
                .joinedAt(LocalDateTime.of(2024, 2, 15, 12, 0))
                .build();

        TeamMemberResponse response = mapper.toMemberResponse(member);

        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getStartupId()).isEqualTo(10L);
        assertThat(response.getUserId()).isEqualTo(7L);
        assertThat(response.getRole()).isEqualTo(TeamRole.FOUNDER);
        assertThat(response.getJoinedAt()).isEqualTo(LocalDateTime.of(2024, 2, 15, 12, 0));
    }

    @Test
    void toInvitationResponse_withAcceptedStatus_shouldMapStatusCorrectly() {
        TeamInvitation invitation = TeamInvitation.builder()
                .id(3L)
                .startupId(20L)
                .invitedUserId(8L)
                .role(TeamRole.CO_FOUNDER)
                .status(InvitationStatus.ACCEPTED)
                .createdAt(LocalDateTime.now())
                .build();

        InvitationResponse response = mapper.toInvitationResponse(invitation);

        assertThat(response.getStatus()).isEqualTo(InvitationStatus.ACCEPTED);
    }
}
