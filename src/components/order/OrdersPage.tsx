'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Bike, Package, UtensilsCrossed,
  Clock, CheckCircle2, XCircle, Loader2, ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/OrderAuthContext';
import { getGuestOrderApi, getMyOrdersApi, getStoreBySlugApi } from '@/lib/order/api';
import { STORE_SLUG } from '@/lib/order/config';
import { useQuery } from '@tanstack/react-query';
import type { GuestOrder } from '@/types/order';

interface HistoryEntry {
  id: string;
  phone: string;
  total: number;
  orderType: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', Icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', Icon: CheckCircle2 },
  PREPARING: { label: 'Preparing', color: 'bg-amber-100 text-amber-700', Icon: Loader2 },
  READY: { label: 'Ready', color: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
  OUT_FOR_DELIVERY: { label: 'On the way', color: 'bg-blue-100 text-blue-700', Icon: Bike },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-600', Icon: XCircle },
};

const ORDER_TYPE_CONFIG: Record<string, { label: string; Icon: React.ElementType }> = {
  DELIVERY: { label: 'Delivery', Icon: Bike },
  TAKEAWAY: { label: 'Collection', Icon: Package },
  EAT_IN: { label: 'Dine In', Icon: UtensilsCrossed },
};

function loadHistoryEntries(userId: string): HistoryEntry[] {
  try {
    const fromUser: HistoryEntry[] = JSON.parse(localStorage.getItem(`sc_orders_${userId}`) ?? '[]');
    const fromGuest: HistoryEntry[] = JSON.parse(localStorage.getItem('sc_orders_guest') ?? '[]');
    const seen = new Set<string>();
    return [...fromUser, ...fromGuest]
      .filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true; })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const { session, isLoggedIn } = useAuth();

  const { data: storeData } = useQuery({
    queryKey: ['order-store'],
    queryFn: () => getStoreBySlugApi(STORE_SLUG),
    retry: false,
    enabled: isLoggedIn,
  });
  const storeId = storeData?.data?.id;

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/order/login?next=/order/orders');
    }
  }, [isLoggedIn, router]);

  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ['order-my-orders', storeId, session?.user.id],
    queryFn: async () => {
      const entries = loadHistoryEntries(session!.user.id);

      const results = await Promise.allSettled([
        getMyOrdersApi(storeId!).then(r => r.data),
        ...entries.map(e => getGuestOrderApi(e.id, { phone: e.phone }).then(r => r.data)),
      ]);

      const seen = new Set<string>();
      const fetched: GuestOrder[] = [];
      for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        const value = result.value;
        const list = Array.isArray(value) ? value : [value];
        for (const order of list) {
          if (seen.has(order.id)) continue;
          seen.add(order.id);
          fetched.push(order);
        }
      }
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return fetched;
    },
    enabled: isLoggedIn && !!session && !!storeId,
  });

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link href="/order" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to menu
        </Link>
        <div className="flex items-center gap-2 mb-6">
          <Clock size={20} className="text-brand-500" />
          <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-36 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/order"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to menu
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <Clock size={20} className="text-brand-500" />
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No orders yet</p>
          <p className="text-sm mt-1">Your past orders will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600', Icon: Clock };
            const type = ORDER_TYPE_CONFIG[order.orderType] ?? { label: order.orderType, Icon: Package };

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="px-5 py-4 flex items-start justify-between gap-3 border-b border-gray-50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">Order #{order.id.slice(-6).toUpperCase()}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                        <status.Icon size={11} />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <type.Icon size={11} />
                        {type.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>
                    {order.deliveryAddress && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{order.deliveryAddress}</p>
                    )}
                  </div>
                  <span className="font-bold text-gray-900 text-base flex-shrink-0">
                    £{parseFloat(String(order.total)).toFixed(2)}
                  </span>
                </div>

                <div className="px-5 py-3 space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-baseline justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-sm text-gray-700">
                          <span className="font-medium text-gray-900">{item.quantity}×</span> {item.name}
                        </span>
                        {item.modifiers.length > 0 && (
                          <span className="text-xs text-gray-400 ml-1">
                            ({item.modifiers.map(m => m.modifierName).join(', ')})
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 flex-shrink-0 tabular-nums">
                        £{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3 border-t border-gray-50 flex justify-end">
                  <Link
                    href={`/order/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Track order
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
