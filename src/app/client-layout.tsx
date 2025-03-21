"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ConfigProvider, theme, App } from "antd";
import AppLayout from "@/component/shared/AppLayout";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/component/contexts/AuthContext";
import AuthGuard from "@/component/auth/AuthGuard";
import "leaflet/dist/leaflet.css";
import { Inter } from "next/font/google";
import { AppWrapper } from "./app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/auth";

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased ${inter.className}`}>
      <AppWrapper>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: "#1890ff",
              colorBgContainer: "#ffffff",
            },
          }}
        >
          <App>
            <AuthProvider>
              {isLoginPage ? (
                <AppLayout>{children}</AppLayout>
              ) : (
                <AuthGuard>
                  <AppLayout>{children}</AppLayout>
                </AuthGuard>
              )}
            </AuthProvider>
          </App>
        </ConfigProvider>
      </AppWrapper>
    </div>
  );
} 