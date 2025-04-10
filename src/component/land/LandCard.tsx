"use client";

import React, { useState, useEffect } from 'react';
import { Card, Space, Button, Modal, message, Form, Input, InputNumber, Popconfirm } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { fetchLands, deleteLand, createLand } from '@/service/land.service';
import type { Land } from '@/model/land.model';
import { DatabaseCoordinates, createDefaultCoordinates } from '@/model/coordinate.model';

interface LandFormValues {
  name: string;
  address: string;
  area: number;
  price: number;
  location: string;
  coordinate: DatabaseCoordinates;
  properties: Array<{ key: string; value: string | number | boolean }>;
  ownerId: number;
  regionId: number;
}

export default function LandCardList() {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
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
      console.error('Lỗi tải danh sách khu đất:', error);
      message.error('Không thể tải danh sách khu đất');
        } finally {
          setLoading(false);
        }
      };

  const handleAddNew = async (values: Partial<LandFormValues>) => {
    try {
      const newLand = await createLand({
        name: values.name || '',
        address: values.address || '',
        area: values.area || 0,
        price: values.price || 0,
        location: values.location || '',
        properties: [],
        coordinate: createDefaultCoordinates(),
        ownerId: values.ownerId || 0,
        regionId: values.regionId || 0
      });

      setLands(prev => [...prev, newLand]);
      message.success('Thêm khu đất mới thành công');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Lỗi tạo khu đất:', error);
      message.error('Không thể tạo khu đất mới');
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

  return (
    <div className="p-6">
      {contextHolder}
      <div className="mb-6">
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Thêm khu đất mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          lands.map(land => (
            <Card
              key={land.id} 
              actions={[
                <Button key="view" type="primary" onClick={() => router.push(`/land/${land.id}`)}>
                  View
                </Button>,
                <Button key="edit" onClick={() => router.push(`/land/edit/${land.id}`)}>
                  Edit
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Bạn có chắc chắn muốn xóa?"
                  onConfirm={() => showDeleteConfirm(land.id)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button danger>
                    Delete
                  </Button>
                </Popconfirm>
              ]}
            >
              <div>
                <div className="text-lg font-medium mb-4">{land.name}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Địa chỉ:</div>
                  <div>{land.address}</div>
                  <div className="text-gray-500">Diện tích:</div>
                  <div>{land.area} ha</div>
                  <div className="text-gray-500">Giá trị:</div>
                  <div>{land.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                  <div className="text-gray-500">Chủ sở hữu:</div>
                  <div>{land.owner?.name}</div>
                  <div className="text-gray-500">Vùng:</div>
                  <div>{land.region?.name}</div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        title="Thêm khu đất mới"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddNew}
        >
          <Form.Item
            name="name"
            label="Tên khu đất"
            rules={[{ required: true, message: 'Vui lòng nhập tên khu đất!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="area"
            label="Diện tích (ha)"
            rules={[{ required: true, message: 'Vui lòng nhập diện tích!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá trị"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={() => 0}
            />
          </Form.Item>
          <Form.Item
            name="location"
            label="Vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Tạo mới
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}