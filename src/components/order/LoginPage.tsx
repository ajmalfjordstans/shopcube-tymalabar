'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/OrderAuthContext';
import { customerLoginApi, customerRegisterApi } from '@/lib/order/api';
import toast from 'react-hot-toast';

type Tab = 'login' | 'register';

export default function LoginPage({ next }: { next?: string }) {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('');

  const redirect = next ?? '/order';

  useEffect(() => {
    if (isLoggedIn) router.replace(redirect);
  }, [isLoggedIn, router, redirect]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const result = await customerLoginApi(email.trim(), password);
      const token = result?.data?.token ?? result?.token;
      const user = result?.data?.user ?? result?.user;
      if (!token) throw new Error('No token received.');
      login({ token, user });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      router.replace(redirect);
    } catch (err: unknown) {
      const msg = extractApiError(err) ?? 'Login failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) { toast.error('Please fill in all required fields.'); return; }
    setLoading(true);
    try {
      await customerRegisterApi({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim() || undefined,
      });
      const loginResult = await customerLoginApi(regEmail.trim(), regPassword);
      const token = loginResult?.data?.token ?? loginResult?.token;
      const user = loginResult?.data?.user ?? loginResult?.user;
      if (!token) throw new Error('Registration succeeded but login failed.');
      login({ token, user });
      toast.success('Account created! Welcome.');
      router.replace(redirect);
    } catch (err: unknown) {
      const msg = extractApiError(err) ?? 'Registration failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <Link
        href="/order"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to menu
      </Link>

      <h1 className="text-2xl font-black text-gray-900 mb-1">Welcome</h1>
      <p className="text-sm text-gray-400 mb-6">Sign in to track orders and save your details.</p>

      <div className="flex bg-white rounded-2xl p-1 mb-6 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {(['login', 'register'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              tab === t ? 'text-white shadow-sm bg-brand-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full border border-gray-200 bg-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full border border-gray-200 bg-white rounded-xl px-3 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/order/forgot-password" className="text-xs text-brand-500 hover:text-brand-700 font-medium">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-500">
            No account?{' '}
            <button type="button" onClick={() => setTab('register')} className="text-brand-500 font-medium hover:underline">
              Create one
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
            <input
              type="text"
              value={regName}
              onChange={e => setRegName(e.target.value)}
              placeholder="Jane Smith"
              autoComplete="name"
              className="w-full border border-gray-200 bg-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={regEmail}
              onChange={e => setRegEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full border border-gray-200 bg-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type={showRegPassword ? 'text' : 'password'}
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                className="w-full border border-gray-200 bg-white rounded-xl px-3 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowRegPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showRegPassword ? 'Hide password' : 'Show password'}
              >
                {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={regPhone}
              onChange={e => setRegPhone(e.target.value)}
              placeholder="07700 900000"
              autoComplete="tel"
              className="w-full border border-gray-200 bg-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have one?{' '}
            <button type="button" onClick={() => setTab('login')} className="text-brand-500 font-medium hover:underline">
              Sign in
            </button>
          </p>
        </form>
      )}

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400 mb-2">Or continue without an account</p>
        <Link href={redirect} className="text-sm text-brand-500 hover:text-brand-700 font-semibold">
          Continue as guest →
        </Link>
      </div>
    </div>
  );
}

type ApiErr = { response?: { data?: { error?: { message?: string }; message?: string } } };

function extractApiError(err: unknown): string | undefined {
  const e = err as ApiErr;
  return (
    e?.response?.data?.error?.message ??
    e?.response?.data?.message
  );
}
