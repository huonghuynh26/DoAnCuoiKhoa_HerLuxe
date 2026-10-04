import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../components/AuthContext";
import { useCart } from "../components/CartContext";
import { categories } from "../resources/products";
import { useProducts } from "../resources/mockStore";

// So khớp tag không phân biệt hoa/thường và khoảng trắng ("Best seller" = "Bestseller")
const normalize = (value) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

// Các tab lọc theo tag: tên hiển thị → giá trị tag trong dữ liệu sản phẩm
const tagTabs = { "Best sellers": "Bestseller", "New arrivals": "New" };

export default function Products() {
  const [params, setParams] = useSearchParams();
  const products = useProducts();
  const category = params.get("category") || "All";
  const tag = params.get("tag") || "";
  const tagLabel =
    Object.keys(tagTabs).find(
      (label) => normalize(tagTabs[label]) === normalize(tag),
    ) || tag;
  const search = params.get("search") || "";
  const selectedId = params.get("id");
  const filtered = useMemo(
    () =>
      products.filter(
        (item) =>
          (category === "All" || item.category === category) &&
          (!tag || normalize(item.tag) === normalize(tag)) &&
          (!search ||
            `${item.name} ${item.description}`
              .toLowerCase()
              .includes(search.toLowerCase())),
      ),
    [products, category, tag, search],
  );
  // Tab cố định: All, Best sellers, New arrivals, rồi các danh mục còn lại
  const tabs = [
    "All",
    ...Object.keys(tagTabs),
    ...categories.filter((item) => item !== "All"),
  ];
  const isActive = (item) =>
    item === "All"
      ? category === "All" && !tag
      : tagTabs[item]
        ? normalize(tagTabs[item]) === normalize(tag)
        : category === item;
  const selectTab = (item) => {
    const next = new URLSearchParams(params);
    next.delete("id");
    next.delete("category");
    next.delete("tag");
    if (tagTabs[item]) next.set("tag", tagTabs[item]);
    else if (item !== "All") next.set("category", item);
    setParams(next);
  };
  if (selectedId) return <ProductDetailInline id={selectedId} />;
  return (
    <div className="page products-page">
      <Header />
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Products</span>
      </nav>
      <main className="browse-page">
        <div className="browse-heading">
          <div>
            <p className="eyebrow">HerLuxe collection</p>
            <h1>{tag ? tagLabel : "All products"}</h1>
            <p>
              Explore makeup, skincare and body care essentials selected for
              everyday rituals.
            </p>
          </div>
          <Link className="button button-dark" to="/collections">
            Explore collections <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
        <div className="browse-tools">
          <div className="category-tabs">
            {tabs.map((item) => (
              <button
                key={item}
                className={isActive(item) ? "active" : ""}
                onClick={() => selectTab(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              e.target.value
                ? next.set("search", e.target.value)
                : next.delete("search");
              setParams(next);
            }}
            placeholder="Search products..."
          />
        </div>
        <div className="browse-grid">
          {filtered.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <h2>No products found</h2>
            <p>Try a different keyword or category.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ProductDetailInline({ id }) {
  const products = useProducts();
  const product = products.find((item) => item.id === id);
  return (
    <div className="page products-page">
      <Header />
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <span>{product?.name || "Not found"}</span>
      </nav>
      <main className="product-detail-section">
        {product ? (
          <ProductInfo product={product} />
        ) : (
          <div className="product-not-found">
            <h1>Product not found</h1>
            <p>
              This product may have been removed or the link may be incorrect.
            </p>
            <Link to="/products" className="back-to-shop">
              Back to products
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ProductInfo({ product }) {
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const handleAddToCart = () => {
    if (isAdmin) return;
    if (!isAuthenticated) {
      navigate(
        `/login?redirect=${encodeURIComponent(`/products?id=${product.id}`)}&notice=signin`,
      );
      return;
    }
    addToCart(product.id, quantity);
  };
  return (
    <div className="product-detail-container">
      <div className="product-detail-image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-detail-info">
        <p className="product-category">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="product-detail-price">${product.price.toFixed(2)}</p>
        <p className="product-short-description">{product.shortDescription}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-purchase-row">
          <div className="quantity-box">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              −
            </button>
            <input
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Number(e.target.value) || 1))
              }
            />
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          <button
            disabled={isAdmin}
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            {isAdmin
              ? "Admin view only"
              : isAuthenticated
                ? "Add to bag"
                : "Sign in to shop"}
          </button>
        </div>
        <p className="add-to-cart-note">
          {isAdmin
            ? "Shopping is disabled in the admin workspace."
            : `Only ${product.stock} left in stock.`}
        </p>
        <Link to="/products" className="back-to-shop">
          ← Continue browsing
        </Link>
      </div>
    </div>
  );
}
