"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, InputNumber, Card, Space, Modal, Tabs } from 'antd';
import { useRouter } from 'next/navigation';
import { createArea } from '@/service/area.service';
import { fetchLands, createLand } from '@/service/land.service';
import type { Land } from '@/model/land.model';
import { createDefaultCoordinates, DatabaseCoordinates, toApiCoordinates } from "@/model/coordinate.model";
import dynamic from 'next/dynamic';
import { PlusOutlined } from '@ant-design/icons';
import { AreaClassification } from '@/model/area.model';

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
  landPlot: string;
  status: 'available' | 'in-use' | 'pending';
  area: number;
  usage: string;
  landId: number;
  classification: AreaClassification;
}

export default function AddArea() {
  const [form] = Form.useForm();
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
  }, []);

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
        ...values,
        areaCount: 0,
        properties: [],
        coordinate: {
          polygon: selectedCoordinate.polygon,
          center: selectedCoordinate.center,
          zoom: selectedCoordinate.zoom
        },
        areas: [],
        region: { id: 1, name: 'Default Region' },
        owner: { id: 1, name: 'Default Owner', phone: '' },
        planningMapUrl: '',
        googleMapUrl: ''
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

  const onFinish = async (values: AreaFormValues) => {
    setLoading(true);
    try {
      console.log('Form values:', values);
      console.log('Selected coordinates:', selectedCoordinate);

      if (!values.landId) {
        message.error('Please select a land');
        setLoading(false);
        return;
      }

      await createArea({
        ...values,
        coordinates: toApiCoordinates(selectedCoordinate),
        classification: values.classification || AreaClassification.PLANT
      });
      message.success('Area created successfully');
      router.push('/area');
    } catch (error) {
      console.error('Error creating area:', error);
      message.error('Failed to create area');
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
              name="landPlot"
              label="Land Plot"
              rules={[{ required: true, message: 'Please input the land plot!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="landId"
              label="Land"
              rules={[{ required: true, message: 'Please select or create a land!' }]}
              validateTrigger={['onChange', 'onBlur']}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Select 
                  style={{ width: 'calc(100% - 32px)' }}
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
                <Button 
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddLandModalVisible(true)}
                />
              </Space.Compact>
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
              initialValue="available"
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
              initialValue={AreaClassification.PLANT}
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
          </div>
        </div>
      ),
    },
    {
      key: 'mapView',
      label: 'Map View',
      children: (
        <div className="h-[600px]">
          <Map
            coordinates={selectedCoordinate}
            onCoordinatesUpdate={handleCoordinatesUpdate}
          />
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
        title="Add New Area"
        extra={
          <Space>
            <Button type="primary" onClick={() => form.submit()} loading={loading}>
              Create Area
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
          initialValues={{
            status: 'available',
            classification: AreaClassification.PLANT
          }}
        >
          <Tabs items={items} />
        </Form>
      </Card>

      <Modal
        title="Add New Land"
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
            label="Land Name"
            rules={[{ required: true, message: 'Please input the land name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please input the address!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="area"
            label="Area (m²)"
            rules={[{ required: true, message: 'Please input the area!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please input the price!' }]}
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
            label="Location"
            rules={[{ required: true, message: 'Please input the location!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Land
              </Button>
              <Button onClick={() => setIsAddLandModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}