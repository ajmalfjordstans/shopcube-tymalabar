'use client';
import Link from 'next/link';
import { ShoppingBag, User, LogOut, CalendarDays, Gift } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCart, useCartBump } from '@/context/OrderCartContext';
import { useAuth } from '@/context/OrderAuthContext';
import { getStoreBySlugApi } from '@/lib/order/api';
import { STORE_SLUG } from '@/lib/order/config';

export default function OrderHeader() {
  const { itemCount } = useCart();
  const bump = useCartBump();
  const { session, logout } = useAuth();

  const { data } = useQuery({
    queryKey: ['order-store'],
    queryFn: () => getStoreBySlugApi(STORE_SLUG),
    retry: false,
  });

  const storeName = data?.data?.name ?? 'TyMalabar';
  const reservationEnabled = data?.data?.reservationEnabled !== false;
  const giftCardEnabled = data?.data?.giftCardEnabled !== false;

  return (
    <header className="relative z-10 bg-white border-b border-gray-200 shadow-sm font-poppins">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/order" className="font-bold text-lg text-[#601131] truncate">
          {storeName} — Order Online
        </Link>

        <div className="flex items-center gap-3">
          {reservationEnabled && (
            <Link href="/order/reservations"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-600 transition-colors font-medium">
              <CalendarDays size={16} />
              <span>Reserve</span>
            </Link>
          )}
          {giftCardEnabled && (
            <Link href="/order/gift-cards"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-600 transition-colors font-medium">
              <Gift size={16} />
              <span>Gift Cards</span>
            </Link>
          )}
          {session ? (
            <div className="flex items-center gap-2">
              <Link href="/order/orders" className="text-sm text-gray-600 flex items-center gap-1 hover:text-gray-900">
                <User size={16} />
                <span className="hidden sm:inline">{session.user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/order/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
          )}

          <Link
            href="/order/cart"
            className={`relative flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-transform duration-200 ${bump ? 'scale-110' : 'scale-100'}`}
          >
            <ShoppingBag size={16} className={bump ? 'animate-bump' : ''} />
            {itemCount > 0 && (
              <span className={`font-semibold ${bump ? 'animate-bump' : ''}`}>{itemCount}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
