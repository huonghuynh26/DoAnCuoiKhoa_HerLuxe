/* ==============================
   HERLUXE — CART LOGIC
   Giỏ hàng lưu trong localStorage dưới dạng mảng:
   [{ id: "cloud-cream", qty: 2 }, ...]

   File này cần được nạp SAU products.js (vì getCartTotal() dùng
   getProductById() để tra giá) và có thể dùng ở mọi trang
   (home.html, product.html, cart.html) — chỉ cần thêm:
   <script src="products.js"></script>
   <script src="cart.js"></script>
================================ */

const CART_STORAGE_KEY = "herluxe-cart";

/* Đọc giỏ hàng hiện tại từ localStorage (luôn trả về mảng, kể cả khi lỗi) */
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Không đọc được giỏ hàng từ localStorage:", error);
    return [];
  }
}

/* Lưu giỏ hàng + tự động cập nhật số trên icon giỏ hàng */
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

/* Thêm sản phẩm vào giỏ (hoặc cộng dồn số lượng nếu đã có) */
function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  saveCart(cart);
}

/* Xóa hẳn 1 sản phẩm khỏi giỏ */
function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
}

/* Đặt lại số lượng cụ thể cho 1 sản phẩm (qty <= 0 sẽ xóa luôn sản phẩm đó) */
function updateCartItemQty(productId, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((item) => item.id !== productId);
  } else {
    const existing = cart.find((item) => item.id === productId);
    if (existing) existing.qty = qty;
  }
  saveCart(cart);
}

/* Xóa sạch giỏ hàng (dùng sau khi đặt hàng thành công) */
function clearCart() {
  saveCart([]);
}

/* Tổng số lượng sản phẩm trong giỏ (hiện ở icon giỏ hàng) */
function getCartCount() {
  return getCart().reduce((total, item) => total + item.qty, 0);
}

/* Tổng tiền — cần products.js đã được nạp trước để tra giá */
function getCartTotal() {
  return getCart().reduce((total, item) => {
    const product =
      typeof getProductById === "function" ? getProductById(item.id) : null;
    return product ? total + product.price * item.qty : total;
  }, 0);
}

function formatPrice(price) {
  return "$" + price.toFixed(2);
}

/* Cập nhật số trên icon giỏ hàng (.hl-cart-count) nếu đang có trên trang */
function updateCartBadge() {
  const badge = document.querySelector(".hl-cart-count");
  if (badge) badge.textContent = String(getCartCount());
}

document.addEventListener("DOMContentLoaded", () => {
  // Cập nhật ngay nếu badge đã có sẵn trong DOM
  updateCartBadge();

  // header.html được nạp bất đồng bộ (fetch) trong header.js, nên icon
  // giỏ hàng có thể chưa tồn tại lúc DOMContentLoaded. Theo dõi khu vực
  // mount header, hễ nội dung được chèn vào là cập nhật lại số ngay.
  const headerMount = document.querySelector("[data-site-header]");
  if (headerMount) {
    const observer = new MutationObserver(() => {
      const badge = headerMount.querySelector(".hl-cart-count");
      if (badge) {
        badge.textContent = String(getCartCount());
        observer.disconnect();
      }
    });
    observer.observe(headerMount, { childList: true, subtree: true });
  }
});
