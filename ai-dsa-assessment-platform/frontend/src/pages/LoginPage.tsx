import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Brain, Lock, Mail, AlertCircle, Eye, EyeOff, Code2, Cpu, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/apiClient';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setServerError('');
    try {
      const res = await authApi.login(data);
      const { user, accessToken, refreshToken } = res.data.data;
      login(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error?.response?.data?.message || 'Login failed. Please check your credentials.';
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredential = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-surface-950)' }}>
      {/* ─── Left Hero Panel ─── */}
      <div style={{
        display: 'none',
        width: '55%',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem',
        background: 'linear-gradient(135deg, #0d1117 0%, #0a0e1a 60%, #060810 100%)',
        borderRight: '1px solid var(--color-surface-600)',
        position: 'relative',
        overflow: 'hidden',
      }} className="login-left-panel">
        {/* Animated grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(56,139,253,0.08) 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }} />
        {/* Blue glow orb */}
        <div style={{
          position: 'absolute', top: '-10%', left: '10%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(31,111,235,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(163,113,247,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '3rem' }}>
            <div style={{
              padding: '0.75rem',
              background: 'linear-gradient(135deg, rgba(31,111,235,0.3), rgba(163,113,247,0.2))',
              borderRadius: '0.875rem',
              border: '1px solid rgba(56,139,253,0.3)',
              backdropFilter: 'blur(8px)',
            }}>
              <Brain size={28} style={{ color: '#58a6ff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>AI DSA Assessment</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '2px' }}>Practice Lab · Placement Ready</p>
            </div>
          </div>

          {/* Headline */}
          <h2 style={{
            fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '1rem',
            letterSpacing: '-0.5px',
          }}>
            Master DSA with an{' '}
            <span style={{
              background: 'linear-gradient(90deg, #58a6ff, #a371f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              AI Mentor
            </span>
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Simulate real company coding assessments. Get AI guidance, run Java code, and track your growth with adaptive difficulty.
          </p>

          {/* Feature cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              {
                icon: <Brain size={18} style={{ color: '#58a6ff' }} />,
                bg: 'rgba(31,111,235,0.12)',
                border: 'rgba(56,139,253,0.2)',
                title: 'AI-Powered Mentoring',
                desc: 'Progressive hints, approach review, and Socratic debugging from a senior-engineer AI',
              },
              {
                icon: <Cpu size={18} style={{ color: '#3fb950' }} />,
                bg: 'rgba(35,134,54,0.1)',
                border: 'rgba(63,185,80,0.2)',
                title: 'Real Code Execution',
                desc: 'Run Java code against hidden test cases in a sandboxed environment',
              },
              {
                icon: <TrendingUp size={18} style={{ color: '#d29922' }} />,
                bg: 'rgba(187,128,9,0.1)',
                border: 'rgba(210,153,34,0.2)',
                title: 'Adaptive Assessment',
                desc: 'Problems adapt to your skill level — difficulty rises as you improve',
              },
              {
                icon: <Code2 size={18} style={{ color: '#a371f7' }} />,
                bg: 'rgba(163,113,247,0.1)',
                border: 'rgba(163,113,247,0.2)',
                title: '20+ DSA Topics',
                desc: 'Arrays to DP, Trees to Graphs — full placement preparation coverage',
              },
            ].map((f) => (
              <div key={f.title} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                padding: '0.875rem 1rem',
                background: f.bg,
                border: `1px solid ${f.border}`,
                borderRadius: '0.625rem',
                transition: 'transform 0.15s',
              }}>
                <div style={{ padding: '0.375rem', borderRadius: '0.375rem', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{f.title}</p>
                  <p style={{ fontSize: '0.76rem', color: 'var(--color-muted)', marginTop: '2px', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-surface-600)' }}>
            {[['20+', 'DSA Problems'], ['6', 'AI Hint Levels'], ['10pt', 'Score System']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#58a6ff' }}>{val}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right Login Panel ─── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'var(--color-surface-950)',
      }}>
        {/* Mobile logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }} className="login-mobile-logo">
          <div style={{ padding: '0.5rem', background: 'rgba(31,111,235,0.2)', borderRadius: '0.625rem', border: '1px solid rgba(56,139,253,0.3)' }}>
            <Brain size={20} style={{ color: '#58a6ff' }} />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>AI DSA Assessment</span>
        </div>

        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--color-surface-800)',
          border: '1px solid var(--color-surface-600)',
          borderRadius: '1rem',
          padding: '2.5rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,139,253,0.05)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.25rem 0.75rem',
              background: 'rgba(31,111,235,0.12)',
              border: '1px solid rgba(56,139,253,0.25)',
              borderRadius: '99px',
              fontSize: '0.72rem',
              color: '#58a6ff',
              fontWeight: 500,
              marginBottom: '1rem',
            }}>
              <Zap size={11} />
              AI-Powered Assessment Platform
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.375rem' }}>Welcome back</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Sign in to continue your DSA practice</p>
          </div>

          {/* Error */}
          {serverError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1rem', marginBottom: '1.25rem',
              background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)',
              borderRadius: '0.5rem', fontSize: '0.8rem', color: '#f85149',
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div style={{ marginBottom: '1.125rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: '#e6edf3', marginBottom: '0.5rem' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="input"
                  style={{ paddingLeft: '2.375rem', height: '2.625rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                />
              </div>
              {errors.email && <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#f85149' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: '#e6edf3', marginBottom: '0.5rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input"
                  style={{ paddingLeft: '2.375rem', paddingRight: '2.75rem', height: '2.625rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#f85149' }}>{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                height: '2.75rem',
                background: isLoading ? 'var(--color-accent-700)' : 'linear-gradient(135deg, var(--color-accent-600), #1158c7)',
                color: 'white', border: 'none', borderRadius: '0.5rem',
                fontSize: '0.9rem', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                boxShadow: '0 4px 14px rgba(31,111,235,0.35)',
              }}
            >
              {isLoading ? (
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : <ChevronRight size={16} />}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Dev credentials */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.875rem',
            background: 'rgba(187,128,9,0.08)',
            border: '1px solid rgba(210,153,34,0.2)',
            borderRadius: '0.5rem',
          }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-warning-400)', marginBottom: '0.5rem' }}>
              ⚡ Dev Credentials — Click to fill
            </p>
            <button
              type="button"
              onClick={() => fillCredential('student@example.com', 'Student@12345')}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.25rem', padding: '0.375rem 0.625rem', marginBottom: '0.375rem', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '0.72rem', transition: 'background 0.1s' }}
            >
              👤 Student: student@example.com / Student@12345
            </button>
            <button
              type="button"
              onClick={() => fillCredential('admin@example.com', 'Admin@12345')}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.25rem', padding: '0.375rem 0.625rem', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '0.72rem', transition: 'background 0.1s' }}
            >
              🛡️ Admin: admin@example.com / Admin@12345
            </button>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.82rem' }}>
              Don&apos;t have an account?{' '}
              <Link to="/register" style={{ color: '#58a6ff', fontWeight: 500, textDecoration: 'none' }}>
                Create account →
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          .login-left-panel { display: flex !important; }
          .login-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
