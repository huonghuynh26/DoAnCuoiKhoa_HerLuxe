import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { CartProvider } from "./components/CartContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Auth from "./pages/Auth";
import Collections from "./pages/Collections";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

function RequireAuth({ children }) { const { isAuthenticated } = useAuth(); const location = useLocation(); return isAuthenticated ? children : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}&notice=signin`} replace />; }
function RequireCustomer({ children }) { const { isCustomer } = useAuth(); const location = useLocation(); return isCustomer ? children : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}&notice=signin`} replace />; }
function RequireAdmin({ children }) { const { isAdmin } = useAuth(); return isAdmin ? children : <Navigate to="/login?notice=admin" replace />; }
function NotFound() { return <main className="empty-state"><h1>404</h1><p>We could not find that page.</p><a className="button button-dark" href="/">Back home</a></main>; }

export default function App() { return <BrowserRouter><AuthProvider><CartProvider><Routes><Route path="/" element={<Home />} /><Route path="/home.html" element={<Navigate to="/" replace />} /><Route path="/index.html" element={<Navigate to="/" replace />} /><Route path="/products" element={<Products />} /><Route path="/products.html" element={<Navigate to="/products" replace />} /><Route path="/cart" element={<RequireCustomer><Cart /></RequireCustomer>} /><Route path="/cart.html" element={<Navigate to="/cart" replace />} /><Route path="/about" element={<About />} /><Route path="/about.html" element={<Navigate to="/about" replace />} /><Route path="/contact" element={<Contact />} /><Route path="/contact.html" element={<Navigate to="/contact" replace />} /><Route path="/faq" element={<FAQ />} /><Route path="/faq.html" element={<Navigate to="/faq" replace />} /><Route path="/login" element={<Auth />} /><Route path="/login.html" element={<Navigate to="/login" replace />} /><Route path="/register" element={<Auth register />} /><Route path="/register.html" element={<Navigate to="/register" replace />} /><Route path="/collections" element={<Collections />} /><Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} /><Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} /><Route path="*" element={<NotFound />} /></Routes></CartProvider></AuthProvider></BrowserRouter>; }
