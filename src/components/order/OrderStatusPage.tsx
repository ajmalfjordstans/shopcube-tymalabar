'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, ChefHat, Package, Bike, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { getGuestOrderApi, getStoreBySlugApi, createPaymentIntentApi, payAtStoreApi } from '@/lib/order/api';
import { STORE_SLUG } from '@/lib/order/config';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/OrderAuthContext';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/order/stripe';
import PaymentForm from './PaymentForm';
import toast from 'react-hot-toast';
import type { GuestOrder } from '@/types/order';
import { getOrderPresentationFlags, getVisibleStatusSteps, shouldShowPaymentPrompt, shouldShowPayAtStoreFallback } from '@/lib/order/orderStatusPresentation';

const STATUS_STEPS: { status: string; label: string; icon: React.ElementType }[] = [
  { status: 'PENDING', label: 'Order received', icon: CheckCircle },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { status: 'PREPARING', label: 'Preparing', icon: ChefHat },
  { status: 'READY', label: 'Ready', icon: Package },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for delivery', icon: Bike },
  { status: 'COMPLETED', label: 'Complete', icon: CheckCircle },
];

const TERMINAL_STATUSES = new Set(['COMPLETED', 'DELIVERED', 'CANCELLED']);

function getStepIndex(status: string): number {
  return STATUS_STEPS.findIndex(s => s.status === status);
}

