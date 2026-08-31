import Cookies from 'js-cookie';
import type { CustomerAuth } from '@/types/order';

const SESSION_KEY = 'store_session';
const COOKIE_NAME = 'store_token';

export function saveCustomerSession(auth: CustomerAuth) {
  Cookies.set(COOKIE_NAME, auth.token, { expires: 7, path: '/' });
  localStorage.setItem(SESSION_KEY, JSON.stringify(auth));
}

export function loadCustomerSession(): CustomerAuth | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as CustomerAuth) : null;
  } catch {
    return null;
  }
}

export function clearCustomerSession() {
  Cookies.remove(COOKIE_NAME, { path: '/' });
  localStorage.removeItem(SESSION_KEY);
}

export function isTokenValid(): boolean {
  const token = Cookies.get(COOKIE_NAME);
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
