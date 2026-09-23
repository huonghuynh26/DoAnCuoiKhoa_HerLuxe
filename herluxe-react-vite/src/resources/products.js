import productsJson from "./json/products.json";

export const seedProducts = productsJson;
export const categories = ["All", "Makeup", "Skincare", "Lips", "Complexion", "Body care"];
export const getProductById = (id, products = seedProducts) => products.find((product) => product.id === id) || null;
