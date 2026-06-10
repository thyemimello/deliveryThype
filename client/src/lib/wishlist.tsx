import { createContext, useContext, useState, useCallback } from "react";

interface WishlistContextType {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("thype-wishlist");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const saveToStorage = (newItems: string[]) => {
    localStorage.setItem("thype-wishlist", JSON.stringify(newItems));
  };

  const addItem = useCallback((productId: string) => {
    setItems((prev) => {
      if (prev.includes(productId)) return prev;
      const newItems = [...prev, productId];
      saveToStorage(newItems);
      return newItems;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((id) => id !== productId);
      saveToStorage(newItems);
      return newItems;
    });
  }, []);

  const toggleItem = useCallback((productId: string) => {
    setItems((prev) => {
      const newItems = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      saveToStorage(newItems);
      return newItems;
    });
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.includes(productId);
  }, [items]);

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, toggleItem, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
