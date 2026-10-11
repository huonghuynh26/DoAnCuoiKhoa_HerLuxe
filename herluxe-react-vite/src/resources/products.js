export const seedProducts = [];
export const categories = ["All", "Makeup", "Skincare", "Lips", "Body care"];
export const getProductById = (id, products = seedProducts) =>
  products.find((product) => product.id === id) || null;
