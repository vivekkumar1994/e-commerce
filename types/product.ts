export interface IProduct {
  id: string | number;
  price?: number;
  image?: string; // <-- Added to sync with ProductInput
  attributeValues?: {
    p_title?: { value?: string };
    p_price?: { value?: number };
    p_description?: { value?: { htmlValue?: string }[] };
    p_image?: { value?: { downloadLink?: string } };
    p_colors?: { value?: string[] };
    p_sizes?: { value?: string[] };
    p_stock?: { value?: number };
    p_rating?: { value?: number };
    p_reviews?: { value?: number };
    p_highlights?: { value?: string[] };
  };
  localizeInfos?: {
    title?: string;
  };
}

export type ProductInput = {
  id: string | number;
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

