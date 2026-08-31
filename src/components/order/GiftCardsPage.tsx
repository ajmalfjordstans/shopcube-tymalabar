'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Elements } from '@stripe/react-stripe-js';
import { getStoreBySlugApi, lookupGiftCardApi, createGiftCardPaymentIntentApi, purchaseGiftCardApi } from '@/lib/order/api';
import { STORE_SLUG } from '@/lib/order/config';
import { getStripe } from '@/lib/order/stripe';
import PaymentForm from './PaymentForm';
import type { Store } from '@/types/order';
import { Gift, Search, ChevronLeft, Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 bg-white';

const PRESETS = [10, 25, 50, 100];

interface GiftCardLookup {
  code: string;
  remainingBalance: number;
  expiresAt: string | null;
  isExpired: boolean;
  isActive: boolean;
}

function formatExpiry(expiresAt: string | null, isExpired: boolean) {
  if (!expiresAt) return 'No expiry';
  const d = new Date(expiresAt);
  const str = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return isExpired ? `Expired ${str}` : `Valid until ${str}`;
}

function CheckBalance() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GiftCardLookup | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'check') {
      const giftCode = params.get('gift_code');
      if (giftCode) setCode(giftCode);
    }
  }, []);

  const handleCheck = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { toast.error('Please enter a gift card code'); return; }
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await lookupGiftCardApi(trimmed);
      setResult(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setError(err?.response?.data?.error?.message ?? 'Gift card not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleCheck()}
          placeholder="e.g. GC-9D4A7C82"
          className={`${inp} flex-1 font-mono`}
        />
        <button
          onClick={handleCheck}
          disabled={loading}
          className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-60 transition-colors flex-shrink-0"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Check
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className={`rounded-2xl border p-5 space-y-3 ${!result.isActive || result.isExpired ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center gap-2">
            <Gift size={18} className={result.isActive && !result.isExpired ? 'text-green-600' : 'text-gray-400'} />
            <span className="font-bold font-mono text-gray-900">{result.code}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-auto ${
              !result.isActive ? 'bg-red-100 text-red-600'
              : result.isExpired ? 'bg-gray-100 text-gray-500'
              : 'bg-green-100 text-green-700'
            }`}>
              {!result.isActive ? 'Deactivated' : result.isExpired ? 'Expired' : 'Active'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Remaining balance</span>
              <span className="font-bold text-2xl text-gray-900">£{result.remainingBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Validity</span>
              <span className={`font-medium ${result.isExpired ? 'text-red-500' : 'text-gray-700'}`}>
                {formatExpiry(result.expiresAt, result.isExpired)}
              </span>
            </div>
          </div>

          {result.isActive && !result.isExpired && result.remainingBalance > 0 && (
            <p className="text-xs text-green-700 pt-1 border-t border-green-200">
              This gift card can be used at checkout on the order summary page.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BuyGiftCard({ store }: { store: Store | undefined }) {
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [form, setForm] = useState({ purchaserName: '', purchaserEmail: '', recipientName: '', recipientEmail: '', message: '' });
  const [step, setStep] = useState<'form' | 'payment' | 'done'>('form');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [purchaseData, setPurchaseData] = useState<{ amount: number } | null>(null);
  const [loadingPI, setLoadingPI] = useState(false);

  const finalAmount = amount ?? (customAmount ? parseFloat(customAmount) : null);
  const storeId = store?.id ?? '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const paymentIntent = params.get('payment_intent');
    const redirectStatus = params.get('redirect_status');
    const gcAmount = params.get('gc_amount');
    const gcPurchaser = params.get('gc_purchaser');
    const gcPurchaserEmail = params.get('gc_purchaser_email');
    const gcRecipient = params.get('gc_recipient');
    const gcRecipientEmail = params.get('gc_recipient_email');
    const gcMessage = params.get('gc_message');

    if (!paymentIntent || !redirectStatus) return;
    window.history.replaceState({}, '', '/order/gift-cards');

    if (redirectStatus === 'succeeded' && gcAmount) {
      purchaseGiftCardApi({
        storeId,
        amount: parseFloat(gcAmount),
        purchaserName: gcPurchaser || undefined,
        purchaserEmail: gcPurchaserEmail || undefined,
        recipientName: gcRecipient || undefined,
        recipientEmail: gcRecipientEmail || undefined,
        message: gcMessage || undefined,
        paymentIntentId: paymentIntent,
      }).then(res => {
        sessionStorage.setItem('last_gift_card', JSON.stringify(res.data));
        setStep('done');
      }).catch(() => {
        toast.error('Payment received but gift card issuance failed. Please contact us with reference: ' + paymentIntent);
      });
    } else {
      toast.error('Payment was not completed. Please try again.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = async () => {
    if (!finalAmount || finalAmount < 1) { toast.error('Please choose or enter an amount (minimum £1)'); return; }
    if (!storeId) { toast.error('Store not loaded'); return; }

    setLoadingPI(true);
    try {
      const res = await createGiftCardPaymentIntentApi(storeId, finalAmount);
      setClientSecret(res.data.clientSecret);
      setPurchaseData({ amount: finalAmount });
      setStep('payment');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      toast.error(err?.response?.data?.error?.message ?? 'Payment unavailable. Please try again later.');
    } finally {
      setLoadingPI(false);
    }
  };

  // Stripe appends payment_intent=... and redirect_status=... automatically — do NOT
  // pre-declare them in the URL or URLSearchParams.get() will read our literal placeholder
  // instead of Stripe's real value. Just include the gift card data params we need.
  const returnUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/order/gift-cards?gc_amount=${finalAmount ?? ''}&gc_purchaser=${encodeURIComponent(form.purchaserName)}&gc_purchaser_email=${encodeURIComponent(form.purchaserEmail)}&gc_recipient=${encodeURIComponent(form.recipientName)}&gc_recipient_email=${encodeURIComponent(form.recipientEmail)}&gc_message=${encodeURIComponent(form.message)}`
    : '';

  const lastCard = typeof window !== 'undefined' ? (() => { try { return JSON.parse(sessionStorage.getItem('last_gift_card') ?? 'null'); } catch { return null; } })() : null;

  if (step === 'done' && lastCard) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h3 className="text-xl font-black text-gray-900">Gift card purchased!</h3>
        <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Code</span>
            <span className="font-black font-mono text-lg text-gray-900">{lastCard.code}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Value</span>
            <span className="font-bold text-gray-900">£{lastCard.amount?.toFixed(2)}</span>
          </div>
          {lastCard.expiresAt && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Expires</span>
              <span className="text-gray-700">{formatExpiry(lastCard.expiresAt, false)}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {form.recipientEmail || form.purchaserEmail
            ? 'A confirmation has been sent by email.'
            : 'Save the code above to use or share.'}
        </p>
        <button onClick={() => { setStep('form'); sessionStorage.removeItem('last_gift_card'); }}
          className="w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          Buy another gift card
        </button>
      </div>
    );
  }

  if (step === 'payment' && clientSecret && purchaseData) {
    return (
      <div className="space-y-4">
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 flex items-center gap-3">
          <CreditCard size={18} className="text-brand-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-brand-800">Pay £{purchaseData.amount.toFixed(2)}</p>
            <p className="text-xs text-brand-600 mt-0.5">Complete payment to receive your gift card code.</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <Elements stripe={getStripe(store?.stripePublishableKey)} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <PaymentForm returnUrl={returnUrl} />
          </Elements>
        </div>
        <button onClick={() => setStep('form')} className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount</label>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {PRESETS.map(p => (
            <button key={p} onClick={() => { setAmount(p); setCustomAmount(''); }}
              className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-colors ${amount === p && !customAmount ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300'}`}>
              £{p}
            </button>
          ))}
        </div>
        <input
          type="number" min="1" step="1"
          value={customAmount}
          onChange={e => { setCustomAmount(e.target.value); setAmount(null); }}
          placeholder="Or enter custom amount (£)"
          className={inp}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your details (optional)</label>
        <div className="space-y-2">
          <input value={form.purchaserName} onChange={e => setForm(f => ({ ...f, purchaserName: e.target.value }))}
            placeholder="Your name" className={inp} />
          <input type="email" value={form.purchaserEmail} onChange={e => setForm(f => ({ ...f, purchaserEmail: e.target.value }))}
            placeholder="Your email (for receipt)" className={inp} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Send to (optional)</label>
        <div className="space-y-2">
          <input value={form.recipientName} onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))}
            placeholder="Recipient's name" className={inp} />
          <input type="email" value={form.recipientEmail} onChange={e => setForm(f => ({ ...f, recipientEmail: e.target.value }))}
            placeholder="Recipient's email" className={inp} />
          <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Personal message (optional)" rows={2} className={`${inp} resize-none`} />
        </div>
      </div>

      {store?.giftCardValidityMonths && (
        <p className="text-xs text-gray-400 text-center">
          Valid for {store.giftCardValidityMonths} month{store.giftCardValidityMonths !== 1 ? 's' : ''} from purchase date.
        </p>
      )}

      {!store?.stripeEnabled ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700">Online payment is not currently available for this store. Please contact us to purchase a gift card.</p>
        </div>
      ) : (
        <button onClick={handlePay} disabled={loadingPI || !finalAmount}
          className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
          {loadingPI ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
          {loadingPI ? 'Setting up payment…' : `Pay £${(finalAmount ?? 0).toFixed(2)}`}
        </button>
      )}
    </div>
  );
}

export default function GiftCardsPage() {
  const [tab, setTab] = useState<'buy' | 'check'>('buy');

  const { data: storeData } = useQuery({
    queryKey: ['order-store'],
    queryFn: () => getStoreBySlugApi(STORE_SLUG),
    staleTime: 5 * 60 * 1000,
  });
  const store = storeData?.data;

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/order"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to menu
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
          <Gift size={20} className="text-brand-500" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Gift Cards</h1>
          {store && <p className="text-sm text-gray-500">{store.name}</p>}
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {(['buy', 'check'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'buy' ? '🎁 Buy a Gift Card' : '🔍 Check Balance'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {tab === 'buy' ? <BuyGiftCard store={store} /> : <CheckBalance />}
      </div>
    </div>
  );
}
