import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCart, getProducts, saveCart } from "../resources/mockStore";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isCustomer } = useAuth();
  const [cart, setCart] = useState(() => getCart());
  const [products, setProducts] = useState(() => getProducts());

  useEffect(() => {
    const refresh = () => { setCart(getCart()); setProducts(getProducts()); };
    window.addEventListener("herluxe-resource-change", refresh);
    window.addEventListener("herluxe-resource-reset", refresh);
    return () => {
      window.removeEventListener("herluxe-resource-change", refresh);
      window.removeEventListener("herluxe-resource-reset", refresh);
    };
  }, []);

  const update = (next) => { setCart(next); saveCart(next); };
  const addToCart = (id, qty = 1) => {
    if (!isCustomer) return false;
    const next = [...cart];
    const item = next.find((entry) => entry.id === id);
    if (item) item.qty += qty; else next.push({ id, qty });
    update(next);
    return true;
  };
  const updateQty = (id, qty) => isCustomer && update(qty <= 0 ? cart.filter((item) => item.id !== id) : cart.map((item) => item.id === id ? { ...item, qty } : item));
  const removeFromCart = (id) => isCustomer && update(cart.filter((item) => item.id !== id));
  const clearCart = () => isCustomer && update([]);
  const items = isCustomer ? cart.map((item) => ({ ...item, product: products.find((product) => product.id === item.id) })).filter((item) => item.product) : [];
  const count = isCustomer ? cart.reduce((sum, item) => sum + item.qty, 0) : 0;
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 5;

  const value = useMemo(() => ({ cart, items, count, subtotal, shipping, total: subtotal + shipping, addToCart, updateQty, removeFromCart, clearCart }), [cart, items, count, subtotal, shipping, isCustomer]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
