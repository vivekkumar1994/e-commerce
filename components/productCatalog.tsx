import React from 'react';
import ProductCard from './productCard';
import { IProduct } from '@/types/product';

// Define local product input type structure
type ProductInput = {
  id: string;
  localizeInfos?: {
    title?: string;
  };
  price: number;
  attributeValues?: {
    p_description?: { value: string[] };
    p_price?: { value: number };
    p_image?: { value: { downloadLink: string } };
    p_title?: { value: string };
  };
};

const ProductCatalog = ({
  title,
  products,
}: {
  title: string;
  products: ProductInput[];
}) => {

  console.log(products,"products hai")
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products?.map((product) => {
          const transformedProduct: IProduct = {
            id: product.id,
            localizeInfos: {
              title: product.localizeInfos?.title || '',
            },
          price: product.price,
            attributeValues: {
              p_description: {
                value:
                  product.attributeValues?.p_description?.value?.map((desc) => ({
                    htmlValue: desc,
                  })) ?? [],
              },
              p_price: {
                value:
                  typeof product.attributeValues?.p_price?.value === 'string'
                    ? parseFloat(product.attributeValues.p_price.value)
                    : product.attributeValues?.p_price?.value ?? product.price,
              },
              p_image: product.attributeValues?.p_image || {
                value: { downloadLink: '' },
              },
              p_title: product.attributeValues?.p_title || { value: '' },
            },
          };
          return <ProductCard product={transformedProduct} key={product.id} />;
        })}
      </div>
    </section>
  );
};

export default ProductCatalog;
