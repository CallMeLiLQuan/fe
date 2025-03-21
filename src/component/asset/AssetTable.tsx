"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Form,
  Row,
  Col,
  Tag,
  App,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Asset } from "@/service/asset.service";
import { useAssets } from "@/component/contexts/AssetContext";
import AssetModal from "./AssetModal";
import moment from "moment";
import Link from "next/link";
import { ColumnType } from "antd/es/table";

const { Option } = Select;

const AssetTable: React.FC = () => {
  const { message, modal } = App.useApp();
  const { assets, loading, error, loadAssets, removeAsset } = useAssets();
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [form] = Form.useForm();

  // Tải dữ liệu ban đầu
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Xử lý tìm kiếm
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Xử lý thêm mới
  const handleAdd = () => {
    setEditingAsset(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Xử lý chỉnh sửa
  const handleEdit = (record: Asset) => {
    setEditingAsset(record);
    form.setFieldsValue({
      ...record,
      purchaseDate: record.purchaseDate ? moment(record.purchaseDate) : null,
    });
    setModalVisible(true);
  };

  // Xử lý xóa
  const handleDelete = (id: number) => {
    modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa tài sản này không?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const success = await removeAsset(id);
          if (success) {
            message.success("Xóa tài sản thành công");
          } else {
            message.error("Không thể xóa tài sản");
          }
        } catch (error) {
          message.error("Xóa tài sản thất bại");
        }
      },
    });
  };

  // Xử lý đóng modal
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  // Xử lý lọc dữ liệu
  const filteredAssets = assets.filter((asset) => {
    const matchSearch = asset.name.toLowerCase().includes(searchText.toLowerCase());
    const matchType = !typeFilter || asset.type === typeFilter;
    const matchStatus = !statusFilter || asset.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  // Danh sách trạng thái
  const statusOptions = [
    { label: "Khả dụng", value: "available" },
    { label: "Đang sử dụng", value: "in_use" },
    { label: "Bảo trì", value: "maintenance" },
    { label: "Đã đặt trước", value: "reserved" },
    { label: "Đã loại bỏ", value: "retired" },
  ];

  // Danh sách loại tài sản
  const typeOptions = [
    { label: "Thiết bị", value: "equipment" },
    { label: "Nội thất", value: "furniture" },
    { label: "Phương tiện", value: "vehicle" },
    { label: "Điện tử", value: "electronics" },
    { label: "Phần mềm", value: "software" },
    { label: "Đất đai", value: "land" },
    { label: "Tòa nhà", value: "building" },
    { label: "Khác", value: "other" },
  ];

  // Cấu hình cột
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên tài sản",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => {
        const option = typeOptions.find((opt) => opt.value === type);
        return option ? option.label : type;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const option = statusOptions.find((opt) => opt.value === status);
        return (
          <Tag color={
            status === 'available' ? 'green' :
            status === 'in_use' ? 'blue' :
            status === 'maintenance' ? 'orange' :
            status === 'reserved' ? 'purple' :
            'red'
          }>
            {option ? option.label : status}
          </Tag>
        );
      },
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      width: 150,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      width: 120,
      render: (value: number) => value ? value.toLocaleString('vi-VN') + ' đ' : '',
    },
    {
      title: "Phân loại",
      dataIndex: "category",
      key: "category",
      width: 120,
    },
    {
      title: "Khu đất",
      dataIndex: "landName",
      key: "landName",
      width: 150,
    },
    // In your columns configuration, add a link to the area name
    {
      title: "Khu vực",
      dataIndex: "areaName",
      key: "areaName",
      width: 150,
      render: (text: string, record: Asset) => (
        <Link href={`/area/${record.area?.id}`}>
          {record.area ? record.area.name : text}
        </Link>
      ),
    },
    {
      title: "Ngày mua",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      width: 120,
      render: (date: string) => date ? moment(date).format('DD/MM/YYYY') : '',
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: 'right',
      render: (_: any, record: Asset) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Update the Table component to handle horizontal scrolling
  return (
    <div style={{ padding: "24px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>Quản lý Tài sản</h2>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => loadAssets()}
              loading={loading}
            >
              Tải lại
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Thêm mới
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Tìm kiếm theo tên"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
        </Col>
        <Col span={8}>
          <Select
            style={{ width: "100%" }}
            placeholder="Lọc theo loại"
            onChange={(value) => setTypeFilter(value)}
            allowClear
          >
            {typeOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            style={{ width: "100%" }}
            placeholder="Lọc theo trạng thái"
            onChange={(value) => setStatusFilter(value)}
            allowClear
          >
            {statusOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns as ColumnType<Asset>[]}
        dataSource={filteredAssets}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1500 }}
      />

      <AssetModal
        visible={modalVisible}
        onCancel={handleCancel}
        editingAsset={editingAsset}
        form={form}
      />
    </div>
  );
};

export default AssetTable;