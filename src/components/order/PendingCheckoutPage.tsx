'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCheckoutStatusApi } from '@/lib/order/api';
import { useAuth } from '@/context/OrderAuthContext';

const SESSION_KEY = 'sc_pending_checkout_identity';

/**
 * Landed on after Stripe redirects back from the payment form (PaymentForm's returnUrl).
 * No Order exists client-side yet at this point — createGuestCheckoutIntent never created one,
 * only a PendingCheckout + PaymentIntent. Stripe's own redirect hands back `payment_intent` as
 * a query param, which is exactly what the Stripe webhook keys the eventual Order on, so this
 * page polls GET /orders/guest/checkout-status/{paymentIntentId} until the webhook has actually
 * materialized the order, then forwards to it.
 */
export default function PendingCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, initialized } = useAuth();
  const mountedRef = useRef(true);

  const paymentIntentId = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  const [identity, setIdentity] = useState<{ phone?: string; email?: string } | null | undefined>(undefined);
  const [manualPhone, setManualPhone] = useState('');
  const [pollEnabled, setPollEnabled] = useState(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      setIdentity(raw ? JSON.parse(raw) : null);
    } catch {
      setIdentity(null);
    }
  }, []);

  const trackBy: { phone?: string; email?: string } | null | undefined =
    identity === undefined || !initialized
      ? undefined
      : identity ?? (session?.user.phone || session?.user.email
          ? { phone: session.user.phone, email: session.user.email }
          : null);

  const { data, error } = useQuery({
    queryKey: ['order-checkout-status', paymentIntentId, trackBy],
    queryFn: () => getCheckoutStatusApi(paymentIntentId!, trackBy!),
    enabled: !!paymentIntentId && !!trackBy && pollEnabled,
    refetchInterval: pollEnabled ? 1_500 : false,
    retry: false,
  });

  const status = data?.data;

  useEffect(() => {
    if (status?.status === 'created' && status.orderId) {
      setPollEnabled(false);
      router.replace(`/order/orders/${status.orderId}`);
    }
  }, [status, router]);

  useEffect(() => {
    if (error && mountedRef.current) setPollEnabled(false);
  }, [error]);

  if (!paymentIntentId || redirectStatus === 'failed') {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center text-center gap-3 font-poppins">
        <AlertCircle size={40} className="text-red-400" />
        <h1 className="text-xl font-bold text-[#601131]">Payment didn&apos;t go through</h1>
        <p className="text-sm text-[#601131]/50">Nothing was charged and no order was placed. You can go back and try again.</p>
        <Link href="/order/checkout" className="mt-2 text-[#B87814] font-semibold text-sm underline">
          Back to checkout
        </Link>
      </div>
    );
  }

  if (trackBy === null) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center text-center gap-3 font-poppins">
        <Loader2 className="animate-spin text-[#F0A429]" size={32} />
        <h1 className="text-xl font-bold text-[#601131]">Finishing up your order…</h1>
        <p className="text-sm text-[#601131]/50">
          We just need the phone number you checked out with to find it.
        </p>
        <form
          className="w-full flex gap-2 mt-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!manualPhone.trim()) return;
            setIdentity({ phone: manualPhone.trim() });
          }}
        >
          <input
            type="tel"
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
            placeholder="Phone number"
            className="flex-1 border border-[#D7CDA7] rounded-lg px-3 py-2 text-sm bg-white text-[#601131]"
          />
          <button type="submit" className="bg-[#F0A429] hover:bg-[#e79b26] text-white text-sm font-semibold px-4 rounded-lg">
            Continue
          </button>
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center text-center gap-3 font-poppins">
        <AlertCircle size={40} className="text-red-400" />
        <h1 className="text-xl font-bold text-[#601131]">Couldn&apos;t confirm your order</h1>
        <p className="text-sm text-[#601131]/50">
          This checkout may have expired. If you were charged, please contact the store — otherwise no payment was taken.
        </p>
        <Link href="/order" className="mt-2 text-[#B87814] font-semibold text-sm underline">
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col items-center text-center gap-3 font-poppins">
      <Loader2 className="animate-spin text-[#F0A429]" size={32} />
      <h1 className="text-xl font-bold text-[#601131]">Finishing up your order…</h1>
      <p className="text-sm text-[#601131]/50">Your payment went through — just confirming with the store.</p>
    </div>
  );
}
