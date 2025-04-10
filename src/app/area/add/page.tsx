"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, InputNumber, Card, Space, Modal, Tabs, App } from 'antd';
import { useRouter } from 'next/navigation';
import { createArea } from '@/service/area.service';
import { fetchLands, createLand } from '@/service/land.service';
import type { Land } from '@/model/land.model';
import { createDefaultCoordinates, DatabaseCoordinates } from "@/model/coordinate.model";
import dynamic from 'next/dynamic';
import { PlusOutlined } from '@ant-design/icons';
import { AreaClassification } from '@/model/area.model';
import type { Point } from '@/model/coordinate.model';

const Map = dynamic(() => import('@/component/map/MapDrawer'), { ssr: false });

interface AddLandFormValues {
  name: string;
  address: string;
  area: number;
  price: number;
  location: string;
}

interface AreaFormValues {
  name: string;
  areaName: string;
  status: 'available' | 'in-use' | 'pending';
  area: number;
  usage: string;
  landId: number;
  classification: AreaClassification;
  coordinates: {
    polygon: [number, number][];
    center: Point;
    zoom: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculateAreaInHectares = (polygon: [number, number][]): number => {
  if (!polygon || polygon.length < 3) return 0;
  
  // Calculate area using the Shoelace formula
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i][0] * polygon[j][1];
    area -= polygon[j][0] * polygon[i][1];
  }
  area = Math.abs(area) / 2;
  
  // Convert square degrees to hectares (approximate conversion)
  // 1 degree ≈ 111.32 km at the equator
  return area * Math.pow(111.32 * 1000, 2) / 10000;
};

