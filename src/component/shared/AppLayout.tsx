"use client";

import React, { useEffect, useState } from "react";
import { Layout, Menu as AntdMenu, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import menuItems from "../config/menu";
import { useAuth } from "../contexts/AuthContext";

const { Header, Sider, Content } = Layout;

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  // State để quản lý collapsed của sider và kiểm tra thiết bị di động
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      // Nếu chiều rộng màn hình nhỏ hơn 768px, coi như đang trên mobile
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setCollapsed(true);
      } else {
        setIsMobile(false);
        setCollapsed(false);
      }
    };

    // Kiểm tra ngay khi component mount
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Nếu đường dẫn chứa "auth", render layout riêng không có sidebar
  if (pathname.includes("auth")) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
          }}
        ></Header>
        <Content
          style={{ margin: "16px", padding: "24px", background: "#fff" }}
        >
          {children}
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        breakpoint="md" // breakpoint cho mobile
        onBreakpoint={(broken) => setCollapsed(broken)}
      >
        <div
          className="logo"
          style={{
            color: "white",
            textAlign: "center",
            padding: "16px",
            fontSize: isMobile ? "14px" : "18px",
          }}
        >
          Quản lý đất
        </div>
        <AntdMenu
          theme="dark"
          mode="inline"
          items={menuItems}
          selectedKeys={[pathname]}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", marginRight: "16px" }}
          />
          {/* Nút Dashboard hiển thị trên mobile */}
          {isMobile && (
            <Button
              type="default"
              onClick={() => router.push("/dashboard")}
              style={{ marginRight: "16px" }}
            >
              Dashboard
            </Button>
          )}
          <div style={{ flex: 1 }} />
          <Button
            type="primary"
            onClick={() => {
              logout();
              router.push("/auth/login");
            }}
          >
            Logout
          </Button>
        </Header>
        <Content
          style={{ margin: "16px", padding: "24px", background: "#fff" }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
