import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  getOrders,
  getProducts,
  getUsers,
  resourceDefinitions,
  resetMockResources,
  saveOrders,
  saveProducts,
  saveUsers,
} from "../resources/mockStore";

const categories = ["Makeup", "Skincare", "Lips", "Complexion", "Body care"];
const statuses = ["pending", "processing", "completed", "cancelled"];
const imageOptions = [
  "/images/lips/lipbalm1.png",
  "/images/lips/lipbalm2.png",
  "/images/lips/lipoil.png",
  "/images/lips/lipscrub.png",
  "/images/makeup/blush.png",
  "/images/makeup/brush.png",
  "/images/makeup/concealer.png",
  "/images/makeup/cushion.png",
  "/images/makeup/eyelash.png",
  "/images/makeup/makeuppowder.png",
  "/images/makeup/makeupsponge.png",
  "/images/makeup/mascara.png",
  "/images/makeup/primer.png",
  "/images/skincare/facialspray.png",
  "/images/skincare/mask.png",
  "/images/skincare/micellar.png",
  "/images/skincare/serum.png",
  "/images/skincare/toner.png",
  "/images/bodycare/bodylotion.png",
  "/images/bodycare/bodyoil.png",
  "/images/bodycare/bodyscrub.png",
  "/images/bodycare/bodywash.png",
  "/images/bodycare/footcream.png",
  "/images/bodycare/handcream.png",
  "/images/bodycare/sunsreen.png",
];
const emptyProduct = {
  id: "",
  name: "",
  category: "Skincare",
  tag: "New",
  price: 0,
  image: "/images/Cream.png",
  shortDescription: "",
  description: "",
  stock: 0,
};

