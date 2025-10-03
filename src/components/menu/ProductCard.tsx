'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Product } from './types';

type Props = {
  product: Product & {
    portionSizes?: Array<'half' | 'full' | 'small' | 'medium' | 'large'>;
    varieties?: Array<'lamb' | 'chicken' | 'veg' | 'prawn' | 'king_prawn' | 'fish' | 'beef' | 'paneer' | 'mixed_veg' | 'salmon'>;
    tags?: string[];
  };
  onAdd?: (id: string) => void;
};

export default function ProductCard({ product, onAdd }: Props) {
  const sizes = product.portionSizes ?? [];
  const varieties = product.varieties ?? [];
  const [size, setSize] = useState<string>(sizes[0] ?? '');
  const [variety, setVariety] = useState<string>(varieties[0] ?? '');

  const hasImage = Boolean(product.image);
  const hasPrice = typeof product.price === 'number' && !Number.isNaN(product.price);

  // helper: initials for placeholder
  const initials =
    product.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();

  return (
    <div className="relative bg-[#F1EED0] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow font-poppins">
      {/* Badge */}
      {product.badge && (
        <span className="absolute top-0 right-0 text-xs bg-red-500 text-white rounded-full px-2 py-1">
          {product.badge}
        </span>
      )}

      {/* Compact two-column layout */}
      <div className="grid grid-cols-[96px_1fr] gap-3">
        {/* Image or placeholder */}
        <div className="w-24 h-24 rounded-lg shadow-inner overflow-hidden flex flex-col items-center justify-center">

          {hasImage ? (
            <Image
              src={product.image as string}
              alt={product.name}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#EDE7C5] text-[#601131]">
              <span className="text-xs font-semibold">{initials}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          {/* Title + price (price hidden when absent) */}
          <div className="flex items-start justify-between gap-3 mt-2">
            <h4 className="font-semibold text-[#601131] leading-tight">{product.name}</h4>
            {hasPrice && <p className="text-2xl text-gray-700 font-semibold">£{(product.price as number).toFixed(2)}</p>}
          </div>

          {/* Description */}
          {product.description && <p className="mt-1 text-xs text-gray-700 line-clamp-3">{product.description}</p>}

          {/* Selectors */}
          {/* {(sizes.length > 0 || varieties.length > 0) && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sizes.length > 0 && (
                <label className="flex items-center gap-2 bg-[#EDE7C5] rounded-md px-2 py-1 text-[#601131]">
                  <span className="text-xs">Size</span>
                  <select
                    className="flex-1 bg-transparent text-xs outline-none"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  >
                    {sizes.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {varieties.length > 0 && (
                <label className="flex items-center gap-2 bg-[#EDE7C5] rounded-md px-2 py-1 text-[#601131]">
                  <span className="text-xs">Variety</span>
                  <select
                    className="flex-1 bg-transparent text-xs outline-none"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                  >
                    {varieties.map((v) => (
                      <option key={v} value={v}>
                        {v.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )} */}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] uppercase tracking-wide bg-[#EDE7C5] text-[#601131] rounded-full px-2 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          {/* <div className="mt-3 flex items-center gap-3">
            <button
              className="flex-1 bg-[#F0A429] hover:bg-[#e79b26] text-white font-semibold text-sm py-2 rounded-md transition-colors"
              onClick={() => onAdd?.(product.id)}
            >
              Add to Cart
            </button>
            <div className="hidden sm:block text-[10px] text-[#601131]">
              {sizes.length > 0 ? size : '—'} {varieties.length > 0 ? `• ${variety}` : ''}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}