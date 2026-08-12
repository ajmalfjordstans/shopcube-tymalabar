import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Rewards - Ty Malabar',
  description: 'Earn points and unlock exclusive rewards with every order at Ty Malabar.',
};

export default function RewardsPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-[#601131] relative overflow-hidden min-h-[100dvh] flex items-center justify-center py-28">
        {/* Background doodle */}
        <div className="absolute inset-0">
          <Image
            src="/background/doodle.avif"
            alt="Decorative background pattern"
            fill
            className="object-cover object-center opacity-60"
            priority
          />
        </div>

        {/* Mandala top-right */}
        <div className="absolute top-10 right-10 w-64 h-64 opacity-25 z-10 pointer-events-none">
          <div className="w-full h-full border-4 border-orange-300 rounded-full flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-orange-300 rounded-full flex items-center justify-center">
              <div className="w-32 h-32 border-2 border-orange-300 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 border-2 border-orange-300 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Mandala bottom-left */}
        <div className="absolute bottom-16 left-10 w-48 h-48 opacity-20 z-10 pointer-events-none">
          <div className="w-full h-full border-4 border-orange-300 rounded-full flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-orange-300 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-orange-300 rounded-full" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-6 relative z-10 text-center font-poppins">
          {/* Crown icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-[#F0A429] to-orange-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl shadow-orange-900/40">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 19h20v2H2v-2zM2 5l5 7 5-7 5 7 5-7v12H2V5z" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
            Ty Malabar
          </h1>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#F0A429] mb-6 leading-tight">
            Rewards
          </h2>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-16 bg-orange-300/40" />
            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            <div className="h-px w-16 bg-orange-300/40" />
          </div>

          {/* Primary CTA */}
          <a
            href="https://forms.gle/H3BC1QNzVuXiveWg8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#601131] hover:bg-[#F1EED0] font-semibold px-10 py-4 rounded-lg transition-colors shadow-lg text-lg mb-10"
          >
            <svg className="w-5 h-5 text-[#F0A429]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            Join Rewards
          </a>

          {/* Description */}
          <p className="text-gray-200 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            We&apos;re crafting something special for our loyal customers. Earn points, unlock exclusive offers, and enjoy rewards with every order.
          </p>

          {/* Reward feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { label: 'Earn Points', icon: '★' },
              { label: 'Exclusive Deals', icon: '🎁' },
              { label: 'Free Meals', icon: '🍛' },
              { label: 'Priority Service', icon: '⚡' },
            ].map(({ label, icon }) => (
              <span
                key={label}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-5 py-2.5 rounded-full border border-white/20"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </span>
            ))}
          </div>

          {/* Secondary nav links */}
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-white/50">
            <Link href="/" className="hover:text-white/80 transition-colors">
              Back to Home
            </Link>
            <span>·</span>
            <a href="https://order.tymalabar.co.uk" target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors">
              Explore Menu
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
