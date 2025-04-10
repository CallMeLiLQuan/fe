"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Table, Button, App } from "antd";
import { Owner } from "@/model/owner.model";

import OwnerModal from "./OwnerModal";
import { deleteOwner, fetchOwners } from "@/service/owner.service";

const OwnerTable: React.FC = () => {
  const { message } = App.useApp();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(false);

  const loadOwners = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Starting to load owners');
      const data = await fetchOwners();
      console.log('Successfully loaded owners data:', data);
      setOwners(data || []);
    } catch (error) {
      console.error("Detailed error loading owners:", error);
      // Only show error message in UI if it's not a network error
      // Network errors often happen during development
      if (error instanceof Error) {
        message.error(`Lỗi khi tải danh sách chủ đất: ${error.message}`);
      } else {
        message.error("Lỗi khi tải danh sách chủ đất");
      }
      // Set owners to empty array on error
      setOwners([]);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    loadOwners();
  }, [loadOwners]);

  const handleEdit = (owner: Owner) => {
    setEditingOwner(owner);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOwner(String(id)); // Convert to string for API call
      message.success("Xóa thành công");
      loadOwners();
    } catch (error) {
      console.error("Error deleting owner:", error);
      message.error("Lỗi khi xóa chủ đất");
    }
  };

  const handleAdd = () => {
    setEditingOwner(null);
    setModalVisible(true);
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    loadOwners();
  };

  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Số lượng đất",
      dataIndex: "landCount",
      key: "landCount",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: unknown, record: Owner) => (
        <>
          <Button type="primary" onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
            Sửa
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm mới chủ đất
      </Button>
      <Table 
        dataSource={owners} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        pagination={{ defaultPageSize: 10 }}
      />
      <OwnerModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        owner={editingOwner}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default OwnerTable;
