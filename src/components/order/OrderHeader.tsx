'use client';
import Link from 'next/link';
import Image from 'next/image';
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
    <header className="relative z-10 bg-[#601131] text-white overflow-hidden font-poppins">
      <div className="absolute inset-0">
        <Image
          src="/background/doodle.avif"
          alt=""
          fill
          className="object-cover object-center opacity-20"
          priority
        />
      </div>

      {/* pt clears the site navbar's fixed, transparent, unscrolled height (~120px) — this
          header's own maroon background needs to reach all the way to y=0 so the navbar's
          white text has something dark to sit on, the same way MenuHero does on other pages. */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-[120px] pb-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link href="/order" className="font-bold text-lg leading-tight">
            {storeName}
          </Link>
          <p className="text-xs mt-0.5">
            <span className="opacity-70">Home</span>{' '}
            <span className="opacity-50">››</span>{' '}
            <span className="opacity-90">Order Online</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          {reservationEnabled && (
            <Link href="/order/reservations"
              className="hidden sm:flex items-center gap-1.5 text-sm opacity-90 hover:opacity-100 hover:text-[#1976D2] transition-colors font-medium">
              <CalendarDays size={16} />
              <span>Reserve</span>
            </Link>
          )}
          {giftCardEnabled && (
            <Link href="/order/gift-cards"
              className="hidden sm:flex items-center gap-1.5 text-sm opacity-90 hover:opacity-100 hover:text-[#1976D2] transition-colors font-medium">
              <Gift size={16} />
              <span>Gift Cards</span>
            </Link>
          )}
          {session ? (
            <div className="flex items-center gap-2">
              <Link href="/order/orders" className="text-sm opacity-90 flex items-center gap-1 hover:opacity-100 hover:text-[#1976D2] transition-colors">
                <User size={16} />
                <span className="hidden sm:inline">{session.user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/order/login"
              className="text-sm opacity-90 hover:opacity-100 hover:text-[#1976D2] transition-colors"
            >
              Sign in
            </Link>
          )}

          <Link
            href="/order/cart"
            className={`relative flex items-center gap-1.5 bg-[#1976D2] hover:bg-[#1565C0] text-white text-sm font-semibold px-3 py-1.5 rounded-full transition-transform duration-200 ${bump ? 'scale-110' : 'scale-100'}`}
          >
            <ShoppingBag size={16} className={bump ? 'animate-bump' : ''} />
            {itemCount > 0 && (
              <span className={bump ? 'animate-bump' : ''}>{itemCount}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
