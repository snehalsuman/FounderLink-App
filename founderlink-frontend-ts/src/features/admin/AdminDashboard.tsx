import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import {
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import Layout from '../../shared/components/Layout';
import Button from '../../shared/components/Button';
import { getAllStartupsAdmin, approveStartup, rejectStartup } from '../../core/api/startupApi';
import { Startup } from '../../types';

const AdminDashboard: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = (): void => {
    setLoading(true);
    getAllStartupsAdmin()
      .then((res) => setStartups(res.data?.content || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: number): Promise<void> => {
    setActionLoading(`${id}_approve`);
    try {
      await approveStartup(id);
      toast.success('Startup approved!');
      setExpandedId(null);
      load();
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number): Promise<void> => {
    setActionLoading(`${id}_reject`);
    try {
      await rejectStartup(id);
      toast.success('Startup rejected.');
      setExpandedId(null);
      load();
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const pending = startups.filter((startup) => !startup.isApproved && !startup.isRejected);
  const approved = startups.filter((startup) => startup.isApproved);
  const rejected = startups.filter((startup) => startup.isRejected);

  let pendingContent: React.ReactNode;
  if (loading) {
    pendingContent = (
      <div className="space-y-3">
        {[1, 2].map((item) => (
          <div key={item} className="h-20 bg-dark-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  } else if (pending.length === 0) {
    pendingContent = (
      <div className="card text-center py-10">
        <ShieldCheck size={36} className="mx-auto text-green-400 mb-3" />
        <p className="text-gray-300 font-medium">All caught up!</p>
        <p className="text-gray-500 text-sm mt-1">No startups pending review.</p>
      </div>
    );
  } else {
    pendingContent = (
      <div className="space-y-3">
        {pending.map((startup) => (
          <div key={startup.id} className="card">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-white">{startup.name}</h3>
                  <span className="badge-blue">
                    {startup.stage === 'EARLY_TRACTION' ? 'Early Traction' : startup.stage}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {startup.industry} · {startup.location} · ${Number(startup.fundingGoal).toLocaleString()} goal
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setExpandedId(expandedId === startup.id ? null : startup.id)}
                  leftIcon={<Eye size={14} />}
                  rightIcon={expandedId === startup.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                >
                  Review
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleApprove(startup.id)}
                  disabled={Boolean(actionLoading)}
                  isLoading={actionLoading === `${startup.id}_approve`}
                  leftIcon={<CheckCircle size={14} />}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleReject(startup.id)}
                  disabled={Boolean(actionLoading)}
                  isLoading={actionLoading === `${startup.id}_reject`}
                  leftIcon={<XCircle size={14} />}
                >
                  Reject
                </Button>
              </div>
            </div>

            {expandedId === startup.id && (
              <div className="mt-4 pt-4 border-t border-dark-500 space-y-3">
                {startup.description && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-gray-300 text-sm">{startup.description}</p>
                  </div>
                )}
                {startup.problemStatement && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Problem Statement</p>
                    <p className="text-gray-300 text-sm">{startup.problemStatement}</p>
                  </div>
                )}
                {startup.solution && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Solution</p>
                    <p className="text-gray-300 text-sm">{startup.solution}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-6 pt-1">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Funding Goal</p>
                    <p className="text-gray-200 text-sm font-medium">
                      ${Number(startup.fundingGoal).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Submitted</p>
                    <p className="text-gray-200 text-sm">
                      {new Date(startup.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Review and manage startup submissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total</p>
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <Building2 size={18} className="text-accent-light" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{startups.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Pending</p>
              <div className="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                <Clock size={18} className="text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{pending.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Approved</p>
              <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{approved.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Rejected</p>
              <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center">
                <XCircle size={18} className="text-red-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{rejected.length}</p>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={16} className="text-yellow-400" />
            Pending Review
            {pending.length > 0 && <span className="badge-yellow ml-1">{pending.length}</span>}
          </h2>

          {pendingContent}
        </div>

        {approved.length > 0 && (
          <div>
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" /> Approved Startups
            </h2>
            <div className="space-y-3">
              {approved.map((startup) => (
                <div
                  key={startup.id}
                  className="card flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity gap-4"
                >
                  <div>
                    <p className="font-semibold text-gray-200">{startup.name}</p>
                    <p className="text-gray-500 text-sm">
                      {startup.industry} · {startup.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-green flex items-center gap-1">
                      <CheckCircle size={11} /> Approved
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(startup.id)}
                      disabled={Boolean(actionLoading)}
                      isLoading={actionLoading === `${startup.id}_reject`}
                      leftIcon={<XCircle size={13} />}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rejected.length > 0 && (
          <div>
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <XCircle size={16} className="text-red-400" /> Rejected Startups
            </h2>
            <div className="space-y-3">
              {rejected.map((startup) => (
                <div
                  key={startup.id}
                  className="card flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity gap-4"
                >
                  <div>
                    <p className="font-semibold text-gray-200">{startup.name}</p>
                    <p className="text-gray-500 text-sm">
                      {startup.industry} · {startup.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-red flex items-center gap-1">
                      <XCircle size={11} /> Rejected
                    </span>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(startup.id)}
                      disabled={Boolean(actionLoading)}
                      isLoading={actionLoading === `${startup.id}_approve`}
                      leftIcon={<CheckCircle size={13} />}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
