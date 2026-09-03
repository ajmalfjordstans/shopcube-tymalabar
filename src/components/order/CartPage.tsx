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
      <div className="bg-white rounded-2xl border border-[#D7CDA7] flex flex-col items-center justify-center px-4 py-16 text-center font-poppins">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4 bg-[#1976D2]/10">
          <ShoppingBag size={40} className="text-[#1976D2]" />
        </div>
        <h2 className="text-xl font-bold text-[#601131] mb-1">Nothing here yet</h2>
        <p className="text-[#601131]/50 mb-8 text-sm">Add something delicious from the menu.</p>
        <Link
          href="/order"
          className="inline-flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-full transition-all bg-[#1976D2] hover:bg-[#1565C0]"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  const deliveryFee = cart.orderType === 'DELIVERY' ? (cart.deliveryDetails?.deliveryFee ?? 0) : 0;

  return (
    <div className="max-w-lg mx-auto font-poppins">
      <Link
        href="/order"
        className="inline-flex items-center gap-1.5 text-sm text-[#601131]/60 hover:text-[#601131] mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to menu
      </Link>

      <h1 className="text-2xl font-bold text-[#601131] mb-6">Your Order</h1>

      <div className="mb-6">
        <p className="text-xs font-bold text-[#601131]/50 uppercase tracking-widest mb-3">Order Type</p>
        <div className="grid grid-cols-2 gap-2">
          {ORDER_TYPES.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => setOrderType(value)}
              className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all ${
                cart.orderType === value
                  ? 'border-[#1976D2] bg-white shadow-md'
                  : 'border-[#D7CDA7]/70 bg-white/60 hover:bg-white hover:border-[#D7CDA7]'
              }`}
            >
              <span className={`text-sm font-bold ${cart.orderType === value ? 'text-[#1565C0]' : 'text-[#601131]/70'}`}>
                {label}
              </span>
              <span className="text-xs text-[#601131]/40 mt-0.5">{description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {cart.items.map(item => (
          <div key={item.cartItemId} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              {item.imageUrl && (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#F5F5DC]">
                  <Image src={item.imageUrl} alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <p className="font-bold text-[#601131] text-sm">{item.name}</p>
                  <p className="font-bold text-[#601131] text-sm flex-shrink-0">£{item.totalPrice.toFixed(2)}</p>
                </div>
                {item.selectedModifiers.length > 0 && (
                  <p className="text-xs text-[#601131]/50 mt-0.5">{item.selectedModifiers.map(m => m.modifierName).join(', ')}</p>
                )}

                {editingId === item.cartItemId ? (
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      placeholder="Add a note (e.g. no onions)"
                      rows={2}
                      autoFocus
                      className="w-full text-xs border border-[#D7CDA7] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#1976D2]/40 resize-none bg-white text-[#601131]"
                    />
                    <div className="flex justify-end gap-2 mt-1.5">
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs font-semibold text-[#601131]/50 px-2 py-1 hover:text-[#601131] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveNote(item.cartItemId)}
                        className="text-xs font-semibold text-[#1565C0] px-2 py-1 hover:text-[#0D47A1] transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : item.specialInstructions ? (
                  <button
                    onClick={() => startEditing(item.cartItemId, item.specialInstructions)}
                    className="flex items-center gap-1 text-xs text-[#601131]/50 mt-0.5 italic hover:text-[#601131] transition-colors text-left"
                  >
                    &ldquo;{item.specialInstructions}&rdquo;
                    <Pencil size={11} className="flex-shrink-0 not-italic" />
                  </button>
                ) : (
                  <button
                    onClick={() => startEditing(item.cartItemId)}
                    className="flex items-center gap-1 text-xs text-[#601131]/50 mt-1 hover:text-[#601131] transition-colors"
                  >
                    <Pencil size={11} />
                    Add a note
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 bg-white border border-[#D7CDA7] rounded-full px-2 py-1">
                <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#F5F5DC] transition-colors text-[#601131]">
                  <Minus size={12} />
                </button>
                <span className="w-5 text-center text-sm font-bold tabular-nums text-[#601131]">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#F5F5DC] transition-colors text-[#601131]">
                  <Plus size={12} />
                </button>
              </div>
              <button onClick={() => removeItem(item.cartItemId)} className="p-2 text-[#601131]/30 hover:text-red-500 transition-colors" aria-label="Remove item">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 mb-6 space-y-2 shadow-sm">
        <div className="flex justify-between text-sm text-[#601131]/60">
          <span>Subtotal</span>
          <span className="font-medium text-[#601131]">£{subtotal.toFixed(2)}</span>
        </div>
        {tax > 0 && (
          <div className="flex justify-between text-sm text-[#601131]/60">
            <span>Tax</span>
            <span className="font-medium text-[#601131]">£{tax.toFixed(2)}</span>
          </div>
        )}
        {cart.orderType === 'DELIVERY' && (
          <div className="flex justify-between text-sm text-[#601131]/60">
            <span>Delivery fee</span>
            <span className="font-medium text-[#601131]">{deliveryFee > 0 ? `£${deliveryFee.toFixed(2)}` : 'At checkout'}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-[#601131] pt-2 border-t border-[#D7CDA7] text-base">
          <span>Total</span>
          <span>£{total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => router.push('/order/checkout')}
        className="w-full text-white font-bold py-4 rounded-2xl transition-all text-center flex items-center justify-center gap-2 bg-[#1976D2] hover:bg-[#1565C0]"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
