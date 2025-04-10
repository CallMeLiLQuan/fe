"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input, Tag, Popconfirm } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { fetchAreas, deleteArea } from "@/service/area.service";
import { useRouter } from "next/navigation";
import { Area } from "@/model/area.model";
import { App } from 'antd';

const { Search } = Input;

interface AreaCardProps {
  area: Area;
  onDelete: () => void;
}

function AreaCard({ area, onDelete }: AreaCardProps) {
  const router = useRouter();
  const { message } = App.useApp();

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/area/${area.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/area/edit/${area.id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteArea(area.id);
      message.success('Xóa mảnh đất thành công');
      onDelete();
    } catch (error) {
      console.error('Lỗi xóa mảnh đất:', error);
      message.error('Xóa mảnh đất thất bại');
    }
  };

  const getStatusColor = (status: string = 'default') => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'Hoàn thành';
      case 'in-use':
        return 'Đang sử dụng';
      case 'pending':
        return 'Đang chờ';
      default:
        return 'default';
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow"
      actions={[
        <Button key="view" type="primary" icon={<EyeOutlined />} onClick={handleView}>
          View
        </Button>,
        <Button key="edit" type="text" icon={<EditOutlined />} onClick={handleEdit}>
          Edit
        </Button>,
        <Popconfirm
          key="delete"
          title="Xóa mảnh đất"
          description="Bạn có chắc chắn muốn xóa mảnh đất này không?"
          onConfirm={handleDelete}
          okText="Có"
          cancelText="Không"
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ]}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-semibold text-lg">{area.name || 'Tên mảnh đất'}</div>
          <div className="text-gray-500">{area.landPlot || 'Không có mảnh đất'}</div>
        </div>
        <Tag color={getStatusColor(area.status)}>{area.status || 'Không xác định'}</Tag>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-500">Tên mảnh đất:</div>
        <div>{area.areaName || 'N/A'}</div>
        <div className="text-gray-500">Diện tích:</div>
        <div>{area.area ? `${area.area} ha` : 'N/A'}</div>
        <div className="text-gray-500">Mục đích sử dụng:</div>
        <div>{area.usage || 'N/A'}</div>
      </div>
    </Card>
  );
}

export default function AreaCardList() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { message } = App.useApp();

  const loadAreas = useCallback(async () => {
    try {
      console.log('Starting to fetch areas...');
      const data = await fetchAreas();
      console.log('Fetched areas:', data);
      setAreas(data || []);
      setError(null);
    } catch (error) {
      console.error('Lỗi tải mảnh đất:', error);
      setError('Không tải được mảnh đất');
      message.error('Không tải được mảnh đất');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  const filteredAreas = areas.filter(area =>
    area.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.areaName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.landPlot?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Search
          placeholder="Search by area name..."
          style={{ width: 300 }}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredAreas.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {searchTerm ? 'No areas found matching your search' : 'No areas found'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAreas.map(area => (
            <AreaCard 
              key={area.id} 
              area={area} 
              onDelete={loadAreas}
            />
          ))}
        </div>
      )}
    </div>
  );
}