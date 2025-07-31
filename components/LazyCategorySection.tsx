"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import ProductCatalog from "@/components/productCatalog";
import { ProductInput } from "@/action/product.actions";

interface LazyCategorySectionProps {
  catKey: string;
  catName: string;
  products: ProductInput[] | undefined;
  loadCategoryProducts: (catKey: string, catName: string) => Promise<void>;
}

const LazyCategorySection = ({ catKey, catName, products, loadCategoryProducts }: LazyCategorySectionProps) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView && !products) {
      loadCategoryProducts(catKey, catName);
    }
  }, [inView, products]);

  return (
    <div ref={ref}>
      {products ? (
        <ProductCatalog title={catName} products={products} />
      ) : (
        <div className="space-y-4">
          <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyCategorySection;