const money = (value) =>
  `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const dateLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const shortDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
};

const slugify = (value) =>
  String(value || "product")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const statusLabel = (status) =>
  status.charAt(0).toUpperCase() + status.slice(1);

function salesForOrder(order) {
  return order.status !== "cancelled";
}

function calculateProductSales(orders) {
  return orders.reduce((sales, order) => {
    if (!salesForOrder(order)) return sales;
    (order.items || []).forEach((item) => {
      sales[item.productId] =
        (sales[item.productId] || 0) + Number(item.qty || 0);
    });
    return sales;
  }, {});
}

function calculateRevenue(orders) {
  return orders.reduce(
    (sum, order) =>
      salesForOrder(order) ? sum + Number(order.total || 0) : sum,
    0,
  );
}

function makeTrend(orders) {
  const usable = orders.filter(
    (order) => salesForOrder(order) && order.createdAt,
  );
  const latest = usable.reduce((max, order) => {
    const date = new Date(order.createdAt);
    return date > max ? date : max;
  }, new Date());
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(latest);
    date.setDate(latest.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: shortDate(key),
      value: usable
        .filter((order) => String(order.createdAt).slice(0, 10) === key)
        .reduce((sum, order) => sum + Number(order.total || 0), 0),
    };
  });
  const max = Math.max(...days.map((day) => day.value), 1);
  return days.map((day) => ({
    ...day,
    height: Math.max(day.value ? (day.value / max) * 100 : 7, 7),
  }));
}

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState(getProducts());
  const [orders, setOrders] = useState(getOrders());
  const [users, setUsers] = useState(getUsers());
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("All");
  const [productStockFilter, setProductStockFilter] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("All");
  const [customerSearch, setCustomerSearch] = useState("");
  const [productModal, setProductModal] = useState(null);
  const [orderModal, setOrderModal] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const refresh = () => {
      setProducts(getProducts());
      setOrders(getOrders());
      setUsers(getUsers());
    };
    window.addEventListener("herluxe-resource-change", refresh);
    window.addEventListener("herluxe-resource-reset", refresh);
    return () => {
      window.removeEventListener("herluxe-resource-change", refresh);
      window.removeEventListener("herluxe-resource-reset", refresh);
    };
  }, []);

  const notify = (message, tone = "success") => {
    setNotice({ message, tone });
    window.setTimeout(() => setNotice(null), 3200);
  };

  const productSales = useMemo(() => calculateProductSales(orders), [orders]);
  const revenue = useMemo(() => calculateRevenue(orders), [orders]);
  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  );
  const openOrders = orders.filter((order) =>
    ["pending", "processing"].includes(order.status),
  );
  const lowStock = products.filter((product) => Number(product.stock) <= 20);
  const activeOrderCount = orders.filter(
    (order) => order.status !== "cancelled",
  ).length;
  const averageOrder = activeOrderCount ? revenue / activeOrderCount : 0;
  const trend = useMemo(() => makeTrend(orders), [orders]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.toLowerCase().trim();
    return products.filter((product) => {
      const matchesQuery =
        !query ||
        `${product.name} ${product.id} ${product.category}`
          .toLowerCase()
          .includes(query);
      const matchesCategory =
        productCategory === "All" || product.category === productCategory;
      const matchesStock =
        productStockFilter === "All" ||
        (productStockFilter === "Low stock"
          ? Number(product.stock) <= 20
          : Number(product.stock) > 20);
      return matchesQuery && matchesCategory && matchesStock;
    });
  }, [products, productSearch, productCategory, productStockFilter]);

  const filteredOrders = useMemo(() => {
    const query = orderSearch.toLowerCase().trim();
    return orders.filter((order) => {
      const matchesQuery =
        !query ||
        `${order.id} ${order.customer} ${order.email}`
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        orderStatus === "All" || order.status === orderStatus;
      return matchesQuery && matchesStatus;
    });
  }, [orders, orderSearch, orderStatus]);

  const customerRows = useMemo(() => {
    const query = customerSearch.toLowerCase().trim();
    return users
      .filter(
        (user) =>
          !query ||
          `${user.name} ${user.email} ${user.phone || ""}`
            .toLowerCase()
            .includes(query),
      )
      .map((user) => {
        const customerOrders = orders.filter(
          (order) =>
            order.email?.toLowerCase() === user.email?.toLowerCase() &&
            order.status !== "cancelled",
        );
        return {
          ...user,
          orderCount: customerOrders.length,
          spend: customerOrders.reduce(
            (sum, order) => sum + Number(order.total || 0),
            0,
          ),
          lastOrder: customerOrders.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          )[0]?.createdAt,
        };
      });
  }, [users, orders, customerSearch]);

  const saveProduct = (event, form, editing) => {
    event.preventDefault();
    const nextProduct = {
      ...form,
      id: editing ? form.id : form.id || `${slugify(form.name)}-${Date.now()}`,
      name: form.name.trim(),
      price: Math.max(0, Number(form.price) || 0),
      stock: Math.max(0, Number(form.stock) || 0),
    };
    const next = editing
      ? products.map((item) => (item.id === form.id ? nextProduct : item))
      : [...products, nextProduct];
    setProducts(next);
    saveProducts(next);
    setProductModal(null);
    notify(
      editing ? "Product changes saved." : "Product added to the catalog.",
    );
  };

  const removeProduct = (product) => {
    if (
      !window.confirm(`Delete ${product.name}? This action cannot be undone.`)
    )
      return;
    const next = products.filter((item) => item.id !== product.id);
    setProducts(next);
    saveProducts(next);
    notify("Product removed from the catalog.");
  };

  const updateOrderStatus = (orderId, status) => {
    const next = orders.map((order) =>
      order.id === orderId
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order,
    );
    setOrders(next);
    saveOrders(next);
    setOrderModal((current) =>
      current?.id === orderId
        ? next.find((order) => order.id === orderId)
        : current,
    );
    notify(`Order ${orderId} moved to ${statusLabel(status)}.`);
  };

  const updateUserRole = (userId, role) => {
    const next = users.map((user) =>
      user.id === userId ? { ...user, role } : user,
    );
    setUsers(next);
    saveUsers(next);
    notify("Account access updated.");
  };

  const exportResources = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      products,
      orders,
      users,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `herluxe-admin-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Resource backup downloaded.");
  };

  const importResources = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        if (
          !Array.isArray(payload.products) ||
          !Array.isArray(payload.orders) ||
          !Array.isArray(payload.users)
        )
          throw new Error("Invalid resource file");
        saveProducts(payload.products);
        saveOrders(payload.orders);
        saveUsers(payload.users);
        setProducts(payload.products);
        setOrders(payload.orders);
        setUsers(payload.users);
        notify("Resource backup imported.");
      } catch {
        notify("The selected file is not a valid HerLuxe backup.", "error");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const resetData = () => {
    if (
      !window.confirm(
        "Reset all local products, orders and accounts to the demo seed?",
      )
    )
      return;
    resetMockResources();
    setProducts(getProducts());
    setOrders(getOrders());
    setUsers(getUsers());
    notify("Local demo data has been reset.");
  };

  const navItems = [
    ["overview", "Overview", "fa-chart-line"],
    ["products", "Products", "fa-box-open", products.length],
    ["orders", "Orders", "fa-receipt", openOrders.length],
    ["customers", "Customers", "fa-users"],
    ["analytics", "Analytics", "fa-chart-pie"],
    ["resources", "Resources", "fa-sliders"],
  ];

  return (
    <div className="admin-shell">
      <Header />
      <main className="admin-main admin-v2">
        {notice && (
          <div className={`admin-toast ${notice.tone}`} role="status">
            <i
              className={`fa-solid ${notice.tone === "error" ? "fa-circle-exclamation" : "fa-circle-check"}`}
            ></i>
            {notice.message}
          </div>
        )}
        <div className="admin-layout">
          {/* Thêm inline style hoặc chỉnh class CSS để sidebar đứng cố định khi cuộn */}
          <aside
            className="admin-sidebar"
            style={{
              position: "sticky",
              top: "24px",
              alignSelf: "flex-start",
              maxHeight: "calc(100vh - 48px)",
              overflowY: "auto",
            }}
          >
            <div className="admin-sidebar-brand">
              <span className="admin-brand-mark">H</span>
              <div>
                <strong>HerLuxe</strong>
                <small>Studio admin</small>
              </div>
            </div>
            <div className="admin-sidebar-label">Workspace</div>
            <nav className="admin-nav" aria-label="Admin navigation">
              {navItems.map(([key, label, icon, count]) => (
                <button
                  key={key}
                  className={tab === key ? "active" : ""}
                  onClick={() => setTab(key)}
                >
                  <i className={`fa-solid ${icon}`}></i>
                  <span>{label}</span>
                  {count ? <b>{count}</b> : null}
                </button>
              ))}
            </nav>
            <div className="admin-sidebar-bottom">
              <div className="admin-sidebar-label">Shortcuts</div>
              <Link to="/products">
                <i className="fa-solid fa-arrow-up-right-from-square"></i> View
                storefront
              </Link>
              <Link to="/profile">
                <i className="fa-regular fa-user"></i> My profile
              </Link>
              <div className="admin-sidebar-user">
                <span>HA</span>
                <div>
                  <strong>HerLuxe Admin</strong>
                  <small>Administrator</small>
                </div>
              </div>
            </div>
          </aside>

          <section className="admin-workspace">
            <header className="admin-workspace-header">
              <div>
                <p className="eyebrow">Private workspace / {tab}</p>
                <h1>
                  {tab === "overview"
                    ? "Good morning, HerLuxe."
                    : navItems.find(([key]) => key === tab)?.[1]}
                </h1>
                <p className="admin-subtitle">
                  {tab === "overview"
                    ? "Keep every product, customer and order moving."
                    : "Manage your boutique operations with confidence."}
                </p>
              </div>
              <div className="admin-header-actions">
                <span className="admin-live">
                  <i></i> Local workspace
                </span>
                <button
                  className="button button-outline"
                  onClick={exportResources}
                >
                  <i className="fa-solid fa-download"></i> Export report
                </button>
              </div>
            </header>

            {tab === "overview" && (
              <Overview
                revenue={revenue}
                averageOrder={averageOrder}
                products={products}
                orders={orders}
                users={users}
                lowStock={lowStock}
                trend={trend}
                productSales={productSales}
                setTab={setTab}
                setOrderModal={setOrderModal}
              />
            )}
            {tab === "products" && (
              <ProductsPanel
                products={filteredProducts}
                total={products.length}
                search={productSearch}
                setSearch={setProductSearch}
                category={productCategory}
                setCategory={setProductCategory}
                stockFilter={productStockFilter}
                setStockFilter={setProductStockFilter}
                onAdd={() =>
                  setProductModal({ editing: false, product: emptyProduct })
                }
                onEdit={(product) =>
                  setProductModal({ editing: true, product })
                }
                onDelete={removeProduct}
                sales={productSales}
              />
            )}
            {tab === "orders" && (
              <OrdersPanel
                orders={filteredOrders}
                products={products}
                search={orderSearch}
                setSearch={setOrderSearch}
                status={orderStatus}
                setStatus={setOrderStatus}
                onOpen={setOrderModal}
                onStatusChange={updateOrderStatus}
              />
            )}
            {tab === "customers" && (
              <CustomersPanel
                rows={customerRows}
                query={customerSearch}
                setQuery={setCustomerSearch}
                onRoleChange={updateUserRole}
              />
            )}
            {tab === "analytics" && (
              <AnalyticsPanel
                products={products}
                orders={orders}
                productSales={productSales}
                trend={trend}
                revenue={revenue}
              />
            )}
            {tab === "resources" && (
              <ResourcesPanel
                exportResources={exportResources}
                importResources={importResources}
                resetData={resetData}
              />
            )}
          </section>
        </div>
      </main>
      <Footer />
      {productModal && (
        <ProductModal
          {...productModal}
          onClose={() => setProductModal(null)}
          onSave={saveProduct}
        />
      )}
      {orderModal && (
        <OrderModal
          order={orderModal}
          products={products}
          onClose={() => setOrderModal(null)}
          onStatusChange={updateOrderStatus}
        />
      )}
    </div>
  );
}

