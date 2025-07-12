import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  image: string;
  brand: string;
}

interface WishlistState {
  items: WishlistItem[];
}

type WishlistAction =
  | { type: 'ADD_TO_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'CLEAR_WISHLIST' };

interface WishlistContextType {
  state: WishlistState;
  addToWishlist: (item: WishlistItem) => { success: boolean; message: string };
  removeFromWishlist: (id: string) => { success: boolean; message: string };
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST': {
      const exists = state.items.some(item => item.id === action.payload.id);
      if (exists) return state;
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }
    case 'REMOVE_FROM_WISHLIST': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    }
    case 'CLEAR_WISHLIST': {
      return {
        ...state,
        items: [],
      };
    }
    default:
      return state;
  }
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  const addToWishlist = (item: WishlistItem) => {
    const exists = state.items.some(i => i.id === item.id);
    if (exists) {
      return { success: false, message: 'Item is already in your wishlist' };
    }
    dispatch({ type: 'ADD_TO_WISHLIST', payload: item });
    return { success: true, message: `${item.title} added to wishlist!` };
  };

  const removeFromWishlist = (id: string) => {
    const itemExists = state.items.some(item => item.id === id);
    if (!itemExists) {
      return { success: false, message: 'Item not found in wishlist' };
    }
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: id });
    return { success: true, message: 'Item removed from wishlist' };
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  const isInWishlist = (id: string) => {
    return state.items.some(item => item.id === id);
  };

  const getWishlistCount = () => {
    return state.items.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        state,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        getWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};