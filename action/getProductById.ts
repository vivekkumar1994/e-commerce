'use server';

import { mockProducts, Product } from '@/lib/mockProducts';

export async function getProductById(id: string): Promise<Product | null> {
  const allProducts: Product[] = mockProducts.flatMap(
    (catalog) => catalog.catalogProducts.items || []
  );

  const product = allProducts.find((item) => item.id == id);
  return product || null;
}
