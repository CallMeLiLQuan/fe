"use client";
import { Spin } from 'antd';
import { Suspense } from 'react';
import RegionCardList from "@/component/region/RegionCard";
import ErrorBoundary from '@/component/ErrorBoundary';

export default function RegionPage() {
  return (
    <ErrorBoundary fallback={<div className="text-center p-8 text-red-500">Something went wrong</div>}>
      <Suspense fallback={<div className="flex justify-center p-8"><Spin size="large" /></div>}>
        <RegionCardList />
      </Suspense>
    </ErrorBoundary>
  );
}