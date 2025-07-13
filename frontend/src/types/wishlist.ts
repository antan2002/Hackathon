// types/wishlist.ts
export interface WishlistItem {
    id: string;
    title: string;
    price: number;
    image: string;
    inStock: boolean;
    category: string;
    ingredients: string[];
    // Add any wishlist-specific properties if needed
}