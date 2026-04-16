import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Search, Rocket } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../shared/components/Layout';
import { getMyInvitations, getTeamByStartup } from '../../core/api/teamApi';
import { getStartupById } from '../../core/api/startupApi';
import useAuth from '../../shared/hooks/useAuth';
import { Invitation, Startup, TeamMember } from '../../types';

const ROLE_LABEL: Record<string, string> = {
  CTO: 'CTO',
  CPO: 'CPO',
  MARKETING_HEAD: 'Marketing Head',
  ENGINEERING_LEAD: 'Engineering Lead',
  CO_FOUNDER: 'Co-Founder',
};

const ROLE_BADGE: Record<string, string> = {
  CTO: 'badge-blue',
  CPO: 'badge-blue',
  MARKETING_HEAD: 'badge-green',
  ENGINEERING_LEAD: 'badge-yellow',
  CO_FOUNDER: 'badge-purple',
};

const CoFounderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [teamsJoined, setTeamsJoined] = useState<Invitation[]>([]);
  const [startupMap, setStartupMap] = useState<Record<number, Startup | null>>({});
  // Live role map: startupId → current role from TeamMember (updated by founder)
  const [liveRoleMap, setLiveRoleMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyInvitations()
      .then(async (res) => {
        const allInvites = res.data || [];
        setInvitations(allInvites);
        const accepted = allInvites.filter((invite) => invite.status === 'ACCEPTED');
        setTeamsJoined(accepted);

        const uniqueIds = Array.from(new Set(allInvites.map((invite) => invite.startupId)));

        // Fetch startup info + live TeamMember roles in parallel
        const [startupEntries, teamEntries] = await Promise.all([
          Promise.all(
            uniqueIds.map((id) =>
              getStartupById(id)
                .then((response) => [id, response.data] as [number, Startup])
                .catch(() => [id, null] as [number, null])
            )
          ),
          // For each accepted startup, get the team and find this co-founder's current role
          Promise.all(
            accepted.map((invite) =>
              getTeamByStartup(invite.startupId)
                .then((teamRes) => {
                  const myMember = (teamRes.data || []).find(
                    (m: TeamMember) => m.userId === userId
                  );
                  return [invite.startupId, myMember?.role ?? invite.role] as [number, string];
                })
                .catch(() => [invite.startupId, invite.role] as [number, string])
            )
          ),
        ]);

        setStartupMap(Object.fromEntries(startupEntries));
        setLiveRoleMap(Object.fromEntries(teamEntries));
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [userId]);

  const pending = invitations.filter((invite) => invite.status === 'PENDING');
  let teamContent: React.ReactNode;
  if (loading) {
    teamContent = (
      <div className="space-y-3">
        {[1, 2].map((item) => (
          <div key={item} className="h-14 bg-dark-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  } else if (teamsJoined.length === 0) {
    teamContent = (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-3">
          <Rocket size={20} className="text-gray-500" />
        </div>
        <p className="text-gray-400 text-sm">Not part of any team yet.</p>
        <p className="text-gray-600 text-sm">Accept an invitation or browse startups.</p>
      </div>
    );
  } else {
    teamContent = (
      <div className="divide-y divide-dark-500">
        {teamsJoined.map((invite) => (
          <div key={invite.id} className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Rocket size={15} className="text-accent-light" />
              </div>
              <div>
                <p className="font-medium text-gray-200">
                  {startupMap[invite.startupId]?.name || `Startup #${invite.startupId}`}
                </p>
                <p className="text-gray-500 text-xs">
                  {startupMap[invite.startupId]?.industry
                    ? `${startupMap[invite.startupId]?.industry} · `
                    : ''}
                  Joined {new Date(invite.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className={ROLE_BADGE[liveRoleMap[invite.startupId] ?? invite.role] || 'badge-blue'}>
              {ROLE_LABEL[liveRoleMap[invite.startupId] ?? invite.role] || liveRoleMap[invite.startupId] || invite.role}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Co-Founder Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Explore startup opportunities, manage your invitations, and collaborate with founders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Teams Joined</p>
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <Users size={18} className="text-accent-light" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{teamsJoined.length}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Pending Invites</p>
              <div className="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                <Mail size={18} className="text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{pending.length}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Opportunities</p>
              <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                <Search size={18} className="text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-2">
              <button
                onClick={() => navigate('/cofounder/startups')}
                className="text-green-400 text-sm font-medium hover:text-green-300 transition-colors"
              >
                Browse →
              </button>
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={16} className="text-accent-light" /> Teams You've Joined
          </h2>

          {teamContent}
        </div>
      </div>
    </Layout>
  );
};

export default CoFounderDashboard;
