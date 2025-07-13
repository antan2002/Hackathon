// types/product.ts
export interface ProductBase {
  id: string;
  title: string;
  price: number;
  image: string;
  inStock: boolean;
}

export interface FoodProduct extends ProductBase {
  brand?: string;
  rating?: number;
  reviews?: number;
  category: string;
  ingredients: string[];
  variant?: string;
}