export default function AddArea() {
  const { message } = App.useApp();
  const [form] = Form.useForm<AreaFormValues>();
  const [landForm] = Form.useForm();
  const router = useRouter();
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddLandModalVisible, setIsAddLandModalVisible] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState<DatabaseCoordinates>(createDefaultCoordinates());

  useEffect(() => {
    const loadLands = async () => {
      try {
        const data = await fetchLands();
        setLands(data);
      } catch (error) {
        console.error('Failed to load lands:', error);
        message.error('Failed to load lands');
      }
    };
    loadLands();
  }, [message]);

  const handleCoordinatesUpdate = (newCoordinates: DatabaseCoordinates) => {
    setSelectedCoordinate(newCoordinates);
  };

  const handleCenterChange = (value: string) => {
    const [lat, lng] = value.split(',').map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      const newCoordinates = {
        ...selectedCoordinate,
        center: { lat, lng }
      };
      setSelectedCoordinate(newCoordinates);
    }
  };

  const handleAddLand = async (values: AddLandFormValues) => {
    try {
      setLoading(true);
      const newLand = await createLand({
        name: values.name,
        address: values.address,
        area: Number(values.area),
        price: Number(values.price),
        location: values.location,
        properties: [
          { key: "Mặt tiền", value: "0m" },
          { key: "Chiều dài", value: 0 },
          { key: "Hướng", value: "Chưa xác định" },
          { key: "Sổ đỏ", value: false }
        ],
        coordinate: {
          polygon: selectedCoordinate.polygon,
          center: selectedCoordinate.center,
          zoom: selectedCoordinate.zoom
        },
        ownerId: 1, // Default owner ID
        regionId: 1, // Default region ID
        planningMapUrl: '',
        googleMapUrl: `https://maps.google.com/?q=${selectedCoordinate.center.lat},${selectedCoordinate.center.lng}`
      });
      setLands(prev => [...prev, newLand]);
      message.success('Land created successfully');
      setIsAddLandModalVisible(false);
      landForm.resetFields();
    } catch (error) {
      console.error('Error creating land:', error);
      message.error('Failed to create land');
    } finally {
      setLoading(false);
    }
  };

  const handleLandSelect = (landId: number) => {
    const selectedLand = lands.find(land => land.id === landId);
    if (selectedLand) {
      form.setFieldValue('landId', landId);
    }
  };

  const onFinish = async (values: AreaFormValues) => {
    setLoading(true);
    try {
      if (!selectedCoordinate.polygon || selectedCoordinate.polygon.length < 3) {
        throw new Error('Please draw a polygon with at least 3 points on the map');
      }

      if (!values.landId) {
        message.error('Please select a land');
        setLoading(false);
        return;
      }

      const selectedLand = lands.find(land => land.id === values.landId);
      if (!selectedLand) {
        throw new Error('Selected land not found');
      }

      const payload = {
        name: values.name,
        areaName: values.areaName,
        landId: values.landId,
        area: values.area,
        usage: values.usage,
        status: values.status,
        classification: values.classification,
        coordinates: selectedCoordinate,
        landPlot: selectedLand.name
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));
      await createArea(payload);

      message.success('Area created successfully');
      router.push('/area');
    } catch (error) {
      console.error('Error creating area:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to create area');
      }
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'basicInfo',
      label: 'Thông tin cơ bản',
      children: (
        <div className="grid grid-cols-2 gap-8">
          <div>
            <Form.Item
              name="name"
              label="Tên khu vực"
              rules={[{ required: true, message: 'Vui lòng nhập tên khu vực!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="areaName"
              label="Vị trí"
              rules={[{ required: true, message: 'Vui lòng nhập vị trí!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="landId"
              label="Khu đất"
              rules={[{ required: true, message: 'Vui lòng chọn hoặc tạo khu đất!' }]}
              validateTrigger={['onChange', 'onBlur']}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Select 
                  style={{ width: 'calc(100% - 32px)' }}
                  placeholder="Chọn khu đất"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={handleLandSelect}
                >
                  {lands.map(land => (
                    <Select.Option key={land.id} value={land.id}>
                      {land.name}
                    </Select.Option>
                  ))}
                </Select>
                <Button 
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddLandModalVisible(true)}
                />
              </Space.Compact>
            </Form.Item>

            <Form.Item
              name="area"
              label="Diện tích (ha)"
              rules={[{ required: true, message: 'Vui lòng nhập diện tích!' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>

            <Form.Item
              name="usage"
              label="Mục đích sử dụng"
              rules={[{ required: true, message: 'Vui lòng nhập mục đích sử dụng!' }]}
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              initialValue="available"
            >
              <Select>
                <Select.Option value="available">Khả dụng</Select.Option>
                <Select.Option value="in-use">Đang sử dụng</Select.Option>
                <Select.Option value="pending">Đang chờ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="classification"
              label="Phân loại"
              rules={[{ required: true, message: 'Vui lòng chọn phân loại!' }]}
              initialValue={AreaClassification.PLANT}
            >
              <Select>
                <Select.Option value="PLANT">Trồng trọt</Select.Option>
                <Select.Option value="OTHER">Khác</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div>
            <Form.Item label="Tọa độ">
              <Card size="small">
                <Form.Item
                  label="Đa giác"
                  rules={[{ required: true, message: 'Vui lòng vẽ đa giác trên bản đồ!' }]}
                >
                  <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    placeholder="Tọa độ sẽ được cập nhật khi vẽ trên bản đồ"
                    value={JSON.stringify(selectedCoordinate.polygon)}
                    disabled
                  />
                </Form.Item>

                <Form.Item
                  label="Tâm"
                  rules={[{ required: true, message: 'Vui lòng nhập tọa độ tâm!' }]}
                >
                  <Input 
                    placeholder="Ví dụ: 21.0235276,105.8420103"
                    value={`${selectedCoordinate.center.lat},${selectedCoordinate.center.lng}`}
                    onChange={(e) => handleCenterChange(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label="Tỷ lệ thu phóng"
                  rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ thu phóng!' }]}
                >
                  <InputNumber 
                    min={1} 
                    max={20} 
                    style={{ width: '100%' }}
                    value={selectedCoordinate.zoom}
                    onChange={(value) => {
                      setSelectedCoordinate({
                        ...selectedCoordinate,
                        zoom: value || 15
                      });
                    }}
                  />
                </Form.Item>
              </Card>
            </Form.Item>

            <Form.Item label="Bản đồ">
              <div style={{ height: '400px', marginBottom: '16px' }}>
                <Map
                  coordinates={selectedCoordinate}
                  onCoordinatesUpdate={handleCoordinatesUpdate}
                />
              </div>
            </Form.Item>
          </div>
        </div>
      ),
    },
    {
      key: 'areas',
      label: 'Areas',
      children: <div>Areas content</div>,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Thêm khu vực mới"
        extra={
          <Space>
            <Button type="primary" onClick={() => form.submit()} loading={loading}>
              Tạo mới
            </Button>
            <Button onClick={() => router.push('/area')}>
              Hủy
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: 'available',
            classification: AreaClassification.PLANT
          }}
        >
          <Tabs items={items} />
        </Form>
      </Card>

      <Modal
        title="Thêm khu đất mới"
        open={isAddLandModalVisible}
        onCancel={() => {
          setIsAddLandModalVisible(false);
          landForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={landForm}
          layout="vertical"
          onFinish={handleAddLand}
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
              parser={(value: string | undefined): number => value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0}
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
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo mới
              </Button>
              <Button onClick={() => setIsAddLandModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}