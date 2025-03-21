"use client";

import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, message, Card, Table, Space, Modal, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchAssets, createAsset, updateAsset, deleteAsset } from '@/service/asset.service';
import { Asset } from '@/model/asset.model';

export default function AssetForm() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [form] = Form.useForm();

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await fetchAssets();
      setAssets(data);
    } catch (error) {
      message.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleAdd = () => {
    setEditingAsset(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Asset) => {
    setEditingAsset(record);
    form.setFieldsValue({
      ...record,
      wateringFrequency: record.plantInfo?.wateringSchedule.frequency,
      wateringAmount: record.plantInfo?.wateringSchedule.amount,
      wateringDescription: record.plantInfo?.wateringSchedule.description,
      age: record.plantInfo?.age,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAsset(id);
      message.success('Asset deleted successfully');
      loadAssets();
    } catch (error) {
      message.error('Failed to delete asset');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const assetData = {
        ...values,
        plantInfo: {
          age: values.age,
          wateringSchedule: {
            frequency: values.wateringFrequency,
            amount: values.wateringAmount,
            description: values.wateringDescription,
          },
        },
      };

      if (editingAsset) {
        await updateAsset(editingAsset.id, assetData);
        message.success('Asset updated successfully');
      } else {
        await createAsset(assetData);
        message.success('Asset created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      loadAssets();
    } catch (error) {
      message.error('Failed to save asset');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Location',
      key: 'location',
      render: (record: Asset) => (
        <>
          <div>Land: {record.landName}</div>
          <div>Area: {record.areaName}</div>
        </>
      ),
    },
    {
      title: 'Plant Info',
      key: 'plantInfo',
      render: (record: Asset) => record.plantInfo && (
        <>
          <div>Age: {record.plantInfo.age} years</div>
          <div>Watering: {record.plantInfo.wateringSchedule.frequency}</div>
          <div>Amount: {record.plantInfo.wateringSchedule.amount}L</div>
        </>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Asset) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete asset"
            description="Are you sure you want to delete this asset?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl">Asset Management</h1>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Asset
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={assets}
          loading={loading}
          rowKey="id"
        />

        <Modal
          title={editingAsset ? 'Edit Asset' : 'Add Asset'}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="plant">Plant</Select.Option>
                <Select.Option value="equipment">Equipment</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>

            <Form.Item
              name="landName"
              label="Land Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="areaName"
              label="Area Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="age"
              label="Age (years)"
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>

            <Form.Item
              name="wateringFrequency"
              label="Watering Frequency"
            >
              <Select>
                <Select.Option value="daily">Daily</Select.Option>
                <Select.Option value="weekly">Weekly</Select.Option>
                <Select.Option value="monthly">Monthly</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="wateringAmount"
              label="Watering Amount (L)"
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>

            <Form.Item
              name="wateringDescription"
              label="Watering Description"
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item>
              <Space className="w-full justify-end">
                <Button onClick={() => setIsModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingAsset ? 'Update' : 'Create'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}