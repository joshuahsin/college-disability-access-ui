import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { login as apiLogin, register as apiRegister } from "../api/auth";
import { tokenStore } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => tokenStore.getUsername());

  const login = useCallback(async (name, password) => {
    const { access, refresh } = await apiLogin(name, password);
    tokenStore.set(access, refresh, name);
    setUsername(name);
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
  }, []);

  const value = useMemo(
    () => ({ username, isAuthenticated: !!username, login, register, logout }),
    [username, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
