import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import ClientLayout from "./client-layout";
import { ConfigProvider, theme } from 'antd';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Quản lý đất",
  description: "System for managing land and areas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: '#1890ff',
            },
          }}
        >
          <ClientLayout>{children}</ClientLayout>
        </ConfigProvider>
      </body>
    </html>
  );
}
