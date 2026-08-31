'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { resetPasswordApi } from '@/lib/order/api';
import toast from 'react-hot-toast';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <AlertCircle size={24} className="text-red-500" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Invalid reset link</h2>
          <p className="text-gray-500 text-sm mt-1.5">This link is missing a reset token. Please request a new one.</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle size={24} className="text-emerald-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Password updated</h2>
          <p className="text-gray-500 text-sm mt-1.5">Your password has been reset. You can now sign in.</p>
        </div>
        <Link
          href="/order/login"
          className="block w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 text-center transition-colors"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await resetPasswordApi(token, password);
      setDone(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
      toast.error(
        e?.response?.data?.error?.message ??
        e?.response?.data?.message ??
        'Reset link is invalid or has expired'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            autoFocus
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat your new password"
            autoComplete="new-password"
            className="w-full border border-gray-200 bg-white rounded-xl px-3 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {confirm && password !== confirm && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || (!!confirm && password !== confirm)}
        className="w-full disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset password'}
      </button>
    </form>
  );
}

export default function ResetPasswordForm() {
  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h1 className="text-2xl font-black text-gray-900 mb-1">Set new password</h1>
        <p className="text-sm text-gray-400 mb-6">Choose a strong password with at least 8 characters.</p>
        <Suspense fallback={<div className="text-center text-gray-400 text-sm py-4">Loading…</div>}>
          <ResetForm />
        </Suspense>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Remember your password?{' '}
        <Link href="/order/login" className="text-brand-500 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
