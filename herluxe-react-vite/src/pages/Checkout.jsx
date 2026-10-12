import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../components/AuthContext";
import { useCart } from "../components/CartContext";
import { saveProducts } from "../resources/mockStore";
import { fetchProducts, updateProduct } from "../resources/productsApi";
import { createOrder } from "../resources/ordersApi";
import "../styles/checkout.css";

const PAYMENTS = ["Cash on delivery", "Bank transfer"];
const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function Checkout() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: "",
    note: "",
    payment: PAYMENTS[0],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(null);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      // 1. Kiểm tra tồn kho theo dữ liệu mới nhất trên MindX.
      const fresh = await fetchProducts();
      const byId = new Map(fresh.map((product) => [product.id, product]));
      const problems = [];
      items.forEach(({ product, qty }) => {
        const live = byId.get(product.id);
        if (!live) problems.push(`${product.name} is no longer available.`);
        else if (Number(live.stock) < qty)
          problems.push(`${product.name}: only ${live.stock} left in stock.`);
      });
      if (problems.length) {
        setError(problems.join(" "));
        return;
      }

      // 2. Tạo đơn trên MindX.
      const order = {
        id: `HL-${Date.now().toString(36).toUpperCase()}`,
        userId: user.id,
        customer: form.name.trim(),
        email: user.email,
        phone: form.phone.trim(),
        shippingAddress: form.address.trim(),
        note: form.note.trim(),
        paymentMethod: form.payment,
        items: items.map(({ product, qty }) => ({
          productId: product.id,
          name: product.name,
          price: byId.get(product.id).price,
          qty,
        })),
        subtotal,
        shipping,
        total,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      await createOrder(order);

      // 3. Trừ tồn kho (nếu lỗi thì đơn vẫn được giữ, chỉ cảnh báo).
      let warning = "";
      try {
        for (const { product, qty } of items) {
          const live = byId.get(product.id);
          await updateProduct({
            ...live,
            stock: Math.max(0, Number(live.stock) - qty),
          });
        }
        saveProducts(await fetchProducts());
      } catch {
        warning =
          "Your order was placed, but the inventory could not be updated automatically.";
      }
      setPlaced({ order, warning });
      clearCart();
    } catch (reason) {
      setError(
        `We could not place your order (${reason.message}). Your bag is unchanged, please try again.`,
      );
    } finally {
      setBusy(false);
    }
  };

  if (placed) {
    const { order, warning } = placed;
    return (
      <div className="page cart-page">
        <Header />
        <main className="cart-section checkout-done">
          <p className="eyebrow">Thank you</p>
          <h1>Your order is placed</h1>
          <p>
            Order <strong>{order.id}</strong> is pending. We will prepare it for{" "}
            {order.customer}.
          </p>
          {warning && <p className="checkout-error">{warning}</p>}
          <div className="checkout-done-box">
            {order.items.map((item) => (
              <div className="cart-summary-row" key={item.productId}>
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>{money(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="cart-summary-row total">
              <span>Total ({order.paymentMethod})</span>
              <span>{money(order.total)}</span>
            </div>
          </div>
          <div className="checkout-done-actions">
            <Link className="button button-dark" to="/profile">
              View my orders
            </Link>
            <Link className="button button-outline" to="/products">
              Continue shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!items.length) return <Navigate to="/cart" replace />;

  return (
    <div className="page cart-page">
      <Header />
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/cart">Your bag</Link>
        <span>/</span>
        <span>Checkout</span>
      </nav>
      <main className="cart-section">
        <h1>Checkout</h1>
        <div className="cart-container">
          <form className="checkout-form" onSubmit={submit}>
            <h2>Delivery details</h2>
            <label>
              Full name
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </label>
            <label>
              Phone number
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
                pattern="[0-9+\s().-]{8,}"
                title="Enter a valid phone number"
              />
            </label>
            <label>
              Delivery address
              <textarea
                rows="3"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                required
                placeholder="Street, ward, district, city"
              />
            </label>
            <label>
              Order note (optional)
              <input
                value={form.note}
                onChange={(e) => update("note", e.target.value)}
                placeholder="Delivery time, gift message…"
              />
            </label>
            <fieldset>
              <legend>Payment method</legend>
              {PAYMENTS.map((method) => (
                <label className="checkout-radio" key={method}>
                  <input
                    type="radio"
                    name="payment"
                    checked={form.payment === method}
                    onChange={() => update("payment", method)}
                  />
                  {method}
                </label>
              ))}
            </fieldset>
            {error && (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            )}
            <button className="checkout-btn" disabled={busy}>
              {busy ? "Placing order…" : `Place order · ${money(total)}`}
            </button>
          </form>
          <aside className="cart-summary">
            <h2>Order summary</h2>
            {items.map(({ product, qty }) => (
              <div className="cart-summary-row" key={product.id}>
                <span>
                  {product.name} × {qty}
                </span>
                <span>{money(product.price * qty)}</span>
              </div>
            ))}
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>{shipping ? money(shipping) : "Complimentary"}</span>
            </div>
            <div className="cart-summary-row total">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
            <Link to="/cart" className="continue-shopping">
              ← Back to bag
            </Link>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
