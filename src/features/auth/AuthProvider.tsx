"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { getUserData } from "@/services/authService";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
