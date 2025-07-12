import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
  maxQuantity?: number;
  inStock?: boolean;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number; variant?: string } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (item: CartItem) => { success: boolean; message: string };
  updateQuantity: (id: string, quantity: number, variant?: string) => { success: boolean; message: string };
  removeFromCart: (id: string, variant?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | null>(null);

const calculateTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(
        item => item.id === action.payload.id &&
          (item.variant || '') === (action.payload.variant || '')
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + action.payload.quantity;
        const maxAllowed = action.payload.maxQuantity ?? 99;

        if (newQuantity > maxAllowed) {
          return state;
        }

        const updatedItems = state.items.map(item =>
          item.id === action.payload.id &&
            (item.variant || '') === (action.payload.variant || '')
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

    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const { total, itemCount } = calculateTotals(newItems);
      return { ...state, items: newItems, total, itemCount };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const newItems = state.items.filter(
          item => item.id !== action.payload.id ||
            (item.variant || '') !== (action.payload.variant || '')
        );
        const { total, itemCount } = calculateTotals(newItems);
        return { ...state, items: newItems, total, itemCount };
      }

      const updatedItems = state.items.map(item =>
        item.id === action.payload.id &&
          (item.variant || '') === (action.payload.variant || '')
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const { total, itemCount } = calculateTotals(updatedItems);
      return { ...state, items: updatedItems, total, itemCount };
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, itemCount: 0 });

  const addToCart = (item: CartItem): { success: boolean; message: string } => {
    const existingItem = state.items.find(
      i => i.id === item.id && (i.variant || '') === (item.variant || '')
    );

    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQuantity + item.quantity;
    const maxAllowed = item.maxQuantity ?? 99;

    if (newTotalQuantity > maxAllowed) {
      return {
        success: false,
        message: `Cannot add more than ${maxAllowed} items of ${item.title} to cart`
      };
    }

    dispatch({ type: 'ADD_TO_CART', payload: item });
    return {
      success: true,
      message: `${item.title} (${item.variant || 'default'}) added to cart successfully!`
    };
  };

  const updateQuantity = (id: string, quantity: number, variant?: string): { success: boolean; message: string } => {
    const item = state.items.find(
      i => i.id === id && (i.variant || '') === (variant || '')
    );

    if (!item) {
      return { success: false, message: 'Item not found in cart' };
    }

    const maxAllowed = item.maxQuantity ?? 99;
    if (quantity > maxAllowed) {
      return {
        success: false,
        message: `Maximum quantity allowed for this item is ${maxAllowed}`
      };
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity, variant } });
    return { success: true, message: 'Quantity updated successfully' };
  };

  const removeFromCart = (id: string, variant?: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};