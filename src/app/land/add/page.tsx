"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Button, InputNumber, Card, Space, App } from 'antd';
import { useRouter } from 'next/navigation';
import { createLand } from '@/service/land.service';
import { fetchRegions } from '@/service/region.service';
import { fetchOwners } from '@/service/owner.service';
import type { Region } from '@/model/region.model';
import type { Owner } from '@/model/owner.model';
import dynamic from 'next/dynamic';
import { DatabaseCoordinates } from '@/model/coordinate.model';
import { AxiosError } from 'axios';

const Map = dynamic(() => import('@/component/map/MapDrawer'), { ssr: false });

export default function AddLand() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const router = useRouter();
  const [regions, setRegions] = useState<Region[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [ownerType, setOwnerType] = useState<'existing' | 'new'>('existing');
  const [coordinates, setCoordinates] = useState<DatabaseCoordinates>(() => ({
    polygon: [[21.0235276, 105.8420103]],
    center: {
      lat: 21.0235276,
      lng: 105.8420103
    },
    zoom: 15
  }));

  const handleCoordinatesUpdate = useCallback((newCoordinates: DatabaseCoordinates) => {
    if (!newCoordinates.polygon || newCoordinates.polygon.length === 0) {
      newCoordinates.polygon = [[21.0235276, 105.8420103]];
    }
    if (!newCoordinates.center) {
      newCoordinates.center = {
        lat: 21.0235276,
        lng: 105.8420103
      };
    }
    if (!newCoordinates.zoom) {
      newCoordinates.zoom = 15;
    }

    setCoordinates(newCoordinates);
    form.setFieldsValue({
      polygon: JSON.stringify(newCoordinates.polygon),
      center: `${newCoordinates.center.lat},${newCoordinates.center.lng}`,
      zoom: newCoordinates.zoom
    });
  }, [form]);

  const handleCenterChange = useCallback((value: string) => {
    const [lat, lng] = value.split(',').map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      setCoordinates(prev => ({
        ...prev,
        center: { lat, lng }
      }));
      form.setFieldsValue({ center: value });
    }
  }, [form]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [regionsData, ownersData] = await Promise.all([
          fetchRegions(),
          fetchOwners()
        ]);
        if (mounted) {
          setRegions(regionsData);
          setOwners(ownersData);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        if (mounted) {
          message.error('Không thể tải dữ liệu ban đầu');
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [message]);

  const onFinish = useCallback(async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      // Validate coordinates
      if (!coordinates.polygon || coordinates.polygon.length < 3) {
        throw new Error('Vui lòng vẽ đa giác với ít nhất 3 điểm trên bản đồ');
      }

      // Format owner data
      const ownerPayload = ownerType === 'new' 
        ? {
            id: 0,
            name: values.ownerName as string,
            phone: (values.ownerPhone as string) || '',
            address: (values.ownerAddress as string) || '',
            landCount: 0,
            properties: []
          }
        : owners.find(o => o.id === values.ownerId);

      if (!ownerPayload) {
        throw new Error('Vui lòng chọn hoặc tạo chủ sở hữu');
      }

      // Format region data
      const selectedRegion = regions.find(r => r.id === values.regionId);
      if (!selectedRegion) {
        throw new Error('Vui lòng chọn vùng');
      }

      // Validate required fields
      if (!values.name || typeof values.name !== 'string' || values.name.trim() === '') {
        throw new Error('Tên khu đất không được để trống');
      }

      if (!values.address || typeof values.address !== 'string' || values.address.trim() === '') {
        throw new Error('Địa chỉ không được để trống');
      }

      if (!values.area || typeof values.area !== 'number' || values.area <= 0) {
        throw new Error('Diện tích phải lớn hơn 0');
      }

      if (!values.price || typeof values.price !== 'number' || values.price <= 0) {
        throw new Error('Giá trị phải lớn hơn 0');
      }

      
      const payload = {
        name: values.name as string,
        address: values.address as string,
        area: Number(values.area),
        price: Number(values.price),
        location: values.location as string,
        properties: [
          { key: "Mặt tiền", value: "0m" },
          { key: "Chiều dài", value: 0 },
          { key: "Hướng", value: "Chưa xác định" },
          { key: "Sổ đỏ", value: false }
        ] as Array<{ key: string; value: string | number | boolean }>,
        coordinate: {
          polygon: JSON.stringify(coordinates.polygon),
          center: JSON.stringify(coordinates.center),
          zoom: coordinates.zoom
        },
        ownerId: ownerType === 'new' ? 0 : Number(values.ownerId),
        regionId: Number(values.regionId),
        planningMapUrl: '',
        googleMapUrl: `https://maps.google.com/?q=${coordinates.center.lat},${coordinates.center.lng}`
      };

      try {
        await createLand(payload);
        message.success('Tạo khu đất thành công');
        router.push('/land');
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          if (error.response) {
            // Handle specific API errors
            const errorMessage = error.response.data?.message || 'Có lỗi xảy ra khi tạo khu đất';
            if (Array.isArray(errorMessage)) {
              // If the error message is an array of validation errors
              message.error(errorMessage.join(', '));
            } else {
              message.error(errorMessage);
            }
          } else if (error.request) {
            // Handle network errors
            message.error('Không thể kết nối đến server');
          }
        } else {
          // Handle other errors
          message.error('Có lỗi xảy ra khi tạo khu đất');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Có lỗi xảy ra khi tạo khu đất');
      }
    } finally {
      setLoading(false);
    }
  }, [coordinates, ownerType, owners, regions, router, message]);

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Thêm Khu Đất Mới">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Tên khu đất"
            rules={[{ required: true, message: 'Vui lòng nhập tên khu đất' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="regionId"
            label="Vùng"
            rules={[{ required: true, message: 'Vui lòng chọn vùng' }]}
          >
            <Select>
              {regions.map(region => (
                <Select.Option key={region.id} value={region.id}>
                  {region.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="area"
            label="Diện tích (ha)"
            rules={[{ required: true, message: 'Vui lòng nhập diện tích' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá trị"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
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
            rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Tọa độ">
            <Card size="small">
              <Form.Item
                name="polygon"
                label="Tọa độ mảnh đất"
                rules={[{ required: true, message: 'Vui lòng vẽ đa giác trên bản đồ' }]}
              >
                <Input.TextArea
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  placeholder="Tọa độ sẽ được cập nhật khi vẽ trên bản đồ"
                  value={JSON.stringify(coordinates.polygon)}
                  disabled
                />
              </Form.Item>

              <Form.Item
                name="center"
                label="Tọa độ trung tâm"
                rules={[{ required: true, message: 'Vui lòng nhập tọa độ trung tâm' }]}
                initialValue={`${coordinates.center.lat},${coordinates.center.lng}`}
              >
                <Input 
                  placeholder="VD: 21.0235276,105.8420103"
                  onChange={(e) => handleCenterChange(e.target.value)}
                />
              </Form.Item>

              <Form.Item
                name="zoom"
                label="Độ phóng to"
                rules={[{ required: true, message: 'Vui lòng nhập độ phóng to' }]}
                initialValue={coordinates.zoom}
              >
                <InputNumber 
                  min={1} 
                  max={20} 
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setCoordinates({
                      ...coordinates,
                      zoom: value || 15
                    });
                    form.setFieldsValue({ zoom: value });
                  }}
                />
              </Form.Item>
            </Card>
          </Form.Item>

          <Form.Item label="Bản đồ">
            <div style={{ height: '400px', marginBottom: '16px' }}>
              <Map
                coordinates={coordinates}
                onCoordinatesUpdate={handleCoordinatesUpdate}
              />
            </div>
          </Form.Item>

          {ownerType === 'new' ? (
            <>
              <Form.Item
                name="ownerName"
                label="Tên chủ sở hữu mới"
                rules={[{ required: true, message: 'Vui lòng nhập tên chủ sở hữu' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="ownerPhone"
                label="Số điện thoại"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="ownerAddress"
                label="Địa chỉ"
              >
                <Input />
              </Form.Item>
              <Button onClick={() => setOwnerType('existing')}>
                Chọn chủ sở hữu có sẵn
              </Button>
            </>
          ) : (
            <>
              <Form.Item
                name="ownerId"
                label="Chọn chủ sở hữu"
                rules={[{ required: true, message: 'Vui lòng chọn chủ sở hữu' }]}
              >
                <Select
                  showSearch
                  placeholder="Tìm kiếm chủ sở hữu"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {owners.map(owner => (
                    <Select.Option key={owner.id} value={owner.id}>
                      {owner.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Button onClick={() => setOwnerType('new')}>
                Thêm chủ sở hữu mới
              </Button>
            </>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo khu đất
              </Button>
              <Button onClick={() => router.push('/land')}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}