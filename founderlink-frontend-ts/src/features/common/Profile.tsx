import React, { useEffect } from 'react';
import { AxiosError } from 'axios';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { InferType } from 'yup';
import { toast } from 'react-hot-toast';
import { User, Mail, Shield } from 'lucide-react';
import Layout from '../../shared/components/Layout';
import Button from '../../shared/components/Button';
import { Input, Textarea } from '../../shared/components/Input';
import useAuth from '../../shared/hooks/useAuth';
import { getMyProfile, updateProfile } from '../../core/api/userApi';
import { profileSchema } from '../../shared/utils/validationSchemas';
import { ProfileFormData } from '../../types';

type ProfileFormValues = InferType<typeof profileSchema>;

const Profile: React.FC = () => {
  const { user, userId } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: yupResolver(profileSchema) as Resolver<ProfileFormValues>,
  });

  useEffect(() => {
    if (!userId) {
      return;
    }

    getMyProfile(userId)
      .then((res) => reset(res.data))
      .catch(() => undefined);
  }, [reset, userId]);

  const onSubmit = async (data: ProfileFormValues): Promise<void> => {
    if (!userId) {
      toast.error('User not found');
      return;
    }

    try {
      await updateProfile(userId, { ...data, email: user?.email } as ProfileFormData & { email?: string });
      toast.success('Profile updated!');
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const roleLabel = user?.role?.replace('ROLE_', '') || 'User';
  const initial = user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User size={22} className="text-accent-light" /> My Profile
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage your public profile information</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dark-500">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-accent/20">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Mail size={14} className="text-gray-500" />
                <p className="text-gray-200 font-medium">{user?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-gray-500" />
                <span className="badge-blue">{roleLabel}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" placeholder="Your full name" {...register('name')} />
            <Textarea rows={3} label="Bio" placeholder="Tell us about yourself..." {...register('bio')} />
            <Input label="Skills" placeholder="e.g. React, Java, Product Management" {...register('skills')} />
            <Textarea rows={2} label="Experience" placeholder="Your professional experience..." {...register('experience')} />
            <Input label="Portfolio / Links" placeholder="https://github.com/yourname" {...register('portfolioLinks')} />
            <div className="pt-2">
              <Button type="submit" variant="primary" isLoading={isSubmitting}>Save Changes</Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
