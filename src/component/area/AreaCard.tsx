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
      message.success('Area deleted successfully');
      onDelete();
    } catch (error) {
      console.error('Error deleting area:', error);
      message.error('Failed to delete area');
    }
  };

  const getStatusColor = (status: string = 'default') => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'success';
      case 'in-use':
        return 'warning';
      case 'pending':
        return 'processing';
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
          title="Delete Area"
          description="Are you sure you want to delete this area?"
          onConfirm={handleDelete}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ]}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-semibold text-lg">{area.name || 'Unnamed Area'}</div>
          <div className="text-gray-500">{area.landPlot || 'No Land Plot'}</div>
        </div>
        <Tag color={getStatusColor(area.status)}>{area.status || 'Unknown'}</Tag>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-500">Area Name:</div>
        <div>{area.areaName || 'N/A'}</div>
        <div className="text-gray-500">Area:</div>
        <div>{area.area ? `${area.area} m²` : 'N/A'}</div>
        <div className="text-gray-500">Usage:</div>
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
  const router = useRouter();
  const { message } = App.useApp();

  const loadAreas = useCallback(async () => {
    try {
      console.log('Starting to fetch areas...');
      const data = await fetchAreas();
      console.log('Fetched areas:', data);
      setAreas(data || []);
      setError(null);
    } catch (error) {
      console.error('Error loading areas:', error);
      setError('Failed to load areas');
      message.error('Failed to load areas');
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
        <div className="text-gray-500">Loading...</div>
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
        <Button type="primary" onClick={() => router.push('/area/add')}>
          Add New Area
        </Button>
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