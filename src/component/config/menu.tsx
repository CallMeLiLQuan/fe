// menu.tsx (hoặc menu.ts)
import React from "react";
import {
  HomeOutlined,
  PartitionOutlined,
  RadarChartOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

// 1. Interface gốc của bạn
interface MyMenu {
  key?: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  children?: MyMenu[];
  module?: string[];
  path?: string;
  action?: string[];
  roles?: string[];
}

// 2. Dữ liệu menu gốc
const myMenu: MyMenu[] = [
  {
    key: "/",
    label: "Trang chủ",
    icon: <HomeOutlined />,
    path: "/",
  },
  {
    key: "/region",
    label: "Quản lý vùng",
    icon: <RadarChartOutlined />,
    path: "/region",
  },
  {
    key: "land",
    label: "Quản lý đất",
    icon: <TeamOutlined />,
    module: ["land", "all"],
    children: [
      {
        key: "/view",
        label: "quản lý đất",
        path: "/land",
        module: ["land", "all"],
        action: ["view", "create", "update", "delete", "all"],
      },
      {
        key: "/land/add",
        label: "Thêm đất",
        path: "/land/add",
        module: ["employees", "all"],
        action: ["create", "update", "delete", "all"],
      }
    ],
  },
  {
    key: "area",
    label: "Quản lý khu vực",
    icon: <PartitionOutlined />,
    module: ["area", "all"],
    children: [
      {
        key: "/area",
        label: "Danh sách khu vực",
        path: "/area",
        module: ["area", "all"],
        action: ["view", "create", "update", "delete", "all"],
      },
      {
        key: "/area/add",
        label: "Thêm khu vực",
        path: "/area/add",
        module: ["area", "all"],
        action: ["create", "all"],
      }
    ],
  },
  {
    key: "/owner",
    label: "Quản lý chủ sở hữu",
    icon: <UserAddOutlined />,
    module: ["owner"],
    path: "/owner",
  },
  {
    key: "/assets",
    label: "Quản lý cây trồng ",
    icon: <UserAddOutlined />,
    module: ["assets", "all"],
    path: "/assets",
  },
  {
    key: "/employees",
    label: "Quản lý nhân sự",
    icon: <TeamOutlined />,
    module: ["employees", "all"],
  },
  {
    key: "/task",
    label: "Quản lý công việc",
    icon: <SolutionOutlined />,
    module: ["task", "all"],
  },
];

// 3. Hàm đệ quy chuyển từ MyMenu[] → MenuProps["items"]
function transformMenu(items: MyMenu[]): MenuProps["items"] {
  return items.map((item) => {
    // Dùng path hoặc key để đảm bảo luôn có key
    const menuKey = item.path || item.key;
    if (!menuKey) {
      throw new Error("Menu item key is required");
    }

    // Nếu có children, chuyển đệ quy và tạo SubMenu
    if (item.children && item.children.length > 0) {
      return {
        key: menuKey,
        label: item.label,
        icon: item.icon,
        children: transformMenu(item.children),
      };
    }

    // Trường hợp không có children, tạo MenuItem
    return {
      key: menuKey,
      label: item.label,
      icon: item.icon,
    };
  });
}

// 4. Xuất ra mảng menuItems cho AppLayout
export const menuItems: MenuProps["items"] = transformMenu(myMenu);

export default menuItems;
