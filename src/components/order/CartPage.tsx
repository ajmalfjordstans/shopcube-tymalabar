'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Trash2, ArrowLeft, ShoppingBag, Pencil } from 'lucide-react';
import { useCart } from '@/context/OrderCartContext';
import type { OrderType } from '@/types/order';

const ORDER_TYPES: { value: OrderType; label: string; description: string }[] = [
  { value: 'TAKEAWAY', label: 'Collection', description: 'Pick up your order' },
  { value: 'DELIVERY', label: 'Delivery', description: 'Delivered to your door' },
];

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, updateInstructions, removeItem, setOrderType, itemCount, subtotal, tax, total } = useCart();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const startEditing = (cartItemId: string, current?: string) => {
    setEditingId(cartItemId);
    setEditText(current ?? '');
  };

  const saveNote = (cartItemId: string) => {
    updateInstructions(cartItemId, editText.trim());
    setEditingId(null);
  };

  if (itemCount === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#D7CDA7] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4 bg-brand-50">
          <ShoppingBag size={40} className="text-brand-400" />
        </div>
        <h2 className="text-xl font-black text-gray-800 mb-1">Nothing here yet</h2>
        <p className="text-gray-400 mb-8 text-sm">Add something delicious from the menu.</p>
        <Link
          href="/order"
          className="inline-flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-full transition-all bg-brand-500 hover:bg-brand-600"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  const deliveryFee = cart.orderType === 'DELIVERY' ? (cart.deliveryDetails?.deliveryFee ?? 0) : 0;

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/order"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to menu
      </Link>

      <h1 className="text-2xl font-black text-gray-900 mb-6">Your Order</h1>

      <div className="mb-6">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Order Type</p>
        <div className="grid grid-cols-2 gap-2">
          {ORDER_TYPES.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => setOrderType(value)}
              className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all ${
                cart.orderType === value
                  ? 'border-brand-500 bg-white shadow-md'
                  : 'border-gray-200/70 bg-white/60 hover:bg-white hover:border-gray-300'
              }`}
            >
              <span className={`text-sm font-bold ${cart.orderType === value ? 'text-brand-600' : 'text-gray-600'}`}>
                {label}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">{description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {cart.items.map(item => (
          <div key={item.cartItemId} className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start gap-3">
              {item.imageUrl && (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image src={item.imageUrl} alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                  <p className="font-black text-gray-900 text-sm flex-shrink-0">£{item.totalPrice.toFixed(2)}</p>
                </div>
                {item.selectedModifiers.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">{item.selectedModifiers.map(m => m.modifierName).join(', ')}</p>
                )}

                {editingId === item.cartItemId ? (
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      placeholder="Add a note (e.g. no onions)"
                      rows={2}
                      autoFocus
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
                    />
                    <div className="flex justify-end gap-2 mt-1.5">
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs font-semibold text-gray-400 px-2 py-1 hover:text-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveNote(item.cartItemId)}
                        className="text-xs font-semibold text-brand-600 px-2 py-1 hover:text-brand-700 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : item.specialInstructions ? (
                  <button
                    onClick={() => startEditing(item.cartItemId, item.specialInstructions)}
                    className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 italic hover:text-gray-600 transition-colors text-left"
                  >
                    &ldquo;{item.specialInstructions}&rdquo;
                    <Pencil size={11} className="flex-shrink-0 not-italic" />
                  </button>
                ) : (
                  <button
                    onClick={() => startEditing(item.cartItemId)}
                    className="flex items-center gap-1 text-xs text-gray-400 mt-1 hover:text-gray-600 transition-colors"
                  >
                    <Pencil size={11} />
                    Add a note
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white transition-colors">
                  <Minus size={12} />
                </button>
                <span className="w-5 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white transition-colors">
                  <Plus size={12} />
                </button>
              </div>
              <button onClick={() => removeItem(item.cartItemId)} className="p-2 text-gray-300 hover:text-red-400 transition-colors" aria-label="Remove item">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 space-y-2" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Subtotal</span>
          <span className="font-medium text-gray-700">£{subtotal.toFixed(2)}</span>
        </div>
        {tax > 0 && (
          <div className="flex justify-between text-sm text-gray-500">
            <span>Tax</span>
            <span className="font-medium text-gray-700">£{tax.toFixed(2)}</span>
          </div>
        )}
        {cart.orderType === 'DELIVERY' && (
          <div className="flex justify-between text-sm text-gray-500">
            <span>Delivery fee</span>
            <span className="font-medium text-gray-700">{deliveryFee > 0 ? `£${deliveryFee.toFixed(2)}` : 'At checkout'}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-gray-100 text-base">
          <span>Total</span>
          <span>£{total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => router.push('/order/checkout')}
        className="w-full text-white font-bold py-4 rounded-2xl transition-all text-center flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
