'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle, Loader2, UtensilsCrossed, ShoppingBag,
  Plus, Minus, Trash2, ChevronRight,
  MapPin, Phone, Clock, Search, X, SlidersHorizontal, Check,
} from 'lucide-react';
import { getStoreBySlugApi, getPublicMenuApi, checkDeliveryPostcodeApi } from '@/lib/order/api';
import { STORE_SLUG } from '@/lib/order/config';
import type { Category, MenuItem, CartItem, OrderType } from '@/types/order';
import { getStoreOpenStatus } from '@/lib/order/storeHours';
import { getMinItemPrice } from '@/lib/order/pricing';
import ItemModal from './ItemModal';
import ClosedStoreModal from './ClosedStoreModal';
import { useAuth } from '@/context/OrderAuthContext';
import { useCart } from '@/context/OrderCartContext';

const ACCENT_COLORS = [
  '#601131', '#F0A429', '#8b5cf6', '#06b6d4', '#10b981',
  '#ef4444', '#3b82f6', '#ec4899',
];

const ORDER_TYPE_TABS: { value: OrderType; label: string }[] = [
  { value: 'TAKEAWAY', label: 'Collection' },
  { value: 'DELIVERY', label: 'Delivery' },
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'name-asc', label: 'A → Z' },
  { value: 'name-desc', label: 'Z → A' },
] as const;

