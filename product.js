/* ==============================
   HERLUXE — PRODUCT DATA
   Dữ liệu sản phẩm dùng chung cho:
   - home.html (hiển thị lưới sản phẩm)
   - product.html (trang chi tiết)
   - cart.html (tra cứu tên/giá/ảnh theo id trong giỏ)

   Khi thêm sản phẩm mới: chỉ cần thêm 1 object vào mảng bên dưới.
================================ */

const PRODUCTS = [
  {
    id: "petal-tint-balm",
    name: "Petal tint balm",
    category: "Lips",
    tag: "New",
    price: 18,
    image: "images/LipBalm.png",
    shortDescription: "Son dưỡng có màu, lên môi tự nhiên như má hồng.",
    description:
      "Petal tint balm là son dưỡng kiêm tint môi, công thức mềm mượt giúp môi luôn ẩm mà vẫn lên màu hồng tự nhiên. Phù hợp dùng hằng ngày, không gây khô môi.",
  },
  {
    id: "cloud-cream",
    name: "Cloud cream",
    category: "Skincare",
    tag: "Bestseller",
    price: 28,
    image: "images/Cream.png",
    shortDescription: "Kem dưỡng ẩm kết cấu nhẹ như mây, thấm nhanh.",
    description:
      "Cloud cream cấp ẩm sâu nhưng không gây bết dính hay nhờn rít. Kết cấu dạng gel-cream nhẹ tênh, phù hợp cho cả da dầu lẫn da khô, dùng được sáng và tối.",
  },
  {
    id: "soft-glow-set",
    name: "Soft glow set",
    category: "Complexion",
    tag: "Limited",
    price: 34,
    image: "images/Contour.png",
    shortDescription:
      "Bộ sản phẩm tạo khối tự nhiên, không cần trang điểm cầu kỳ.",
    description:
      "Soft glow set gồm phấn tạo khối và highlight tông ấm, giúp gương mặt sáng khỏe tự nhiên chỉ trong vài bước. Phiên bản giới hạn theo mùa.",
  },
  {
    id: "silk-body-oil",
    name: "Silk body oil",
    category: "Body care",
    tag: "Everyday",
    price: 22,
    image: "images/Oil.png",
    shortDescription: "Dầu dưỡng thể mềm mượt, thấm nhanh không nhờn rít.",
    description:
      "Silk body oil giúp da mềm mịn như lụa sau mỗi lần dùng, hương thơm nhẹ nhàng lưu lại cả ngày. Dùng sau khi tắm để đạt hiệu quả tốt nhất.",
  },
  {
    id: "daily-glow-duo",
    name: "Daily glow duo",
    category: "Makeup",
    tag: "Bestseller",
    price: 30,
    image: "images/Palette.png",
    shortDescription: "Bộ đôi tạo màu tự nhiên cho má và môi.",
    description:
      "Daily glow duo là bộ sản phẩm 2-trong-1 giúp bạn có vẻ ngoài tươi tắn chỉ trong một bước, dễ tán và không gây bết dính.",
  },
  {
    id: "dew-drop-serum",
    name: "Dew drop serum",
    category: "Skincare",
    tag: "Bestseller",
    price: 26,
    image: "images/Serum.png",
    shortDescription: "Serum cấp ẩm tức thì, da căng mọng như sương sớm.",
    description:
      "Dew drop serum chứa thành phần cấp ẩm cao, thẩm thấu nhanh, giúp da căng bóng tự nhiên mà không gây nhờn. Dùng trước bước kem dưỡng.",
  },
  {
    id: "afterglow-mist",
    name: "Afterglow mist",
    category: "Body care",
    tag: "Bestseller",
    price: 20,
    image: "images/FacialSpray.png",
    shortDescription: "Xịt khoáng dưỡng ẩm, cấp ẩm nhanh mọi lúc.",
    description:
      "Afterglow mist là xịt khoáng cấp ẩm tức thì, có thể dùng lại nhiều lần trong ngày để giữ làn da luôn tươi mát và rạng rỡ.",
  },
];

/* Hàm tiện ích: tìm 1 sản phẩm theo id */
function getProductById(id) {
  return PRODUCTS.find((product) => product.id === id) || null;
}
