import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();
        if (mounted) setUser(response.ok ? data.user || null : null);
      } catch {
        if (mounted) setUser(null);
      }
    }
    loadUser();
    window.addEventListener("auth-user-updated", loadUser);
    return () => {
      mounted = false;
      window.removeEventListener("auth-user-updated", loadUser);
    };
  }, []);

  return user; // undefined | null | { id, email, name }
}