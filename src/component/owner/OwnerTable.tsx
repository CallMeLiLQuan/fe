"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, message } from "antd";
import { Owner } from "@/model/owner.model";

import OwnerModal from "./OwnerModal";
import { deleteOwner, fetchOwners } from "@/service/owner.service";

const OwnerTable: React.FC = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);

  const loadOwners = async () => {
    try {
      const data = await fetchOwners();
      setOwners(data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách owner");
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  const handleEdit = (owner: Owner) => {
    setEditingOwner(owner);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOwner(id);
      message.success("Xóa thành công");
      loadOwners();
    } catch (error) {
      message.error("Lỗi khi xóa owner");
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
      title: "Số lượng đất",
      dataIndex: "landCount",
      key: "landCount",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: Owner) => (
        <>
          <Button type="default" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="default" danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm mới Owner
      </Button>
      <Table dataSource={owners} columns={columns} rowKey="id" />
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
