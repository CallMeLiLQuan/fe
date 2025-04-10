"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, InputNumber, Card, Space, Tabs, Modal } from 'antd';
import { useRouter } from 'next/navigation';
import { getLandById, updateLand } from '@/service/land.service';
import { fetchRegions, createRegion } from '@/service/region.service';
import { fetchOwners, createOwner } from '@/service/owner.service';
import { createDefaultCoordinates, DatabaseCoordinates } from "@/model/coordinate.model";
import { PlusOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { App } from 'antd';
import type { Region } from '@/model/region.model';
import type { Owner } from '@/model/owner.model';

const Map = dynamic(() => import('@/component/map/MapDrawer'), { ssr: false });

interface LandFormValues {
  name: string;
  address: string;
  area: number;
  price: number;
  location: string;
  properties: Array<{ key: string; value: string | number | boolean }>;
  ownerId: number;
  regionId: number;
  planningMapUrl?: string;
  googleMapUrl?: string;
}

interface RegionFormValues {
  name: string;
  description?: string;
}

interface OwnerFormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function EditLand({ params }: { params: { id: string } }) {
  const [form] = Form.useForm();
  const [regionForm] = Form.useForm();
  const [ownerForm] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<number>();
  const [selectedRegionId, setSelectedRegionId] = useState<number>();
  const [isAddRegionModalVisible, setIsAddRegionModalVisible] = useState(false);
  const [isAddOwnerModalVisible, setIsAddOwnerModalVisible] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState<DatabaseCoordinates>(createDefaultCoordinates());
  const { message } = App.useApp();

  useEffect(() => {
    const loadData = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const [landData, regionsData, ownersData] = await Promise.all([
          getLandById(parseInt(params.id)),
          fetchRegions(),
          fetchOwners()
        ]);
        
        setRegions(regionsData);
        setOwners(ownersData);
        
        console.log('Setting form values:', {
          ...landData,
          ownerId: landData.owner?.id,
          regionId: landData.region?.id
        });

        // Set selected IDs
        setSelectedOwnerId(landData.owner?.id);
        setSelectedRegionId(landData.region?.id);

        // Set form values
        form.setFieldsValue({
          name: landData.name,
          address: landData.address,
          area: landData.area,
          price: landData.price,
          location: landData.location,
          properties: landData.properties,
          ownerId: landData.owner?.id,
          regionId: landData.region?.id,
          planningMapUrl: landData.planningMapUrl,
          googleMapUrl: landData.googleMapUrl
        });

        // Set coordinates
        if (landData.coordinate) {
          setSelectedCoordinate({
            center: landData.coordinate.center,
            polygon: landData.coordinate.polygon,
            zoom: landData.coordinate.zoom
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

  const handleAddRegion = async (values: RegionFormValues) => {
    try {
      const newRegion = await createRegion(values);
      setRegions(prev => [...prev, newRegion]);
      form.setFieldValue('regionId', newRegion.id);
      message.success('Region created successfully');
      setIsAddRegionModalVisible(false);
      regionForm.resetFields();
    } catch (error) {
      console.error('Error creating region:', error);
      message.error('Failed to create region');
    }
  };

  const handleAddOwner = async (values: OwnerFormValues) => {
    try {
      const newOwner = await createOwner(values);
      setOwners(prev => [...prev, newOwner]);
      form.setFieldValue('ownerId', newOwner.id);
      message.success('Owner created successfully');
      setIsAddOwnerModalVisible(false);
      ownerForm.resetFields();
    } catch (error) {
      console.error('Error creating owner:', error);
      message.error('Failed to create owner');
    }
  };

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

  const onFinish = async (values: LandFormValues) => {
    if (!params.id) return;
    
    console.log('Form values on submit:', values);
    
    setLoading(true);
    try {
      if (!selectedCoordinate.polygon || selectedCoordinate.polygon.length < 3) {
        throw new Error('Please draw a polygon with at least 3 points on the map');
      }

      await updateLand(parseInt(params.id), {
        ...values,
        coordinate: {
          polygon: selectedCoordinate.polygon,
          center: selectedCoordinate.center,
          zoom: selectedCoordinate.zoom
        }
      });

      message.success('Land updated successfully');
      router.push('/land');
    } catch (error) {
      console.error('Error updating land:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to update land');
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
              name="address"
              label="Address"
              rules={[{ required: true, message: 'Please input the address!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="area"
              label="Area (ha)"
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

            <Form.Item
              name="ownerId"
              label="Owner"
              rules={[{ required: true, message: 'Please select or create an owner!' }]}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Select 
                  style={{ width: 'calc(100% - 32px)' }}
                  placeholder="Select an owner"
                  showSearch
                  optionFilterProp="children"
                  value={selectedOwnerId}
                  onChange={(value) => {
                    setSelectedOwnerId(value);
                    form.setFieldValue('ownerId', value);
                  }}
                >
                  {owners.map(owner => (
                    <Select.Option key={owner.id} value={owner.id}>
                      {owner.name}
                    </Select.Option>
                  ))}
                </Select>
                <Button 
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddOwnerModalVisible(true)}
                />
              </Space.Compact>
            </Form.Item>

            <Form.Item
              name="regionId"
              label="Region"
              rules={[{ required: true, message: 'Please select or create a region!' }]}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Select 
                  style={{ width: 'calc(100% - 32px)' }}
                  placeholder="Select a region"
                  showSearch
                  optionFilterProp="children"
                  value={selectedRegionId}
                  onChange={(value) => {
                    setSelectedRegionId(value);
                    form.setFieldValue('regionId', value);
                  }}
                >
                  {regions.map(region => (
                    <Select.Option key={region.id} value={region.id}>
                      {region.name}
                    </Select.Option>
                  ))}
                </Select>
                <Button 
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddRegionModalVisible(true)}
                />
              </Space.Compact>
            </Form.Item>

            <Form.Item
              name="planningMapUrl"
              label="Planning Map URL"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="googleMapUrl"
              label="Google Map URL"
            >
              <Input />
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
        title="Edit Land"
        extra={
          <Space>
            <Button type="primary" onClick={() => {
              console.log('Current form values:', form.getFieldsValue());
              form.submit();
            }} loading={loading}>
              Update Land
            </Button>
            <Button onClick={() => router.push('/land')}>
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
            ownerId: selectedOwnerId,
            regionId: selectedRegionId
          }}
        >
          <Tabs items={items} />
        </Form>
      </Card>

      <Modal
        title="Add New Region"
        open={isAddRegionModalVisible}
        onCancel={() => {
          setIsAddRegionModalVisible(false);
          regionForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={regionForm}
          layout="vertical"
          onFinish={handleAddRegion}
        >
          <Form.Item
            name="name"
            label="Region Name"
            rules={[{ required: true, message: 'Please input the region name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Region
              </Button>
              <Button onClick={() => setIsAddRegionModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add New Owner"
        open={isAddOwnerModalVisible}
        onCancel={() => {
          setIsAddOwnerModalVisible(false);
          ownerForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={ownerForm}
          layout="vertical"
          onFinish={handleAddOwner}
        >
          <Form.Item
            name="name"
            label="Owner Name"
            rules={[{ required: true, message: 'Please input the owner name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please input the phone number!' }]}
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

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Owner
              </Button>
              <Button onClick={() => setIsAddOwnerModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 