"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  Asset,
  fetchAssets,
  createAsset,
  updateAsset as updateAssetApi,
  deleteAsset,
} from "@/service/asset.service";

interface AssetContextType {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  loadAssets: () => Promise<void>;
  addAsset: (asset: Omit<Asset, "id">) => Promise<Asset | null>;
  updateAsset: (id: number, asset: Partial<Asset>) => Promise<Asset | null>;
  removeAsset: (id: number) => Promise<boolean>;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const useAssets = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error("useAssets must be used within an AssetProvider");
  }
  return context;
};

interface AssetProviderProps {
  children: React.ReactNode;
}

export const AssetProvider: React.FC<AssetProviderProps> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAssets();
      setAssets(data);
    } catch (err) {
      console.error("Error loading assets:", err);
      setError("Không thể tải danh sách tài sản");
    } finally {
      setLoading(false);
    }
  }, []);

  const addAsset = useCallback(async (asset: Omit<Asset, "id">) => {
    try {
      setLoading(true);
      setError(null);
      const newAsset = await createAsset(asset);
      setAssets((prev) => [...prev, newAsset]);
      return newAsset;
    } catch (err) {
      console.error("Error adding asset:", err);
      setError("Không thể thêm tài sản mới");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAsset = useCallback(async (id: number, asset: Partial<Asset>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedAsset = await updateAssetApi(id, asset);
      setAssets((prev) =>
        prev.map((item) => (item.id === id ? updatedAsset : item))
      );
      return updatedAsset;
    } catch (err) {
      console.error("Error updating asset:", err);
      setError("Không thể cập nhật tài sản");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeAsset = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await deleteAsset(id);
      setAssets((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error("Error removing asset:", err);
      setError("Không thể xóa tài sản");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    assets,
    loading,
    error,
    loadAssets,
    addAsset,
    updateAsset,
    removeAsset,
  };

  return (
    <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
  );
};

export default AssetContext; 