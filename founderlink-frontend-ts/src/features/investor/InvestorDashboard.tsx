import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, DollarSign, TrendingUp, ArrowRight,
  CheckCircle, Clock, XCircle, CreditCard, IndianRupee,
} from 'lucide-react';
import Layout from '../../shared/components/Layout';
import useAuth from '../../shared/hooks/useAuth';
import { getAllStartups } from '../../core/api/startupApi';
import { getPaymentsByInvestor } from '../../core/api/paymentApi';
import { Startup, Payment } from '../../types';

const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState<boolean>(true);

  useEffect(() => {
    getAllStartups().then((res) => setStartups(res.data?.content || [])).catch(() => {});
    if (user?.userId) {
      getPaymentsByInvestor(user.userId)
        .then((res) => setPayments(res.data || []))
        .catch(() => {})
        .finally(() => setPaymentsLoading(false));
    }
  }, [user]);

  const successPayments = payments.filter((p: Payment) => p.status === 'SUCCESS');
  const pendingPayments = payments.filter((p: Payment) => p.status === 'AWAITING_APPROVAL');
  const failedPayments = payments.filter((p: Payment) => p.status === 'FAILED' || p.status === 'REJECTED');
  const totalInvested = successPayments.reduce((sum: number, p: Payment) => sum + Number(p.amount), 0);
  const userDisplayName = user?.name || user?.email?.split('@')[0];

  const statusIcon = (status: string): React.ReactNode => {
    if (status === 'SUCCESS') return <CheckCircle size={14} className="text-green-400" />;
    if (status === 'FAILED' || status === 'REJECTED') return <XCircle size={14} className="text-red-400" />;
    return <Clock size={14} className="text-yellow-400" />;
  };

  const statusBadge = (status: string): string => {
    if (status === 'SUCCESS') return 'badge-green';
    if (status === 'FAILED' || status === 'REJECTED') return 'badge-red';
    return 'badge-yellow';
  };

  const paymentTone = (status: string): string => {
    if (status === 'SUCCESS') return 'bg-green-500/15';
    if (status === 'AWAITING_APPROVAL') return 'bg-yellow-500/15';
    return 'bg-red-500/15';
  };

  const statusLabel = (status: string): string => {
    if (status === 'SUCCESS') return 'Confirmed';
    if (status === 'AWAITING_APPROVAL') return 'Pending';
    if (status === 'FAILED') return 'Failed';
    if (status === 'REJECTED') return 'Rejected';
    return status;
  };

  let recentInvestmentsContent: React.ReactNode;
  if (paymentsLoading) {
    recentInvestmentsContent = (
      <div className="space-y-3">
        {[1, 2, 3].map((i: number) => (
          <div key={i} className="h-14 bg-dark-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  } else if (payments.length === 0) {
    recentInvestmentsContent = (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
          <TrendingUp size={24} className="text-gray-500" />
        </div>
        <p className="text-gray-400 mb-4">No investments yet</p>
        <Link to="/investor/startups" className="btn-primary">Browse Startups</Link>
      </div>
    );
  } else {
    recentInvestmentsContent = (
      <div className="divide-y divide-dark-500">
        {payments.slice(0, 5).map((payment: Payment) => (
          <div key={payment.id} className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${paymentTone(payment.status)}`}>
                {statusIcon(payment.status)}
              </div>
              <div>
                <p className="font-medium text-gray-100 text-sm">{payment.startupName}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-semibold text-white text-sm">
                ₹{Number(payment.amount).toLocaleString()}
              </p>
              <span className={statusBadge(payment.status)}>
                {statusLabel(payment.status)}
              </span>
            </div>
          </div>
        ))}
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
              Welcome back{userDisplayName ? `, ${userDisplayName}` : ''} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">Your investment portfolio at a glance</p>
          </div>
          <Link to="/investor/startups" className="btn-primary flex items-center gap-2">
            <Search size={16} /> Browse Startups
          </Link>
        </div>

        {/* Portfolio stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Available Startups</p>
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <Search size={18} className="text-accent-light" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{startups.length}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Invested</p>
              <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                <IndianRupee size={18} className="text-green-400" />
              </div>
            </div>
            {paymentsLoading ? (
              <div className="h-9 w-24 bg-dark-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold text-green-400">₹{totalInvested.toLocaleString()}</p>
            )}
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Confirmed</p>
              <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-400" />
              </div>
            </div>
            {paymentsLoading ? (
              <div className="h-9 w-12 bg-dark-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold text-white">{successPayments.length}</p>
            )}
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Pending</p>
              <div className="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                <Clock size={18} className="text-yellow-400" />
              </div>
            </div>
            {paymentsLoading ? (
              <div className="h-9 w-12 bg-dark-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold text-white">{pendingPayments.length}</p>
            )}
          </div>
        </div>

        {/* Payment summary banner -- shown when there are pending payments */}
        {!paymentsLoading && pendingPayments.length > 0 && (
          <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/8 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-yellow-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-300">
                  {pendingPayments.length} payment{pendingPayments.length !== 1 ? 's' : ''} awaiting approval
                </p>
                <p className="text-xs text-yellow-500 mt-0.5">
                  ₹{pendingPayments.reduce((s: number, p: Payment) => s + Number(p.amount), 0).toLocaleString()} pending confirmation from founders
                </p>
              </div>
            </div>
            <Link to="/investor/payments" className="btn-secondary text-xs shrink-0 flex items-center gap-1">
              View <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Failed payment alert */}
        {!paymentsLoading && failedPayments.length > 0 && (
          <div className="rounded-xl border border-red-500/25 bg-red-500/8 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <XCircle size={18} className="text-red-400 shrink-0" />
              <p className="text-sm font-medium text-red-300">
                {failedPayments.length} payment{failedPayments.length !== 1 ? 's' : ''} failed or rejected
              </p>
            </div>
            <Link to="/investor/payments" className="btn-secondary text-xs shrink-0 flex items-center gap-1">
              View <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Recent investments */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <CreditCard size={16} className="text-accent-light" /> Recent Investments
            </h2>
            <Link
              to="/investor/payments"
              className="text-sm text-accent-light hover:underline flex items-center gap-1"
            >
              Full history <ArrowRight size={14} />
            </Link>
          </div>

          {recentInvestmentsContent}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/investor/payments"
            className="card flex items-center justify-between group hover:border-accent/30 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-200 text-sm">Payment History</p>
              <p className="text-xs text-gray-500 mt-0.5">All transactions &amp; Razorpay receipts</p>
            </div>
            <ArrowRight size={16} className="text-gray-500 group-hover:text-accent-light transition-colors" />
          </Link>
          <Link
            to="/investor/investments"
            className="card flex items-center justify-between group hover:border-accent/30 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-200 text-sm">My Investments</p>
              <p className="text-xs text-gray-500 mt-0.5">Investment status per startup</p>
            </div>
            <DollarSign size={16} className="text-gray-500 group-hover:text-accent-light transition-colors" />
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default InvestorDashboard;
