import { createContext, useContext, useState, useCallback } from "react";
import type { CartItem, Product } from "@shared/schema";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: (products: Product[]) => number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  tableNumber: string | null;
  setTableSession: (number: string) => void;
  clearTableSession: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("itamar-cart");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("cafe-table") || null;
    }
    return null;
  });

  const saveToStorage = (newItems: CartItem[]) => {
    localStorage.setItem("itamar-cart", JSON.stringify(newItems));
  };

  const setTableSession = useCallback((number: string) => {
    sessionStorage.setItem("cafe-table", number);
    setTableNumber(number);
  }, []);

  const clearTableSession = useCallback(() => {
    sessionStorage.removeItem("cafe-table");
    setTableNumber(null);
  }, []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id
      );

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = prev.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prev, { productId: product.id, quantity }];
      }
      saveToStorage(newItems);
      return newItems;
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const newItems = prev.filter(
        (item) => item.productId !== productId
      );
      saveToStorage(newItems);
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => {
      const newItems = prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );
      saveToStorage(newItems);
      return newItems;
    });
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    saveToStorage([]);
  }, []);

  const getItemCount = useCallback(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const getTotal = useCallback((products: Product[]) => {
    return items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.productId);
      return acc + (product?.price || 0) * item.quantity;
    }, 0);
  }, [items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getTotal,
        isOpen,
        openCart,
        closeCart,
        tableNumber,
        setTableSession,
        clearTableSession,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
