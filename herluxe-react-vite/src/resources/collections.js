import collectionsJson from "./json/collections.json";

// Ảnh riêng cho từng bộ sưu tập (nằm trong public/images/)
const bannerImages = {
  "everyday-glow": "/images/makeup.jpg",
  "soft-skin": "/images/skincare.jpg",
  "lips-of-the-day": "/images/lips.jpg",
};

export const collections = collectionsJson.map((item, index) => ({
  ...item,
  image: bannerImages[item.id] || item.image,
  accent: ["rose", "sand", "plum", "ivory"][index],
}));
