import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Brain, User, Mail, Lock, GraduationCap, Users, Code, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/apiClient';
import { useAuthStore } from '../store/authStore';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  college?: string;
  batch?: string;
  preferredLanguage: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ defaultValues: { preferredLanguage: 'java' } });

  const password = watch('password', '');

  // Manual validation
  const validateForm = (data: RegisterFormData): string | null => {
    if (!data.name || data.name.length < 2) return 'Name must be at least 2 characters';
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Invalid email address';
    if (!data.password || data.password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(data.password)) return 'Password must contain uppercase letter';
    if (!/[a-z]/.test(data.password)) return 'Password must contain lowercase letter';
    if (!/[0-9]/.test(data.password)) return 'Password must contain a number';
    if (data.password !== data.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const passwordStrength = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const onSubmit = async (data: RegisterFormData) => {
    const error = validateForm(data);
    if (error) { setServerError(error); return; }

    setIsLoading(true);
    setServerError('');
    try {
      const res = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        college: data.college,
        batch: data.batch,
        preferredLanguage: data.preferredLanguage,
      });
      const { user, accessToken, refreshToken } = res.data.data;
      login(user, accessToken, refreshToken);
      toast.success('Account created! Welcome to AI DSA Assessment!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-accent-600/20 rounded-lg border border-accent-600/30">
              <Brain className="w-6 h-6 text-accent-400" />
            </div>
            <span className="font-bold text-xl text-white">AI DSA Assessment</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-muted text-sm">Start your DSA practice journey</p>
        </div>
        <div className="card p-8">
          {serverError && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-error-500/10 border border-error-500/30 rounded-lg text-error-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input {...register('name')} placeholder="John Doe" className="input pl-10" />
              </div>
              {errors.name && <p className="mt-1 text-xs text-error-400">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input {...register('email')} type="email" placeholder="you@example.com" className="input pl-10" />
              </div>
              {errors.email && <p className="mt-1 text-xs text-error-400">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {Object.entries(passwordStrength).map(([key, met]) => (
                    <div key={key} className={`flex items-center gap-1 text-xs ${met ? 'text-success-400' : 'text-muted'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-success-400' : 'bg-surface-500'}`} />
                      {key === 'length' ? '8+ characters' : key === 'upper' ? 'Uppercase' : key === 'lower' ? 'Lowercase' : 'Number'}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input {...register('confirmPassword')} type="password" placeholder="••••••••" className="input pl-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">College</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input {...register('college')} placeholder="Optional" className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Batch</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input {...register('batch')} placeholder="e.g. 2024" className="input pl-10" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Preferred Language</label>
              <div className="relative">
                <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <select {...register('preferredLanguage')} className="input pl-10">
                  <option value="java">Java (Default)</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-primary w-full justify-center py-2.5 mt-6">
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-muted text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
