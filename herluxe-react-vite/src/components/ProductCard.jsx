import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";

const palette = {
  Lips: "rose",
  Skincare: "sand",
  "Body care": "ivory",
  Makeup: "rose",
};
const visual = {
  Lips: "product-visual-lip",
  Skincare: "product-visual-cream",
  Complexion: "product-visual-glow",
  "Body care": "product-visual-oil",
  Makeup: "product-visual-glow",
};

export default function ProductCard({ product, compact = false }) {
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = useState(false);
  const soldOut = product.stock != null && Number(product.stock) <= 0;
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(false), 2600);
    return () => clearTimeout(timer);
  }, [notice]);
  const handleAdd = () => {
    if (isAdmin) return;
    if (soldOut) {
      setNotice(true);
      return;
    }
    if (!isAuthenticated) {
      navigate(
        `/login?redirect=${encodeURIComponent(location.pathname + location.search)}&notice=signin`,
      );
      return;
    }
    addToCart(product.id, 1);
  };
  return (
    <article
      className={`product-card product-card-${palette[product.category] || "rose"} ${compact ? "compact" : ""} ${soldOut ? "is-sold-out" : ""}`}
    >
      <Link
        to={`/products?id=${product.id}`}
        className="product-card-click-area"
      >
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <div className={`product-visual ${visual[product.category] || ""}`}>
          <img src={product.image} alt={product.name} />
          {soldOut && (
            <span className="sold-out-badge" aria-label="Out of stock">
              Out of stock
            </span>
          )}
        </div>
        <div className="product-info">
          <div>
            <p>{product.category}</p>
            <h3>{product.name}</h3>
          </div>
          <strong>${product.price}</strong>
        </div>
      </Link>
      {notice && (
        <p className="stock-notice" role="alert">
          Sorry, “{product.name}” is currently out of stock.
        </p>
      )}
      <button
        type="button"
        className={soldOut ? "is-sold-out-btn" : ""}
        disabled={isAdmin}
        onClick={handleAdd}
      >
        {isAdmin ? (
          "Admin view only"
        ) : soldOut ? (
          <>
            Out of stock <i className="fa-solid fa-ban"></i>
          </>
        ) : isAuthenticated ? (
          <>
            Add to bag <i className="fa-solid fa-plus"></i>
          </>
        ) : (
          <>
            Sign in to shop <i className="fa-solid fa-arrow-right"></i>
          </>
        )}
      </button>
    </article>
  );
}
