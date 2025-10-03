export type Product = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  image: string; // public path
  badge?: 'new' | 'popular' | 'recommended';
};

export type Category = {
  id: string;
  name: string;
  count: number;
  href?: string;
};