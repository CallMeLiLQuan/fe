"use client";

import { App, ConfigProvider } from 'antd';
import { ReactNode } from 'react';

export default function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider>
      <App>{children}</App>
    </ConfigProvider>
  );
}