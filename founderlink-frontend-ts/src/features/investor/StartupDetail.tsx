import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { MapPin, TrendingUp, DollarSign, Heart, ArrowLeft, Zap, CheckCircle, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../shared/components/Layout';
import useAuth from '../../shared/hooks/useAuth';
import { getStartupById, followStartup, isFollowingStartup } from '../../core/api/startupApi';
import { getInvestmentsByStartup } from '../../core/api/investmentApi';
import { createOrder, verifyPayment, getPaymentsByStartup } from '../../core/api/paymentApi';
import { getAuthUserById } from '../../core/api/userApi';
import { investmentSchema } from '../../shared/utils/validationSchemas';
import { Startup, Investment, Payment, InvestmentFormData, RazorpayResponse } from '../../types';

const StartupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isInvestor, user } = useAuth();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [following, setFollowing] = useState<boolean>(false);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvestmentFormData>({ resolver: yupResolver(investmentSchema) });

  useEffect(() => {
    if (!id) return;
    getStartupById(Number(id)).then(res => setStartup(res.data)).catch(() => toast.error('Failed to load'));
    getInvestmentsByStartup(Number(id)).then(res => setInvestments(res.data || [])).catch(() => {});
    getPaymentsByStartup(Number(id)).then(res => setPayments(res.data || [])).catch(() => {});
    isFollowingStartup(Number(id)).then(res => setFollowing(res.data.following)).catch(() => {});
  }, [id]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onInvest = async (data: InvestmentFormData): Promise<void> => {
    setPaymentLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error('Failed to load payment gateway'); setPaymentLoading(false); return; }

      let founderEmail = '';
      try {
        const founderRes = await getAuthUserById(startup?.founderId as number);
        founderEmail = founderRes.data?.email || '';
      } catch {
        // non-critical -- email will be skipped gracefully on backend
      }

      const orderRes = await createOrder({
        investorId: user?.userId as number,
        founderId: startup?.founderId as number,
        startupId: parseInt(id!),
        startupName: startup?.name || '',
        investorName: user?.name || user?.email || '',
        investorEmail: user?.email || '',
        founderEmail,
        amount: parseFloat(String(data.amount)),
      });

      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'FounderLink',
        description: `Investment in ${startup!.name}`,
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verifyRes.data.success) {
              toast.success('Payment successful! Investment confirmed.');
              reset();
              getInvestmentsByStartup(Number(id)).then(res => setInvestments(res.data || []));
              getPaymentsByStartup(Number(id)).then(res => setPayments(res.data || []));
            } else {
              toast.error('Payment verification failed');
            }
          } catch {
            toast.error('Error verifying payment');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => toast('Payment cancelled', { icon: '⚠️' }),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleFollow = async (): Promise<void> => {
    if (following) return;
    try {
      await followStartup(Number(id));
      setFollowing(true);
      toast.success('Following this startup!');
    } catch (err: any) {
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('already')) {
        setFollowing(true);
      } else {
        toast.error(msg || 'Failed to follow');
      }
    }
  };

  if (!startup) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading startup...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Count payments that founder has accepted (SUCCESS) as raised funds
  const totalRaised = payments
    .filter((p: Payment) => p.status === 'SUCCESS')
    .reduce((sum: number, p: Payment) => sum + Number(p.amount), 0);
  const progress = startup.fundingGoal ? Math.min((totalRaised / startup.fundingGoal) * 100, 100) : 0;
  const getInvestmentBadge = (status: string): string => {
    if (status === 'APPROVED') return 'badge-green';
    if (status === 'REJECTED') return 'badge-red';
    if (status === 'COMPLETED') return 'badge-blue';
    return 'badge-yellow';
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Main card */}
        <div className="card">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{startup.name}</h1>
              <div className="flex items-center flex-wrap gap-2">
                <span className="badge-blue">{startup.stage === 'EARLY_TRACTION' ? 'Early Traction' : startup.stage}</span>
                {startup.isApproved && <span className="badge-green flex items-center gap-1"><CheckCircle size={11} /> Approved</span>}
                <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} />{startup.location}</span>
                <span className="flex items-center gap-1 text-xs text-gray-500"><TrendingUp size={12} />{startup.industry}</span>
              </div>
            </div>
            <button
              onClick={handleFollow}
              className={`flex items-center gap-2 shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                following
                  ? 'bg-green-500/15 text-green-400 border border-green-500/30 cursor-default'
                  : 'btn-secondary'
              }`}
            >
              <Heart size={15} className={following ? 'fill-green-400' : ''} />
              {following ? 'Following' : 'Follow'}
            </button>
          </div>

          <p className="text-gray-300 leading-relaxed mb-5">{startup.description}</p>

          {/* Funding progress */}
          <div className="bg-dark-700 rounded-xl p-4 mb-5 border border-dark-400">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Funding Progress</span>
              <span className="text-sm font-semibold text-white">
                ₹{totalRaised.toLocaleString()} / ₹{Number(startup.fundingGoal).toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-dark-500 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">{progress.toFixed(1)}% of goal reached</p>
          </div>

          {/* Problem / Solution */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-700 rounded-xl p-4 border border-dark-400">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Problem</p>
              <p className="text-sm text-gray-300 leading-relaxed">{startup.problemStatement}</p>
            </div>
            <div className="bg-dark-700 rounded-xl p-4 border border-dark-400">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Solution</p>
              <p className="text-sm text-gray-300 leading-relaxed">{startup.solution}</p>
            </div>
          </div>
        </div>

        {/* Invest card -- investors only */}
        {isInvestor && (
          <div className="card border border-accent/20">
            <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
              <Zap size={16} className="text-accent-light" /> Invest in {startup.name}
            </h2>
            <p className="text-gray-500 text-sm mb-4">Secure payment via Razorpay -- you'll receive an email confirmation</p>
            <form onSubmit={handleSubmit(onInvest)} className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input
                  type="number"
                  className="input-field pl-7"
                  placeholder="Enter amount"
                  {...register('amount', { required: true, min: 1 })}
                />
                {errors.amount && <p className="text-red-400 text-xs mt-1">Enter a valid amount</p>}
              </div>
              <button
                type="submit"
                disabled={paymentLoading}
                className="btn-primary whitespace-nowrap flex items-center gap-2"
              >
                <CreditCard size={15} />
                {paymentLoading ? 'Processing...' : 'Pay & Invest'}
              </button>
            </form>
            <p className="text-xs text-gray-600 mt-3 flex items-center gap-1">
              Powered by Razorpay -- test mode active
            </p>
          </div>
        )}

        {/* Investment history */}
        {investments.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-white mb-4">
              Investments <span className="text-gray-500 font-normal text-sm">({investments.length})</span>
            </h2>
            <div className="divide-y divide-dark-500">
              {investments.map((inv: Investment) => (
                <div key={inv.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
                      <DollarSign size={14} className="text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-200">₹{Number(inv.amount).toLocaleString()}</p>
                  </div>
                  <span className={getInvestmentBadge(inv.status)}>{inv.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StartupDetail;
