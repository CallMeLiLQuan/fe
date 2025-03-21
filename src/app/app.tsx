"use client";

import React from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <ConfigProvider>
      <AntdApp>
        {children}
      </AntdApp>
    </ConfigProvider>
  );
} 