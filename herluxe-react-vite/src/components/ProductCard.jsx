import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";

const palette = { Lips: "rose", Skincare: "sand", Complexion: "plum", "Body care": "ivory", Makeup: "rose" };
const visual = { Lips: "product-visual-lip", Skincare: "product-visual-cream", Complexion: "product-visual-glow", "Body care": "product-visual-oil", Makeup: "product-visual-glow" };

export default function ProductCard({ product, compact = false }) {
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleAdd = () => {
    if (isAdmin) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}&notice=signin`);
      return;
    }
    addToCart(product.id, 1);
  };
  return <article className={`product-card product-card-${palette[product.category] || "rose"} ${compact ? "compact" : ""}`}><Link to={`/products?id=${product.id}`} className="product-card-click-area"><span className="product-tag">{product.tag}</span><div className={`product-visual ${visual[product.category] || ""}`}><img src={product.image} alt={product.name} /></div><div className="product-info"><div><p>{product.category}</p><h3>{product.name}</h3></div><strong>${product.price}</strong></div></Link><button type="button" disabled={isAdmin} onClick={handleAdd}>{isAdmin ? "Admin view only" : isAuthenticated ? <>Add to bag <i className="fa-solid fa-plus"></i></> : <>Sign in to shop <i className="fa-solid fa-arrow-right"></i></>}</button></article>;
}
