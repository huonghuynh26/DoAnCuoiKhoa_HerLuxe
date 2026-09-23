import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearCurrentUser, getCurrentUser, getUsers, saveCurrentUser, saveUsers } from "../resources/mockStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());

  useEffect(() => {
    const refresh = () => setUser(getCurrentUser());
    window.addEventListener("herluxe-auth-change", refresh);
    window.addEventListener("herluxe-resource-reset", refresh);
    return () => {
      window.removeEventListener("herluxe-auth-change", refresh);
      window.removeEventListener("herluxe-resource-reset", refresh);
    };
  }, []);

  const signIn = (nextUser) => {
    saveCurrentUser(nextUser);
    setUser(nextUser);
  };

  const signOut = () => {
    clearCurrentUser();
    setUser(null);
  };

  const updateProfile = (changes) => {
    if (!user) return null;
    const nextUser = { ...user, ...changes };
    saveCurrentUser(nextUser);
    const users = getUsers();
    const nextUsers = users.some((item) => item.id === user.id)
      ? users.map((item) => item.id === user.id ? nextUser : item)
      : [...users, nextUser];
    saveUsers(nextUsers);
    setUser(nextUser);
    return nextUser;
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    isCustomer: user?.role === "customer",
    signIn,
    signOut,
    updateProfile,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
