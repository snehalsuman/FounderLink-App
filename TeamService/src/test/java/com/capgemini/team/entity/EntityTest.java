package com.capgemini.team.entity;

import com.capgemini.team.enums.InvitationStatus;
import com.capgemini.team.enums.TeamRole;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

class EntityTest {

    // ── TeamInvitation ────────────────────────────────────────────────────────

    @Test
    void teamInvitation_prePersist_shouldSetCreatedAtAndDefaultStatus() throws Exception {
        TeamInvitation invitation = new TeamInvitation();
        Method onCreate = TeamInvitation.class.getDeclaredMethod("onCreate");
        onCreate.setAccessible(true);
        onCreate.invoke(invitation);

        assertThat(invitation.getCreatedAt()).isNotNull();
        assertThat(invitation.getStatus()).isEqualTo(InvitationStatus.PENDING);
    }

    @Test
    void teamInvitation_prePersist_shouldNotOverrideExistingStatus() throws Exception {
        TeamInvitation invitation = new TeamInvitation();
        invitation.setStatus(InvitationStatus.ACCEPTED);

        Method onCreate = TeamInvitation.class.getDeclaredMethod("onCreate");
        onCreate.setAccessible(true);
        onCreate.invoke(invitation);

        assertThat(invitation.getStatus()).isEqualTo(InvitationStatus.ACCEPTED);
    }

    @Test
    void teamInvitation_builder_shouldSetAllFields() {
        TeamInvitation invitation = TeamInvitation.builder()
                .id(1L)
                .startupId(10L)
                .invitedUserId(20L)
                .role(TeamRole.CO_FOUNDER)
                .status(InvitationStatus.PENDING)
                .build();

        assertThat(invitation.getId()).isEqualTo(1L);
        assertThat(invitation.getStartupId()).isEqualTo(10L);
        assertThat(invitation.getInvitedUserId()).isEqualTo(20L);
        assertThat(invitation.getRole()).isEqualTo(TeamRole.CO_FOUNDER);
        assertThat(invitation.getStatus()).isEqualTo(InvitationStatus.PENDING);
    }

    // ── TeamMember ────────────────────────────────────────────────────────────

    @Test
    void teamMember_prePersist_shouldSetJoinedAt() throws Exception {
        TeamMember member = new TeamMember();
        Method onCreate = TeamMember.class.getDeclaredMethod("onCreate");
        onCreate.setAccessible(true);
        onCreate.invoke(member);

        assertThat(member.getJoinedAt()).isNotNull();
    }

    @Test
    void teamMember_builder_shouldSetAllFields() {
        TeamMember member = TeamMember.builder()
                .id(1L)
                .startupId(10L)
                .userId(5L)
                .role(TeamRole.CO_FOUNDER)
                .build();

        assertThat(member.getId()).isEqualTo(1L);
        assertThat(member.getStartupId()).isEqualTo(10L);
        assertThat(member.getUserId()).isEqualTo(5L);
        assertThat(member.getRole()).isEqualTo(TeamRole.CO_FOUNDER);
    }
}