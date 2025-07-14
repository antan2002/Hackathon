// context/CartContext.tsx
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
} from "react";
import { CartItem } from "../types/cart";
import { FoodProduct } from "../types/product";

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | {
      type: "UPDATE_QUANTITY";
      payload: { id: string; quantity: number; variant?: string };
    }
  | { type: "CLEAR_CART" };

type CartContextType = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (
    product: FoodProduct,
    quantity?: number
  ) => { success: boolean; message: string };
  updateQuantity: (
    id: string,
    quantity: number,
    variant?: string
  ) => { success: boolean; message: string };
  removeFromCart: (id: string, variant?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  recommendations: any[];
  recLoading: boolean;
  recError: string | null;
  fetchRecommendations: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const calculateTotals = (items: CartItem[]) => {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { total, itemCount };
  };

  const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
      case "ADD_TO_CART": {
        const existingItem = state.items.find(
          (item) =>
            item.id === action.payload.id &&
            (item.variant || "") === (action.payload.variant || "")
        );

        if (existingItem) {
          const newQuantity = existingItem.quantity + action.payload.quantity;
          const maxAllowed = action.payload.maxQuantity ?? 99;

          if (newQuantity > maxAllowed) {
            return state;
          }

          const updatedItems = state.items.map((item) =>
            item.id === action.payload.id &&
            (item.variant || "") === (action.payload.variant || "")
              ? { ...item, quantity: newQuantity }
              : item
          );
          const { total, itemCount } = calculateTotals(updatedItems);
          return { ...state, items: updatedItems, total, itemCount };
        }

        const newItems = [...state.items, action.payload];
        const { total, itemCount } = calculateTotals(newItems);
        return { ...state, items: newItems, total, itemCount };
      }

      case "REMOVE_FROM_CART": {
        const newItems = state.items.filter(
          (item) => item.id !== action.payload
        );
        const { total, itemCount } = calculateTotals(newItems);
        return { ...state, items: newItems, total, itemCount };
      }

      case "UPDATE_QUANTITY": {
        if (action.payload.quantity <= 0) {
          const newItems = state.items.filter(
            (item) =>
              item.id !== action.payload.id ||
              (item.variant || "") !== (action.payload.variant || "")
          );
          const { total, itemCount } = calculateTotals(newItems);
          return { ...state, items: newItems, total, itemCount };
        }

        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id &&
          (item.variant || "") === (action.payload.variant || "")
            ? { ...item, quantity: action.payload.quantity }
            : item
        );
        const { total, itemCount } = calculateTotals(updatedItems);
        return { ...state, items: updatedItems, total, itemCount };
      }

      case "CLEAR_CART":
        return { items: [], total: 0, itemCount: 0 };

      default:
        return state;
    }
  };

  // --- All logic above is inside CartProvider now ---

  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  // recFetched is not needed, remove
  // Helper to convert cart item for API
  const toCartItemRequest = (item: CartItem) => ({
    id: item.id,
    name: item.title || `Product ${item.id}`,
    category: item.category,
    ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
  });

  // Fetch recommendations for current cart
  const fetchRecommendations = useCallback(async (): Promise<void> => {
    if (recLoading || state.items.length === 0) {
      console.log("[CartContext] Skipping fetch: loading or cart empty.");
      return;
    }
    setRecLoading(true);
    setRecError(null);
    try {
      console.log("[CartContext] Fetching recommendations for:", state.items);
      const response = await fetch(
        "http://localhost:5000/api/cart/recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            cartItems: state.items.map(toCartItemRequest),
          }),
        }
      );
      console.log(
        "[CartContext] Recommendation fetch status:",
        response.status
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("[CartContext] Recommendation error:", errorData);
        throw new Error(errorData.error || "Failed to fetch recommendations");
      }
      const data = await response.json();
      console.log("[CartContext] Recommendation response:", data);
      const recData = data.recommendations || data;
      const recs = recData.recommendations || [];
      const explanations = recData.explanation || [];
      const metrics = recData.metrics || [];
      const enrichedRecs = recs.map((rec: any) => {
        const explanationObj = explanations.find((e: any) => e.id === rec.id);
        const metricObj = metrics.find((m: any) => m.id === rec.id);
        return {
          id: rec.id,
          name: rec.name,
          price: rec.price,
          category: rec.category,
          ingredients: rec.ingredients,
          image: rec.imageUrl || "/placeholder-product.jpg",
          reasoning:
            explanationObj?.reasoning ||
            "Recommended based on your preferences",
          healthIndex: metricObj?.healthIndex || 0,
          valueScore: metricObj?.valueScore || 0,
          variant: rec.variant || "",
        };
      });
      console.log("[CartContext] Enriched recommendations:", enrichedRecs);
      setRecommendations(enrichedRecs.slice(0, 5));
    } catch (err) {
      console.error("[CartContext] Recommendation fetch error:", err);
      setRecError(
        err instanceof Error
          ? err.message
          : "Recommendation service unavailable"
      );
    } finally {
      setRecLoading(false);
      console.log("[CartContext] Recommendation loading set to false.");
    }
  }, [state.items]);

  // Build a cart signature based on id and variant only (not quantity)
  const cartSignature = state.items
    .map((item) => `${item.id}:${item.variant || ""}`)
    .sort()
    .join("|");

  // Fetch recommendations only when cartSignature changes
  useEffect(() => {
    if (state.items.length > 0) {
      fetchRecommendations();
    } else {
      setRecommendations([]);
    }
  }, [cartSignature]);

  const convertToCartItem = (
    product: FoodProduct,
    quantity: number = 1
  ): CartItem => {
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity,
      maxQuantity: 99,
      inStock: product.inStock,
      category: product.category,
      ingredients: product.ingredients,
      // Add any additional properties needed
    };
  };

  const addToCart = (
    product: FoodProduct,
    quantity: number = 1
  ): { success: boolean; message: string } => {
    const item = convertToCartItem(product, quantity);
    const existingItem = state.items.find(
      (i) => i.id === item.id && (i.variant || "") === (item.variant || "")
    );

    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQuantity + item.quantity;
    const maxAllowed = item.maxQuantity ?? 99;

    if (newTotalQuantity > maxAllowed) {
      return {
        success: false,
        message: `Cannot add more than ${maxAllowed} items of ${item.title} to cart`,
      };
    }

    console.log("[CartContext] Adding to cart:", item);
    dispatch({ type: "ADD_TO_CART", payload: item });
    return {
      success: true,
      message: `${item.title} added to cart successfully!`,
    };
  };

  const updateQuantity = (
    id: string,
    quantity: number,
    variant?: string
  ): { success: boolean; message: string } => {
    const item = state.items.find(
      (i) => i.id === id && (i.variant || "") === (variant || "")
    );

    if (!item) {
      return { success: false, message: "Item not found in cart" };
    }

    const maxAllowed = item.maxQuantity ?? 99;
    if (quantity > maxAllowed) {
      return {
        success: false,
        message: `Maximum quantity allowed for this item is ${maxAllowed}`,
      };
    }

    console.log("[CartContext] Updating quantity:", { id, quantity, variant });
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity, variant } });
    return { success: true, message: "Quantity updated successfully" };
  };

  const removeFromCart = (id: string) => {
    console.log("[CartContext] Removing from cart:", id);
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const clearCart = () => {
    console.log("[CartContext] Clearing cart");
    dispatch({ type: "CLEAR_CART" });
  };

  const getCartTotal = () => state.total;
  const getCartItemCount = () => state.itemCount;

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount,
        recommendations,
        recLoading,
        recError,
        fetchRecommendations,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
