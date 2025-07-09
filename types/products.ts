// types/products.ts

export interface Seller {
  _id: string;
  name: string;
  email: string;
}

export interface Product {
  _id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  sellerId?: Seller;
}

// Used to represent raw MongoDB documents before transforming
export interface RawSeller {
  _id: string | { toString(): string };
  name: string;
  email: string;
}

export interface RawProduct {
  _id: string | { toString(): string };
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  sellerId?: RawSeller;
}
