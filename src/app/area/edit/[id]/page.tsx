"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, InputNumber, Card, Space, Tabs } from 'antd';
import { useRouter } from 'next/navigation';
import { getAreaById, updateArea } from '@/service/area.service';
import { fetchLands } from '@/service/land.service';
import type { Land } from '@/model/land.model';
import { createDefaultCoordinates, DatabaseCoordinates } from "@/model/coordinate.model";
import dynamic from 'next/dynamic';
import { AreaClassification } from '@/model/area.model';
import { App } from 'antd';

const Map = dynamic(() => import('@/component/map/MapDrawer'), { ssr: false });

interface AreaFormValues {
  name: string;
  areaName: string;
  status: 'available' | 'in-use' | 'pending';
  area: number;
  usage: string;
  landId: number;
  classification: AreaClassification;
}

export default function EditArea({ params }: { params: { id: string } }) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState<DatabaseCoordinates>(createDefaultCoordinates());
  const { message } = App.useApp();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [areaData, landsData] = await Promise.all([
          getAreaById(parseInt(params.id)),
          fetchLands()
        ]);
        
        setLands(landsData);
        
        // Set form values
        form.setFieldsValue({
          name: areaData.name,
          areaName: areaData.areaName,
          landId: areaData.land,
          area: areaData.area,
          usage: areaData.usage,
          status: areaData.status,
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
        message.error('Failed to load area data');
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

      await updateArea(parseInt(params.id), {
        ...values,
        landPlot: selectedLand.name,
        coordinates: {
          center: `${selectedCoordinate.center.lat},${selectedCoordinate.center.lng}`,
          polygon: JSON.stringify(selectedCoordinate.polygon),
          zoom: selectedCoordinate.zoom
        }
      });

      message.success('Area updated successfully');
      router.push('/area');
    } catch (error) {
      console.error('Error updating area:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to update area');
      }
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'basicInfo',
      label: 'Basic Information',
      children: (
        <div className="grid grid-cols-2 gap-8">
          <div>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please input the name!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="areaName"
              label="Area Name"
              rules={[{ required: true, message: 'Please input the area name!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="landId"
              label="Land"
              rules={[{ required: true, message: 'Please select a land!' }]}
            >
              <Select 
                placeholder="Select a land"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                }
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
              label="Area (m²)"
              rules={[{ required: true, message: 'Please input the area!' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>

            <Form.Item
              name="usage"
              label="Usage"
              rules={[{ required: true, message: 'Please input the usage!' }]}
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select the status!' }]}
            >
              <Select>
                <Select.Option value="available">Available</Select.Option>
                <Select.Option value="in-use">In Use</Select.Option>
                <Select.Option value="pending">Pending</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="classification"
              label="Classification"
              rules={[{ required: true, message: 'Please select the classification!' }]}
            >
              <Select>
                <Select.Option value={AreaClassification.PLANT}>Plant</Select.Option>
                <Select.Option value={AreaClassification.OTHER}>Other</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div>
            <Form.Item label="Coordinates">
              <Card size="small">
                <Form.Item
                  label="Polygon"
                  rules={[{ required: true, message: 'Please draw polygon on the map!' }]}
                >
                  <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    placeholder="Coordinates will be updated when drawing on the map"
                    value={JSON.stringify(selectedCoordinate.polygon)}
                    disabled
                  />
                </Form.Item>

                <Form.Item
                  label="Center"
                  rules={[{ required: true, message: 'Please input center coordinates!' }]}
                >
                  <Input 
                    placeholder="e.g., 21.0235276,105.8420103"
                    value={`${selectedCoordinate.center.lat},${selectedCoordinate.center.lng}`}
                    onChange={(e) => handleCenterChange(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label="Zoom"
                  rules={[{ required: true, message: 'Please input zoom level!' }]}
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

            <Form.Item label="Map">
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
  ];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Edit Area"
        extra={
          <Space>
            <Button type="primary" onClick={() => form.submit()} loading={loading}>
              Update Area
            </Button>
            <Button onClick={() => router.push('/area')}>
              Cancel
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Tabs items={items} />
        </Form>
      </Card>
    </div>
  );
} 