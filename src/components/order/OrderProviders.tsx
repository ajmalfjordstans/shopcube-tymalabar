'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { OrderAuthProvider } from '@/context/OrderAuthContext';

export default function OrderProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <OrderAuthProvider>
        {children}
        <Toaster position="top-center" />
      </OrderAuthProvider>
    </QueryClientProvider>
  );
}
