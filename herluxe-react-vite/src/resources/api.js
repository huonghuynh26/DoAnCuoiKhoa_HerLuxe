import { sampleUsers } from "./sampleData";
import { seedProducts } from "./products";

const DEFAULT_API_KEY = "6ab3d52e3a04ea4a097e4dba";
const API_BASE_URL = "https://mindx-mockup-server.vercel.app/api/resources";

export const USERS_API_URL = import.meta.env.VITE_MINDX_USERS_API_URL || `${API_BASE_URL}/users?apiKey=${DEFAULT_API_KEY}`;
export const PRODUCTS_API_URL = import.meta.env.VITE_MINDX_PRODUCTS_API_URL || `${API_BASE_URL}/products?apiKey=${DEFAULT_API_KEY}`;

export function extractResourceItems(payload) {
  const candidates = [payload?.data?.data, payload?.data, payload?.items, payload];
  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    const numericObjects = candidate.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const numericValues = Object.keys(entry)
        .filter((key) => /^\d+$/.test(key))
        .map((key) => entry[key]);
      return numericValues.length ? numericValues : [entry];
    });
    if (numericObjects.length) return numericObjects;
  }
  return [];
}

const normalizeRole = (role) => (role === "admin" ? "admin" : "customer");

const normalizeUser = (user) => ({
  ...user,
  role: normalizeRole(user.role),
});

const uniqueUsers = (users) => {
  const seen = new Set();
  return users.filter((user) => {
    const key = user.id || user.email?.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const normalizeProduct = (product, index) => {
  const description = String(product.description || product.shortDescription || "").trim();
  return {
    ...product,
    id: product.id || `product-${index + 1}`,
    tag: product.tag || "New",
    price: Number(product.price) || 0,
    stock: Number(product.stock ?? 0),
    shortDescription: product.shortDescription || description.split(/[.!?]/)[0] || "HerLuxe beauty essential.",
    description: description || "HerLuxe beauty essential.",
  };
};

async function fetchResource(url, label) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${label} resource returned ${response.status}`);
  return response.json();
}

export async function fetchUsersResource() {
  const payload = await fetchResource(USERS_API_URL, "Users");
  const users = uniqueUsers(extractResourceItems(payload).map(normalizeUser));
  return users.length ? users : sampleUsers;
}

export async function replaceUsersResource(users) {
  const response = await fetch(USERS_API_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(users),
  });
  if (!response.ok) throw new Error(`Users resource update returned ${response.status}`);
  return response;
}

export async function fetchProductsResource() {
  const payload = await fetchResource(PRODUCTS_API_URL, "Products");
  const products = extractResourceItems(payload).map(normalizeProduct);
  return products.length ? products : seedProducts;
}

export async function replaceProductsResource(products) {
  const response = await fetch(PRODUCTS_API_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(products),
  });
  if (!response.ok) throw new Error(`Products resource update returned ${response.status}`);
  return response;
}
