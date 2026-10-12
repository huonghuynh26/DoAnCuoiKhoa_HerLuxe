import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { fetchOrders } from "../resources/ordersApi";
import "../styles/checkout.css";

const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const dateLabel = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value || "—"
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchOrders()
      .then((all) => {
        if (!active) return;
        const email = user?.email?.toLowerCase();
        setOrders(
          all.filter(
            (order) =>
              (user?.id && order.userId === user.id) ||
              (email && order.email?.toLowerCase() === email),
          ),
        );
      })
      .catch((reason) => active && setError(reason.message));
    return () => {
      active = false;
    };
  }, [user?.id, user?.email]);

  return (
    <section className="my-orders">
      <div className="my-orders-heading">
        <p className="eyebrow">Your purchases</p>
        <h2>Order history</h2>
      </div>
      {error && (
        <p className="my-orders-note error">
          We could not load your orders ({error}).
        </p>
      )}
      {!error && orders === null && (
        <p className="my-orders-note">Loading your orders…</p>
      )}
      {orders && !orders.length && (
        <p className="my-orders-note">You have not placed any orders yet.</p>
      )}
      {orders?.map((order) => (
        <article className="my-order" key={order.id}>
          <header>
            <div>
              <strong>{order.id}</strong>
              <small>{dateLabel(order.createdAt)}</small>
            </div>
            <span className={`order-status ${order.status}`}>
              {order.status}
            </span>
          </header>
          <ul>
            {order.items.map((item, index) => (
              <li key={`${item.productId}-${index}`}>
                <span>
                  {item.name || item.productId} × {item.qty}
                </span>
                <span>
                  {money(Number(item.price || 0) * Number(item.qty || 0))}
                </span>
              </li>
            ))}
          </ul>
          <footer>
            <span>{order.paymentMethod || "—"}</span>
            <strong>Total {money(order.total)}</strong>
          </footer>
        </article>
      ))}
    </section>
  );
}
