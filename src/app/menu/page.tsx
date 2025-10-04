'use client';

import MenuHero from '@/components/menu/MenuHero';
import SortBar from '@/components/menu/SortBar';
import CategoryList from '@/components/menu/CategoryList';
import ProductGrid from '@/components/menu/ProductGrid';
import Pagination from '@/components/menu/Pagination';
import { categories, products, findCategoryById, collectDescendantIds } from '@/components/menu/data';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-[30vh] flex items-center justify-center text-[#601131]">Loading menu...</div>}>
      <MenuPageContent />
    </Suspense>
  );
}

function MenuPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const category = searchParams.get('category') || null;
  const sort = searchParams.get('sort') || 'popular';
  const q = searchParams.get('q') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const updateParams = (patch: Record<string, string | null>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') sp.delete(k);
      else sp.set(k, v);
    }
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const firstScroll = useRef(true);
  useEffect(() => {
    if (firstScroll.current) {
      firstScroll.current = false;
      return;
    }
    const el = document.getElementById('menu');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [category, sort, q]);

  const categoryFilterIds = category ? new Set([category, ...collectDescendantIds(category)]) : null;
  let filtered = products.filter((p) => (categoryFilterIds ? categoryFilterIds.has(p.categoryId) : true));

  if (q) {
    const qp = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(qp) ||
        p.description.toLowerCase().includes(qp) ||
        (p.tags?.some((t) => t.toLowerCase().includes(qp)) ?? false) ||
        (p.varieties?.some((v) => v.toLowerCase().includes(qp)) ?? false),
    );
  }

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return (a.price ?? 0) - (b.price ?? 0);
      case 'price-desc':
        return (b.price ?? 0) - (a.price ?? 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'popular':
      default:
        const rank = (x: typeof a) => (x.badge === 'popular' ? 2 : x.badge === 'recommended' ? 1 : 0);
        return rank(b) - rank(a);
    }
  });

  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(totalPages, page);
  const start = (currentPage - 1) * pageSize;
  const paged = sorted.slice(start, start + pageSize);

  const showingText = `Showing ${paged.length} of ${sorted.length} results`;

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  useEffect(() => {
    if (isCategoryOpen) {
      document.body.style.overflow = "hidden"; // disable scrolling
    } else {
      document.body.style.overflow = "auto"; // enable scrolling
    }

    return () => {
      document.body.style.overflow = "auto"; // cleanup when component unmounts
    };
  }, [isCategoryOpen]);


  return (
    <main className="font-poppins relative">
      <MenuHero />
      <div className="" id="menu"></div>

      <div className="bg-[#F5F5DC] md:pt-20 pb-16">
        <SortBar
          showingText={showingText}
          onSortChange={(value) => updateParams({ sort: value, page: '1' })}
          searchText={q}
          onSearchChange={(value) => updateParams({ q: value, page: '1' })}
        />

        {/* Mobile: open drawer button */}
        <div className="px-6 lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setIsCategoryOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#EDE7C5] text-[#601131] hover:bg-[#e5dfb3] transition"
          >
            <span className="inline-block w-4">☰</span>
            Categories
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 relative">
          {/* Products */}
          <div>
            <h3 className="text-[#601131] font-bold text-lg mb-4">
              {findCategoryById(category || '')?.name || 'All Products'}
            </h3>
            <ProductGrid products={paged} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={(p) => updateParams({ page: String(p) })}
            />
          </div>

          {/* Sidebar (desktop only) */}
          <div className="hidden lg:block">
            <CategoryList
              title="All Menu"
              tree={categories}
              selectedId={category}
              onSelect={(id) => updateParams({ category: id, page: '1' })}
              onClear={() => updateParams({ category: null, page: '1' })}
            />
          </div>
        </div>
      </div>

      {/* Drawer for mobile */}
      {isCategoryOpen && (
        <div className='relative z-100'>
          {/* Backdrop */}
          <button
            aria-label="Close category drawer"
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsCategoryOpen(false)}
          />
          {/* Panel */}
          <div className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-[#F1EED0] shadow-xl rounded-tr-xl rounded-br-xl">
            <div className="p-4 flex items-center justify-between border-b border-[#D7CDA7]">
              <h4 className="font-semibold text-[#601131]">Categories</h4>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(false)}
                className="px-3 py-1 rounded-md bg-[#EDE7C5] text-[#601131] hover:bg-[#e5dfb3] transition"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <CategoryList
                title="All Menu"
                tree={categories}
                selectedId={category}
                onSelect={(id) => {
                  updateParams({ category: id, page: '1' });
                  setIsCategoryOpen(false);
                }}
                onClear={() => {
                  updateParams({ category: null, page: '1' });
                  setIsCategoryOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}