export type Product = {
    id: string;
    localizeInfos?: {
      title?: string;
    };
    price: number;
    attributeValues?: {
      p_description?: {
        value?: { htmlValue?: string }[];
      };
      p_price?: {
        value?: number;
      };
      p_image?: {
        value?: {
          downloadLink?: string;
        };
      };
      p_title?: {
        value?: string;
      };
    };
  };
  
  export type Catalog = {
    id: string;
    localizeInfos: {
      title: string;
    };
    catalogProducts: {
      items?: Product[];
    };
  };
  