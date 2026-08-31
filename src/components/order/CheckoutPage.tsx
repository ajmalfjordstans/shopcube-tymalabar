'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, MapPin, Calendar, ChevronRight, Gift, X, Clock } from 'lucide-react';
import { useCart } from '@/context/OrderCartContext';
import { useAuth } from '@/context/OrderAuthContext';
import { getStoreBySlugApi, createGuestOrderApi, createGuestCheckoutIntentApi, checkDeliveryPostcodeApi, lookupGiftCardApi } from '@/lib/order/api';
import { STORE_SLUG } from '@/lib/order/config';
import { getStoreOpenStatus } from '@/lib/order/storeHours';
import { computeGiftCardApplication, validateCheckoutFields, resolvePreOrderSchedule } from '@/lib/order/checkoutValidation';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import ScheduleModal from './ScheduleModal';
import PaymentForm from './PaymentForm';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/order/stripe';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, subtotal, tax, total, setScheduledAt, setDeliveryDetails } = useCart();
  const { session, isLoggedIn } = useAuth();

  const [name, setName] = useState(session?.user.name ?? '');
  const [email, setEmail] = useState(session?.user.email ?? '');
  const [phone, setPhone] = useState(session?.user.phone ?? '');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [placing, setPlacing] = useState(false);
  const [deliveryCheck, setDeliveryCheck] = useState<
    { checking: boolean; ok: boolean; message?: string } | null
  >(null);
  const [payment, setPayment] = useState<{ clientSecret: string } | null>(null);
  const orderCompleteRef = useRef(false);

  const [gcOpen, setGcOpen] = useState(false);
  const [gcCode, setGcCode] = useState('');
  const [gcInfo, setGcInfo] = useState<{ code: string; remainingBalance: number; expiresAt: string | null; isExpired: boolean; isActive: boolean } | null>(null);
  const [gcApply, setGcApply] = useState('');
  const [gcLooking, setGcLooking] = useState(false);
  const [gcError, setGcError] = useState<string | null>(null);

  const { data: storeData } = useQuery({
    queryKey: ['order-store'],
    queryFn: () => getStoreBySlugApi(STORE_SLUG),
    retry: false,
  });

  const store = storeData?.data;
  const storeId = store?.id ?? '';
  const stripeEnabled = store?.stripeEnabled ?? false;
  const preOrderEnabled = store?.preOrderEnabled ?? false;
  const leadHours = store?.preOrderLeadHours ?? 0;
  const maxDays = store?.preOrderMaxDays ?? 7;

  const [scheduleForLater, setScheduleForLater] = useState(false);
  const [scheduledAtIso, setScheduledAtIso] = useState<string | undefined>(undefined);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const storeStatus = useMemo(() => getStoreOpenStatus(store?.hours), [store?.hours]);
  const storeClosed = storeStatus !== null && !storeStatus.open;
  const closedNoticeMessage = `We're closed right now — orders can only be scheduled for when we reopen${
    storeStatus && !storeStatus.open && storeStatus.reopenTime ? ` (${storeStatus.reopenDay} at ${storeStatus.reopenTime})` : ''
  }.`;

  const closedScheduleForcedRef = useRef(false);
  useEffect(() => {
    if (preOrderEnabled && storeClosed && !closedScheduleForcedRef.current) {
      closedScheduleForcedRef.current = true;
      setScheduleForLater(true);
      if (!scheduledAtIso) setShowScheduleModal(true);
    }
  }, [preOrderEnabled, storeClosed, scheduledAtIso]);

  const earliestSlot = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + leadHours * 60);
    return d;
  }, [leadHours]);

  const latestDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + maxDays);
    return d;
  }, [maxDays]);

  useEffect(() => {
    setScheduledAt(preOrderEnabled && scheduleForLater ? scheduledAtIso : undefined);
  }, [preOrderEnabled, scheduleForLater, scheduledAtIso, setScheduledAt]);

  useEffect(() => {
    if (!session) return;
    setName(prev => prev || session.user.name);
    setEmail(prev => prev || session.user.email);
    if (session.user.phone) setPhone(prev => prev || session.user.phone!);
    const savedAddr = localStorage.getItem(`sc_address_${session.user.id}`);
    const savedPost = localStorage.getItem(`sc_postcode_${session.user.id}`);
    if (savedAddr) setAddress(prev => prev || savedAddr);
    if (savedPost) setPostcode(prev => prev || savedPost);
  }, [session]);

  useEffect(() => {
    if (!cart.deliveryDetails) return;
    setPostcode(prev => prev || cart.deliveryDetails!.postcode);
    setAddress(prev => prev || cart.deliveryDetails!.address);
  }, [cart.deliveryDetails]);

  useEffect(() => {
    if (cart.orderType !== 'DELIVERY' || !storeId) return;
    const trimmed = postcode.trim();
    if (!trimmed) { setDeliveryCheck(null); return; }
    if (!/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i.test(trimmed)) {
      setDeliveryCheck(null);
      return;
    }

    const controller = new AbortController();
    setDeliveryCheck({ checking: true, ok: false });
    const timer = setTimeout(() => {
      checkDeliveryPostcodeApi(storeId, trimmed.toUpperCase(), controller.signal)
        .then(result => {
          if (result.eligible && result.zone) {
            setDeliveryCheck({ checking: false, ok: true });
            setDeliveryDetails({
              address: address.trim(),
              postcode: trimmed.toUpperCase(),
              deliveryZoneId: result.zone.id,
              deliveryFee: result.zone.deliveryFee,
              minOrderValue: result.zone.minOrderValue,
            });
          } else {
            setDeliveryCheck({ checking: false, ok: false, message: result.reason ?? "Sorry, we don't deliver to this postcode." });
          }
        })
        .catch(err => {
          if ((err as { code?: string })?.code === 'ERR_CANCELED') return;
          setDeliveryCheck({ checking: false, ok: false, message: 'Could not check postcode. Please try again.' });
        });
    }, 500);

    return () => { clearTimeout(timer); controller.abort(); };
  }, [postcode, cart.orderType, storeId, address, setDeliveryDetails]);

  useEffect(() => {
    if (cart.items.length === 0 && !payment && !placing && !orderCompleteRef.current) {
      router.replace('/order');
    }
  }, [cart.items.length, router, payment, placing]);

  if (cart.items.length === 0 && !payment && !placing && !orderCompleteRef.current) {
    return null;
  }

  const { gcApplyAmount, remainingAfterGc } = computeGiftCardApplication({ gcInfo, gcApply, total });

  async function handleLookupGiftCard() {
    const code = gcCode.trim().toUpperCase();
    if (!code) { toast.error('Enter a gift card code'); return; }
    setGcLooking(true);
    setGcInfo(null);
    setGcError(null);
    try {
      const res = await lookupGiftCardApi(code);
      if (!res.data.isActive) { setGcError('This gift card has been deactivated.'); return; }
      if (res.data.isExpired) { setGcError('This gift card has expired.'); return; }
      if (res.data.remainingBalance <= 0) { setGcError('This gift card has no remaining balance.'); return; }
      setGcInfo(res.data);
      setGcApply(Math.min(res.data.remainingBalance, total).toFixed(2));
    } catch {
      setGcError('Gift card not found. Check the code and try again.');
    } finally {
      setGcLooking(false);
    }
  }

  async function handlePlaceOrder() {
    const minOrderValue = cart.deliveryDetails?.minOrderValue ?? 0;
    const fieldsError = validateCheckoutFields({
      name, phone, orderType: cart.orderType, postcode, subtotal, minOrderValue,
      storeId, storeClosed, preOrderEnabled, scheduleForLater, deliveryCheck,
    });
    if (fieldsError) { toast.error(fieldsError); return; }

    const scheduleResult = resolvePreOrderSchedule({
      preOrderEnabled, scheduleForLater, scheduledAtIso, earliestSlot, latestDate, leadHours, maxDays,
    });
    if (scheduleResult.error) { toast.error(scheduleResult.error); return; }
    const scheduledAt = scheduleResult.scheduledAt;

    const cartSnapshot = cart.items;
    const orderType = cart.orderType as 'TAKEAWAY' | 'DELIVERY';

    const gcApplySnapshot = gcApplyAmount;
    const gcCodeSnapshot = gcInfo?.code;

    setPlacing(true);
    try {
      const orderBody = {
        storeId,
        orderType,
        scheduledAt,
        customer: {
          phone: phone.trim(),
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          address: orderType === 'DELIVERY' ? address.trim() || undefined : undefined,
          postcode: orderType === 'DELIVERY' ? postcode.trim().toUpperCase() : undefined,
        },
        items: cartSnapshot.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          modifiers: item.selectedModifiers.map(m => ({ modifierId: m.modifierId })),
          notes: item.specialInstructions || undefined,
        })),
        ...(gcCodeSnapshot && gcApplySnapshot > 0
          ? { giftCardCode: gcCodeSnapshot, giftCardAmount: gcApplySnapshot }
          : {}),
      };

      const afterOrderPlaced = (orderId: string, orderTotal: number, successMessage: string) => {
        localStorage.setItem(`guest_order_phone_${orderId}`, phone.trim());

        const entry = {
          id: orderId,
          phone: phone.trim(),
          total: orderTotal,
          orderType,
          createdAt: new Date().toISOString(),
        };
        const historyKey = session?.user.id ? `sc_orders_${session.user.id}` : 'sc_orders_guest';
        try {
          const existing = JSON.parse(localStorage.getItem(historyKey) ?? '[]');
          localStorage.setItem(historyKey, JSON.stringify([entry, ...existing].slice(0, 20)));
        } catch {
          toast('Order placed, but history couldn\'t be saved — storage may be full.', { icon: '⚠️' });
        }

        orderCompleteRef.current = true;
        clearCart();
        toast.success(successMessage);
        router.push(`/order/orders/${orderId}`);
      };

      if (stripeEnabled) {
        const result = await createGuestCheckoutIntentApi(orderBody);

        if ('clientSecret' in result.data) {
          try {
            sessionStorage.setItem('sc_pending_checkout_identity', JSON.stringify({
              phone: phone.trim(),
              email: email.trim() || undefined,
            }));
          } catch {
            // Best-effort — if storage is unavailable the pending page will just ask again.
          }
          setPayment({ clientSecret: result.data.clientSecret });
          setPlacing(false);
          return;
        }

        afterOrderPlaced(
          result.data.id,
          result.data.total,
          result.data.stripeUnavailable
            ? 'Online payment is unavailable right now — your order was placed for payment at the store.'
            : (gcCodeSnapshot ? 'Order placed and gift card applied!' : 'Order placed successfully!')
        );
        return;
      }

      const result = await createGuestOrderApi(orderBody);
      afterOrderPlaced(result.data.id, result.data.total, gcCodeSnapshot ? 'Order placed and gift card applied!' : 'Order placed successfully!');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
      const msg = e?.response?.data?.error?.message ?? e?.response?.data?.message ?? 'Failed to place order.';
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  }

  if (payment) {
    return (
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pay for your order</h1>
        <p className="text-sm text-gray-500 mb-6">
          Your order has been placed. Complete payment below to confirm it.
        </p>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <Elements stripe={getStripe(store?.stripePublishableKey)} options={{ clientSecret: payment.clientSecret }}>
            <PaymentForm returnUrl={`${window.location.origin}/order/orders/pending`} />
          </Elements>
        </div>
      </div>
    );
  }

  if (storeClosed && !preOrderEnabled) {
    return (
      <div className="max-w-lg mx-auto">
        <Link
          href="/order/cart"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to order
        </Link>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <Clock size={26} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">We&apos;re closed right now</h1>
          <p className="text-sm text-gray-500">
            {store?.name ?? 'This store'} isn&apos;t accepting orders at the moment.
            {storeStatus && !storeStatus.open && storeStatus.reopenTime &&
              ` We'll be back ${storeStatus.reopenDay} at ${storeStatus.reopenTime}.`}
          </p>
          <Link
            href="/order"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600"
          >
            <ArrowLeft size={14} /> Back to menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/order/cart"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to order
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {!isLoggedIn && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700">
            <Link href={`/order/login?next=/order/checkout`} className="font-semibold underline">
              Sign in
            </Link>{' '}
            for faster checkout and order history. You can also continue as a guest below.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Your details</h2>
          <input
            type="text"
            placeholder="Full name *"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="email"
            placeholder="Email address *"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="tel"
            placeholder="Phone number *"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {preOrderEnabled && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={16} className="text-brand-500" />
              When would you like this?
            </h2>
            {storeClosed && (
              <p className="text-xs text-red-500">{closedNoticeMessage}</p>
            )}
            <div className="flex gap-2">
              {!storeClosed && (
                <button
                  type="button"
                  onClick={() => setScheduleForLater(false)}
                  className={`flex-1 text-sm font-semibold py-2.5 rounded-lg border transition-colors ${
                    !scheduleForLater ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  As soon as possible
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setScheduleForLater(true);
                  if (!scheduledAtIso) setShowScheduleModal(true);
                }}
                className={`flex-1 text-sm font-semibold py-2.5 rounded-lg border transition-colors ${
                  scheduleForLater ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'
                }`}
              >
                Schedule for later
              </button>
            </div>
            {scheduleForLater && (
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                className="w-full flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm hover:border-brand-300 transition-colors"
              >
                {scheduledAtIso ? (
                  <span className="font-medium text-gray-800">
                    {new Date(scheduledAtIso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : (
                  <span className="text-gray-400">Choose a time…</span>
                )}
                <span className="flex items-center gap-1 text-brand-500 font-semibold text-xs flex-shrink-0">
                  {scheduledAtIso ? 'Change' : 'Select'}
                  <ChevronRight size={14} />
                </span>
              </button>
            )}
          </div>
        )}

        {cart.orderType === 'DELIVERY' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <MapPin size={16} className="text-brand-500" />
              Delivery address
            </h2>
            <input
              type="text"
              placeholder="Street address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="text"
              placeholder="Postcode *"
              value={postcode}
              onChange={e => setPostcode(e.target.value.toUpperCase())}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {!!cart.deliveryDetails?.minOrderValue && cart.deliveryDetails.minOrderValue > 0 && (
              <p className={`text-xs ${subtotal < cart.deliveryDetails.minOrderValue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                Minimum order for delivery: £{cart.deliveryDetails.minOrderValue.toFixed(2)}
                {subtotal < cart.deliveryDetails.minOrderValue &&
                  ` — add £${(cart.deliveryDetails.minOrderValue - subtotal).toFixed(2)} more to qualify`}
              </p>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <h2 className="font-semibold text-gray-800 mb-3">Order summary</h2>
          {cart.items.map(item => (
            <div key={item.cartItemId} className="flex justify-between text-sm text-gray-600">
              <span>{item.quantity}× {item.name}</span>
              <span>£{item.totalPrice.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
            {preOrderEnabled && scheduleForLater && scheduledAtIso && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Scheduled for</span>
                <span className="font-medium text-gray-800">
                  {new Date(scheduledAtIso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>£{tax.toFixed(2)}</span>
              </div>
            )}
            {cart.orderType === 'DELIVERY' && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                {deliveryCheck?.checking ? (
                  <span className="text-gray-400 italic flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" /> Checking…
                  </span>
                ) : deliveryCheck?.ok && cart.deliveryDetails?.deliveryFee !== undefined ? (
                  <span className="font-medium text-gray-700">£{cart.deliveryDetails.deliveryFee.toFixed(2)}</span>
                ) : deliveryCheck?.message ? (
                  <span className="text-red-500 text-xs">{deliveryCheck.message}</span>
                ) : (
                  <span className="text-gray-400 italic">calculated by restaurant</span>
                )}
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-1">
              <span>Total</span>
              <span>£{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {store?.giftCardEnabled !== false && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <button onClick={() => setGcOpen(v => !v)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-gray-900">
              <span className="flex items-center gap-2"><Gift size={16} className="text-brand-500" /> Have a gift card?</span>
              <span className="text-gray-400 text-xs">{gcOpen ? 'Hide' : 'Apply'}</span>
            </button>

            {gcOpen && (
              <div className="mt-3 space-y-3">
                {!gcInfo ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        value={gcCode}
                        onChange={e => { setGcCode(e.target.value.toUpperCase()); setGcError(null); }}
                        onKeyDown={e => e.key === 'Enter' && handleLookupGiftCard()}
                        placeholder="e.g. GC-9D4A7C82"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <button onClick={handleLookupGiftCard} disabled={gcLooking}
                        className="px-4 py-2 bg-brand-500 text-white text-sm font-bold rounded-lg disabled:opacity-60">
                        {gcLooking ? <Loader2 size={14} className="animate-spin" /> : 'Check'}
                      </button>
                    </div>
                    {gcError && <p className="text-xs text-red-500">{gcError}</p>}
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm font-bold font-mono text-gray-900">{gcInfo.code}</p>
                        <p className="text-xs text-green-700">Balance: £{gcInfo.remainingBalance.toFixed(2)}</p>
                      </div>
                      <button onClick={() => { setGcInfo(null); setGcCode(''); setGcApply(''); }}
                        className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                      </button>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Amount to apply (max £{Math.min(gcInfo.remainingBalance, total).toFixed(2)})</label>
                      <input
                        type="number" min="0.01" step="0.01"
                        max={Math.min(gcInfo.remainingBalance, total)}
                        value={gcApply}
                        onChange={e => setGcApply(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    {gcApplyAmount > 0 && (
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-green-700">Gift card saves</span>
                        <span className="text-green-700">−£{gcApplyAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {remainingAfterGc > 0 && (
                      <div className="flex justify-between text-sm font-bold text-gray-900">
                        <span>Remaining to pay</span>
                        <span>£{remainingAfterGc.toFixed(2)}</span>
                      </div>
                    )}
                    {remainingAfterGc <= 0 && (
                      <p className="text-xs text-green-700 font-semibold">✓ Gift card covers the full order</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          {remainingAfterGc <= 0
            ? 'Your gift card covers the full order — no card payment needed.'
            : stripeEnabled
              ? `You'll be asked to pay ${gcApplyAmount > 0 ? `£${remainingAfterGc.toFixed(2)} (after gift card)` : 'by card'} once your order is placed.`
              : 'Payment will be taken at the restaurant. Your order will be confirmed shortly after placing.'}
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          {placing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Placing order…
            </>
          ) : (
            remainingAfterGc <= 0
              ? `Place Order — Gift Card Covers £${total.toFixed(2)}`
              : gcApplyAmount > 0
                ? `Place Order — £${remainingAfterGc.toFixed(2)} remaining`
                : `Place Order — £${total.toFixed(2)}`
          )}
        </button>
      </div>

      {showScheduleModal && (
        <ScheduleModal
          storeId={storeId}
          leadHours={leadHours}
          maxDays={maxDays}
          value={scheduledAtIso}
          onChange={setScheduledAtIso}
          onClose={() => setShowScheduleModal(false)}
          hoursData={store?.hours}
          closedNotice={storeClosed ? closedNoticeMessage : undefined}
        />
      )}
    </div>
  );
}
