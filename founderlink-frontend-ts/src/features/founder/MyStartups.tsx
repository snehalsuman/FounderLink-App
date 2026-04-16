import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Rocket } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../shared/components/Layout';
import useAuth from '../../shared/hooks/useAuth';
import { getStartupsByFounder, deleteStartup } from '../../core/api/startupApi';
import { Startup } from '../../types';

const MyStartups: React.FC = () => {
  const { userId } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(() => {
    if (!userId) return;
    getStartupsByFounder(userId)
      .then((res) => setStartups(res.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Delete this startup?')) return;
    setStartups((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteStartup(id);
      toast.success('Startup deleted');
    } catch {
      toast.error('Failed to delete');
      load();
    }
  };

  const getStartupStatus = (startup: Startup): { badge: string; label: string } => {
    if (startup.isApproved) return { badge: 'badge-green', label: 'Approved' };
    if (startup.isRejected) return { badge: 'badge-red', label: 'Rejected' };
    return { badge: 'badge-yellow', label: 'Pending' };
  };

  let startupsContent: React.ReactNode;
  if (loading) {
    startupsContent = (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-dark-800 rounded-xl animate-pulse border border-dark-500" />)}
      </div>
    );
  } else if (startups.length === 0) {
    startupsContent = (
      <div className="card text-center py-14">
        <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
          <Rocket size={24} className="text-gray-500" />
        </div>
        <p className="text-gray-300 font-medium mb-1">No startups yet</p>
        <p className="text-gray-500 text-sm mb-5">Create your first startup to get started</p>
        <Link to="/founder/startups/create" className="btn-primary">Create your first startup</Link>
      </div>
    );
  } else {
    startupsContent = (
      <div className="space-y-3">
        {startups.map((startup) => {
          const status = getStartupStatus(startup);
          return (
            <div key={startup.id} className="card flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Link to={`/founder/startups/${startup.id}`} className="font-semibold text-white hover:text-accent transition-colors">
                    {startup.name}
                  </Link>
                  <span className={status.badge}>{status.label}</span>
                  <span className="badge-blue">
                    {startup.stage === 'EARLY_TRACTION' ? 'Early Traction' : startup.stage}
                  </span>
                </div>
                <p className="text-gray-500 text-sm truncate">{startup.industry} {'\u00B7'} {startup.location}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/founder/team/${startup.id}`}
                  className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3"
                >
                  <Users size={13} /> Team
                </Link>
                <Link
                  to={`/founder/startups/${startup.id}/edit`}
                  className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3"
                >
                  <Edit size={13} /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(startup.id)}
                  aria-label={`Delete startup ${startup.name}`}
                  className="btn-danger flex items-center gap-1.5 text-sm py-1.5 px-3"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Startups</h1>
            <p className="text-gray-400 text-sm mt-1">{startups.length} startup{startups.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/founder/startups/create" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Startup
          </Link>
        </div>

        {startupsContent}
      </div>
    </Layout>
  );
};

export default MyStartups;
