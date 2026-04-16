import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket, CheckCircle, Clock, XCircle, Plus, ArrowRight,
  IndianRupee, TrendingUp, Users, CreditCard,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../shared/components/Layout';
import useAuth from '../../shared/hooks/useAuth';
import { getStartupsByFounder } from '../../core/api/startupApi';
import { getPaymentsByFounder } from '../../core/api/paymentApi';
import { Startup, Payment } from '../../types';

const FounderDashboard: React.FC = () => {
  const { userId, user } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentsLoading, setPaymentsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) return;
    getStartupsByFounder(userId)
      .then((res) => setStartups(res.data || []))
      .catch(() => toast.error('Failed to load startups'))
      .finally(() => setLoading(false));

    getPaymentsByFounder(userId)
      .then((res) => setPayments(res.data || []))
      .catch(() => {})
      .finally(() => setPaymentsLoading(false));
  }, [userId]);

  const approved = startups.filter((s) => s.isApproved);
  const rejected = startups.filter((s) => s.isRejected);
  const pending  = startups.filter((s) => !s.isApproved && !s.isRejected);

  const successPayments  = payments.filter((p) => p.status === 'SUCCESS');
  const pendingPayments  = payments.filter((p) => p.status === 'AWAITING_APPROVAL');
  const totalReceived    = successPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const uniqueInvestors  = new Set(successPayments.map((p) => p.investorId)).size;
  const userDisplayName = user?.name || user?.email?.split('@')[0];

  const statusLabel = (status: string): string => {
    if (status === 'AWAITING_APPROVAL') return 'Pending';
    if (status === 'SUCCESS') return 'Success';
    if (status === 'REJECTED') return 'Rejected';
    return status;
  };

  const paymentTone = (status: string): { badge: string; bg: string; text: string } => {
    if (status === 'SUCCESS') return { badge: 'badge-green', bg: 'bg-green-500/15', text: 'text-green-400' };
    if (status === 'REJECTED') return { badge: 'badge-red', bg: 'bg-red-500/15', text: 'text-red-400' };
    return { badge: 'badge-yellow', bg: 'bg-yellow-500/15', text: 'text-yellow-400' };
  };

  const startupStatusTone = (startup: Startup): { badge: string; label: string } => {
    if (startup.isApproved) return { badge: 'badge-green', label: 'Approved' };
    if (startup.isRejected) return { badge: 'badge-red', label: 'Rejected' };
    return { badge: 'badge-yellow', label: 'Pending' };
  };

  let recentPaymentsContent: React.ReactNode;
  if (paymentsLoading) {
    recentPaymentsContent = (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-dark-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  } else if (payments.length === 0) {
    recentPaymentsContent = (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-3">
          <IndianRupee size={20} className="text-gray-500" />
        </div>
        <p className="text-gray-400 text-sm">No payments received yet</p>
        <p className="text-gray-600 text-xs mt-1">Payments from investors will appear here</p>
      </div>
    );
  } else {
    recentPaymentsContent = (
      <div className="divide-y divide-dark-500">
        {payments.slice(0, 5).map((payment) => {
          const tone = paymentTone(payment.status);
          return (
            <div key={payment.id} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tone.bg}`}>
                  <IndianRupee size={15} className={tone.text} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-100">{payment.investorName}</p>
                  <p className="text-xs text-gray-500">
                    {payment.startupName} {'\u00B7'}{' '}
                    {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold text-white text-sm">
                  +{'\u20B9'}{Number(payment.amount).toLocaleString()}
                </p>
                <span className={tone.badge}>{statusLabel(payment.status)}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  let recentStartupsContent: React.ReactNode;
  if (loading) {
    recentStartupsContent = (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-14 bg-dark-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  } else if (startups.length === 0) {
    recentStartupsContent = (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
          <Rocket size={24} className="text-gray-500" />
        </div>
        <p className="text-gray-400 mb-4">You haven't created any startups yet</p>
        <Link to="/founder/startups/create" className="btn-primary">
          Create your first startup
        </Link>
      </div>
    );
  } else {
    recentStartupsContent = (
      <div className="divide-y divide-dark-500">
        {startups.slice(0, 5).map((startup) => {
          const startupTone = startupStatusTone(startup);
          return (
            <div key={startup.id} className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-100">{startup.name}</p>
                <p className="text-gray-500 text-sm">{startup.industry} {'\u00B7'} {startup.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge-blue">
                  {startup.stage === 'EARLY_TRACTION' ? 'Early Traction' : startup.stage}
                </span>
                <span className={startupTone.badge}>{startupTone.label}</span>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back{userDisplayName ? `, ${userDisplayName}` : ''}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Here's an overview of your startups</p>
          </div>
          <Link to="/founder/startups/create" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Startup
          </Link>
        </div>

        {/* Startup stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Startups</p>
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <Rocket size={18} className="text-accent-light" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{startups.length}</p>
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
              <p className="text-gray-400 text-sm">Pending Review</p>
              <div className="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                <Clock size={18} className="text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{pending.length}</p>
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

        {/* Payment stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="stat-card col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Raised</p>
              <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                <IndianRupee size={18} className="text-green-400" />
              </div>
            </div>
            {paymentsLoading ? (
              <div className="h-9 w-28 bg-dark-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold text-green-400">{'\u20B9'}{totalReceived.toLocaleString()}</p>
            )}
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Investors</p>
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <Users size={18} className="text-accent-light" />
              </div>
            </div>
            {paymentsLoading ? (
              <div className="h-9 w-12 bg-dark-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold text-white">{uniqueInvestors}</p>
            )}
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Pending</p>
              <div className="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                <TrendingUp size={18} className="text-yellow-400" />
              </div>
            </div>
            {paymentsLoading ? (
              <div className="h-9 w-12 bg-dark-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold text-white">{pendingPayments.length}</p>
            )}
          </div>
        </div>

        {/* Recent payments */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <CreditCard size={16} className="text-green-400" /> Recent Payments
            </h2>
            <Link
              to="/founder/payments"
              className="text-sm text-accent-light hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {recentPaymentsContent}
        </div>

        {/* Recent startups */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">My Startups</h2>
            <Link
              to="/founder/startups"
              className="text-sm text-accent-light hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {recentStartupsContent}
        </div>
      </div>
    </Layout>
  );
};

export default FounderDashboard;
