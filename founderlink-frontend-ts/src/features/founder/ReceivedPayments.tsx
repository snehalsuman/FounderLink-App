import React, { useEffect, useState } from 'react';
import { IndianRupee, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../shared/components/Layout';
import useAuth from '../../shared/hooks/useAuth';
import { getPaymentsByFounder } from '../../core/api/paymentApi';
import { Payment } from '../../types';

const ReceivedPayments: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user?.userId) {
      getPaymentsByFounder(user.userId)
        .then((res) => setPayments(res.data || []))
        .catch(() => toast.error('Failed to load payments'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const totalReceived = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const uniqueInvestors = new Set(payments.filter((p) => p.status === 'SUCCESS').map((p) => p.investorId)).size;

  const statusLabel = (status: string): string => {
    if (status === 'AWAITING_APPROVAL') return 'PENDING';
    return status;
  };

  const statusBadge = (status: string): string => {
    if (status === 'SUCCESS') return 'badge-green';
    if (status === 'REJECTED') return 'badge-red';
    return 'badge-yellow';
  };

  let paymentsContent: React.ReactNode;
  if (loading) {
    paymentsContent = (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  } else if (payments.length === 0) {
    paymentsContent = <p className="text-center text-gray-500 py-10">No investments received yet</p>;
  } else {
    paymentsContent = (
      <div className="divide-y divide-dark-500">
        {payments.map((payment) => (
          <div key={payment.id} className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{payment.investorName}</p>
                <p className="text-xs text-gray-500">{payment.startupName}</p>
                <p className="text-xs text-gray-600">{new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-400">+{'\u20B9'}{Number(payment.amount).toLocaleString()}</p>
              <span className={statusBadge(payment.status)}>{statusLabel(payment.status)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Received Investments</h1>
          <p className="text-gray-500 text-sm mt-1">Payments received from investors</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-2xl font-bold text-green-400">{'\u20B9'}{totalReceived.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Total Received</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-white">{uniqueInvestors}</p>
            <p className="text-xs text-gray-500 mt-1">Investors</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-accent-light">{payments.filter((p) => p.status === 'SUCCESS').length}</p>
            <p className="text-xs text-gray-500 mt-1">Transactions</p>
          </div>
        </div>

        {/* Payments list */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <IndianRupee size={16} className="text-green-400" /> Investment Transactions
          </h2>

          {paymentsContent}
        </div>
      </div>
    </Layout>
  );
};

export default ReceivedPayments;
