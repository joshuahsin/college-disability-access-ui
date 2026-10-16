import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, register as apiRegister, me as apiMe } from "../api/auth";
import { tokenStore } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => tokenStore.getUsername());
  const [isStaff, setIsStaff] = useState(false);

  // On a fresh page load with an existing session, re-derive `isStaff` from
  // the server rather than trusting anything persisted client-side.
  useEffect(() => {
    if (!tokenStore.getAccess()) return;
    apiMe()
      .then((me) => setIsStaff(me.is_staff))
      .catch(() => {});
  }, []);

  const login = useCallback(async (name, password) => {
    const { access, refresh } = await apiLogin(name, password);
    tokenStore.set(access, refresh, name);
    setUsername(name);
    const me = await apiMe();
    setIsStaff(me.is_staff);
  }, []);

  const register = useCallback(
    async (name, password) => {
      await apiRegister(name, password);
      await login(name, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUsername(null);
    setIsStaff(false);
  }, []);

  const value = useMemo(
    () => ({ username, isAuthenticated: !!username, isStaff, login, register, logout }),
    [username, isStaff, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
