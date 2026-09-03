'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { forgotPasswordApi } from '@/lib/order/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return toast.error('Email is required');
    setLoading(true);
    try {
      await forgotPasswordApi(email.trim());
      setSent(true);
    } catch {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto font-poppins">
      <Link
        href="/order/login"
        className="inline-flex items-center gap-1.5 text-sm text-[#601131]/60 hover:text-[#601131] transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to sign in
      </Link>

      {sent ? (
        <div className="bg-[#F1EED0] rounded-2xl p-6 text-center space-y-4 border border-[#D7CDA7]">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <Mail size={24} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="font-bold text-[#601131] text-lg">Check your inbox</h2>
            <p className="text-[#601131]/60 text-sm mt-1.5">
              If <strong>{email}</strong> is registered, you&apos;ll receive a password reset link shortly. It expires in 60 minutes.
            </p>
          </div>
          <Link
            href="/order/login"
            className="block w-full py-3 border border-[#D7CDA7] rounded-xl text-sm font-semibold text-[#601131]/70 hover:bg-white text-center transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-[#601131] mb-1">Forgot password?</h1>
          <p className="text-sm text-[#601131]/50 mb-6">Enter your email and we&apos;ll send you a reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#601131] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                className="w-full border border-[#D7CDA7] bg-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976D2]/40 text-[#601131]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 bg-[#1976D2] hover:bg-[#1565C0]"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send reset link'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
