import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthCtx = {
  token: string | null;
  user: any | null;
  setAuth: (token: string | null, user: any | null) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: any }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("auth_token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    const url = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";
    fetch(`${url}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setUser)
      .catch(() => setUser(null));
  }, [token]);

  const setAuth = (t: string | null, u: any | null) => {
    if (t) localStorage.setItem("auth_token", t); else localStorage.removeItem("auth_token");
    if (u && (u as any).csrfToken) localStorage.setItem("csrf_token", (u as any).csrfToken); else localStorage.removeItem("csrf_token");
    setToken(t);
    setUser(u);
  };

  const value = useMemo(() => ({ token, user, setAuth }), [token, user]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function Authenticated({ children }: { children: any }) {
  const ctx = useContext(Ctx)!;
  if (!ctx || !ctx.token) return null;
  return children;
}

export function Unauthenticated({ children }: { children: any }) {
  const ctx = useContext(Ctx)!;
  if (ctx && ctx.token) return null;
  return children;
}

export function useAuth() {
  const ctx = useContext(Ctx)!;
  return { isAuthenticated: !!ctx?.token, user: ctx?.user };
}

export function useAuthActions() {
  const ctx = useContext(Ctx)!;
  const url = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";
  const signIn = async (provider: "password" | "anonymous", formData?: FormData) => {
    if (provider === "anonymous") {
      const r = await fetch(`${url}/api/auth/anonymous`, { method: "POST" });
      const data = await r.json();
      ctx.setAuth(data.token, data);
      return;
    }
    const body: any = {};
    if (formData) {
      body.email = formData.get("email");
      body.password = formData.get("password");
      body.flow = formData.get("flow") || "signIn";
    }
    const r = await fetch(`${url}/api/auth/sign-in`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.error || "Sign in failed");
    }
    const data = await r.json();
    ctx.setAuth(data.token, data);
  };
  const signOut = async () => {
    ctx.setAuth(null, null);
  };
  return { signIn, signOut };
}