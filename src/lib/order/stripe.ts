import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePromises = new Map<string, Promise<Stripe | null>>();

/**
 * Load Stripe.js using the store's own publishable key if provided, falling
 * back to the platform default (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).
 * Caches one Stripe.js instance per publishable key.
 */
export function getStripe(publishableKey?: string | null) {
  const key = publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
  let promise = stripePromises.get(key);
  if (!promise) {
    promise = loadStripe(key);
    stripePromises.set(key, promise);
  }
  return promise;
}
