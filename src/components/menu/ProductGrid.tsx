'use client';
import { Product } from './types';
import ProductCard from './ProductCard';

type Props = {
  products: Product[];
  onAdd?: (id: string) => void;
};

export default function ProductGrid({ products, onAdd }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2  gap-6">
      {products.map((p, index) => (
        <ProductCard key={index} product={p} onAdd={onAdd} />
      ))}
    </div>
  );
}