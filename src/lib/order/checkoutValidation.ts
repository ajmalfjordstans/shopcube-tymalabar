/**
 * Pure logic extracted from CheckoutPage's handlePlaceOrder so it's directly unit-testable
 * without rendering the (large, heavily hook-coupled) component.
 */

export interface GiftCardApplicationInput {
  gcInfo: { remainingBalance: number } | null;
  gcApply: string;
  total: number;
}

/** How much of the order a selected gift card covers, clamped to (typed amount, remaining balance, order total). */
export function computeGiftCardApplication({ gcInfo, gcApply, total }: GiftCardApplicationInput) {
  const gcApplyAmount = gcInfo && gcApply ? Math.min(parseFloat(gcApply) || 0, gcInfo.remainingBalance, total) : 0;
  const remainingAfterGc = Math.max(0, total - gcApplyAmount);
  return { gcApplyAmount, remainingAfterGc };
}

export interface DeliveryCheckState {
  checking: boolean;
  ok: boolean;
  message?: string;
}

export interface CheckoutFieldsInput {
  name: string;
  phone: string;
  orderType: string;
  postcode: string;
  subtotal: number;
  minOrderValue: number;
  storeId: string;
  storeClosed: boolean;
  preOrderEnabled: boolean;
  scheduleForLater: boolean;
  deliveryCheck: DeliveryCheckState | null;
}

/**
 * The non-scheduling validation gate at the top of handlePlaceOrder — checked in this exact
 * order, returns the first failing rule's message, or null when everything passes.
 */
export function validateCheckoutFields(input: CheckoutFieldsInput): string | null {
  if (!input.name.trim()) return 'Please enter your name.';
  if (!input.phone.trim()) return 'Please enter your phone number.';
  if (input.orderType === 'DELIVERY' && !input.postcode.trim()) return 'Please enter your postcode.';
  if (
    input.orderType === 'DELIVERY' && input.deliveryCheck &&
    !input.deliveryCheck.checking && !input.deliveryCheck.ok
  ) {
    return input.deliveryCheck.message ?? "We can't deliver to this postcode right now.";
  }
  if (input.orderType === 'DELIVERY' && input.minOrderValue > 0 && input.subtotal < input.minOrderValue) {
    return `This delivery zone needs a minimum order of £${input.minOrderValue.toFixed(2)} (your subtotal is £${input.subtotal.toFixed(2)}).`;
  }
  if (!input.storeId) return 'Store not loaded.';
  if (input.storeClosed && !(input.preOrderEnabled && input.scheduleForLater)) {
    return "We're closed right now — please choose a time to schedule your order.";
  }
  return null;
}

export interface PreOrderScheduleInput {
  preOrderEnabled: boolean;
  scheduleForLater: boolean;
  scheduledAtIso: string | undefined;
  earliestSlot: Date;
  latestDate: Date;
  leadHours: number;
  maxDays: number;
}

export type PreOrderScheduleResult =
  | { error: string; scheduledAt?: undefined }
  | { error?: undefined; scheduledAt: string | undefined };

/** Resolves (and validates) the scheduledAt to submit — undefined when pre-order isn't in play. */
export function resolvePreOrderSchedule(input: PreOrderScheduleInput): PreOrderScheduleResult {
  if (!(input.preOrderEnabled && input.scheduleForLater)) {
    return { scheduledAt: undefined };
  }
  if (!input.scheduledAtIso) {
    return { error: 'Please choose a time for your order.' };
  }
  const combined = new Date(input.scheduledAtIso);
  if (combined < input.earliestSlot) {
    return { error: `Please choose a time at least ${input.leadHours} hour${input.leadHours === 1 ? '' : 's'} from now.` };
  }
  if (combined > input.latestDate) {
    return { error: `Orders can only be scheduled up to ${input.maxDays} day${input.maxDays === 1 ? '' : 's'} ahead.` };
  }
  return { scheduledAt: input.scheduledAtIso };
}
