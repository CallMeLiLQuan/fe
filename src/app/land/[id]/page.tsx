"use client";

import { useState, useEffect } from 'react';
import { Card, Tabs, Modal, Form, Input, Select, InputNumber, Button, Tag } from 'antd';
import dynamic from 'next/dynamic';
import { Land, toLand, LandResponse } from '@/model/land.model';
import { AreaClassification } from '@/model/area.model';
import { useParams, useRouter } from 'next/navigation';
import { getLandById } from '@/service/land.service';
import { EyeOutlined } from '@ant-design/icons';

const ViewOnlyMap = dynamic(() => import('@/component/map/ViewOnlyMap'), { ssr: false });

function InfoView({ land }: { land: Land }) {
  return (
    <Card>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="font-semibold">Name</div>
          <div>{land.name}</div>
        </div>
        <div>
          <div className="font-semibold">Address</div>
          <div>{land.address}</div>
        </div>
        <div>
          <div className="font-semibold">Area</div>
          <div>{land.area} m²</div>
        </div>
        <div>
          <div className="font-semibold">Price</div>
          <div>{land.price}</div>
        </div>
        <div>
          <div className="font-semibold">Location</div>
          <div>{land.location}</div>
        </div>
        <div>
          <div className="font-semibold">Area Count</div>
          <div>{land.areaCount}</div>
        </div>
        <div>
          <div className="font-semibold">Owner</div>
          <div>{land.owner.name}</div>
        </div>
        <div>
          <div className="font-semibold">Region</div>
          <div>{land.region.name}</div>
        </div>
      </div>
    </Card>
  );
}

interface AreaFormValues {
  name: string;
  areaName: string;
  landPlot: string;
  status: 'available' | 'in-use' | 'pending';
  area: number;
  usage: string;
  classification: AreaClassification;
}

function AreasView({ land }: { land: Land }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm<AreaFormValues>();
  const router = useRouter();

  const handleSubmit = async (values: AreaFormValues) => {
    try {
      console.log('Creating area:', values);
      // TODO: Implement area creation
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error creating area:', error);
    }
  };

  if (!land.areas || land.areas.length === 0) {
    return (
      <div>
        <div className="mb-4">
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Add Area
          </Button>
        </div>
        <div className="text-center text-gray-500 py-8">
          No areas found for this land
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Add Area
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {land.areas.map(area => (
          <Card 
            key={area.id} 
            className="hover:shadow-lg transition-shadow"
            title={area.name}
            extra={
              <Tag color={
                area.status === 'available' ? 'success' :
                area.status === 'in-use' ? 'warning' :
                area.status === 'pending' ? 'processing' : 'default'
              }>
                {area.status}
              </Tag>
            }
            actions={[
              <Button 
                key="view" 
                type="primary" 
                icon={<EyeOutlined />}
                onClick={() => router.push(`/area/${area.id}`)}
              >
                View
              </Button>
            ]}
          >
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Area Name:</div>
              <div>{area.areaName}</div>
              <div className="text-gray-500">Land Plot:</div>
              <div>{area.landPlot}</div>
              <div className="text-gray-500">Area:</div>
              <div>{area.area} m²</div>
              <div className="text-gray-500">Usage:</div>
              <div>{area.usage}</div>
              <div className="text-gray-500">Classification:</div>
              <div>{area.classification}</div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title="Add New Area"
        open={isModalVisible}
        onOk={form.submit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input area name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="areaName"
            label="Area Name"
            rules={[{ required: true, message: 'Please input area name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="landPlot"
            label="Land Plot"
            rules={[{ required: true, message: 'Please input land plot!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select>
              <Select.Option value="available">Available</Select.Option>
              <Select.Option value="in-use">In Use</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="area"
            label="Area (m²)"
            rules={[{ required: true, message: 'Please input area!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="usage"
            label="Usage"
            rules={[{ required: true, message: 'Please input usage!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="classification"
            label="Classification"
            rules={[{ required: true, message: 'Please select classification!' }]}
          >
            <Select>
              <Select.Option value={AreaClassification.PLANT}>Plant</Select.Option>
              <Select.Option value={AreaClassification.OTHER}>Other</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function MapView({ land }: { land: Land }) {
  if (!land.coordinate) {
    return (
      <div className="h-[calc(100vh-13rem)] flex items-center justify-center">
        <div className="text-gray-500">No map data available</div>
      </div>
    );
  }

  // Prepare areas data for the map
  const areasData = land.areas.map(area => ({
    id: area.id,
    name: area.name,
    coordinates: area.coordinates,
    status: area.status,
    tooltip: `Khu vực: ${area.name}
Diện tích: ${area.area} m²
Mục đích sử dụng: ${area.usage}
Trạng thái: ${area.status}
Phân loại: ${area.classification}`
  }));

  return (
    <div className="h-[calc(100vh-13rem)]">
      <ViewOnlyMap 
        coordinates={land.coordinate}
        areas={areasData}
      />
    </div>
  );
}

export default function LandDetail() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [land, setLand] = useState<Land | null>(null);

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const landId = Array.isArray(params?.id) ? params.id[0] : params?.id;
        if (!landId) {
          console.error('Land ID is undefined');
          setLoading(false);
          return;
        }

        const response = await getLandById(parseInt(landId));
        console.log('Raw response:', response);
        
        const data = toLand(response as LandResponse);
        console.log('Processed data:', data);
        
        setLand(data);
      } catch (error) {
        console.error('Error fetching land:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLand();
  }, [params]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!land) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Land not found</div>
      </div>
    );
  }

  const items = [
    {
      key: 'basicInfo',
      label: 'Basic Information',
      children: <InfoView land={land} />
    },
    {
      key: 'mapView',
      label: 'Map View',
      children: <MapView land={land} />
    },
    {
      key: 'areas',
      label: 'Areas',
      children: <AreasView land={land} />
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold mb-2">{land.name}</h1>
          <p className="text-gray-600">{land.address}</p>
        </div>
        <Button type="primary">Edit Land</Button>
      </div>
      <Tabs 
        items={items} 
        className="bg-white rounded-lg shadow-sm"
        tabBarStyle={{
          marginBottom: 0,
          paddingLeft: 24,
          paddingRight: 24,
          borderBottom: '1px solid #f0f0f0'
        }}
      />
    </div>
  );
}
