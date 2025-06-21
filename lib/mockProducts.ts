// lib/mockProducts.ts

type Product = {
  id: string;
  localizeInfos?: {
    title?: string;
  };
  price: number;
  attributeValues?: {
    p_description?: { value?: { htmlValue?: string }[] };
    p_price?: { value?: number };
    p_image?: { value?: { downloadLink?: string } };
    p_title?: { value?: string };
  };
};

type Catalog = {
  id: string;
  localizeInfos: {
    title: string;
  };
  catalogProducts: {
    items?: Product[];
  };
};

export const mockProducts: Catalog[] = [
  {
    id: 'catalog-1',
    localizeInfos: { title: 'Featured Products' },
    catalogProducts: {
      items: [
        {
          id: 'product-1',
          localizeInfos: { title: 'Smart laptop' },
          price: 155500.99,
          attributeValues: {
            p_description: {
              value: [{ htmlValue: '<p>Beautiful apple laptop</p>' }],
            },
            p_image: {
              value: { downloadLink: '/appleLaptop1.jpg' },
            },
            p_title: { value: 'Apple Laptop' },
          },
        },
        {
          id: 'product-2',
          localizeInfos: { title: 'baby costume' },
          price: 27.99,
          attributeValues: {
            p_description: {
              value: [{ htmlValue: '<p>Baby costume is trending this month</p>' }],
            },
            p_image: {
              value: { downloadLink: '/babycostume.jpg' },
            },
            p_title: { value: 'baby costume' },
          },
        },
        {
          id: 'product-3',
          localizeInfos: { title: 'bedwithstorage' },
          price: 19.99,
          attributeValues: {
            p_description: {
              value: [{ htmlValue: '<p>Trendy bed for all seasons.</p>' }],
            },
            p_image: {
              value: { downloadLink: '/bedwithstorage.jpg' },
            },
            p_title: { value: 'bedwithstorage' },
          },
        },
        {
          id: 'product-4',
          localizeInfos: { title: 'bumkeshbakshit' },
          price: 19.99,
          attributeValues: {
            p_description: {
              value: [{ htmlValue: '<p>Trendy bumkeshbakshi for all seasons.</p>' }],
            },
            p_image: {
              value: { downloadLink: '/bumkeshbakshi.jpg' },
            },
            p_title: { value: 'bumkeshbakshi' },
          },
        },
        {
          id: 'product-5',
          localizeInfos: { title: 'coconutoil' },
          price: 19.99,
          attributeValues: {
            p_description: {
              value: [{ htmlValue: '<p>Trendy coconutoil for all seasons.</p>' }],
            },
            p_image: {
              value: { downloadLink: '/coconutoil.jpg' },
            },
            p_title: { value: 'coconutoil' },
          },
        },
      ],
    },
  },
  {
    id: 'catalog-2',
    localizeInfos: { title: 'New Arrivals' },
    catalogProducts: {
      items: [
        {
          id: 'product-6',
          localizeInfos: { title: 'Elegant Watch' },
          price: 129.99,
          attributeValues: {
            p_description: {
              value: [{ htmlValue: '<p>Elegant fragrance for formal occasions.</p>' }],
            },
            p_image: {
              value: { downloadLink: '/fragrancedeonevia.jpg' },
            },
            p_title: { value: 'latest deo' },
          },
        },
        {
          id: 'product-7',
          localizeInfos: { title: 'meluha' },
          price: 129.99,
          attributeValues: {
            p_description: {
              value: [{ htmlValue: '<p>Elegant wristwatch for formal occasions.</p>' }],
            },
            p_image: {
              value: { downloadLink: '/meluha.jpg' },
            },
            p_title: { value: 'meluha' },
          },
        },
        {
          id: 'product-8',
          localizeInfos: { title: 'trending kajal' },
          price: 129.99,
          attributeValues: {
            p_description: {
              value: [{ htmlValue: '<p>Trending kajal for this month.</p>' }],
            },
            p_image: {
              value: { downloadLink: '/kajal1.jpg' },
            },
            p_title: { value: 'Elegant kajal' },
          },
        },
        {
          id: 'product-9',
          localizeInfos: { title: 'greyhumour' },
          price: 129.99,
          attributeValues: {
            p_description: {
              value: [{ htmlValue: '<p>Elegant greyhumour for formal occasions.</p>' }],
            },
            p_image: {
              value: { downloadLink: '/greyhumour.jpg' },
            },
            p_title: { value: 'greyhumour' },
          },
        },
      ],
    },
  },
];
