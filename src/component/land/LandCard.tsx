"use client";

// Fix the duplicate imports and add missing states
import { Card, Button, Modal, Form, Space, Popconfirm, message, Input } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined, EnvironmentOutlined, PlusOutlined, GlobalOutlined } from "@ant-design/icons";
import { updateLand, deleteLand, createLand } from "@/service/land.service";
import { useEffect, useState } from "react";
import { fetchLands } from "@/service/land.service";
import { useAuth } from "@/component/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Land } from "@/model/land.model";
import router from "next/router";
import form from "antd/es/form";

const LandCard = ({ land, onUpdate, onDelete }: { 
  land: Land, 
  onUpdate: (id: number, updatedLand: Partial<Land>) => void,
  onDelete: (id: number) => void 
}) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter(); // Add this line

  const handleView = () => {
    router.push(`/land/${land.id}`);
  };

  const handleEdit = async (values: any) => {
    try {
      await updateLand(land.id, values);
      onUpdate(land.id, values);
      setIsEditModalVisible(false);
      message.success('Land updated successfully');
    } catch (error) {
      message.error('Failed to update land');
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
            <span className="font-semibold">
              {land.id}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-medium mb-0 text-gray-800">{land.name}</h3>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <div className="flex items-center mb-1">
                <UserOutlined className="mr-2" />
                <span>Owner: {land.owner.name}</span>
              </div>
              <div className="flex items-center mb-1">
                <EnvironmentOutlined className="mr-2" />
                <span>Address: {land.address}</span>
              </div>
              <div className="flex items-center mb-1">
                <GlobalOutlined className="mr-2" />
                <span>Region: {land.region?.name || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
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
            title="Delete Land"
            description="Are you sure you want to delete this land?"
            onConfirm={() => onDelete(land.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      </Card>

      <Modal
        title="Edit Land"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          initialValues={{
            ...land,
            coordinates: {
              polygon: land.coordinates?.polygon || [],
              center: land.coordinates?.center || "",
              zoom: land.coordinates?.zoom || 15
            }
          }}
          onFinish={handleEdit}
          layout="vertical"
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="owner.name" label="Owner Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
      
          {/* Add Coordinate Fields */}
          <Form.Item name={["coordinates", "polygon"]} label="Polygon Coordinates" rules={[{ required: true }]}>
            <Input.TextArea 
              placeholder="Enter polygon coordinates (comma-separated)"
              onChange={(e) => {
                const value = e.target.value;
                form.setFieldsValue({
                  coordinates: {
                    ...form.getFieldValue('coordinates'),
                    polygon: value.split(',').map(coord => coord.trim())
                  }
                });
              }}
            />
          </Form.Item>
          <Form.Item name={["coordinates", "center"]} label="Center Coordinate" rules={[{ required: true }]}>
            <Input placeholder="Enter center coordinate" />
          </Form.Item>
          <Form.Item name={["coordinates", "zoom"]} label="Zoom Level" rules={[{ required: true }]}>
            <Input type="number" min={1} max={20} />
          </Form.Item>
      
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
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

export default function LandCardList() {
  const [lands, setLands] = useState<Land[]>([]);
  const [filteredLands, setFilteredLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const regionId = searchParams.get('regionId');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (mounted && isAuthenticated) {
      const loadLands = async () => {
        try {
          setLoading(true);
          const data = await fetchLands();
          const filteredData = regionId 
            ? data.filter((land: { regionId: number; }) => land.regionId === parseInt(regionId))
            : data;
          setLands(filteredData);
          setFilteredLands(filteredData);
          
          // Set search text to region name if regionId exists
          if (regionId && filteredData.length > 0) {
            setSearchText(filteredData[0].region.name);
          }
        } catch (error) {
          console.error("Error loading lands:", error);
        } finally {
          setLoading(false);
        }
      };

      loadLands();
    }
  }, [isAuthenticated, router, mounted, regionId]);

  const [searchText, setSearchText] = useState('');
  
  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = lands.filter(land => 
      land.name.toLowerCase().includes(value.toLowerCase()) ||
      land.region?.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredLands(filtered);
  };

  const handleAddNew = async (values: Partial<Land>) => {
    try {
      const coordinates = {
        polygon: values.coordinates?.polygon || [],
        center: values.coordinates?.center || "",
        zoom: values.coordinates?.zoom || 15
      };
  
      const newLand = await createLand({
        name: values.name!,
        address: values.address!,
        owner: {
          name: values.owner?.name!,
          id: 0,
          phone: "",
          address: ""
        },
        area: 0,
        price: 0,
        location: "",
        areaCount: 0,
        coordinates: coordinates,
        areas: [],
        regionId: parseInt(regionId || '0'),
        region: {
          id: parseInt(regionId || '0'),
          name: ''
        }
      });
      setLands(prev => [...prev, newLand]);
      setFilteredLands(prev => [...prev, newLand]);
      setIsAddModalVisible(false);
      addForm.resetFields();
      message.success('Land added successfully');
    } catch (error) {
      message.error('Failed to add land');
    }
  };
  
  // Update the Add New Land Modal form
  <Modal
    title="Add New Land"
    open={isAddModalVisible}
    onCancel={() => setIsAddModalVisible(false)}
    footer={null}
  >
    <Form
      form={addForm}
      onFinish={handleAddNew}
      layout="vertical"
    >
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="address" label="Address" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name={["owner", "name"]} label="Owner Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      
      {/* Add Coordinate Fields */}
      <Form.Item name={["coordinates", "polygon"]} label="Polygon Coordinates" rules={[{ required: true }]}>
        <Input.TextArea 
          placeholder="Enter polygon coordinates (comma-separated)"
          onChange={(e) => {
            const value = e.target.value;
            addForm.setFieldsValue({
              coordinates: {
                ...addForm.getFieldValue('coordinates'),
                polygon: value.split(',').map(coord => coord.trim())
              }
            });
          }}
        />
      </Form.Item>
      <Form.Item name={["coordinates", "center"]} label="Center Coordinate" rules={[{ required: true }]}>
        <Input placeholder="Enter center coordinate" />
      </Form.Item>
      <Form.Item name={["coordinates", "zoom"]} label="Zoom Level" rules={[{ required: true }]}>
        <Input type="number" min={1} max={20} defaultValue={15} />
      </Form.Item>
  
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Add Land
          </Button>
          <Button onClick={() => setIsAddModalVisible(false)}>
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
  const handleUpdate = async (id: number, updatedLand: Partial<Land>) => {
    try {
      await updateLand(id, updatedLand);
      setLands(prev => prev.map(land => 
        land.id === id ? { ...land, ...updatedLand } : land
      ));
      setFilteredLands(prev => prev.map(land => 
        land.id === id ? { ...land, ...updatedLand } : land
      ));
      message.success('Land updated successfully');
    } catch (error) {
      message.error('Failed to update land');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteLand(id);
      setLands(prev => prev.filter(land => land.id !== id));
      setFilteredLands(prev => prev.filter(land => land.id !== id));
      message.success('Land deleted successfully');
    } catch (error) {
      message.error('Failed to delete land');
    }
  };

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Input.Search
          placeholder="Search by land or region name..."
          allowClear
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Button 
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalVisible(true)}
        >
          Add New Land
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div>Loading...</div>
        ) : (
          filteredLands.map((land) => (
            <LandCard 
              key={land.id} 
              land={land} 
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <Modal
        title="Add New Land"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
      >
        <Form
          form={addForm}
          onFinish={handleAddNew}
          layout="vertical"
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={["owner", "name"]} label="Owner Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Land
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