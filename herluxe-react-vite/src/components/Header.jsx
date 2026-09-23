import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";

export default function Header() {
  const { count } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const submitSearch = (event) => { event.preventDefault(); if (query.trim()) navigate(`/products?search=${encodeURIComponent(query.trim())}`); };
  const nav = [["New arrivals", "/#new-arrivals"], ["Makeup", "/products?category=Makeup"], ["Skincare", "/products?category=Skincare"], ["Best sellers", "/products?tag=Bestseller"], ["About us", "/about"]];
  const logout = () => { signOut(); navigate("/"); setMenuOpen(false); };
  return <div className="hl-header-wrapper"><div className="hl-announcement-bar"><p>{isAdmin ? "Admin workspace · Inventory and account management" : "Free shipping on orders over $50 · Beauty, made personal"}</p></div><header className="hl-site-header"><div className="hl-header-shell"><Link className="hl-brand" to={isAdmin ? "/admin" : "/"} aria-label="HerLuxe home"><img src="/images/logo4.png" alt="HerLuxe Logo" /></Link><button className="hl-menu-toggle" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span></span><span></span><span></span><span className="sr-only">Open menu</span></button><nav className={`hl-primary-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">{isAdmin ? <><Link to="/admin" onClick={() => setMenuOpen(false)}>Admin console</Link><Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link></> : nav.map(([label, href]) => href.startsWith("/#") ? <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a> : <Link key={label} to={href} onClick={() => setMenuOpen(false)}>{label}</Link>)}</nav><div className="hl-header-actions">{!isAdmin && <div className={`hl-inline-search ${searchOpen ? "is-open" : ""}`}><form className="hl-search-expandable" onSubmit={submitSearch}><input value={query} onChange={(e) => setQuery(e.target.value)} type="text" placeholder="Search beauty..." autoComplete="off" />{query && <button className="hl-search-clear" type="button" onClick={() => setQuery("")} aria-label="Clear search"><i className="fa-solid fa-xmark"></i></button>}</form><button className="hl-icon-btn" type="button" onClick={() => setSearchOpen(!searchOpen)} aria-label="Open search"><i className="fa-solid fa-magnifying-glass search-icon"></i><i className="fa-solid fa-xmark close-icon"></i></button></div>}<Link className="hl-icon-link" to="/profile" aria-label="Profile"><i className={`fa-regular ${user ? "fa-user" : "fa-circle-user"}`}></i></Link>{!isAdmin && <Link className="hl-icon-link cart-link" to="/cart" aria-label="Shopping bag"><i className="fa-solid fa-bag-shopping"></i><span className="hl-cart-count">{count}</span></Link>}{user ? <button className="hl-signin-link hl-logout-link" onClick={logout}>{isAdmin ? "Sign out" : user.name || "Profile"}</button> : <Link className="hl-signin-link" to="/login">Sign in</Link>}</div></div></header></div>;
}
