'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, ShoppingBag, Clock, User, CalendarDays, Gift } from 'lucide-react';
import { useCart, useCartBump } from '@/context/OrderCartContext';
import { useAuth } from '@/context/OrderAuthContext';

interface Tab {
  href: string;
  label: string;
  Icon: React.ElementType;
  isActive: boolean;
  badge?: number;
}

export default function OrderBottomNav({ reservationEnabled, giftCardEnabled }: { reservationEnabled?: boolean; giftCardEnabled?: boolean }) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const bump = useCartBump();
  const { isLoggedIn } = useAuth();

  const isMenu         = pathname === '/order';
  const isCart         = pathname.startsWith('/order/cart') || pathname.startsWith('/order/checkout');
  const isOrders       = pathname.startsWith('/order/orders');
  const isReservations = pathname.startsWith('/order/reservations');
  const isGiftCards    = pathname.startsWith('/order/gift-cards');
  const isAccount      = pathname.startsWith('/order/account') || pathname.startsWith('/order/login');

  const tabs: Tab[] = [
    { href: '/order',                                              label: 'Menu',    Icon: UtensilsCrossed, isActive: isMenu },
    { href: '/order/cart',                                        label: 'Cart',    Icon: ShoppingBag,     isActive: isCart, badge: itemCount > 0 ? itemCount : undefined },
    ...(reservationEnabled !== false ? [{ href: '/order/reservations', label: 'Reserve',  Icon: CalendarDays, isActive: isReservations }] : []),
    ...(giftCardEnabled !== false    ? [{ href: '/order/gift-cards',   label: 'Gift Cards', Icon: Gift,        isActive: isGiftCards }] : []),
    ...(isLoggedIn ? [{ href: '/order/orders',              label: 'Orders',  Icon: Clock,           isActive: isOrders }] : []),
    { href: isLoggedIn ? '/order/account' : '/order/login', label: isLoggedIn ? 'Account' : 'Sign In', Icon: User, isActive: isAccount },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#F1EED0]/95 backdrop-blur-md border-t border-[#D7CDA7] font-poppins"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative pt-1 transition-colors ${
              tab.isActive ? 'text-[#F0A429]' : 'text-[#601131]/50 active:text-[#601131]'
            }`}
          >
            {tab.isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-[#F0A429]" />
            )}

            <div className="relative">
              <tab.Icon size={22} strokeWidth={tab.isActive ? 2.5 : 1.8} />
              {tab.badge !== undefined && (
                <span className={`absolute -top-1.5 -right-2.5 bg-[#F0A429] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none ${
                  tab.label === 'Cart' && bump ? 'animate-bump' : ''
                }`}>
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </div>

            <span className={`text-[10px] leading-none ${tab.isActive ? 'font-bold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
