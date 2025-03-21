"use client";

import { usePathname } from "next/navigation";
import { ConfigProvider, theme, App as AntdApp } from "antd";
import AppLayout from "@/component/shared/AppLayout";
import { AuthProvider } from "@/component/contexts/AuthContext";
import AuthGuard from "@/component/auth/AuthGuard";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/auth";

  return (
    <>
      <title>Quản lý đất</title>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: "#1890ff",
            colorBgContainer: "#ffffff",
          },
        }}
      >
        <AntdApp>
          <AuthProvider>
            {isLoginPage ? (
              <AppLayout>{children}</AppLayout>
            ) : (
              <AuthGuard>
                <AppLayout>{children}</AppLayout>
              </AuthGuard>
            )}
          </AuthProvider>
        </AntdApp>
      </ConfigProvider>
    </>
  );
}