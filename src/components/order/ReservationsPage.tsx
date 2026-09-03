'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Elements } from '@stripe/react-stripe-js';
import { getStoreBySlugApi, getReservationAvailabilityApi, createReservationApi, createReservationPaymentIntentApi, payReservationDepositApi } from '@/lib/order/api';
import { STORE_SLUG } from '@/lib/order/config';
import { getStripe } from '@/lib/order/stripe';
import PaymentForm from './PaymentForm';
import { CalendarDays, Users, Clock, ChevronLeft, ChevronRight, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import type { ReservationCreateResult } from '@/types/order';
import toast from 'react-hot-toast';

type Step = 'select' | 'slots' | 'form' | 'payment' | 'confirm';

function todayStr() { return new Date().toISOString().slice(0, 10); }

function shiftDate(s: string, days: number) {
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function formatDateLong(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime12(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

const inp = 'w-full px-4 py-3 border border-[#D7CDA7] rounded-xl text-sm focus:border-[#1976D2] focus:outline-none focus:ring-2 focus:ring-[#1976D2]/20 bg-white text-[#601131]';

export default function ReservationsPage() {
  const router = useRouter();

  const { data: storeData } = useQuery({
    queryKey: ['order-store'],
    queryFn: () => getStoreBySlugApi(STORE_SLUG),
    staleTime: 5 * 60 * 1000,
  });
  const store = storeData?.data;

  const [step, setStep] = useState<Step>('select');

  const [date, setDate] = useState(todayStr());
  const [partySize, setPartySize] = useState(2);

  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingPaymentIntent, setLoadingPaymentIntent] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);

  const [confirmed, setConfirmed] = useState<ReservationCreateResult | null>(null);

  const maxParty = store?.maxPartySize ?? 20;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const reservationId = params.get('reservation_id');
    const paymentIntent = params.get('payment_intent');
    const redirectStatus = params.get('redirect_status');
    if (!reservationId || !paymentIntent) return;

    window.history.replaceState({}, '', '/order/reservations');

    const stored = sessionStorage.getItem(`reservation_${reservationId}`);
    const data = stored ? JSON.parse(stored) : null;
    if (data) setConfirmed(data);

    if (redirectStatus === 'succeeded') {
      payReservationDepositApi(reservationId, paymentIntent)
        .then(() => setDepositPaid(true))
        .catch(() => {
          setDepositPaid(true);
          toast.error('Deposit received but confirmation failed. Please contact us with your booking reference.');
        });
      setStep('confirm');
    } else {
      toast.error('Payment was not completed. Your reservation is held — you can pay the deposit later.');
      setStep('confirm');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFetchSlots = async () => {
    if (!store) return;
    setSlotsError(null);
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const res = await getReservationAvailabilityApi(store.id, date, partySize);
      if (!res.availableSlots || res.availableSlots.length === 0) {
        setSlotsError('No available time slots for this date and party size. Try a different date or party size.');
      } else {
        setSlots(res.availableSlots);
      }
      setStep('slots');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string }; message?: string } } };
      const msg: string = err?.response?.data?.error?.message ?? err?.response?.data?.message ?? 'Failed to load availability.';
      if (msg.toLowerCase().includes('disabled')) {
        setSlotsError('Table reservations are not available at this time.');
      } else {
        setSlotsError(msg);
      }
      setStep('slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!store || !selectedSlot) return;
    if (!form.name.trim()) { toast.error('Please enter your name'); return; }
    if (!form.phone.trim()) { toast.error('Please enter your phone number'); return; }

    // Build datetime in local time — avoid new Date('YYYY-MM-DD') which parses as UTC midnight
    const [y, mo, dy] = date.split('-').map(Number);
    const [h, m] = selectedSlot.split(':').map(Number);
    const dt = new Date(y, mo - 1, dy, h, m, 0, 0);

    setSubmitting(true);
    try {
      const res = await createReservationApi({
        storeId: store.id,
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        customerEmail: form.email.trim() || undefined,
        partySize,
        reservationDate: dt.toISOString(),
        notes: form.notes.trim() || undefined,
      });

      setConfirmed(res.data);
      sessionStorage.setItem(`reservation_${res.data.reservationId}`, JSON.stringify({
        ...res.data,
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        notes: form.notes.trim() || undefined,
      }));

      if (res.data.depositRequired && store.stripeEnabled) {
        setLoadingPaymentIntent(true);
        try {
          const piRes = await createReservationPaymentIntentApi(res.data.reservationId);
          setClientSecret(piRes.data.clientSecret);
          setStep('payment');
        } catch {
          setStep('confirm');
        } finally {
          setLoadingPaymentIntent(false);
        }
      } else {
        setStep('confirm');
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string }; message?: string } } };
      const msg = err?.response?.data?.error?.message ?? err?.response?.data?.message ?? 'Failed to book. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto font-poppins">
      <button
        onClick={() => {
          if (step === 'select') router.push('/order');
          else if (step === 'slots') setStep('select');
          else if (step === 'form') setStep('slots');
          else if (step === 'payment') setStep('form');
          else if (step === 'confirm') router.push('/order');
        }}
        className="flex items-center gap-1.5 text-sm text-[#601131]/60 hover:text-[#601131] mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        {step === 'select' || step === 'confirm' ? 'Back to menu' : 'Back'}
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#1976D2]/10 flex items-center justify-center flex-shrink-0">
          <CalendarDays size={20} className="text-[#1976D2]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#601131]">Reserve a Table</h1>
          {store && <p className="text-sm text-[#601131]/50">{store.name}</p>}
        </div>
      </div>

      {step === 'select' && (
        <div className="bg-[#F1EED0] rounded-2xl border border-[#D7CDA7] shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#601131]/50 uppercase tracking-wider mb-2">Date</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setDate(d => shiftDate(d, -1))} disabled={date <= todayStr()}
                className="p-2.5 border border-[#D7CDA7] rounded-xl hover:bg-white disabled:opacity-40 transition-colors bg-white">
                <ChevronLeft size={16} className="text-[#601131]/60" />
              </button>
              <input type="date" value={date} min={todayStr()} onChange={e => setDate(e.target.value)}
                className="flex-1 px-4 py-3 border border-[#D7CDA7] rounded-xl text-sm focus:border-[#1976D2] focus:outline-none bg-white text-center font-semibold text-[#601131]" />
              <button onClick={() => setDate(d => shiftDate(d, 1))}
                className="p-2.5 border border-[#D7CDA7] rounded-xl hover:bg-white transition-colors bg-white">
                <ChevronRight size={16} className="text-[#601131]/60" />
              </button>
            </div>
            <p className="text-xs text-[#601131]/40 mt-1.5 text-center">{formatDateLong(date)}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#601131]/50 uppercase tracking-wider mb-2">Party size</label>
            <div className="flex items-center gap-4 justify-center">
              <button onClick={() => setPartySize(p => Math.max(1, p - 1))}
                className="w-11 h-11 rounded-xl border border-[#D7CDA7] hover:bg-white flex items-center justify-center text-xl font-bold text-[#601131]/70 transition-colors bg-white">
                −
              </button>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#1976D2]" />
                <span className="text-2xl font-bold text-[#601131] w-8 text-center">{partySize}</span>
                <span className="text-sm text-[#601131]/50">{partySize === 1 ? 'person' : 'people'}</span>
              </div>
              <button onClick={() => setPartySize(p => Math.min(maxParty, p + 1))}
                className="w-11 h-11 rounded-xl border border-[#D7CDA7] hover:bg-white flex items-center justify-center text-xl font-bold text-[#601131]/70 transition-colors bg-white">
                +
              </button>
            </div>
            {partySize >= maxParty && (
              <p className="text-xs text-amber-600 mt-2 text-center">For groups larger than {maxParty}, please call us directly.</p>
            )}
          </div>

          <button onClick={handleFetchSlots} disabled={loadingSlots}
            className="w-full py-3.5 bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
            {loadingSlots ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
            {loadingSlots ? 'Checking availability…' : 'Check Availability'}
          </button>
        </div>
      )}

      {step === 'slots' && (
        <div className="space-y-4">
          <div className="bg-[#F1EED0] rounded-2xl border border-[#D7CDA7] shadow-sm p-5">
            <p className="text-xs font-bold text-[#601131]/50 uppercase tracking-wider mb-1">
              {formatDateLong(date)} · {partySize} {partySize === 1 ? 'person' : 'people'}
            </p>
            <p className="text-sm text-gray-700">Select a time slot</p>
          </div>

          {slotsError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{slotsError}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => { setSelectedSlot(slot); setStep('form'); }}
                  className="py-3.5 rounded-xl border-2 text-sm font-bold transition-colors border-[#D7CDA7] bg-white hover:border-[#1976D2]/50 hover:bg-[#1976D2]/10 hover:text-[#1565C0] text-[#601131]/70"
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 'form' && selectedSlot && (
        <div className="space-y-4">
          <div className="bg-[#1976D2]/10 border border-[#1976D2]/30 rounded-2xl p-4 flex items-center gap-3">
            <Clock size={16} className="text-[#1976D2] flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#1565C0]">{formatDateLong(date)} at {selectedSlot}</p>
              <p className="text-xs text-[#1565C0]/80">{partySize} {partySize === 1 ? 'person' : 'people'}</p>
            </div>
          </div>

          <div className="bg-[#F1EED0] rounded-2xl border border-[#D7CDA7] shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#601131]/50 uppercase tracking-wider mb-1.5">Full Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#601131]/50 uppercase tracking-wider mb-1.5">Phone *</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="07700 900000" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#601131]/50 uppercase tracking-wider mb-1.5">
                Email <span className="font-normal text-[#601131]/40">(optional)</span>
              </label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#601131]/50 uppercase tracking-wider mb-1.5">
                Special requests <span className="font-normal text-[#601131]/40">(optional)</span>
              </label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Allergies, occasion, high chair needed…"
                rows={3} className={`${inp} resize-none`} />
            </div>

            <button onClick={handleSubmit} disabled={submitting}
              className="w-full py-3.5 bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting ? 'Submitting…' : 'Request Reservation'}
            </button>
            <p className="text-xs text-[#601131]/40 text-center">
              Your reservation will be pending confirmation — we&apos;ll be in touch.
            </p>
          </div>
        </div>
      )}

      {step === 'payment' && confirmed && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <CreditCard size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                Deposit required — £{(confirmed.depositAmount ?? 0).toFixed(2)}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Pay now to secure your reservation for {formatDateLong(date)} at {selectedSlot ?? ''}.
              </p>
            </div>
          </div>

          {loadingPaymentIntent ? (
            <div className="bg-[#F1EED0] rounded-2xl border border-[#D7CDA7] shadow-sm p-8 flex items-center justify-center gap-3">
              <Loader2 size={20} className="animate-spin text-[#1976D2]" />
              <span className="text-sm text-[#601131]/60">Setting up payment…</span>
            </div>
          ) : clientSecret ? (
            <div className="bg-white rounded-2xl border border-[#D7CDA7] shadow-sm p-6">
              <Elements
                stripe={getStripe(store?.stripePublishableKey)}
                options={{ clientSecret, appearance: { theme: 'stripe' } }}
              >
                <PaymentForm
                  returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/order/reservations?reservation_id=${confirmed.reservationId}`}
                />
              </Elements>
            </div>
          ) : null}

          <button
            onClick={() => setStep('confirm')}
            className="w-full py-3 text-sm text-[#601131]/40 hover:text-[#601131]/70 transition-colors"
          >
            Skip — pay deposit later
          </button>
        </div>
      )}

      {step === 'confirm' && confirmed && (
        <div className="space-y-4">
          <div className="bg-[#F1EED0] rounded-2xl border border-[#D7CDA7] shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays size={28} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#601131] mb-1">
              {confirmed.status === 'CONFIRMED' ? 'Reservation Confirmed!' : 'Request Received!'}
            </h2>
            <p className="text-sm text-[#601131]/50 mb-6">
              {confirmed.status === 'CONFIRMED'
                ? 'Your table has been reserved. See you soon!'
                : 'We\'ll confirm your booking shortly.'}
            </p>

            <div className="text-left bg-white rounded-xl p-4 space-y-3 mb-6 border border-[#D7CDA7]/60">
              <div className="flex justify-between text-sm">
                <span className="text-[#601131]/50">Date &amp; time</span>
                <span className="font-semibold text-[#601131]">{formatDateTime12(confirmed.reservationDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#601131]/50">Party size</span>
                <span className="font-semibold text-[#601131]">{confirmed.partySize} {confirmed.partySize === 1 ? 'person' : 'people'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#601131]/50">Status</span>
                <span className={`font-semibold ${confirmed.status === 'CONFIRMED' ? 'text-green-600' : 'text-amber-600'}`}>
                  {confirmed.status === 'CONFIRMED' ? 'Confirmed' : 'Awaiting confirmation'}
                </span>
              </div>
              {confirmed.depositRequired && (
                <div className="flex justify-between text-sm pt-2 border-t border-[#D7CDA7]">
                  <span className="text-[#601131]/50">Deposit</span>
                  <span className={`font-semibold ${depositPaid ? 'text-green-600' : 'text-amber-600'}`}>
                    {depositPaid
                      ? `Paid — £${(confirmed.depositAmount ?? 0).toFixed(2)}`
                      : `Outstanding — £${(confirmed.depositAmount ?? 0).toFixed(2)}`}
                  </span>
                </div>
              )}
            </div>

            {confirmed.depositRequired && !depositPaid && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-left">
                <p className="text-sm font-semibold text-amber-800 mb-1">Deposit outstanding</p>
                <p className="text-xs text-amber-700">
                  A deposit of £{(confirmed.depositAmount ?? 0).toFixed(2)} is required to secure your booking.
                  We will contact you to arrange payment if not already completed.
                </p>
              </div>
            )}
            {confirmed.depositRequired && depositPaid && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-left">
                <p className="text-sm font-semibold text-green-800">Deposit paid ✓</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Your £{(confirmed.depositAmount ?? 0).toFixed(2)} deposit has been received.
                </p>
              </div>
            )}

            <button onClick={() => router.push('/order')}
              className="w-full py-3 border border-[#D7CDA7] rounded-xl text-sm font-semibold text-[#601131]/70 hover:bg-white transition-colors">
              Back to menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
