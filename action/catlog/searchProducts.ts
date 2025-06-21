'use server';

import { mockProducts } from "../../lib/mockProducts"
interface SearchParams {
  query: string;
}

export const searchProductsAction = async ({ query }: SearchParams) => {
  try {
    const lowerQuery = query.toLowerCase();

    // Flatten all products across all catalogs
    const allProducts = mockProducts.flatMap(
      (catalog) => catalog.catalogProducts.items ?? []
    );

    // Filter products by title or description
    const matchedProducts = allProducts.filter((product) => {
      const title = product?.attributeValues?.p_title?.value?.toLowerCase() || '';
      const description =
        product?.attributeValues?.p_description?.value?.[0]?.htmlValue?.toLowerCase() || '';

      return title.includes(lowerQuery) || description.includes(lowerQuery);
    });

    return matchedProducts;
  } catch (error) {
    console.error('Error searching products from mock data:', error);
    throw new Error('Mock product search failed');
  }
};
