import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Edit } from 'lucide-react';
import Layout from '../../shared/components/Layout';
import Button from '../../shared/components/Button';
import { Input, Textarea, Select } from '../../shared/components/Input';
import { getStartupById, updateStartup } from '../../core/api/startupApi';
import { startupSchema } from '../../shared/utils/validationSchemas';
import { StartupFormData } from '../../types';

interface EditStartupParams {
  id: string;
  [key: string]: string | undefined;
}

const EditStartup: React.FC = () => {
  const { id } = useParams<EditStartupParams>();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StartupFormData>({ resolver: yupResolver(startupSchema) });
  const navigate = useNavigate();
  const startupId = Number(id);

  useEffect(() => {
    if (!id || Number.isNaN(startupId)) {
      toast.error('Invalid startup');
      return;
    }

    getStartupById(startupId)
      .then((res) => reset(res.data))
      .catch(() => toast.error('Failed to load startup'));
  }, [id, reset, startupId]);

  const onSubmit = async (data: StartupFormData): Promise<void> => {
    if (!id || Number.isNaN(startupId)) {
      toast.error('Invalid startup');
      return;
    }

    try {
      await updateStartup(startupId, { ...data, fundingGoal: parseFloat(String(data.fundingGoal)) });
      toast.success('Startup updated!');
      navigate('/founder/startups');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update startup');
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Edit size={22} className="text-accent-light" /> Edit Startup
          </h1>
          <p className="text-gray-400 text-sm mt-1">Update your startup details</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Startup Name" placeholder="e.g. GreenTech" error={errors.name?.message} {...register('name', { required: 'Required' })} />
              <Input label="Industry" placeholder="e.g. CleanTech" error={errors.industry?.message} {...register('industry', { required: 'Required' })} />
            </div>

            <Textarea rows={3} label="Description" placeholder="Describe your startup..." error={errors.description?.message} {...register('description', { required: 'Required' })} />

            <div className="grid grid-cols-2 gap-4">
              <Textarea rows={3} label="Problem Statement" placeholder="What problem are you solving?" error={errors.problemStatement?.message} {...register('problemStatement', { required: 'Required' })} />
              <Textarea rows={3} label="Your Solution" placeholder="How do you solve it?" error={errors.solution?.message} {...register('solution', { required: 'Required' })} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input type="number" label="Funding Goal ($)" placeholder="500000" error={errors.fundingGoal?.message} {...register('fundingGoal', { required: 'Required', min: 1 })} />
              <Select label="Stage" error={errors.stage?.message} {...register('stage', { required: 'Required' })}>
                <option value="">Select stage</option>
                <option value="IDEA">Idea</option>
                <option value="MVP">MVP</option>
                <option value="EARLY_TRACTION">Early Traction</option>
                <option value="SCALING">Scaling</option>
              </Select>
              <Input label="Location" placeholder="e.g. Berlin" {...register('location')} />
            </div>

            <div className="flex gap-3 pt-2 border-t border-dark-500">
              <Button type="submit" variant="primary" isLoading={isSubmitting}>Save Changes</Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/founder/startups')}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditStartup;
