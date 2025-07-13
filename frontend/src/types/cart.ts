// types/cart.ts
export interface CartItem {
    id: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
    maxQuantity: number;
    inStock: boolean;
    category: string;
    ingredients: string[];
    variant?: string;
}
export interface CartItemRequest {
    id: string;
    name: string;
    category: string;
    ingredients: string[];
}

export interface Recommendation {
    id: string;
    name: string;
    price: number;
    category: string;
    ingredients: string[];
    image: string;
    reasoning?: string;
    healthIndex?: number;
    valueScore?: number;
    variant?: string;
}