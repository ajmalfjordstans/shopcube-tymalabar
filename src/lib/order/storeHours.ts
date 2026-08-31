import type { StoreHours } from '@/types/order';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export type StoreOpenStatus =
  | { open: true; openTime: string; closeTime: string }
  | { open: false; reopenDay?: string; reopenTime?: string };

/**
 * Current open/closed state plus — when closed — the next time the store reopens
 * (today if there's still time left before opening, otherwise the next open day).
 * Returns null when hours haven't loaded yet.
 */
export function getStoreOpenStatus(hours: StoreHours[] | undefined | null): StoreOpenStatus | null {
  if (!hours || hours.length === 0) return null;

  const now = new Date();
  const day = now.getDay();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const entry = hours.find(h => h.dayOfWeek === day);

  if (entry && entry.isOpen !== false && entry.openTime && entry.closeTime) {
    const [oh, om] = entry.openTime.split(':').map(Number);
    const [ch, cm] = entry.closeTime.split(':').map(Number);
    const openMin = oh * 60 + om;
    const closeMin = ch * 60 + cm;
    if (nowMin >= openMin && nowMin < closeMin) {
      return { open: true, openTime: entry.openTime, closeTime: entry.closeTime };
    }
    if (nowMin < openMin) {
      return { open: false, reopenDay: 'today', reopenTime: entry.openTime };
    }
  }

  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const e = hours.find(h => h.dayOfWeek === d && h.isOpen !== false && h.openTime);
    if (e) {
      return { open: false, reopenDay: i === 1 ? 'tomorrow' : DAY_NAMES[d], reopenTime: e.openTime! };
    }
  }
  return { open: false };
}
