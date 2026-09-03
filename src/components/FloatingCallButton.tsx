'use client';
import { usePathname } from 'next/navigation';

export default function FloatingCallButton() {
  const pathname = usePathname();
  const isOrderSection = pathname?.startsWith('/order') ?? false;

  return (
    <a
      href="tel:+441656860844"
      className={`fixed bottom-6 right-6 z-[200] items-center justify-center w-14 h-14 rounded-full bg-[#F0A429] shadow-lg hover:bg-[#d48e20] transition-colors ${
        // The ordering pages already have their own "Call" CTA in OrderHeader, and on
        // mobile their bottom tab bar (OrderBottomNav) plus a floating "View order" bar
        // both occupy this same bottom-right area — a third floating call button there
        // just collides with them. Keep it only on desktop /order, where none of that applies.
        isOrderSection ? 'hidden md:flex' : 'flex'
      }`}
      aria-label="Call us"
    >
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.29 21 3 13.71 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
      </svg>
    </a>
  );
}
