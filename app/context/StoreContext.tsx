"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type CartItem = {
  _id: string;
  name: string;
  price: number;
  currency: string;
  images: string[];
  quantity: number;
};

type StoreContextType = {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  toggleWishlist: (productId: string) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved data when the website opens
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("gobi-cart");
      const savedWishlist = localStorage.getItem("gobi-wishlist");

      if (savedCart) {
        // This effect synchronizes React state with browser storage.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCart(JSON.parse(savedCart));
      }

      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error("Failed to load saved shopping data:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart and wishlist whenever they change
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem("gobi-cart", JSON.stringify(cart));
    localStorage.setItem("gobi-wishlist", JSON.stringify(wishlist));
  }, [cart, wishlist, isLoaded]);

  function addToCart(product: Omit<CartItem, "quantity">) {
    setCart((current) => {
      const existing = current.find((item) => item._id === product._id);

      if (existing) {
        return current.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }

  function toggleWishlist(productId: string) {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  return (
    <StoreContext.Provider
      value={{ cart, wishlist, addToCart, toggleWishlist }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return context;
}
