import collectionsJson from "./json/collections.json";

// Ảnh riêng cho từng bộ sưu tập (nằm trong public/images/)
const bannerImages = {
  "everyday-glow": "/images/makeup.jpg",
  "soft-skin": "/images/skincare.jpg",
  "lips-of-the-day": "/images/lips.jpg",
};

// Ô thứ 4: đổi "Best Sellers" thành "Body Care" và chỉ lọc sản phẩm thuộc Body care
const bodyCare = {
  id: "body-care",
  title: "Body Care",
  subtitle: "Soothing lotions, oils and scrubs for head-to-toe softness.",
  category: "Body care",
  image: "/images/bodycare.jpg",
};

export const collections = collectionsJson.map((item, index) => ({
  ...(item.id === "best-sellers" ? bodyCare : item),
  image:
    item.id === "best-sellers"
      ? bodyCare.image
      : bannerImages[item.id] || item.image,
  accent: ["rose", "sand", "plum", "ivory"][index],
}));
