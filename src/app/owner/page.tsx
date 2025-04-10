"use client";
import OwnerTable from "@/component/owner/OwnerTable";
import React from "react";
import { App } from "antd";

const OwnerPage: React.FC = () => {
  return (
    <App>
      <div style={{ padding: 24 }}>
        <h1>Quản lý chủ đất</h1>
        <OwnerTable />
      </div>
    </App>
  );
};

export default OwnerPage;
