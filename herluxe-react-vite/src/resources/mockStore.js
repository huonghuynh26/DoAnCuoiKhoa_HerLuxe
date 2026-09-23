import { seedProducts } from "./products";
import { sampleOrders, sampleUsers } from "./sampleData";

export const resourceDefinitions = [
  { name: "products", label: "Products", description: "Product names, prices, stock levels and images." },
  { name: "cart", label: "Shopping carts", description: "Items selected by signed-in customers." },
  { name: "users", label: "User accounts", description: "Customer and admin account profiles." },
  { name: "orders", label: "Orders", description: "Orders and their processing status." },
  { name: "collections", label: "Collections", description: "Curated groups used by the discovery page." },
];

const KEYS = {
  products: "herluxe:products",
  cart: "herluxe-cart",
  users: "herluxe:users",
  orders: "herluxe:orders",
  collections: "herluxe:collections",
  currentUser: "herluxe:current-user",
};

export const readResource = (name, fallback = []) => {
  try {
    const raw = localStorage.getItem(KEYS[name] || `herluxe:${name}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const writeResource = (name, value) => {
  localStorage.setItem(KEYS[name] || `herluxe:${name}`, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("herluxe-resource-change", { detail: { name, value } }));
  return value;
};

export const getProducts = () => readResource("products", seedProducts);
export const saveProducts = (products) => writeResource("products", products);
export const getCart = () => readResource("cart", []);
export const saveCart = (cart) => writeResource("cart", cart);
export const getOrders = () => readResource("orders", sampleOrders);
export const saveOrders = (orders) => writeResource("orders", orders);
export const getUsers = () => readResource("users", sampleUsers);
export const saveUsers = (users) => writeResource("users", users);
export const getCurrentUser = () => readResource("currentUser", null);
export const saveCurrentUser = (user) => {
  writeResource("currentUser", user);
  window.dispatchEvent(new Event("herluxe-auth-change"));
  return user;
};
export const clearCurrentUser = () => {
  localStorage.removeItem(KEYS.currentUser);
  window.dispatchEvent(new Event("herluxe-auth-change"));
};

export const resetMockResources = () => {
  Object.keys(KEYS).forEach((key) => localStorage.removeItem(KEYS[key]));
  window.dispatchEvent(new Event("herluxe-resource-reset"));
};

export const resourceSnapshot = () => ({
  products: getProducts(),
  cart: getCart(),
  users: getUsers(),
  orders: getOrders(),
  collections: readResource("collections", []),
});
