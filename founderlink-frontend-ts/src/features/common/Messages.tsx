import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, ChevronRight, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../shared/components/Layout';
import useAuth from '../../shared/hooks/useAuth';
import { getMyConversations, startConversation } from '../../core/api/messagingApi';
import { getAuthUserById, getUsersByRole } from '../../core/api/userApi';
import { getStartupsByFounder } from '../../core/api/startupApi';
import { AuthUser, Conversation, RouteLocationState } from '../../types';

const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userMap, setUserMap] = useState<Record<number, AuthUser>>({});
  const [founderStartupMap, setFounderStartupMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [messageable, setMessageable] = useState<AuthUser[]>([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { userId, isFounder, isInvestor, isCoFounder } = useAuth();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let rolesToFetch: string[] = [];
    if (isFounder) {
      rolesToFetch = ['ROLE_INVESTOR', 'ROLE_COFOUNDER'];
    } else if (isInvestor || isCoFounder) {
      rolesToFetch = ['ROLE_FOUNDER'];
    }

    Promise.all([
      getMyConversations()
        .then((res) => {
          const payload = res.data as Conversation[] | { data?: Conversation[] };
          return Array.isArray(payload) ? payload : payload.data || [];
        })
        .catch(() => [] as Conversation[]),
      ...rolesToFetch.map((role) =>
        getUsersByRole(role)
          .then((res) => res.data || [])
          .catch(() => [] as AuthUser[])
      ),
    ])
      .then(([convos, ...userArrays]) => {
        setConversations(convos);

        const allUsers = userArrays.flat().filter((user) => user.userId !== userId);
        setMessageable(allUsers);

        const nextUserMap: Record<number, AuthUser> = {};
        allUsers.forEach((user) => {
          nextUserMap[user.userId] = user;
        });

        const coveredIds = new Set(allUsers.map((user) => user.userId));
        const extraIds = Array.from(
          new Set(
            convos.map((conversation) =>
              conversation.participant1Id === userId
                ? conversation.participant2Id
                : conversation.participant1Id
            )
          )
        ).filter((id) => !coveredIds.has(id));

        const finaliseUserMap = (map: Record<number, AuthUser>) => {
          setUserMap({ ...map });
          // Fetch startups for any founders in the map
          const founderIds = Object.values(map)
            .filter((u) => u.role === 'ROLE_FOUNDER')
            .map((u) => u.userId);
          if (founderIds.length > 0) {
            Promise.all(
              founderIds.map((fid) =>
                getStartupsByFounder(fid)
                  .then((r) => [fid, r.data] as [number, typeof r.data])
                  .catch(() => [fid, []] as [number, never[]])
              )
            ).then((results) => {
              const startupMap: Record<number, string> = {};
              results.forEach(([fid, startups]) => {
                if (startups.length > 0) {
                  startupMap[fid] = startups.map((s) => s.name).join(', ');
                }
              });
              setFounderStartupMap(startupMap);
            });
          }
        };

        if (extraIds.length > 0) {
          Promise.all(
            extraIds.map((id) =>
              getAuthUserById(id)
                .then((response) => [id, response.data] as [number, AuthUser])
                .catch(() => [id, null] as [number, null])
            )
          ).then((entries) => {
            entries.forEach(([id, data]) => {
              if (data) {
                nextUserMap[id] = data;
              }
            });
            finaliseUserMap(nextUserMap);
          });
        } else {
          finaliseUserMap(nextUserMap);
        }
      })
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, [isCoFounder, isFounder, isInvestor, userId]);

  const getRoleBadge = (role: string): { label: string; className: string } => {
    switch (role) {
      case 'ROLE_FOUNDER':    return { label: 'Founder',    className: 'bg-green-500/15 text-green-400 border border-green-500/25' };
      case 'ROLE_INVESTOR':   return { label: 'Investor',   className: 'bg-blue-500/15 text-blue-400 border border-blue-500/25' };
      case 'ROLE_COFOUNDER':  return { label: 'Co-Founder', className: 'bg-purple-500/15 text-purple-400 border border-purple-500/25' };
      default:                return { label: role.replace('ROLE_', ''), className: 'bg-dark-600 text-gray-400 border border-dark-400' };
    }
  };

  const filtered =
    search.trim().length > 0
      ? messageable.filter(
          (user) =>
            user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  let conversationsContent: React.ReactNode;
  if (loading) {
    conversationsContent = (
      <div className="space-y-3">
        {[1, 2].map((item) => (
          <div key={item} className="h-14 bg-dark-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  } else if (conversations.length === 0) {
    conversationsContent = (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-3">
          <MessageSquare size={20} className="text-gray-500" />
        </div>
        <p className="text-gray-400 text-sm">No conversations yet.</p>
        <p className="text-gray-600 text-sm">Search for someone above to start chatting.</p>
      </div>
    );
  } else {
    conversationsContent = (
      <div className="divide-y divide-dark-500">
        {conversations.map((conversation) => {
          const otherId =
            conversation.participant1Id === userId
              ? conversation.participant2Id
              : conversation.participant1Id;

          return (
            <div
              key={conversation.id}
              className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-dark-700 rounded-lg px-3 -mx-3 transition-colors group"
              onClick={() =>
                navigate(`/messages/${conversation.id}`, {
                  state: { otherUserId: otherId } as RouteLocationState,
                })
              }
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-dark-600 border border-dark-400 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-gray-300">
                    {(userMap[otherId]?.name || userMap[otherId]?.email || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-200">
                      {userMap[otherId]?.name || userMap[otherId]?.email || `User #${otherId}`}
                    </p>
                    {userMap[otherId]?.role && (() => {
                      const badge = getRoleBadge(userMap[otherId].role);
                      return (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${badge.className}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-gray-500 text-xs">
                    {founderStartupMap[otherId]
                      ? `${founderStartupMap[otherId]} · ${new Date(conversation.createdAt).toLocaleDateString()}`
                      : new Date(conversation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-gray-600 group-hover:text-gray-300 transition-colors"
              />
            </div>
          );
        })}
      </div>
    );
  }

  const handleSelectUser = async (user: AuthUser): Promise<void> => {
    setSearch('');
    setShowDropdown(false);
    try {
      const res = await startConversation(user.userId);
      const conversation = res.data as Conversation | { data?: Conversation };
      const value = ('data' in conversation ? conversation.data : conversation) as
        | Conversation
        | undefined;
      if (!value) {
        throw new Error('Conversation not created');
      }
      navigate(`/messages/${value.id}`, { state: { otherUserId: user.userId } as RouteLocationState });
    } catch {
      toast.error('Failed to start conversation');
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare size={22} className="text-accent-light" /> Messages
          </h1>
          <p className="text-gray-400 text-sm mt-1">Direct conversations with other users</p>
        </div>

        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={16} className="text-accent-light" /> New Conversation
          </h2>
          <div className="relative">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <input
                className="input-field pl-9 w-full"
                placeholder="Search by name or email..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              />
            </div>
            {showDropdown && filtered.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-dark-700 border border-dark-400 rounded-xl shadow-lg overflow-hidden">
                {filtered.slice(0, 8).map((user) => (
                  <button
                    key={user.userId}
                    onMouseDown={() => handleSelectUser(user)}
                    className="w-full text-left px-4 py-3 hover:bg-dark-600 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-accent-light text-xs font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-200 text-sm font-medium">{user.name || user.email}</p>
                        {user.role && (() => {
                          const badge = getRoleBadge(user.role);
                          return (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${badge.className}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-gray-500 text-xs">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {showDropdown && search.trim().length > 0 && filtered.length === 0 && (
              <div className="absolute z-20 w-full mt-1 bg-dark-700 border border-dark-400 rounded-xl px-4 py-3">
                <p className="text-gray-500 text-sm">No users found matching "{search}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-white mb-4">Conversations</h2>
          {conversationsContent}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
