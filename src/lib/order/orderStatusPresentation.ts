/**
 * Pure derivations extracted from OrderStatusPage so they're directly unit-testable
 * without rendering the (heavily hook-coupled) component.
 */

export interface OrderPresentationInput {
  status: string;
  paymentStatus: string | undefined;
  redirectStatus: string | null;
}

/**
 * `cardDeclined` (Stripe worked, the card was rejected) is deliberately distinct from
 * `stripeBroken`-the-caller-tracks-separately (Stripe itself unreachable/misconfigured) —
 * only the latter unlocks the pay-at-restaurant fallback.
 */
export function getOrderPresentationFlags({ status, paymentStatus, redirectStatus }: OrderPresentationInput) {
  return {
    isCancelled: status === 'CANCELLED',
    isComplete: status === 'COMPLETED' || status === 'DELIVERED',
    cardDeclined: paymentStatus === 'FAILED' || redirectStatus === 'failed',
  };
}

/** Only show delivery-specific steps (e.g. "Out for delivery") for DELIVERY orders. */
export function getVisibleStatusSteps<T extends { status: string }>(steps: T[], orderType: string): T[] {
  return orderType === 'DELIVERY' ? steps : steps.filter(s => s.status !== 'OUT_FOR_DELIVERY');
}

export interface PaymentPromptInput {
  isCancelled: boolean;
  stripeEnabled: boolean;
  paymentStatus: string | undefined;
  hasPayClientSecret: boolean;
  redirectStatus: string | null;
}

/**
 * Gates the "Pay now" / "Pay at the restaurant instead" block. Hidden while a just-completed
 * Stripe payment is awaiting webhook confirmation (redirectStatus === 'succeeded'), so the
 * customer isn't prompted to pay again before the order catches up to PAID.
 */
export function shouldShowPaymentPrompt(input: PaymentPromptInput): boolean {
  return !input.isCancelled && input.stripeEnabled && input.paymentStatus !== 'PAID'
    && !input.hasPayClientSecret && input.redirectStatus !== 'succeeded';
}

/**
 * The pay-at-restaurant fallback is only offered when Stripe itself is confirmed broken
 * (not merely a declined card) AND the order hasn't shipped past AWAITING_PAYMENT yet.
 */
export function shouldShowPayAtStoreFallback({ stripeBroken, orderStatus }: { stripeBroken: boolean; orderStatus: string }): boolean {
  return stripeBroken && orderStatus === 'AWAITING_PAYMENT';
}
