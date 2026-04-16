import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Rocket, TrendingUp, Users, CheckCircle } from 'lucide-react';
import Button from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { register as registerApi } from '../../core/api/authApi';
import { registerSchema } from '../../shared/utils/validationSchemas';
import { RegisterFormData } from '../../types';

interface RoleOption {
  value: RegisterFormData['role'];
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  activeBorder: string;
}

const ROLES: RoleOption[] = [
  {
    value: 'ROLE_FOUNDER',
    label: 'Founder',
    desc: 'Launch and manage your startup',
    icon: <Rocket size={16} />,
    color: 'text-accent-light',
    activeBorder: 'border-accent/50 bg-accent/10',
  },
  {
    value: 'ROLE_INVESTOR',
    label: 'Investor',
    desc: 'Discover and fund startups',
    icon: <TrendingUp size={16} />,
    color: 'text-green-400',
    activeBorder: 'border-green-500/50 bg-green-500/10',
  },
  {
    value: 'ROLE_COFOUNDER',
    label: 'Co-Founder',
    desc: 'Join a team and build together',
    icon: <Users size={16} />,
    color: 'text-yellow-400',
    activeBorder: 'border-yellow-500/50 bg-yellow-500/10',
  },
];

const Register: React.FC = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({ resolver: yupResolver(registerSchema) });
  const navigate = useNavigate();
  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    try {
      await registerApi(data);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">

      {/* ─── LEFT PANEL ─── same structure & styling as Login ─── */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 sticky top-0 h-screen overflow-hidden relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      >
        {/* Exact same overlay as Login */}
        <div className="absolute inset-0 bg-dark-900/75" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-dark-900/50 to-transparent" />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/40">
              <span className="text-white font-bold text-sm">FL</span>
            </div>
            <span className="text-xl font-bold text-white">FounderLink</span>
          </div>
        </div>

        {/* Middle content */}
        <div className="relative z-10 px-10 pb-4">
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Start your journey<br />
            with the right<br />
            <span className="text-accent-light">people & network</span>
          </h2>
          <p className="text-white/60 text-base mb-8 leading-relaxed">
            Join founders, investors, and co-founders on one platform.
          </p>

          {/* Benefits list */}
          <ul className="space-y-3">
            {[
              'Access to 800+ verified investors',
              'Manage your startup from day one',
              'Find co-founders & build your team',
              'Admin-reviewed listings for quality',
              'Real-time messaging & notifications',
            ].map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-white/60">
                <CheckCircle size={14} className="text-accent-light shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial — exact same card style as Login */}
        <div className="relative z-10 mx-10 mb-10 bg-white/8 border border-white/12 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-white/85 text-sm font-medium leading-relaxed">
            "We closed our seed round in 6 weeks using FounderLink."
          </p>
          <p className="text-white/45 text-xs mt-2">— Arjun Mehta, Founder at Nexora</p>
        </div>

        {/* Footer */}
        <p className="relative z-10 px-10 pb-6 text-white/30 text-xs">&copy; 2025 FounderLink. All rights reserved.</p>
      </div>

      {/* ─── RIGHT PANEL — vertically centered ─── */}
      <div className="flex-1 overflow-y-auto bg-dark-900">
        <div className="min-h-screen flex items-center justify-center px-8 py-10">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-white font-bold text-xs">FL</span>
              </div>
              <span className="text-xl font-bold text-white">FounderLink</span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-1.5">Create your account</h1>
            <p className="text-gray-400 text-sm mb-7">Join the network of founders and investors. Free forever.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Name */}
              <Input label="Full Name" placeholder="John Doe" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />

              {/* Email */}
              <Input type="email" label="Email address" placeholder="you@example.com" error={errors.email?.message} {...register('email', { required: 'Email is required' })} />

              {/* Password */}
              <Input
                type="password"
                label="Password"
                placeholder="Minimum 6 characters"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 characters' },
                })}
              />

              {/* Role picker */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2.5">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setValue('role', r.value)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${
                        selectedRole === r.value
                          ? `${r.activeBorder} ring-1 ring-offset-0`
                          : 'border-dark-400 bg-dark-700 hover:border-dark-300 hover:bg-dark-600'
                      }`}
                    >
                      <span className={`shrink-0 ${selectedRole === r.value ? r.color : 'text-gray-500'}`}>
                        {r.icon}
                      </span>
                      <div>
                        <p className={`text-sm font-semibold leading-tight ${selectedRole === r.value ? 'text-white' : 'text-gray-300'}`}>
                          {r.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-tight">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register('role', { required: 'Please select a role' })} />
                {errors.role && <p className="text-red-400 text-xs mt-1.5">{errors.role.message}</p>}
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isSubmitting}>Create Account</Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-light font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Register;
