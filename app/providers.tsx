"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type CartItems = Record<string, Record<string, number>>;

export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory: string;
  sizes: string[];
  colors: string[];
  bestseller: boolean;
  image: string[];
  date: number;
};

type ProductListResponse = {
  success: boolean;
  products?: Product[];
  message?: string;
};

type CartGetResponse = {
  success: boolean;
  cartData?: CartItems;
  message?: string;
};

type BasicResponse = {
  success: boolean;
  message?: string;
};

type SetState<T> = Dispatch<SetStateAction<T>>;

type ShopContextValue = {
  products: Product[];
  cartItems: CartItems;
  currency: string;
  currencyFormat: Intl.NumberFormat;
  delivery_fee: number;
  search: string;
  setSearch: SetState<string>;
  showSearch: boolean;
  setShowSearch: SetState<boolean>;
  token: string | null;
  userEmail: string | null;
  addToCart: (itemId: string, color: string, size: string) => Promise<void>;
  updateQuantity: (
    itemId: string,
    color: string,
    size: string,
    quantity: number
  ) => Promise<void>;
  getCartCount: () => number;
  getCartAmount: () => number;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error("useShop must be used within Providers");
  }
  return ctx;
};

const authedHeaders = (token: string | null) => {
  const headers: Record<string, string> = {};
  if (token) headers.token = token;
  return headers;
};

const toCartVariantKey = (color: string, size: string) => {
  const c = (color ?? "").trim();
  const s = (size ?? "").trim();
  return s ? `${c}::${s}` : c;
};

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currency = "£";
  const delivery_fee = 2;

  const currencyFormat = useMemo(
    () =>
      new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }),
    []
  );

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItems>({});

  const wasAdminRef = useRef<boolean>(pathname.startsWith("/admin"));

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/product/list");
    const data = (await res.json()) as ProductListResponse;

    if (!data.success) {
      throw new Error(data.message ?? "Failed to load products");
    }

    setProducts(data.products ?? []);
  }, []);

  const fetchCart = useCallback(async (accessToken: string) => {
    const res = await fetch("/api/cart/get", {
      method: "POST",
      headers: authedHeaders(accessToken),
    });

    const data = (await res.json()) as CartGetResponse;

    if (!data.success) {
      throw new Error(data.message ?? "Failed to load cart");
    }

    setCartItems(data.cartData ?? {});
  }, []);

  const refresh = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token ?? null;
    const email = data.session?.user?.email ?? null;
    setToken(accessToken);
    setUserEmail(email);

    await fetchProducts();

    if (accessToken) {
      await fetchCart(accessToken);
    } else {
      setCartItems({});
    }
  }, [fetchCart, fetchProducts]);

  useEffect(() => {
    void refresh();

    const supabase = createSupabaseBrowserClient();
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const accessToken = session?.access_token ?? null;
      const email = session?.user?.email ?? null;
      setToken(accessToken);
      setUserEmail(email);

      if (accessToken) {
        try {
          await fetchCart(accessToken);
        } catch {
          setCartItems({});
        }
      } else {
        setCartItems({});
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [fetchCart, refresh]);

  useEffect(() => {
    const isAdmin = pathname.startsWith("/admin");
    const wasAdmin = wasAdminRef.current;

    if (wasAdmin && !isAdmin) {
      void fetchProducts();
    }

    wasAdminRef.current = isAdmin;
  }, [fetchProducts, pathname]);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();

    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
    }

    await supabase.auth.signOut();
    setToken(null);
    setUserEmail(null);
    setCartItems({});
  }, []);

  const addToCart = async (itemId: string, color: string, size: string) => {
    if (!color) {
      throw new Error("Select Wig Color");
    }

    const variantKey = toCartVariantKey(color, size);

    setCartItems((prev) => {
      const next: CartItems = structuredClone(prev);
      if (!next[itemId]) next[itemId] = {};
      next[itemId][variantKey] = (next[itemId][variantKey] ?? 0) + 1;
      return next;
    });

    if (!token) return;

    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authedHeaders(token),
      },
      body: JSON.stringify({ itemId, color, size }),
    });

    const data = (await res.json()) as BasicResponse;
    if (!data.success) {
      throw new Error(data.message ?? "Failed to add to cart");
    }
  };

  const updateQuantity = async (
    itemId: string,
    color: string,
    size: string,
    quantity: number
  ) => {
    const variantKey = toCartVariantKey(color, size);

    setCartItems((prev) => {
      const next: CartItems = structuredClone(prev);
      if (!next[itemId]) next[itemId] = {};
      next[itemId][variantKey] = quantity;
      if (quantity <= 0) {
        delete next[itemId][variantKey];
        if (!Object.keys(next[itemId]).length) delete next[itemId];
      }
      return next;
    });

    if (!token) return;

    const res = await fetch("/api/cart/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authedHeaders(token),
      },
      body: JSON.stringify({ itemId, color, size, quantity }),
    });

    const data = (await res.json()) as BasicResponse;
    if (!data.success) {
      throw new Error(data.message ?? "Failed to update cart");
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const size in cartItems[items]) {
        const qty = cartItems[items][size];
        if (qty > 0) totalCount += qty;
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      const itemInfo = products.find((product) => product._id === items);
      if (!itemInfo) continue;
      for (const size in cartItems[items]) {
        const qty = cartItems[items][size];
        if (qty > 0) totalAmount += itemInfo.price * qty;
      }
    }
    return totalAmount;
  };

  const value: ShopContextValue = {
    products,
    cartItems,
    currency,
    currencyFormat,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    token,
    userEmail,
    addToCart,
    updateQuantity,
    getCartCount,
    getCartAmount,
    refresh,
    signOut,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
