import type { Catalog } from '@/types/productTypes';

export const mockProducts: Catalog[] = [
  {
    id: 'catalog-1',
    localizeInfos: { title: 'Featured Products' },
    catalogProducts: {
      items: Array.from({ length: 20 }, (_, i) => {
        const id = i + 1;
        return {
          id: `product-${id}`,
          localizeInfos: { title: `Product ${id}` },
          price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
          attributeValues: {
            p_description: {
              value: [
                {
                  htmlValue: `<p>This is a description for Product ${id}.</p>`,
                },
              ],
            },
            p_image: {
              value: {
                downloadLink: `/images/products/product-${id}.jpg`,
              },
            },
            p_title: { value: `Product ${id}` },
          },
        };
      }),
    },
  },
];