export default function MenuBrowser() {
  const { session } = useAuth();
  const { cart, itemCount, subtotal, tax, total, updateQuantity, removeItem, setOrderType, setDeliveryDetails } = useCart();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [deliveryPostcode, setDeliveryPostcode] = useState('');
  const [postcodeChecking, setPostcodeChecking] = useState(false);
  const [postcodeResult, setPostcodeResult] = useState<
    { ok: true; fee: number; minOrderValue: number } | { ok: false; message: string } | null
  >(null);
  const [showSavedPostcode, setShowSavedPostcode] = useState(false);
  const [autoChecked, setAutoChecked] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const postcodeAbortRef = useRef<AbortController | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('default');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [hideUnavailable, setHideUnavailable] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const { data: storeData, isLoading: storeLoading } = useQuery({
    queryKey: ['order-store'],
    queryFn: () => getStoreBySlugApi(STORE_SLUG),
    retry: false,
  });

  const storeId = storeData?.data?.id;
  const storeName = storeData?.data?.name ?? 'TyMalabar';
  const preOrderEnabled = storeData?.data?.preOrderEnabled ?? false;

  const { data: menuData, isLoading: menuLoading, error } = useQuery({
    queryKey: ['order-menu', storeId],
    queryFn: () => getPublicMenuApi(storeId!),
    enabled: !!storeId,
  });

  const categories: Category[] = menuData?.data ?? [];

  const [hiddenAllergens, setHiddenAllergens] = useState<Set<string>>(new Set());

  const allAllergens = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; icon?: string }>();
    for (const cat of categories) {
      for (const sub of cat.subcategories) {
        for (const item of sub.menuItems) {
          for (const a of item.allergens ?? []) {
            if (!seen.has(a.id)) seen.set(a.id, a);
          }
        }
      }
    }
    return [...seen.values()];
  }, [categories]);

  function toggleAllergen(id: string) {
    setHiddenAllergens(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const allItems = useMemo(() =>
    categories.flatMap(cat => cat.subcategories.flatMap(sub => sub.menuItems)), [categories]);

  const itemAccentMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat, catIdx) => {
      const accent = cat.colorCode ?? ACCENT_COLORS[catIdx % ACCENT_COLORS.length];
      cat.subcategories.forEach(sub => sub.menuItems.forEach(item => map.set(item.id, accent)));
    });
    return map;
  }, [categories]);

  const filteredItems = useMemo(() => {
    const getPrice = (item: MenuItem) => item.price ?? item.eatInPrice;

    let items = [...allItems];

    if (hiddenAllergens.size > 0)
      items = items.filter(i => !(i.allergens ?? []).some(a => hiddenAllergens.has(a.id)));

    if (hideUnavailable)
      items = items.filter(i => i.isAvailable);

    const q = searchQuery.trim().toLowerCase();
    if (q)
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q)
      );

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) items = items.filter(i => getPrice(i) >= min);
    if (!isNaN(max)) items = items.filter(i => getPrice(i) <= max);

    if (sortBy === 'price-asc') items = [...items].sort((a, b) => getPrice(a) - getPrice(b));
    if (sortBy === 'price-desc') items = [...items].sort((a, b) => getPrice(b) - getPrice(a));
    if (sortBy === 'name-asc') items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'name-desc') items = [...items].sort((a, b) => b.name.localeCompare(a.name));

    return items;
  }, [allItems, hiddenAllergens, hideUnavailable, searchQuery, minPrice, maxPrice, sortBy]);

  const visibleIds = useMemo(() => new Set(filteredItems.map(i => i.id)), [filteredItems]);

  const isSearchMode = searchQuery.trim() !== '' || sortBy !== 'default' || minPrice !== '' || maxPrice !== '';

  const activeFilterCount = [
    sortBy !== 'default',
    minPrice !== '',
    maxPrice !== '',
    !hideUnavailable,
  ].filter(Boolean).length;

  const storeStatus = useMemo(() => getStoreOpenStatus(storeData?.data?.hours), [storeData]);

  const [showClosedPopup, setShowClosedPopup] = useState(false);
  const closedPopupShownRef = useRef(false);

  useEffect(() => {
    if (storeStatus && !storeStatus.open && !closedPopupShownRef.current) {
      closedPopupShownRef.current = true;
      setShowClosedPopup(true);
    }
  }, [storeStatus]);

  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategoryId(entry.target.id);
            navRef.current
              ?.querySelector(`[data-cat="${entry.target.id}"]`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      },
      { root: container, rootMargin: '-12px 0px -50% 0px', threshold: 0 },
    );

    Object.values(categoryRefs.current).forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [categories]);

  // Auto-check saved postcode for logged-in customers
  useEffect(() => {
    if (!session || !storeId || autoChecked) return;
    setAutoChecked(true);
    const saved = localStorage.getItem(`sc_postcode_${session.user.id}`);
    if (!saved) return;
    setDeliveryPostcode(saved);
    setShowSavedPostcode(true);
    setPostcodeChecking(true);
    checkDeliveryPostcodeApi(storeId, saved.trim().toUpperCase())
      .then(result => {
        if (result.eligible && result.zone) {
          setPostcodeResult({ ok: true, fee: result.zone.deliveryFee, minOrderValue: result.zone.minOrderValue });
          setDeliveryDetails({
            address: '',
            postcode: saved.trim().toUpperCase(),
            deliveryZoneId: result.zone.id,
            deliveryFee: result.zone.deliveryFee,
            minOrderValue: result.zone.minOrderValue,
          });
        } else {
          setPostcodeResult({ ok: false, message: result.reason ?? "Sorry, we don't deliver to this postcode." });
        }
      })
      .catch(() => setPostcodeResult({ ok: false, message: 'Could not check postcode. Please try again.' }))
      .finally(() => setPostcodeChecking(false));
  }, [session, storeId, autoChecked, setDeliveryDetails]);

  function scrollToCategory(id: string) {
    setActiveCategoryId(id);
    const container = scrollContainerRef.current;
    const el = categoryRefs.current[id];
    if (el && container) {
      const top =
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop - 12;
      container.scrollTo({ top, behavior: 'smooth' });
    }
  }

  async function checkDelivery() {
    if (!deliveryPostcode.trim() || !storeId) return;
    if (!/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i.test(deliveryPostcode.trim())) {
      setPostcodeResult({ ok: false, message: 'Please enter a valid UK postcode (e.g. CF35 5NW).' });
      return;
    }
    postcodeAbortRef.current?.abort();
    const controller = new AbortController();
    postcodeAbortRef.current = controller;
    setPostcodeChecking(true);
    setPostcodeResult(null);
    try {
      const result = await checkDeliveryPostcodeApi(storeId, deliveryPostcode.trim().toUpperCase(), controller.signal);
      if (result.eligible && result.zone) {
        setPostcodeResult({ ok: true, fee: result.zone.deliveryFee, minOrderValue: result.zone.minOrderValue });
        setDeliveryDetails({
          address: '',
          postcode: deliveryPostcode.trim().toUpperCase(),
          deliveryZoneId: result.zone.id,
          deliveryFee: result.zone.deliveryFee,
          minOrderValue: result.zone.minOrderValue,
        });
      } else {
        setPostcodeResult({ ok: false, message: result.reason ?? "Sorry, we don't deliver to this postcode." });
      }
    } catch (err) {
      if ((err as { code?: string })?.code === 'ERR_CANCELED') return;
      setPostcodeResult({ ok: false, message: 'Could not check postcode. Please try again.' });
    } finally {
      setPostcodeChecking(false);
    }
  }

  const isLoading = storeLoading || (!!storeId && menuLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  if (error || (!storeLoading && !storeId)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-500 px-4">
        <AlertCircle size={36} className="text-red-400" />
        <p className="text-center text-sm">
          {!storeId ? 'This store could not be found.' : 'Failed to load the menu. Please try again.'}
        </p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        No menu items available right now.
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#f5f5f5] rounded-2xl overflow-hidden border border-[#D7CDA7] shadow-sm">

      {/* Status strip */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-3 flex-wrap">
        {storeData?.data?.address && (
          <p className="text-xs text-gray-400 hidden md:flex items-center gap-1">
            <MapPin size={10} />
            {storeData.data.address}{storeData.data.city ? `, ${storeData.data.city}` : ''}
          </p>
        )}
        {storeStatus && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full ${storeStatus.open ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            <Clock size={10} />
            {storeStatus.open
              ? `Open · ${storeStatus.openTime}–${storeStatus.closeTime}`
              : storeStatus.reopenTime
                ? `Closed · Opens ${storeStatus.reopenDay === 'today' ? storeStatus.reopenTime : `${storeStatus.reopenDay} ${storeStatus.reopenTime}`}`
                : 'Closed'}
          </span>
        )}
        {storeStatus && !storeStatus.open && (
          <span className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full ${preOrderEnabled ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
            {preOrderEnabled ? 'Pre-order available' : 'Pre-order unavailable'}
          </span>
        )}
        {storeData?.data?.phone && (
          <a
            href={`tel:${storeData.data.phone.replace(/\s/g, '')}`}
            className="ml-auto flex-shrink-0 flex items-center gap-2 text-sm text-white font-bold bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-full transition-all"
          >
            <Phone size={14} />
            <span className="hidden md:inline">{storeData.data.phone}</span>
            <span className="md:hidden">Call</span>
          </a>
        )}
      </div>

      {/* 2-COLUMN LAYOUT */}
      <div className="flex flex-1 min-h-0">

        {/* CENTER */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 z-10">

            <div className="flex items-center gap-2 px-4 md:px-6 pt-3 pb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search menu…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl border transition-all ${
                    showFilters || activeFilterCount > 0
                      ? 'bg-brand-50 border-brand-200 text-brand-600'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-brand-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {showFilters && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
                    <div className="absolute right-0 top-full mt-2 z-20 w-72 bg-white rounded-2xl border border-gray-100 space-y-4 p-4"
                      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Sort by</p>
                        <div className="flex flex-wrap gap-1.5">
                          {SORT_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setSortBy(opt.value)}
                              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                                sortBy === opt.value
                                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-100" />

                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Price range</p>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">£</span>
                            <input
                              type="number"
                              placeholder="Min"
                              value={minPrice}
                              min={0}
                              onChange={e => setMinPrice(e.target.value)}
                              className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                            />
                          </div>
                          <span className="text-xs text-gray-400">to</span>
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">£</span>
                            <input
                              type="number"
                              placeholder="Max"
                              value={maxPrice}
                              min={0}
                              onChange={e => setMaxPrice(e.target.value)}
                              className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100" />

                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Availability</p>
                        <button
                          onClick={() => setHideUnavailable(v => !v)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                            hideUnavailable
                              ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {hideUnavailable && <Check className="w-3 h-3" />}
                          Available only
                        </button>
                      </div>

                      {activeFilterCount > 0 && (
                        <>
                          <div className="border-t border-gray-100" />
                          <button
                            onClick={() => { setSortBy('default'); setMinPrice(''); setMaxPrice(''); setHideUnavailable(true); setShowFilters(false); }}
                            className="w-full text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors py-0.5"
                          >
                            Clear all filters
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {!isSearchMode && (
              <div ref={navRef} className="flex gap-1.5 px-4 md:px-6 py-2 overflow-x-auto hide-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    data-cat={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      activeCategoryId === cat.id
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {allAllergens.length > 0 && (
            <div className="flex-shrink-0 border-b border-gray-100 bg-white px-4 md:px-6 py-2">
              <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                <span className="text-xs text-gray-400 font-semibold flex-shrink-0 mr-1">Hide:</span>
                {allAllergens.map(a => {
                  const active = hiddenAllergens.has(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAllergen(a.id)}
                      className={`flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                        active
                          ? 'bg-red-100 border-red-300 text-red-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {a.icon && <span>{a.icon}</span>}
                      {a.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto" style={{ maxHeight: '75vh' }}>
            <div className="p-4 md:p-6 space-y-10">

              {isSearchMode ? (
                filteredItems.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-gray-500">No items found</p>
                    <p className="text-sm mt-1">Try a different search or adjust the filters</p>
                    <button
                      onClick={() => { setSearchQuery(''); setMinPrice(''); setMaxPrice(''); setSortBy('default'); }}
                      className="mt-4 text-sm text-brand-500 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-gray-400 -mb-6">
                      {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                    </p>
                    <div className="space-y-1.5">
                      {filteredItems.map(item => (
                        <MenuItemRow
                          key={item.id}
                          item={item}
                          accent={itemAccentMap.get(item.id) ?? ACCENT_COLORS[0]}
                          onClick={() => setSelectedItem(item)}
                        />
                      ))}
                    </div>
                  </>
                )
              ) : (
                categories.map((cat, catIdx) => {
                  const accent = cat.colorCode ?? ACCENT_COLORS[catIdx % ACCENT_COLORS.length];
                  const visibleSubs = cat.subcategories
                    .map(sub => ({ ...sub, menuItems: sub.menuItems.filter(item => visibleIds.has(item.id)) }))
                    .filter(sub => sub.menuItems.length > 0);

                  if (visibleSubs.length === 0) return null;

                  const totalItems = visibleSubs.reduce((s, sub) => s + sub.menuItems.length, 0);

                  return (
                    <section
                      key={cat.id}
                      id={cat.id}
                      ref={el => { categoryRefs.current[cat.id] = el; }}
                    >
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${accent}18` }}>
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                          <h2 className="text-sm font-black tracking-wide" style={{ color: accent }}>{cat.name}</h2>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">{totalItems} items</span>
                      </div>

                      {visibleSubs.map(sub => (
                        <div key={sub.id ?? 'uncat'} className="mb-5">
                          {sub.name !== 'Uncategorized' && (
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 pl-4">
                              {sub.name}
                            </p>
                          )}
                          <div className="space-y-1.5">
                            {sub.menuItems.map(item => (
                              <MenuItemRow
                                key={item.id}
                                item={item}
                                accent={accent}
                                onClick={() => setSelectedItem(item)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </section>
                  );
                })
              )}

              <div className="h-6" />
            </div>
          </div>
        </div>

        {/* RIGHT CART PANEL (desktop) */}
        <aside className="w-72 flex-shrink-0 bg-white border-l border-gray-100/60 hidden md:flex flex-col">
          <div className="px-4 pt-4 pb-3 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-gray-900 text-base">Your Order</h2>
              {itemCount > 0 && (
                <span className="text-xs font-bold bg-brand-500 text-white w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>

            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
              {ORDER_TYPE_TABS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setOrderType(value)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    cart.orderType === value
                      ? 'bg-white text-brand-600 font-bold shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {cart.orderType === 'DELIVERY' && (
              <div className="space-y-1.5">
                {showSavedPostcode ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <MapPin size={11} className="text-gray-400" />
                      <span className="font-semibold uppercase tracking-wide">{deliveryPostcode}</span>
                    </span>
                    <button
                      onClick={() => { setShowSavedPostcode(false); setPostcodeResult(null); setDeliveryPostcode(''); }}
                      className="text-xs text-gray-400 hover:text-gray-700 underline transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Enter postcode"
                      value={deliveryPostcode}
                      onChange={e => { setDeliveryPostcode(e.target.value.toUpperCase()); setPostcodeResult(null); }}
                      onKeyDown={e => e.key === 'Enter' && checkDelivery()}
                      className="flex-1 border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase"
                    />
                    <button
                      onClick={checkDelivery}
                      disabled={postcodeChecking || !deliveryPostcode.trim()}
                      className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center"
                    >
                      {postcodeChecking ? <Loader2 size={12} className="animate-spin" /> : 'Check'}
                    </button>
                  </div>
                )}
                {postcodeChecking && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Loader2 size={11} className="animate-spin" /> Checking…
                  </p>
                )}
                {postcodeResult && !postcodeChecking && (
                  postcodeResult.ok ? (
                    <p className="text-xs text-green-600 font-medium">
                      ✓ Delivery available — £{postcodeResult.fee.toFixed(2)} fee
                      {postcodeResult.minOrderValue > 0 && ` · £${postcodeResult.minOrderValue.toFixed(2)} minimum order`}
                    </p>
                  ) : (
                    <p className="text-xs text-red-500">{postcodeResult.message}</p>
                  )
                )}
                {!postcodeResult && !postcodeChecking && cart.deliveryDetails?.deliveryFee !== undefined && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ £{cart.deliveryDetails.deliveryFee.toFixed(2)} delivery fee applied
                    {!!cart.deliveryDetails.minOrderValue && cart.deliveryDetails.minOrderValue > 0 &&
                      ` · £${cart.deliveryDetails.minOrderValue.toFixed(2)} minimum order`}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {itemCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-brand-50">
                  <ShoppingBag size={26} className="text-brand-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-500">Your order is empty</p>
                  <p className="text-xs text-gray-400 mt-0.5">Pick something delicious</p>
                </div>
              </div>
            ) : (
              <div className="p-3 space-y-1.5">
                {cart.items.map(item => (
                  <CartItemRow
                    key={item.cartItemId}
                    item={item}
                    onUpdateQty={qty => updateQuantity(item.cartItemId, qty)}
                    onRemove={() => removeItem(item.cartItemId)}
                  />
                ))}
              </div>
            )}
          </div>

          {itemCount > 0 && (
            <div className="border-t border-gray-100 p-4">
              <div className="space-y-1.5 mb-4">
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
                {cart.orderType === 'DELIVERY' && cart.deliveryDetails?.deliveryFee !== undefined && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivery</span>
                    <span className="font-medium text-gray-700">£{cart.deliveryDetails.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/order/checkout"
                className="flex items-center justify-between w-full text-white font-bold py-3.5 px-5 rounded-xl transition-all group bg-brand-500 hover:bg-brand-600"
              >
                <span>Go to Checkout</span>
                <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile floating cart bar */}
      {itemCount > 0 && (
        <Link
          href="/order/cart"
          className="md:hidden fixed bottom-20 left-4 right-4 z-30 flex items-center justify-between bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg transition-colors"
        >
          <span>View order ({itemCount})</span>
          <span>£{total.toFixed(2)}</span>
        </Link>
      )}

      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {showClosedPopup && storeStatus && !storeStatus.open && (
        <ClosedStoreModal
          storeName={storeName}
          reopenDay={storeStatus.reopenDay}
          reopenTime={storeStatus.reopenTime}
          preOrderEnabled={preOrderEnabled}
          onClose={() => setShowClosedPopup(false)}
        />
      )}
    </div>
  );
}

function MenuItemRow({ item, accent, onClick }: { item: MenuItem; accent: string; onClick: () => void }) {
  const hasModifiers = item.modifierGroups.length > 0;
  const displayPrice = item.price ?? item.eatInPrice;
  const showFromPrice = displayPrice === 0 && getMinItemPrice(item, 'TAKEAWAY') > 0;
  const minPrice = showFromPrice ? getMinItemPrice(item, 'TAKEAWAY') : displayPrice;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-gray-100/80 flex items-stretch overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-200 transition-all duration-200 group"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="w-1 self-stretch flex-shrink-0" style={{ backgroundColor: accent }} />

      <div className="flex-1 flex items-center gap-3 pl-3 pr-4 py-4 min-w-0">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={56}
            height={56}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: `${accent}15` }}
          >
            <UtensilsCrossed size={20} style={{ color: accent, opacity: 0.65 }} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-snug">{item.name}</p>
          {item.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
          )}
          {hasModifiers && (
            <span
              className="inline-block text-[10px] font-black mt-1.5 px-2 py-0.5 rounded-full tracking-wide"
              style={{ color: accent, backgroundColor: `${accent}18` }}
            >
              CUSTOMISABLE
            </span>
          )}
        </div>

        <div className="flex flex-col items-end justify-between gap-2 self-stretch py-0.5 flex-shrink-0">
          <span className="font-black text-gray-900 text-base tabular-nums">
            {showFromPrice && <span className="font-medium text-gray-400 text-xs mr-0.5">From</span>}
            £{minPrice.toFixed(2)}
          </span>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 group-hover:brightness-110 transition-all duration-200"
            style={{ backgroundColor: accent, boxShadow: `0 4px 12px ${accent}50` }}
          >
            <Plus size={16} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </button>
  );
}

function CartItemRow({ item, onUpdateQty, onRemove }: { item: CartItem; onUpdateQty: (qty: number) => void; onRemove: () => void }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 leading-snug">{item.name}</p>
          {item.selectedModifiers.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
              {item.selectedModifiers.map(m => m.modifierName).join(', ')}
            </p>
          )}
          {item.specialInstructions && (
            <p className="text-xs text-gray-400 mt-0.5 italic line-clamp-1">
              &ldquo;{item.specialInstructions}&rdquo;
            </p>
          )}
        </div>
        <p className="text-sm font-bold text-gray-900 flex-shrink-0 tabular-nums">
          £{item.totalPrice.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-1.5 py-0.5">
          <button
            onClick={() => onUpdateQty(item.quantity - 1)}
            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <Minus size={11} />
          </button>
          <span className="text-xs font-bold w-4 text-center tabular-nums">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.quantity + 1)}
            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <Plus size={11} />
          </button>
        </div>
        <button
          onClick={onRemove}
          aria-label="Remove"
          className="p-1 text-gray-300 hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
