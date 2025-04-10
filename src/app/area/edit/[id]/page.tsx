"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, InputNumber, Card, Space, Tabs, App } from 'antd';
import { useRouter } from 'next/navigation';
import { getAreaById, updateArea } from '@/service/area.service';
import { fetchLands } from '@/service/land.service';
import type { Land } from '@/model/land.model';
import { createDefaultCoordinates, DatabaseCoordinates } from "@/model/coordinate.model";
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/component/map/MapDrawer'), { ssr: false });

interface AreaFormValues {
  name: string;
  areaName: string;
  status: 'available' | 'in-use' | 'pending';
  area: number;
  usage: string;
  landId: number;
  classification: string;
}

export default function EditArea({ params }: { params: { id: string } }) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState<DatabaseCoordinates>(createDefaultCoordinates());
  const { message } = App.useApp();
  const [lands, setLands] = useState<Land[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const [areaData, landsData] = await Promise.all([
          getAreaById(parseInt(params.id)),
          fetchLands()
        ]);
        
        console.log('Setting form values:', areaData);
        setLands(landsData);

        // Find the correct land ID from the land name (landPlot)
        const matchingLand = landsData.find((land: Land) => land.name === areaData.landPlot);
        const landId = matchingLand ? matchingLand.id : areaData.land?.id;
        
        console.log('Matching land:', matchingLand, 'Selected landId:', landId);

        // Set form values
        form.setFieldsValue({
          name: areaData.name,
          areaName: areaData.areaName,
          landId: landId,
          status: areaData.status,
          area: areaData.area,
          usage: areaData.usage,
          classification: areaData.classification
        });

        // Set coordinates
        if (areaData.coordinates) {
          setSelectedCoordinate({
            center: areaData.coordinates.center,
            polygon: areaData.coordinates.polygon,
            zoom: areaData.coordinates.zoom
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        message.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, form, message]);

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

  const onFinish = async (values: AreaFormValues) => {
    if (!params.id) return;
    
    console.log('Form values on submit:', values);
    
    setLoading(true);
    try {
      if (!selectedCoordinate.polygon || selectedCoordinate.polygon.length < 3) {
        throw new Error('Vui lòng vẽ đa giác với ít nhất 3 điểm trên bản đồ');
      }

      const selectedLand = lands.find(land => land.id === values.landId);
      if (!selectedLand) {
        throw new Error('Không tìm thấy khu đất');
      }

      await updateArea(parseInt(params.id), {
        ...values,
        coordinates: selectedCoordinate,
        landPlot: selectedLand.name
      });

      message.success('Cập nhật khu vực thành công');
      router.push('/area');
    } catch (error) {
      console.error('Error updating area:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Không thể cập nhật khu vực');
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
              rules={[{ required: true, message: 'Vui lòng chọn khu đất!' }]}
            >
              <Select
                placeholder="Chọn khu đất"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                }
                defaultActiveFirstOption={false}
                value={form.getFieldValue('landId')}
              >
                {lands.map(land => (
                  <Select.Option key={land.id} value={land.id}>
                    {land.name}
                  </Select.Option>
                ))}
              </Select>
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
              <div style={{ height: '400px', marginBottom: '16px', width: '100%', position: 'relative' }}>
                <Map
                  coordinates={selectedCoordinate}
                  onCoordinatesUpdate={handleCoordinatesUpdate}
                />
              </div>
            </Form.Item>
          </div>
        </div>
      ),
    }
  ];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Chỉnh sửa khu vực"
        extra={
          <Space>
            <Button type="primary" onClick={() => form.submit()} loading={loading}>
              Cập nhật
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
          preserve={true}
        >
          <Tabs items={items} />
        </Form>
      </Card>
    </div>
  );
} 