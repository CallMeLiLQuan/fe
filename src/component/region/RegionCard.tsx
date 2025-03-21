"use client";

import { Card, Button, Modal, Form, Input, Space, Popconfirm, message, Spin } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Region, RegionFormData } from "@/model/region.model";
import { fetchRegions, createRegion, updateRegion, deleteRegion } from "@/service/region.service";
import { useAuth } from "@/component/contexts/AuthContext";
import { useRouter } from "next/navigation";

const RegionCard = ({ region, onUpdate, onDelete }: {
  region: Region,
  onUpdate: (id: number, updatedRegion: Partial<Region>) => void,
  onDelete: (id: number) => void
}) => {
  const router = useRouter();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleView = () => {
    router.push(`/land?regionId=${region.id}`);
  };

  const handleEdit = async (values: RegionFormData) => {
    try {
      setLoading(true);
      await updateRegion(region.id, values);
      onUpdate(region.id, values);
      setIsEditModalVisible(false);
      message.success('Region updated successfully');
    } catch (error) {
      console.error('Error updating region:', error);
      message.error('Failed to update region');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        className="w-full max-w-sm shadow-md rounded-lg overflow-hidden border border-gray-200"
        styles={{ body: { padding: '16px' } }}
      >
        <div className="flex items-start mb-3">
          <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center rounded-md mr-3 text-xl font-bold">
            <span className="font-semibold">{region.id}</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-medium mb-0 text-gray-800">{region.name}</h3>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <div className="flex items-center mb-1">
                <FileTextOutlined className="mr-2" />
                <span>Description: {region.description}</span>
              </div>
              <div className="flex items-center mb-1">
                <CheckCircleOutlined className="mr-2" />
                <span>Lands count: {region.lands?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={handleView}
          >
            View
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => setIsEditModalVisible(true)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Region"
            description="Are you sure you want to delete this region?"
            onConfirm={() => onDelete(region.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      </Card>

      <Modal
        title="Edit Region"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        confirmLoading={loading}
      >
        <Form
          form={form}
          initialValues={region}
          onFinish={handleEdit}
          layout="vertical"
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save Changes
              </Button>
              <Button onClick={() => setIsEditModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default function RegionCardList() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [filteredRegions, setFilteredRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    loadRegions();
  }, [isAuthenticated, router]);

  const loadRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to load regions...');
      
      const data = await fetchRegions();
      console.log('Received regions data:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }
      
      setRegions(data);
      setFilteredRegions(data);
    } catch (error) {
      console.error("Error loading regions:", error);
      setError(error instanceof Error ? error.message : 'Failed to load regions');
      message.error('Failed to load regions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    const filtered = regions.filter(region => 
      region.name.toLowerCase().includes(value.toLowerCase()) ||
      region.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredRegions(filtered);
  };

  const handleUpdate = async (id: number, updatedRegion: Partial<Region>) => {
    try {
      await updateRegion(id, updatedRegion);
      setRegions(prev => prev.map(region => 
        region.id === id ? { ...region, ...updatedRegion } : region
      ));
      setFilteredRegions(prev => prev.map(region => 
        region.id === id ? { ...region, ...updatedRegion } : region
      ));
      message.success('Region updated successfully');
    } catch (error) {
      console.error('Error updating region:', error);
      message.error('Failed to update region');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRegion(id);
      setRegions(prev => prev.filter(region => region.id !== id));
      setFilteredRegions(prev => prev.filter(region => region.id !== id));
      message.success('Region deleted successfully');
    } catch (error) {
      console.error('Error deleting region:', error);
      message.error('Failed to delete region');
    }
  };

  const handleAddNew = async (values: RegionFormData) => {
    try {
      const newRegion = await createRegion(values);
      setRegions(prev => [...prev, newRegion]);
      setFilteredRegions(prev => [...prev, newRegion]);
      setIsAddModalVisible(false);
      addForm.resetFields();
      message.success('Region created successfully');
    } catch (error) {
      console.error('Error creating region:', error);
      message.error('Failed to create region');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Input.Search
            placeholder="Search by region name or description..."
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
          {loading && <Spin />}
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalVisible(true)}
        >
          Add New Region
        </Button>
      </div>

      {error ? (
        <div className="text-center text-red-500 mt-8">
          <p>{error}</p>
          <Button onClick={loadRegions} type="primary" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : filteredRegions.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No regions found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegions.map((region) => (
            <RegionCard
              key={region.id}
              region={region}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        title="Add New Region"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
      >
        <Form
          form={addForm}
          onFinish={handleAddNew}
          layout="vertical"
        >
          <Form.Item 
            name="name" 
            label="Name" 
            rules={[{ required: true, message: 'Please input region name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="description" 
            label="Description" 
            rules={[{ required: true, message: 'Please input region description' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Region
              </Button>
              <Button onClick={() => setIsAddModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