function Overview({
  revenue,
  averageOrder,
  products,
  orders,
  users,
  lowStock,
  trend,
  productSales,
  setTab,
  setOrderModal,
}) {
  const topProducts = [...products]
    .sort((a, b) => (productSales[b.id] || 0) - (productSales[a.id] || 0))
    .slice(0, 4);
  return (
    <section className="admin-content admin-overview">
      <div className="admin-kpi-grid">
        <Kpi
          icon="fa-sack-dollar"
          label="Net revenue"
          value={money(revenue)}
          detail={`${orders.filter((order) => order.status !== "cancelled").length} active orders`}
          tone="rose"
        />
        <Kpi
          icon="fa-cart-shopping"
          label="Total orders"
          value={orders.length}
          detail={`${orders.filter((order) => order.status === "pending").length} awaiting action`}
          tone="ink"
        />
        <Kpi
          icon="fa-arrow-trend-up"
          label="Average order"
          value={money(averageOrder)}
          detail="Across non-cancelled orders"
          tone="sage"
        />
        <Kpi
          icon="fa-triangle-exclamation"
          label="Low stock"
          value={lowStock.length}
          detail={
            lowStock.length
              ? "Restock attention needed"
              : "Inventory looks healthy"
          }
          tone="sand"
        />
      </div>
      <div className="admin-overview-grid">
        <div className="admin-card admin-chart-card">
          <div className="admin-card-heading">
            <div>
              <p className="eyebrow">Sales rhythm</p>
              <h2>Revenue overview</h2>
            </div>
            <span className="trend-positive">
              <i className="fa-solid fa-arrow-up"></i> Live data
            </span>
          </div>
          <div className="bar-chart" aria-label="Revenue by day">
            {trend.map((day) => (
              <div className="bar-column" key={day.key}>
                <span className="bar-value">
                  {day.value ? money(day.value).replace(".00", "") : "—"}
                </span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: `${day.height}%` }}
                  ></div>
                </div>
                <small>{day.label}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-heading">
            <div>
              <p className="eyebrow">Attention</p>
              <h2>Inventory watch</h2>
            </div>
            <button className="text-action" onClick={() => setTab("products")}>
              Manage →
            </button>
          </div>
          {lowStock.length ? (
            lowStock.slice(0, 4).map((product) => (
              <div className="mini-row" key={product.id}>
                <img src={product.image} alt="" />
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.category}</small>
                </div>
                <span className="stock-warning">{product.stock} left</span>
              </div>
            ))
          ) : (
            <EmptyState
              icon="fa-boxes-stacked"
              title="All stocked up"
              text="No products are below the low-stock threshold."
            />
          )}
        </div>
      </div>
      <div className="admin-overview-grid lower">
        <div className="admin-card">
          <div className="admin-card-heading">
            <div>
              <p className="eyebrow">Merchandising</p>
              <h2>Top products</h2>
            </div>
            <button className="text-action" onClick={() => setTab("analytics")}>
              View analytics →
            </button>
          </div>
          {topProducts.map((product, index) => (
            <div className="ranking-row" key={product.id}>
              <span className="ranking-number">0{index + 1}</span>
              <img src={product.image} alt="" />
              <div>
                <strong>{product.name}</strong>
                <small>
                  {product.category} · {productSales[product.id] || 0} units
                  sold
                </small>
              </div>
              <b>{money(product.price)}</b>
            </div>
          ))}
        </div>
        <div className="admin-card">
          <div className="admin-card-heading">
            <div>
              <p className="eyebrow">Fulfillment</p>
              <h2>Recent orders</h2>
            </div>
            <button className="text-action" onClick={() => setTab("orders")}>
              View all →
            </button>
          </div>
          {orders.slice(0, 5).map((order) => (
            <button
              className="order-list-row"
              key={order.id}
              onClick={() => setOrderModal(order)}
            >
              <span className="order-id">{order.id}</span>
              <span>
                <strong>{order.customer}</strong>
                <small>{dateLabel(order.createdAt)}</small>
              </span>
              <b>{money(order.total)}</b>
              <StatusPill status={order.status} />
            </button>
          ))}
          {!orders.length && (
            <EmptyState
              icon="fa-receipt"
              title="No orders yet"
              text="Completed checkouts will appear here."
            />
          )}
        </div>
      </div>
      <div className="admin-footnote">
        <i className="fa-solid fa-circle-info"></i>
        <span>
          <strong>{users.length} accounts</strong> are registered in this local
          workspace. Revenue excludes cancelled orders and updates whenever you
          complete a checkout.
        </span>
      </div>
    </section>
  );
}

