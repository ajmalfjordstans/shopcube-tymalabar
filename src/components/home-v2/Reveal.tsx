'use client';

import React, { useEffect, useRef, useState } from 'react';

type Direction = 'up' | 'left' | 'right' | 'scale';

const HIDDEN_TRANSFORM: Record<Direction, string> = {
  up: 'translate-y-8',
  left: '-translate-x-10',
  right: 'translate-x-10',
  scale: 'scale-90',
};

export default function Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);
    // Safety net: never leave content permanently invisible if the observer is delayed.
    const fallback = setTimeout(() => setVisible(true), 1800);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : `opacity-0 ${HIDDEN_TRANSFORM[direction]}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
