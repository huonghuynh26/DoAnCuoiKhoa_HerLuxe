import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../components/AuthContext";

export default function Profile() {
  const { user, updateProfile, signOut } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const submit = (event) => { event.preventDefault(); updateProfile(form); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  const logout = () => { signOut(); navigate("/"); };
  return <div className="page profile-page"><Header /><main className="profile-main"><div className="profile-heading"><p className="eyebrow">Your account</p><h1>Profile & preferences</h1><p>Keep your personal details up to date for a smoother HerLuxe experience.</p></div><div className="profile-layout"><aside className="profile-identity"><div className="profile-avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</div><h2>{user?.name}</h2><p>{user?.email}</p><span className="profile-role">{user?.role}</span>{user?.role === "admin" && <Link className="profile-admin-link" to="/admin">Open admin console</Link>}<button className="profile-signout" onClick={logout}>Sign out</button></aside><form className="profile-form" onSubmit={submit}><div className="profile-form-heading"><div><p className="eyebrow">Personal details</p><h2>Account information</h2></div>{saved && <span className="saved-note">Saved</span>}</div><label>Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label><label>Email address<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required /></label><label>Phone number<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><button className="button button-dark">Save changes</button></form></div></main><Footer /></div>;
}
