import { useState, useEffect, useCallback } from "react";
import { authApi } from "../api/auth";
import type { AdminInfo } from "../api/auth";

export function useAuth() {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then((res: any) => {
        setAdmin(res.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res: any = await authApi.login({ username, password });
    localStorage.setItem('token', res.data.token);
    setAdmin(res.data.admin);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('token');
    setAdmin(null);
  }, []);

  return { admin, loading, login, logout, isAuthenticated: !!admin };
}
