import type { MenuItem, OrderType } from '@/types/order';

/**
 * Cheapest possible total for an item: base price plus the cheapest modifier
 * from each required modifier group (customer must pick at least one, so the
 * true minimum spend includes it). Used to show "From £X.XX" for items priced
 * at £0 that only become chargeable once a required modifier is selected.
 */
export function getMinItemPrice(item: MenuItem, orderType: OrderType): number {
  const basePrice = orderType === 'EAT_IN' ? item.eatInPrice : (item.price ?? item.eatInPrice);

  const requiredModifiersMin = item.modifierGroups
    .filter(g => g.isRequired && g.modifiers.length > 0)
    .reduce((sum, g) => {
      const cheapest = Math.min(
        ...g.modifiers.map(m => (orderType === 'EAT_IN' ? (m.eatInPrice ?? m.price) : m.price))
      );
      return sum + cheapest;
    }, 0);

  return basePrice + requiredModifiersMin;
}

export function hasRequiredModifiers(item: MenuItem): boolean {
  return item.modifierGroups.some(g => g.isRequired && g.modifiers.length > 0);
}
