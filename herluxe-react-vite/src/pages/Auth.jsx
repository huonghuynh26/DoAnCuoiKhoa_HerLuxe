import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../components/AuthContext";
import { getUsers, saveUsers } from "../resources/mockStore";
import { fetchUsersResource, replaceUsersResource } from "../resources/api";

export default function Auth({ register = false }) {
  const [isRegister, setIsRegister] = useState(register);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const notice = params.get("notice");
  const redirect = params.get("redirect") || "/";
  const update = (key, value) => setForm({ ...form, [key]: value });
  const getUsersForAuth = async () => {
    const localUsers = getUsers();
    try {
      const remoteUsers = await fetchUsersResource();
      if (remoteUsers.length) {
        const localByEmail = new Map(localUsers.map((user) => [user.email?.toLowerCase(), user]));
        const mergedUsers = remoteUsers.map((remoteUser) => {
          const localUser = localByEmail.get(remoteUser.email?.toLowerCase());
          return { ...localUser, ...remoteUser, password: remoteUser.password || localUser?.password };
        });
        const remoteEmails = new Set(mergedUsers.map((user) => user.email?.toLowerCase()));
        const withLocalDemoAccounts = [...mergedUsers, ...localUsers.filter((user) => !remoteEmails.has(user.email?.toLowerCase()))];
        saveUsers(withLocalDemoAccounts);
        return withLocalDemoAccounts;
      }
    } catch {
      // Local resource remains the fallback when the Postman/MindX endpoint is unavailable.
    }
    return localUsers;
  };
  const submit = async (event) => {
    event.preventDefault();
    setWorking(true);
    setMessage("Checking account...");
    try {
      const users = await getUsersForAuth();
      if (isRegister) {
        if (users.some((user) => user.email?.toLowerCase() === form.email.toLowerCase())) {
          setMessage("This email is already registered.");
          return;
        }
        const newUser = { id: `user-${Date.now()}`, name: form.name, email: form.email, phone: form.phone, password: form.password, role: "customer" };
        const nextUsers = [...users, newUser];
        saveUsers(nextUsers);
        try { await replaceUsersResource(nextUsers); } catch { /* Keep the local resource usable if the remote API rejects PUT. */ }
        signIn(newUser);
        setMessage("Account created. Welcome to HerLuxe.");
        setTimeout(() => navigate(redirect), 550);
      } else {
        const foundUser = users.find((user) => user.email?.toLowerCase() === form.email.toLowerCase() && user.password === form.password);
        if (!foundUser) { setMessage("Invalid email or password."); return; }
        const normalizedUser = { ...foundUser, role: foundUser.role === "admin" ? "admin" : "customer" };
        signIn(normalizedUser);
        setMessage(normalizedUser.role === "admin" ? "Welcome to the admin console." : "Welcome back to HerLuxe.");
        setTimeout(() => navigate(normalizedUser.role === "admin" ? "/admin" : redirect), 550);
      }
    } catch (error) {
      setMessage(error.message || "Unable to connect. Please try again.");
    } finally {
      setWorking(false);
    }
  };
  return <div className="page auth-page"><Header /><main className={isRegister ? "register-section" : "login-section"}><form className={isRegister ? "register-form" : "login-form"} onSubmit={submit}><h1>{isRegister ? "Create an account" : "Welcome back"}</h1>{notice === "signin" && !isRegister && <p className="auth-notice">Please sign in before adding items to your bag.</p>}{notice === "admin" && !isRegister && <p className="auth-notice">The admin console is restricted to admin accounts.</p>}{message && <p className={`auth-message ${message.includes("Invalid") || message.includes("already") || message.includes("Unable") ? "error" : "success"}`}>{message}</p>}{isRegister && <div className="form-group"><label>Full name</label><input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" /></div>}<div className="form-group"><label>Email address</label><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="name@mail.com" /></div>{isRegister && <div className="form-group"><label>Phone number</label><input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="000-000-000" /></div>}<div className="form-group password-group"><label>Password</label><div className="password-box"><input required type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Password" /><button type="button" onClick={() => setShowPassword(!showPassword)}><i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i></button></div></div><button disabled={working} className={isRegister ? "register-button" : "login-button"}>{working ? "Please wait..." : isRegister ? "Create my account" : "Sign in"}</button><p className={isRegister ? "login-text" : "register-text"}>{isRegister ? "Already have an account?" : "New to HerLuxe?"} <button type="button" onClick={() => { setIsRegister(!isRegister); setMessage(""); }}>{isRegister ? "Sign in" : "Create an account"}</button></p></form><div className={isRegister ? "register-card" : "login-card"}><div className="card-border"><div className={isRegister ? "logo-register-card" : "logo-login-card"}><img src="/images/logo3.png" alt="HerLuxe" /></div><h2>Welcome</h2><p>Discover your beauty</p><div className="social-icons"><a href="https://facebook.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-facebook-f"></i></a><a href="https://instagram.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-instagram"></i></a><a href="https://youtube.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-youtube"></i></a></div></div></div></main><Footer /></div>;
}
