"use client";

import React from "react";
import { App } from "antd";
import { AssetProvider } from "@/component/contexts/AssetContext";
import AssetTable from "@/component/asset/AssetTable";

export default function Page() {
  return (
    <App>
      <AssetProvider>
        <AssetTable />
      </AssetProvider>
    </App>
  );
}