export default function OrderStatusPage({ orderId }: { orderId: string }) {
  const searchParams = useSearchParams();
  const redirectStatus = searchParams.get('redirect_status');
  const stripeUnavailableParam = searchParams.get('stripe_unavailable') === '1';
  const [pollEnabled, setPollEnabled] = useState(true);
  const [localPhone, setLocalPhone] = useState<string | null | undefined>(undefined);
  const { session, initialized } = useAuth();
  const mountedRef = useRef(true);
  const [payClientSecret, setPayClientSecret] = useState<string | null>(null);
  const [requestingPayment, setRequestingPayment] = useState(false);
  const [confirmingPayAtStore, setConfirmingPayAtStore] = useState(false);
  const [stripeAttemptFailed, setStripeAttemptFailed] = useState(stripeUnavailableParam);

  const { data: storeData } = useQuery({
    queryKey: ['order-store'],
    queryFn: () => getStoreBySlugApi(STORE_SLUG),
    retry: false,
  });
  const store = storeData?.data;

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setLocalPhone(localStorage.getItem(`guest_order_phone_${orderId}`));
  }, [orderId]);

  const trackBy: { phone?: string; email?: string } | null | undefined =
    localPhone === undefined || !initialized
      ? undefined
      : localPhone
        ? { phone: localPhone }
        : session?.user.phone || session?.user.email
          ? { phone: session.user.phone, email: session.user.email }
          : null;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['order-guest-order', orderId, trackBy],
    queryFn: () => getGuestOrderApi(orderId, trackBy!),
    enabled: !!trackBy && pollEnabled,
    refetchInterval: pollEnabled ? 5_000 : false,
    retry: false,
  });

  const order: GuestOrder | undefined = data?.data;

  useEffect(() => {
    if ((order && TERMINAL_STATUSES.has(order.status)) || error) {
      if (mountedRef.current) setPollEnabled(false);
    }
  }, [order, error]);

  if (trackBy === undefined || (isLoading && trackBy)) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  if (!trackBy || error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3 text-gray-500 px-4">
        <AlertCircle size={36} className="text-red-400" />
        <p className="text-center">Could not load your order. Please check back later.</p>
        <Link href="/order" className="text-brand-500 underline text-sm">Return to menu</Link>
      </div>
    );
  }

  const { isCancelled, isComplete, cardDeclined } = getOrderPresentationFlags({
    status: order.status, paymentStatus: order.paymentStatus, redirectStatus,
  });
  const currentStepIndex = getStepIndex(order.status);
  const stripeBroken = stripeAttemptFailed;

  const visibleSteps = getVisibleStatusSteps(STATUS_STEPS, order.orderType);

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        {isCancelled ? (
          <>
            <AlertCircle className="mx-auto text-red-400 mb-3" size={52} />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Order cancelled</h1>
          </>
        ) : isComplete ? (
          <>
            <CheckCircle className="mx-auto text-green-500 mb-3" size={52} />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Enjoy your meal!</h1>
          </>
        ) : (
          <>
            <Clock className="mx-auto text-brand-500 mb-3" size={52} />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Order placed!</h1>
            <p className="text-gray-500 text-sm">We&apos;ll update this page as your order progresses.</p>
          </>
        )}
      </div>

      {(redirectStatus || order.paymentStatus === 'PAID' || order.paymentStatus === 'FAILED') && (
        <div className={`flex items-center gap-2 rounded-xl border p-4 mb-5 text-sm ${
          order.paymentStatus === 'PAID'
            ? 'bg-green-50 border-green-200 text-green-700'
            : order.paymentStatus === 'FAILED' || redirectStatus === 'failed'
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}>
          <CreditCard size={18} className="flex-shrink-0" />
          {order.paymentStatus === 'PAID'
            ? 'Payment successful — thank you!'
            : cardDeclined
              ? 'Payment failed. Please try again with a different card below.'
              : 'Payment processing…'}
        </div>
      )}

      {shouldShowPaymentPrompt({
        isCancelled, stripeEnabled: !!store?.stripeEnabled, paymentStatus: order.paymentStatus,
        hasPayClientSecret: !!payClientSecret, redirectStatus,
      }) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
          <p className="text-sm text-gray-600 mb-3">
            {stripeBroken
              ? 'Online payment is currently unavailable. You can try again, or pay at the restaurant.'
              : cardDeclined
                ? 'Your payment didn\'t go through. Please try again with a different card.'
                : 'Complete your payment to confirm this order.'}
          </p>
          <button
            onClick={async () => {
              if (!trackBy) return;
              setRequestingPayment(true);
              try {
                const res = await createPaymentIntentApi(orderId, trackBy);
                setPayClientSecret(res.data.clientSecret);
              } catch (err: unknown) {
                const e = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
                toast.error(e?.response?.data?.error?.message ?? e?.response?.data?.message ?? 'Could not start payment.');
                setStripeAttemptFailed(true);
              } finally {
                setRequestingPayment(false);
              }
            }}
            disabled={requestingPayment}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {requestingPayment ? <Loader2 size={18} className="animate-spin" /> : 'Pay now'}
          </button>
          {shouldShowPayAtStoreFallback({ stripeBroken, orderStatus: order.status }) && (
            <button
              onClick={async () => {
                if (!trackBy) return;
                setConfirmingPayAtStore(true);
                try {
                  await payAtStoreApi(orderId, trackBy);
                  await refetch();
                  toast.success('Order confirmed — pay at the restaurant when you arrive.');
                } catch (err: unknown) {
                  const e = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
                  toast.error(e?.response?.data?.error?.message ?? e?.response?.data?.message ?? 'Could not confirm order.');
                } finally {
                  setConfirmingPayAtStore(false);
                }
              }}
              disabled={confirmingPayAtStore}
              className="w-full mt-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {confirmingPayAtStore ? <Loader2 size={18} className="animate-spin" /> : 'Pay at the restaurant instead'}
            </button>
          )}
        </div>
      )}

      {payClientSecret && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
          <h2 className="font-semibold text-gray-800 mb-3">Pay for your order</h2>
          <Elements stripe={getStripe(store?.stripePublishableKey)} options={{ clientSecret: payClientSecret }}>
            <PaymentForm returnUrl={`${window.location.origin}/order/orders/${orderId}`} />
          </Elements>
        </div>
      )}

      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
          <div className="space-y-4">
            {visibleSteps.map((step, idx) => {
              const done = currentStepIndex >= idx;
              const active = currentStepIndex === idx;
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    done ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-sm font-medium ${active ? 'text-brand-600' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                    {step.label}
                    {active && !isComplete && <span className="ml-2 text-xs font-normal text-gray-400 animate-pulse">• in progress</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 space-y-3">
        <h2 className="font-semibold text-gray-800">Order details</h2>
        <div className="text-sm space-y-1 text-gray-600">
          <div className="flex justify-between">
            <span>Type</span>
            <span className="font-medium capitalize">{order.orderType.replace('_', ' ').toLowerCase()}</span>
          </div>
          {order.orderType === 'DELIVERY' && order.deliveryAddress && (
            <div className="flex justify-between">
              <span>Delivery to</span>
              <span className="font-medium">{order.deliveryAddress}</span>
            </div>
          )}
          {order.scheduledAt && (
            <div className="flex justify-between">
              <span>Scheduled for</span>
              <span className="font-medium">
                {new Date(order.scheduledAt).toLocaleString('en-GB', {
                  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>£{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {order.items && order.items.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 space-y-2">
          <h2 className="font-semibold text-gray-800 mb-3">Items</h2>
          {order.items.map((item, i) => (
            <div key={i} className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>
                  {item.quantity}× {item.name}
                  {item.modifiers && item.modifiers.length > 0 && (
                    <span className="text-xs text-gray-400 ml-1">
                      ({item.modifiers.map(m => m.modifierName).join(', ')})
                    </span>
                  )}
                </span>
                <span>£{Number(item.price * item.quantity).toFixed(2)}</span>
              </div>
              {item.notes && (
                <p className="text-xs text-gray-400 italic mt-0.5">&ldquo;{item.notes}&rdquo;</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Link
        href="/order"
        className="block text-center text-sm text-brand-500 hover:underline"
      >
        ← Back to menu
      </Link>
    </div>
  );
}
