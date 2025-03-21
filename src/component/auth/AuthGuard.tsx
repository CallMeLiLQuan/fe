"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 1) Log mỗi lần AuthGuard render
  console.log("[AuthGuard Render]", { isAuthenticated, pathname });

  useEffect(() => {
    // 2) Log khi useEffect chạy
    console.log("[AuthGuard useEffect]", { isAuthenticated, pathname });

    if (!isAuthenticated && pathname !== "/auth") {
      router.push("/auth");
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated && pathname !== "/auth") {
    return <p>Đang chuyển hướng...</p>;
  }

  return <>{children}</>;
};

export default AuthGuard;
