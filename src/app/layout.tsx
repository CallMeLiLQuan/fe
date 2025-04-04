import "./globals.css";
import "leaflet/dist/leaflet.css";
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import { Inter } from 'next/font/google';
import ClientLayout from "./client-layout";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
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
          <AntdApp>
            <ClientLayout>{children}</ClientLayout>
          </AntdApp>
        </ConfigProvider>
      </body>
    </html>
  );
}
