'use client';
import { createContext, useContext, useEffect, useReducer, useCallback, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import type { Cart, CartItem, OrderType, SelectedModifier, DeliveryDetails } from '@/types/order';

interface AddToCartPayload {
  menuItemId: string;
  name: string;
  imageUrl?: string;
  basePrice: number;
  taxRate: number;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  specialInstructions?: string;
}

type Action =
  | { type: 'LOAD'; cart: Cart }
  | { type: 'ADD'; payload: AddToCartPayload }
  | { type: 'UPDATE_QTY'; cartItemId: string; quantity: number }
  | { type: 'UPDATE_NOTES'; cartItemId: string; notes: string }
  | { type: 'REMOVE'; cartItemId: string }
  | { type: 'SET_ORDER_TYPE'; orderType: OrderType }
  | { type: 'SET_DELIVERY'; details: DeliveryDetails }
  | { type: 'SET_SCHEDULED'; scheduledAt: string | undefined }
  | { type: 'CLEAR' };

function itemTotal(item: CartItem): number {
  const modTotal = item.selectedModifiers.reduce((s, m) => s + m.price, 0);
  return (item.basePrice + modTotal) * item.quantity;
}

function makeCartItemId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function reducer(state: Cart, action: Action): Cart {
  switch (action.type) {
    case 'LOAD':
      return action.cart;

    case 'ADD': {
      const { payload } = action;
      const newItem: CartItem = {
        cartItemId: makeCartItemId(),
        menuItemId: payload.menuItemId,
        name: payload.name,
        imageUrl: payload.imageUrl,
        basePrice: payload.basePrice,
        taxRate: payload.taxRate,
        quantity: payload.quantity,
        selectedModifiers: payload.selectedModifiers,
        specialInstructions: payload.specialInstructions,
        totalPrice: 0,
      };
      newItem.totalPrice = itemTotal(newItem);
      return { ...state, items: [...state.items, newItem] };
    }

    case 'UPDATE_QTY': {
      const items = state.items
        .map(i => i.cartItemId === action.cartItemId
          ? { ...i, quantity: action.quantity, totalPrice: itemTotal({ ...i, quantity: action.quantity }) }
          : i
        )
        .filter(i => i.quantity > 0);
      return { ...state, items };
    }

    case 'UPDATE_NOTES': {
      const items = state.items.map(i =>
        i.cartItemId === action.cartItemId
          ? { ...i, specialInstructions: action.notes || undefined }
          : i
      );
      return { ...state, items };
    }

    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i.cartItemId !== action.cartItemId) };

    case 'SET_ORDER_TYPE':
      return { ...state, orderType: action.orderType, deliveryDetails: action.orderType !== 'DELIVERY' ? undefined : state.deliveryDetails };

    case 'SET_DELIVERY':
      return { ...state, deliveryDetails: action.details };

    case 'SET_SCHEDULED':
      return { ...state, scheduledAt: action.scheduledAt };

    case 'CLEAR':
      return { ...state, items: [], deliveryDetails: undefined, scheduledAt: undefined };

    default:
      return state;
  }
}

interface CartContextValue {
  cart: Cart;
  addItem: (payload: AddToCartPayload) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateInstructions: (cartItemId: string, notes: string) => void;
  removeItem: (cartItemId: string) => void;
  setOrderType: (orderType: OrderType) => void;
  setDeliveryDetails: (details: DeliveryDetails) => void;
  setScheduledAt: (scheduledAt: string | undefined) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'store_cart_tymalabar';

function makeEmptyCart(storeId: string): Cart {
  return { storeId, items: [], orderType: 'TAKEAWAY' };
}

/** Pulled out of CartProvider's useMemo so the totals math is directly unit-testable. */
export function computeCartTotals(cart: Pick<Cart, 'items' | 'deliveryDetails' | 'orderType'>) {
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.items.reduce((s, i) => s + i.totalPrice, 0);
  const tax = cart.items.reduce((s, i) => s + i.totalPrice * ((i.taxRate || 0) / 100), 0);
  const deliveryFee = cart.deliveryDetails?.deliveryFee ?? 0;
  const total = subtotal + tax + (cart.orderType === 'DELIVERY' ? deliveryFee : 0);
  return { itemCount, subtotal, tax, total };
}

export function OrderCartProvider({ children, storeId }: { children: React.ReactNode; storeId: string }) {
  const [cart, dispatch] = useReducer(reducer, makeEmptyCart(storeId));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: Cart = JSON.parse(raw);
        if (saved.storeId === storeId) dispatch({ type: 'LOAD', cart: saved });
      }
    } catch { /* ignore */ }
  }, [storeId]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      } catch {
        toast.error("Couldn't save your cart — storage may be full. Items may be lost on refresh.", { id: 'cart-save-fail', duration: 6000 });
      }
    }, 200);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [cart, storeId]);

  const addItem = useCallback((payload: AddToCartPayload) => dispatch({ type: 'ADD', payload }), []);
  const updateQuantity = useCallback((cartItemId: string, quantity: number) => dispatch({ type: 'UPDATE_QTY', cartItemId, quantity }), []);
  const updateInstructions = useCallback((cartItemId: string, notes: string) => dispatch({ type: 'UPDATE_NOTES', cartItemId, notes }), []);
  const removeItem = useCallback((cartItemId: string) => dispatch({ type: 'REMOVE', cartItemId }), []);
  const setOrderType = useCallback((orderType: OrderType) => dispatch({ type: 'SET_ORDER_TYPE', orderType }), []);
  const setDeliveryDetails = useCallback((details: DeliveryDetails) => dispatch({ type: 'SET_DELIVERY', details }), []);
  const setScheduledAt = useCallback((scheduledAt: string | undefined) => dispatch({ type: 'SET_SCHEDULED', scheduledAt }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const { itemCount, subtotal, tax, total } = useMemo(
    () => computeCartTotals(cart),
    [cart.items, cart.deliveryDetails, cart.orderType]
  );

  return (
    <CartContext.Provider value={{
      cart, addItem, updateQuantity, updateInstructions, removeItem,
      setOrderType, setDeliveryDetails, setScheduledAt, clearCart,
      itemCount, subtotal, tax, total,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside OrderCartProvider');
  return ctx;
}

/** Returns true for a brief moment whenever the cart's item count increases — for "bump" animations on cart badges. */
export function useCartBump(): boolean {
  const { itemCount } = useCart();
  const prevCount = useRef(itemCount);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const increased = itemCount > prevCount.current;
    prevCount.current = itemCount;
    if (increased) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 320);
      return () => clearTimeout(t);
    }
  }, [itemCount]);

  return bump;
}
