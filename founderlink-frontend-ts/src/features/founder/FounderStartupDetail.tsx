import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Users, Target, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../shared/components/Layout';
import { getStartupById } from '../../core/api/startupApi';
import { getPaymentsByStartup } from '../../core/api/paymentApi';
import { Startup, Payment } from '../../types';

const FounderStartupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getStartupById(Number(id)),
      getPaymentsByStartup(Number(id)),
    ])
      .then(([startupRes, paymentsRes]) => {
        setStartup(startupRes.data);
        setPayments(paymentsRes.data || []);
      })
      .catch(() => toast.error('Failed to load startup'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!startup) {
    return (
      <Layout>
        <div className="text-center py-20 text-gray-400">Startup not found.</div>
      </Layout>
    );
  }

  const successPayments = payments.filter((p: Payment) => p.status === 'SUCCESS');
  const totalRaised = successPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const fundingGoal = Number(startup.fundingGoal) || 0;
  const remaining = Math.max(fundingGoal - totalRaised, 0);
  const progress = fundingGoal > 0 ? Math.min((totalRaised / fundingGoal) * 100, 100) : 0;

  // Group by investor name and sum their contributions
  const contributorMap = new Map<string, { name: string; total: number; count: number }>();
  successPayments.forEach((p) => {
    const key = String(p.investorId);
    const existing = contributorMap.get(key);
    if (existing) {
      existing.total += Number(p.amount);
      existing.count += 1;
    } else {
      contributorMap.set(key, { name: p.investorName || `Investor #${p.investorId}`, total: Number(p.amount), count: 1 });
    }
  });
  const contributors = Array.from(contributorMap.values()).sort((a, b) => b.total - a.total);

  const getStageLabel = (stage: string) => stage === 'EARLY_TRACTION' ? 'Early Traction' : stage;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Back */}
        <button
          onClick={() => navigate('/founder/startups')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={16} /> Back to my startups
        </button>

        {/* Header card */}
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                <span className="text-accent font-bold text-lg">{startup.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{startup.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  {startup.isApproved && <span className="badge-green">Approved</span>}
                  {startup.isRejected && <span className="badge-red">Rejected</span>}
                  {!startup.isApproved && !startup.isRejected && <span className="badge-yellow">Pending</span>}
                  <span className="badge-blue">{getStageLabel(startup.stage)}</span>
                  {startup.industry && <span className="badge-blue">{startup.industry}</span>}
                  {startup.location && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      {startup.location}
                    </span>
                  )}
                </div>
              </div>
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
            </div>
          </div>

          {startup.description && (
            <p className="text-gray-400 text-sm leading-relaxed mt-4">{startup.description}</p>
          )}
        </div>

        {/* Funding overview */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-accent-light" /> Funding overview
          </h2>

          {/* 3 stat cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-dark-700 rounded-xl p-4 border border-dark-400">
              <div className="flex items-center gap-1.5 mb-2">
                <Target size={13} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Funding Goal</span>
              </div>
              <p className="text-xl font-bold text-white">₹{fundingGoal.toLocaleString()}</p>
            </div>
            <div className="bg-dark-700 rounded-xl p-4 border border-dark-400">
              <div className="flex items-center gap-1.5 mb-2">
                <DollarSign size={13} className="text-green-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Received</span>
              </div>
              <p className="text-xl font-bold text-green-400">₹{totalRaised.toLocaleString()}</p>
            </div>
            <div className="bg-dark-700 rounded-xl p-4 border border-dark-400">
              <div className="flex items-center gap-1.5 mb-2">
                <DollarSign size={13} className="text-yellow-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Remaining</span>
              </div>
              <p className="text-xl font-bold text-yellow-400">₹{remaining.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-gray-400">
                ₹{totalRaised.toLocaleString()} raised of ₹{fundingGoal.toLocaleString()} goal
              </span>
              <span className="text-sm font-semibold text-accent-light">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 bg-dark-500 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {successPayments.length} confirmed payment{successPayments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Investor contributions */}
        {contributors.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-white mb-4">
              Investor contributions{' '}
              <span className="text-gray-500 font-normal text-sm">({contributors.length})</span>
            </h2>
            <div className="divide-y divide-dark-500">
              {contributors.map((c, idx) => {
                const pct = fundingGoal > 0 ? ((c.total / fundingGoal) * 100).toFixed(1) : '0.0';
                return (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-dark-700 border border-dark-400 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-gray-300">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-200">{c.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-white shrink-0">
                      ₹{c.total.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-gray-500">({pct}% of goal)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Problem / Solution */}
        {(startup.problemStatement || startup.solution) && (
          <div className="grid grid-cols-2 gap-4">
            {startup.problemStatement && (
              <div className="card">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Problem</p>
                <p className="text-sm text-gray-300 leading-relaxed">{startup.problemStatement}</p>
              </div>
            )}
            {startup.solution && (
              <div className="card">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Solution</p>
                <p className="text-sm text-gray-300 leading-relaxed">{startup.solution}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FounderStartupDetail;
