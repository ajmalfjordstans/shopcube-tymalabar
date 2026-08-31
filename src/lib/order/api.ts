import axios from 'axios';
import Cookies from 'js-cookie';
import type { Category, Store, StoreHours, DeliveryZoneCheck } from '@/types/order';

// Defaults to the live ShopCubeServer API so production works even if
// NEXT_PUBLIC_API_URL isn't set in the deployment's env vars. Override locally
// via .env.local to point at a local ShopCubeServer instead.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://shop-cube-server.vercel.app/api';

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = Cookies.get('store_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let redirecting = false;

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Only redirect to login when a request was made WITH a token but the server
    // rejected it (expired / invalid). If there was no token, the 401 is expected
    // for public endpoints and we should not redirect unauthenticated users.
    if (err.response?.status === 401 && typeof window !== 'undefined' && !redirecting) {
      const token = Cookies.get('store_token');
      if (token) {
        redirecting = true;
        window.location.href = '/order/login';
        setTimeout(() => { redirecting = false; }, 2000);
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth (Customer) ───────────────────────────────────────────────────────────
export const customerLoginApi = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then(r => r.data);

export const customerRegisterApi = (body: { name: string; email: string; password: string; phone?: string }) =>
  api.post('/auth/register', body).then(r => r.data);

export const forgotPasswordApi = (email: string) =>
  api.post('/auth/forgot-password', { email }).then(r => r.data);

export const resetPasswordApi = (token: string, password: string) =>
  api.post('/auth/reset-password', { token, password }).then(r => r.data);

// ── Profile (Authenticated Customer) ─────────────────────────────────────────
export const getUserProfileApi = () =>
  api.get('/users/profile').then(r => r.data);

export const updateUserProfileApi = (body: { name?: string; phone?: string }) =>
  api.put('/users/profile', body).then(r => r.data);

// ── Stores (Public) ───────────────────────────────────────────────────────────
export const getStoreBySlugApi = (slug: string): Promise<{ success: boolean; data: Store }> =>
  api.get(`/stores/by-slug/${slug}`).then(r => r.data);

export const getStoreHoursApi = (storeId: string): Promise<{ success: boolean; data: StoreHours[] }> =>
  api.get(`/stores/${storeId}/hours`).then(r => r.data);

// ── Menu (Public) ─────────────────────────────────────────────────────────────
export const getPublicMenuApi = (storeId: string): Promise<{ success: boolean; data: Category[] }> =>
  api.get(`/stores/${storeId}/menu`).then(r => r.data);

// ── Orders (Guest — no auth) ──────────────────────────────────────────────────
export interface GuestOrderBody {
  storeId: string;
  customer: { phone: string; name?: string; email?: string; address?: string; postcode?: string };
  orderType: 'TAKEAWAY' | 'DELIVERY';
  scheduledAt?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    modifiers?: Array<{ modifierId: string }>;
    notes?: string;
  }>;
  notes?: string;
  // Redeemed atomically against the order total when the order is created — see
  // OrderController.createGuestOrder, which validates and debits the card server-side.
  giftCardCode?: string;
  giftCardAmount?: number;
}

export const createGuestOrderApi = (body: GuestOrderBody): Promise<{ success: boolean; data: { id: string; status: string; total: number } }> =>
  api.post('/orders/guest', body).then(r => r.data);

// The Stripe-payment counterpart to createGuestOrderApi — same body shape. Never creates an
// order for the still-owing-money case: either an order already exists (gift card covered the
// total, or Stripe was momentarily unavailable — `orderId` is set) or payment is still pending
// (`clientSecret` is set, pay via PaymentForm, then poll getCheckoutStatusApi).
export const createGuestCheckoutIntentApi = (body: GuestOrderBody): Promise<{
  success: boolean;
  data:
    | { id: string; status: string; total: number; stripeUnavailable?: boolean }
    | { pendingCheckoutId: string; clientSecret: string };
}> =>
  api.post('/orders/guest/checkout-intent', body).then(r => r.data);

export const getCheckoutStatusApi = (
  paymentIntentId: string,
  params: { phone?: string; email?: string }
): Promise<{ success: boolean; data: { status: 'waiting' | 'created'; orderId?: string } }> =>
  api.get(`/orders/guest/checkout-status/${paymentIntentId}`, { params }).then(r => r.data);

export const getGuestOrderApi = (orderId: string, params: { phone?: string; email?: string }): Promise<{ success: boolean; data: import('@/types/order').GuestOrder }> =>
  api.get(`/orders/guest/${orderId}`, { params }).then(r => r.data);

export const createPaymentIntentApi = (
  orderId: string,
  params: { phone?: string; email?: string }
): Promise<{ success: boolean; data: { clientSecret: string } }> =>
  api.post(`/orders/guest/${orderId}/payment-intent`, params).then(r => r.data);

export const payAtStoreApi = (
  orderId: string,
  params: { phone?: string; email?: string }
): Promise<{ success: boolean; data: unknown }> =>
  api.post(`/orders/guest/${orderId}/pay-at-store`, params).then(r => r.data);

// ── Orders (Authenticated Customer) ──────────────────────────────────────────
export const getMyOrdersApi = (storeId: string, page = 1, limit = 20): Promise<{
  success: boolean;
  data: import('@/types/order').GuestOrder[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> =>
  api.get('/customers/me/orders', { params: { storeId, page, limit } }).then(r => r.data);

// ── Delivery ──────────────────────────────────────────────────────────────────
export const checkDeliveryPostcodeApi = (storeId: string, postcode: string, signal?: AbortSignal): Promise<DeliveryZoneCheck> =>
  api.get(`/stores/${storeId}/delivery-check`, { params: { postcode }, signal }).then(r => r.data.data);

// ── Gift Cards (Public) ───────────────────────────────────────────────────────
export const lookupGiftCardApi = (code: string): Promise<{ success: boolean; data: { code: string; remainingBalance: number; expiresAt: string | null; isExpired: boolean; isActive: boolean } }> =>
  api.get(`/gift-cards/${encodeURIComponent(code)}`).then(r => r.data);

export const createGiftCardPaymentIntentApi = (storeId: string, amount: number): Promise<{ success: boolean; data: { clientSecret: string } }> =>
  api.post('/gift-cards/payment-intent', { storeId, amount }).then(r => r.data);

export const purchaseGiftCardApi = (body: {
  storeId: string; amount: number;
  purchaserName?: string; purchaserEmail?: string;
  recipientName?: string; recipientEmail?: string;
  message?: string; paymentIntentId?: string;
}): Promise<{ success: boolean; data: { code: string; amount: number; remainingBalance: number; expiresAt: string | null } }> =>
  api.post('/gift-cards/purchase', body).then(r => r.data);

export const redeemGiftCardApi = (body: { storeId: string; giftCardCode: string; amount: number; orderId?: string }): Promise<{ success: boolean; data: { code: string; redeemed: number; remainingBalance: number } }> =>
  api.post('/gift-cards/redeem', body).then(r => r.data);

// ── Reservations (Public) ─────────────────────────────────────────────────────
export const getReservationAvailabilityApi = (storeId: string, date: string, partySize: number): Promise<import('@/types/order').ReservationAvailability> =>
  api.get('/reservations/availability', { params: { storeId, date, partySize } }).then(r => r.data);

export const createReservationApi = (body: import('@/types/order').ReservationCreateBody): Promise<{ success: boolean; data: import('@/types/order').ReservationCreateResult }> =>
  api.post('/reservations', body).then(r => r.data);

export const payReservationDepositApi = (id: string, paymentRef: string): Promise<{ success: boolean }> =>
  api.post(`/reservations/${id}/pay-deposit`, { paymentRef }).then(r => r.data);

export const createReservationPaymentIntentApi = (id: string): Promise<{ success: boolean; data: { clientSecret: string } }> =>
  api.post(`/reservations/${id}/payment-intent`, {}).then(r => r.data);
