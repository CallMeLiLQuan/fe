"use client";

import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { fetchLands, deleteLand } from '@/service/land.service';
import type { Land } from '@/model/land.model';

export default function LandList() {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [modal, contextHolder] = Modal.useModal();

  useEffect(() => {
    loadLands();
  }, []);

  const loadLands = async () => {
    try {
      setLoading(true);
      const data = await fetchLands();
      setLands(data);
    } catch (error) {
      console.error('Error loading lands:', error);
      message.error('Không thể tải danh sách khu đất');
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (id: number) => {
    modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa khu đất này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteLand(id);
          message.success('Xóa khu đất thành công');
          loadLands();
        } catch (error) {
          console.error('Error deleting land:', error);
          message.error('Không thể xóa khu đất');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Diện tích (m²)',
      dataIndex: 'area',
      key: 'area',
    },
    {
      title: 'Giá trị',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
    {
      title: 'Chủ sở hữu',
      dataIndex: ['owner', 'name'],
      key: 'ownerName',
    },
    {
      title: 'Vùng',
      dataIndex: ['region', 'name'],
      key: 'regionName',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Land) => (
        <Space size="middle">
          <Button type="primary" onClick={() => router.push(`/land/${record.id}`)}>
            Chi tiết
          </Button>
          <Button type="primary" onClick={() => router.push(`/land/edit/${record.id}`)}>
            Sửa
          </Button>
          <Button type="primary" danger onClick={() => showDeleteConfirm(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {contextHolder}
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => router.push('/land/add')}>
          Thêm khu đất mới
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={lands}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
}