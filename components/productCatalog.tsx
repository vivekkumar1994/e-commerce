import React from 'react';
import ProductCard from './productCard';
import { IProduct } from '@/types/product';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { Navigation, Autoplay } from 'swiper/modules';

type ProductInput = {
  id: string;
  title?: string;
  description?: string;
  price: number | string;
  image?: string;
  localizeInfos?: {
    title?: string;
  };
  attributeValues?: {
    p_description?: { value: string[] };
    p_price?: { value: number | string };
    p_image?: { value: { downloadLink: string } };
    p_title?: { value: string };
  };
};

interface ProductCatalogProps {
  title: string;
  products: ProductInput[];
  onAddToWishlist?: (productId: string) => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ title, products }) => {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
        {title}
      </h2>

     <Swiper
  spaceBetween={20}
  slidesPerView={1.2}  // Slightly reduced for better mobile spacing
  navigation
  autoplay={{ delay: 3000, disableOnInteraction: false }}
  loop
  breakpoints={{
    640: { slidesPerView: 2.2 },
    768: { slidesPerView: 3.2 },
    1024: { slidesPerView: 4.2 },
  }}
  modules={[Navigation, Autoplay]}
>
  {products?.map((product) => {
    const price =
      typeof product.price === 'string' ? parseFloat(product.price) : product.price;

    const image =
      product.image ||
      product.attributeValues?.p_image?.value?.downloadLink ||
      '';

    const p_title =
      product.attributeValues?.p_title?.value ||
      product.title ||
      product.localizeInfos?.title ||
      'Untitled Product';

    const p_price =
      typeof product.attributeValues?.p_price?.value === 'string'
        ? parseFloat(product.attributeValues.p_price.value)
        : product.attributeValues?.p_price?.value ?? price;

    const p_description =
      product.attributeValues?.p_description?.value?.map((desc) => ({
        htmlValue: desc,
      })) ?? [];

    const transformedProduct: IProduct = {
      id: product.id,
      localizeInfos: {
        title: product.localizeInfos?.title || '',
      },
      price,
      attributeValues: {
        p_description: { value: p_description },
        p_price: { value: p_price },
        p_image: { value: { downloadLink: image } },
        p_title: { value: p_title },
      },
    };

    return (
      <SwiperSlide key={product.id}>
        <ProductCard product={transformedProduct} />
      </SwiperSlide>
    );
  })}
</Swiper>
    </section>
  );
};

export default ProductCatalog;