function Kpi({ icon, label, value, detail, tone }) {
  return (
    <div className={`admin-kpi ${tone}`}>
      <span className="kpi-icon">
        <i className={`fa-solid ${icon}`}></i>
      </span>
      <span className="kpi-label">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
function StatusPill({ status }) {
  return (
    <span className={`status-pill ${status}`}>
      <i></i>
      {statusLabel(status)}
    </span>
  );
}
function EmptyState({ icon, title, text }) {
  return (
    <div className="admin-empty">
      <i className={`fa-solid ${icon}`}></i>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function ProductsPanel({
  products,
  total,
  search,
  setSearch,
  category,
  setCategory,
  stockFilter,
  setStockFilter,
  onAdd,
  onEdit,
  onDelete,
  sales,
}) {
  return (
    <section className="admin-content">
      <div className="admin-section-toolbar">
        <div>
          <p className="eyebrow">Catalog management</p>
          <h2>
            Products{" "}
            <span className="count-pill">
              {products.length} of {total}
            </span>
          </h2>
        </div>
        <button className="button button-dark" onClick={onAdd}>
          <i className="fa-solid fa-plus"></i> Add product
        </button>
      </div>
      <div className="admin-filter-bar">
        <label className="admin-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, ID or category"
          />
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option>All</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(event) => setStockFilter(event.target.value)}
        >
          <option>All</option>
          <option>Low stock</option>
          <option>Healthy stock</option>
        </select>
      </div>
      <div className="admin-card admin-table-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Sold</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="table-product">
                      <img src={product.image} alt="" />
                      <div>
                        <strong>{product.name}</strong>
                        <small>
                          {product.id} · {product.tag}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <strong>{money(product.price)}</strong>
                  </td>
                  <td>
                    <span
                      className={
                        Number(product.stock) <= 20
                          ? "inventory-low"
                          : "inventory-good"
                      }
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td>{sales[product.id] || 0}</td>
                  <td>
                    <span
                      className={`catalog-status ${Number(product.stock) === 0 ? "out" : Number(product.stock) <= 20 ? "low" : "in"}`}
                    >
                      {Number(product.stock) === 0
                        ? "Out of stock"
                        : Number(product.stock) <= 20
                          ? "Low stock"
                          : "In stock"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        aria-label={`Edit ${product.name}`}
                        onClick={() => onEdit(product)}
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        className="danger"
                        aria-label={`Delete ${product.name}`}
                        onClick={() => onDelete(product)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!products.length && (
          <EmptyState
            icon="fa-box-open"
            title="No products match"
            text="Try a different search or add a new product."
          />
        )}
      </div>
    </section>
  );
}

function OrdersPanel({
  orders,
  products,
  search,
  setSearch,
  status,
  setStatus,
  onOpen,
  onStatusChange,
}) {
  const productMap = Object.fromEntries(
    products.map((product) => [product.id, product]),
  );
  return (
    <section className="admin-content">
      <div className="admin-section-toolbar">
        <div>
          <p className="eyebrow">Operations desk</p>
          <h2>
            Order management{" "}
            <span className="count-pill">{orders.length} orders</span>
          </h2>
        </div>
        <div className="admin-order-summary">
          <span>
            <i className="dot pending"></i>Pending{" "}
            {orders.filter((order) => order.status === "pending").length}
          </span>
          <span>
            <i className="dot processing"></i>Processing{" "}
            {orders.filter((order) => order.status === "processing").length}
          </span>
        </div>
      </div>
      <div className="admin-filter-bar">
        <label className="admin-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order ID or customer"
          />
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option>All</option>
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="admin-card admin-table-card">
        <div className="admin-table-wrap">
          <table className="admin-table orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Placed</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <button
                      className="link-button"
                      onClick={() => onOpen(order)}
                    >
                      {order.id}
                    </button>
                  </td>
                  <td>
                    <strong>{order.customer}</strong>
                    <small>{order.email}</small>
                  </td>
                  <td>
                    <span>
                      {(order.items || []).reduce(
                        (sum, item) => sum + Number(item.qty || 0),
                        0,
                      )}{" "}
                      items
                    </span>
                    <small>
                      {(order.items || [])
                        .slice(0, 2)
                        .map(
                          (item) =>
                            item.name ||
                            productMap[item.productId]?.name ||
                            item.productId,
                        )
                        .join(", ")}
                    </small>
                  </td>
                  <td>
                    <strong>{money(order.total)}</strong>
                  </td>
                  <td>{dateLabel(order.createdAt)}</td>
                  <td>
                    <select
                      className={`status-select ${order.status}`}
                      value={order.status}
                      onChange={(event) =>
                        onStatusChange(order.id, event.target.value)
                      }
                    >
                      {statuses.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Open ${order.id}`}
                      onClick={() => onOpen(order)}
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!orders.length && (
          <EmptyState
            icon="fa-receipt"
            title="No orders found"
            text="New customer checkouts will show up here."
          />
        )}
      </div>
    </section>
  );
}

function CustomersPanel({ rows, query, setQuery, onRoleChange }) {
  return (
    <section className="admin-content">
      <div className="admin-section-toolbar">
        <div>
          <p className="eyebrow">Customer relationships</p>
          <h2>
            Account directory{" "}
            <span className="count-pill">{rows.length} accounts</span>
          </h2>
        </div>
      </div>
      <div className="admin-filter-bar">
        <label className="admin-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email or phone"
          />
        </label>
      </div>
      <div className="admin-card admin-table-card">
        <div className="admin-table-wrap">
          <table className="admin-table customer-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Role</th>
                <th>Orders</th>
                <th>Lifetime value</th>
                <th>Last order</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((account) => (
                <tr key={account.id}>
                  <td>
                    <div className="customer-cell">
                      <span>
                        {(account.name || "U").slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <strong>{account.name}</strong>
                        <small>
                          {account.email} · {account.phone || "No phone"}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-label ${account.role}`}>
                      {account.role}
                    </span>
                  </td>
                  <td>{account.orderCount}</td>
                  <td>
                    <strong>{money(account.spend)}</strong>
                  </td>
                  <td>
                    {account.lastOrder
                      ? dateLabel(account.lastOrder)
                      : "No orders"}
                  </td>
                  <td>
                    <select
                      value={account.role || "customer"}
                      onChange={(event) =>
                        onRoleChange(account.id, event.target.value)
                      }
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <EmptyState
            icon="fa-users"
            title="No accounts found"
            text="Try a different customer search."
          />
        )}
      </div>
    </section>
  );
}

function AnalyticsPanel({ products, orders, productSales, trend, revenue }) {
  const categoryRevenue = categories
    .map((category) => {
      const amount = orders
        .filter((order) => order.status !== "cancelled")
        .reduce(
          (sum, order) =>
            sum +
            (order.items || [])
              .filter(
                (item) =>
                  products.find((product) => product.id === item.productId)
                    ?.category === category,
              )
              .reduce(
                (lineSum, item) =>
                  lineSum +
                  Number(
                    item.price ||
                      products.find((product) => product.id === item.productId)
                        ?.price ||
                      0,
                  ) *
                    Number(item.qty || 0),
                0,
              ),
          0,
        );
      return { category, amount };
    })
    .filter((item) => item.amount > 0);
  const maxCategory = Math.max(
    ...categoryRevenue.map((item) => item.amount),
    1,
  );
  const topProducts = [...products].sort(
    (a, b) => (productSales[b.id] || 0) - (productSales[a.id] || 0),
  );
  return (
    <section className="admin-content">
      <div className="analytics-headline">
        <div>
          <p className="eyebrow">Performance intelligence</p>
          <h2>Know what is moving the business.</h2>
          <p>
            Sales metrics are calculated from the orders stored in this
            workspace. Cancelled orders are excluded from revenue and unit
            counts.
          </p>
        </div>
        <div className="analytics-total">
          <small>Tracked revenue</small>
          <strong>{money(revenue)}</strong>
        </div>
      </div>
      <div className="analytics-grid">
        <div className="admin-card admin-chart-card">
          <div className="admin-card-heading">
            <div>
              <p className="eyebrow">Last seven order days</p>
              <h2>Revenue by day</h2>
            </div>
          </div>
          <div className="bar-chart large">
            {trend.map((day) => (
              <div className="bar-column" key={day.key}>
                <span className="bar-value">
                  {day.value ? money(day.value).replace(".00", "") : "—"}
                </span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: `${day.height}%` }}
                  ></div>
                </div>
                <small>{day.label}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-heading">
            <div>
              <p className="eyebrow">Mix by category</p>
              <h2>Category revenue</h2>
            </div>
          </div>
          <div className="category-bars">
            {categoryRevenue.length ? (
              categoryRevenue.map((item) => (
                <div className="category-bar" key={item.category}>
                  <div>
                    <span>{item.category}</span>
                    <strong>{money(item.amount)}</strong>
                  </div>
                  <div className="category-track">
                    <span
                      style={{ width: `${(item.amount / maxCategory) * 100}%` }}
                    ></span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon="fa-chart-simple"
                title="More data needed"
                text="Category performance will appear after orders are placed."
              />
            )}
          </div>
        </div>
      </div>
      <div className="admin-card admin-table-card analytics-products">
        <div className="admin-card-heading">
          <div>
            <p className="eyebrow">Product velocity</p>
            <h2>Units sold by product</h2>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Units sold</th>
                <th>Stock remaining</th>
                <th>Sell-through signal</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => {
                const sold = productSales[product.id] || 0;
                const signal =
                  sold >= 5 ? "Strong" : sold ? "Growing" : "No sales yet";
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product">
                        <img src={product.image} alt="" />
                        <strong>{product.name}</strong>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>
                      <strong>{sold}</strong>
                    </td>
                    <td>{product.stock}</td>
                    <td>
                      <span
                        className={`signal ${signal === "Strong" ? "strong" : signal === "Growing" ? "growing" : "quiet"}`}
                      >
                        {signal}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ResourcesPanel({ exportResources, importResources, resetData }) {
  return (
    <section className="admin-content">
      <div className="analytics-headline">
        <div>
          <p className="eyebrow">Data control room</p>
          <h2>Resources & safeguards.</h2>
          <p>
            Local resources power this demo storefront. Back up your working
            data before connecting a new endpoint or resetting the workspace.
          </p>
        </div>
      </div>
      <div className="resource-grid">
        {resourceDefinitions.map((resource) => (
          <div className="resource-card-v2" key={resource.name}>
            <span className="resource-icon">
              <i
                className={`fa-solid ${resource.name === "orders" ? "fa-receipt" : resource.name === "users" ? "fa-users" : resource.name === "products" ? "fa-box-open" : "fa-database"}`}
              ></i>
            </span>
            <div>
              <strong>{resource.label}</strong>
              <p>{resource.description}</p>
              <code>{resource.name}.json</code>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-card resource-actions-card">
        <div>
          <p className="eyebrow">Backup & recovery</p>
          <h2>Keep a copy of your store data.</h2>
          <p>
            Export includes products, orders and accounts. Import accepts a
            backup created by this console.
          </p>
        </div>
        <div className="resource-actions-v2">
          <button className="button button-dark" onClick={exportResources}>
            <i className="fa-solid fa-download"></i> Export JSON
          </button>
          <label className="button button-outline">
            <i className="fa-solid fa-upload"></i> Import JSON
            <input
              type="file"
              accept="application/json,.json"
              onChange={importResources}
              hidden
            />
          </label>
          <button className="button button-danger" onClick={resetData}>
            <i className="fa-solid fa-rotate-left"></i> Reset demo data
          </button>
        </div>
      </div>
    </section>
  );
}

function ProductModal({ editing, product, onClose, onSave }) {
  const [form, setForm] = useState(product);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <div
      className="admin-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="admin-modal product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <div className="admin-modal-header">
          <div>
            <p className="eyebrow">
              {editing ? "Catalog edit" : "New catalog item"}
            </p>
            <h2 id="product-modal-title">
              {editing ? "Edit product" : "Add a product"}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <form
          className="admin-modal-form"
          onSubmit={(event) => onSave(event, form, editing)}
        >
          <div className="product-form-grid">
            <label>
              Product name
              <input
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                required
                placeholder="e.g. Rose cloud balm"
              />
            </label>
            <label>
              Category
              <select
                value={form.category}
                onChange={(event) => update("category", event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Price (USD)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => update("price", event.target.value)}
                required
              />
            </label>
            <label>
              Stock quantity
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(event) => update("stock", event.target.value)}
                required
              />
            </label>
            <label>
              Collection tag
              <input
                value={form.tag}
                onChange={(event) => update("tag", event.target.value)}
                placeholder="New, Bestseller, Limited"
              />
            </label>
            <label>
              Product image
              <select
                value={form.image}
                onChange={(event) => update("image", event.target.value)}
              >
                {imageOptions.map((item) => (
                  <option key={item} value={item}>
                    {item.replace("/images/", "").replace(".png", "")}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Short description
            <input
              value={form.shortDescription}
              onChange={(event) =>
                update("shortDescription", event.target.value)
              }
              placeholder="One sentence for product cards"
            />
          </label>
          <label>
            Full description
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              rows="4"
              placeholder="Tell customers what makes this product special."
            ></textarea>
          </label>
          <div className="modal-form-footer">
            <span>
              <i className="fa-solid fa-circle-info"></i> Changes are saved to
              this browser workspace.
            </span>
            <div>
              <button
                type="button"
                className="button button-outline"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="button button-dark">
                {editing ? "Save changes" : "Add product"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

function OrderModal({ order, products, onClose, onStatusChange }) {
  const productMap = Object.fromEntries(
    products.map((product) => [product.id, product]),
  );
  return (
    <div
      className="admin-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="admin-modal order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        <div className="admin-modal-header">
          <div>
            <p className="eyebrow">
              Order details / {dateLabel(order.createdAt)}
            </p>
            <h2 id="order-modal-title">{order.id}</h2>
            <p className="modal-muted">
              {order.customer} · {order.email}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="order-detail-status">
          <div>
            <small>Current status</small>
            <StatusPill status={order.status} />
          </div>
          <label>
            Update status
            <select
              value={order.status}
              onChange={(event) => onStatusChange(order.id, event.target.value)}
            >
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="order-items-detail">
          {(order.items || []).map((item, index) => {
            const product = productMap[item.productId];
            return (
              <div
                className="order-detail-line"
                key={`${item.productId}-${index}`}
              >
                <img src={product?.image || "/images/Cream.png"} alt="" />
                <div>
                  <strong>
                    {item.name || product?.name || item.productId}
                  </strong>
                  <small>
                    {item.qty} × {money(item.price ?? product?.price)}
                  </small>
                </div>
                <b>
                  {money(
                    Number(item.price ?? product?.price ?? 0) *
                      Number(item.qty || 0),
                  )}
                </b>
              </div>
            );
          })}
        </div>
        <div className="order-totals">
          <span>
            <span>Subtotal</span>
            <strong>{money(order.subtotal ?? order.total)}</strong>
          </span>
          <span>
            <span>Shipping</span>
            <strong>
              {order.shipping ? money(order.shipping) : "Complimentary"}
            </strong>
          </span>
          <span className="total">
            <span>Total</span>
            <strong>{money(order.total)}</strong>
          </span>
        </div>
        <div className="order-meta-grid">
          <div>
            <small>Shipping address</small>
            <strong>
              {order.shippingAddress || order.address || "Not provided"}
            </strong>
          </div>
          <div>
            <small>Payment method</small>
            <strong>{order.paymentMethod || "Demo checkout"}</strong>
          </div>
        </div>
        <div className="modal-form-footer">
          <span className="modal-muted">
            Created {dateLabel(order.createdAt)}
            {order.updatedAt ? ` · Updated ${dateLabel(order.updatedAt)}` : ""}
          </span>
          <button className="button button-dark" onClick={onClose}>
            Done
          </button>
        </div>
      </section>
    </div>
  );
}
