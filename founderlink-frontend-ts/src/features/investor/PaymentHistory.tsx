import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../shared/components/Layout';
import useAuth from '../../shared/hooks/useAuth';
import { getPaymentsByInvestor } from '../../core/api/paymentApi';
import { Payment } from '../../types';

const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user?.userId) {
      getPaymentsByInvestor(user.userId)
        .then(res => setPayments(res.data || []))
        .catch(() => toast.error('Failed to load payment history'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const totalInvested = payments
    .filter((p: Payment) => p.status === 'SUCCESS')
    .reduce((sum: number, p: Payment) => sum + Number(p.amount), 0);

  const statusIcon = (status: string): React.ReactNode => {
    if (status === 'SUCCESS') return <CheckCircle size={16} className="text-green-400" />;
    if (status === 'FAILED' || status === 'REJECTED') return <XCircle size={16} className="text-red-400" />;
    return <Clock size={16} className="text-yellow-400" />;
  };

  const statusBadge = (status: string): string => {
    if (status === 'SUCCESS') return 'badge-green';
    if (status === 'FAILED' || status === 'REJECTED') return 'badge-red';
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
    paymentsContent = <p className="text-center text-gray-500 py-10">No payments yet</p>;
  } else {
    paymentsContent = (
      <div className="divide-y divide-dark-500">
        {payments.map((payment: Payment) => (
          <div key={payment.id} className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
                {statusIcon(payment.status)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{payment.startupName}</p>
                <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                {payment.razorpayPaymentId && (
                  <p className="text-xs text-gray-600 font-mono">{payment.razorpayPaymentId}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">₹{Number(payment.amount).toLocaleString()}</p>
              <span className={statusBadge(payment.status)}>{payment.status}</span>
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
          <h1 className="text-2xl font-bold text-white">Payment History</h1>
          <p className="text-gray-500 text-sm mt-1">All your investment payments</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-2xl font-bold text-white">₹{totalInvested.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Total Invested</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-green-400">{payments.filter((p: Payment) => p.status === 'SUCCESS').length}</p>
            <p className="text-xs text-gray-500 mt-1">Successful</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-gray-400">{payments.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Transactions</p>
          </div>
        </div>

        {/* Payment list */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-accent-light" /> Transactions
          </h2>

          {paymentsContent}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentHistory;
