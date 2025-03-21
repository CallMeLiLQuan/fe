"use client";

import { Employee } from "@/model/employee.model";
import {
  createEmployee,
  deleteEmployee,
  fetchEmployees,
  updateEmployee,
} from "@/service/employee.service";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  notification,
  Row,
  Table,
} from "antd";
import React, { useEffect, useState } from "react";
import EmployeeModal from "./EmployeeModal";

// Custom hook để lấy kích thước cửa sổ (window size)
const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return size;
};

const EmployeeTable: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  // State để lưu từ khóa tìm kiếm theo tên nhân viên
  const [searchName, setSearchName] = useState("");

  const size = useWindowSize();

  const loadEmployeesData = async () => {
    setLoading(true);
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh sách nhân viên",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeesData();
  }, []);

  // Lọc danh sách nhân viên theo tên dựa trên từ khóa searchName
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchName.toLowerCase())
  );

  // Sửa nhân viên: mở modal chỉnh sửa và set dữ liệu vào form
  const handleEdit = (record: Employee) => {
    setEditingEmployee(record);
    setVisible(true);
    form.setFieldsValue(record);
  };

  // Xoá nhân viên
  const handleDelete = async (id: number) => {
    try {
      await deleteEmployee(id);
      notification.success({
        message: "Thành công",
        description: "Xoá nhân viên thành công",
      });
      loadEmployeesData();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể xoá nhân viên",
      });
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 50 },
    { title: "Họ tên", dataIndex: "name", key: "name", width: 150 },
    { title: "Chức vụ", dataIndex: "position", key: "position", width: 150 },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone", width: 120 },
    { title: "Email", dataIndex: "email", key: "email", width: 200 },
    {
      title: "Khu vực",
      dataIndex: "area",
      key: "area",
      width: 120,
      render: (area: any) => (area ? area.name : ""),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_: any, record: Employee) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button type="default" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="default" danger onClick={() => handleDelete(record.id)}>
            Xoá
          </Button>
        </div>
      ),
    },
  ];

  // Thêm nhân viên: mở modal thêm mới
  const handleAdd = () => {
    setVisible(true);
    setEditingEmployee(null);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // Payload sẽ gồm các trường của employee và đối tượng user
      const payload = {
        ...values,
        user: {
          username: values.username,
          password: values.password,
          roleIds: [values.roleId],
        },
      };

      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, payload);
        notification.success({
          message: "Thành công",
          description: "Cập nhật nhân viên thành công",
        });
      } else {
        await createEmployee(payload);
        notification.success({
          message: "Thành công",
          description: "Tạo nhân viên thành công",
        });
      }
      setVisible(false);
      form.resetFields();
      setEditingEmployee(null);
      loadEmployeesData();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể lưu thông tin nhân viên",
      });
    }
  };

  const handleModalCancel = () => {
    setVisible(false);
    form.resetFields();
    setEditingEmployee(null);
  };

  return (
    <div className="employee-table-container" style={{ padding: 24 }}>
      {/* Header với tiêu đề, ô tìm kiếm theo tên nhân viên và nút Thêm nhân viên */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: 16, flexWrap: "wrap", gap: 16 }}
      >
        <Col>
          <h2 style={{ fontSize: size.width < 768 ? "1.5rem" : "2rem" }}>
            Quản lý Nhân viên
          </h2>
        </Col>
        <Col>
          <Input
            placeholder="Tìm theo tên nhân viên"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ width: 300, marginRight: 8 }}
          />
          <Button type="primary" onClick={handleAdd}>
            Thêm nhân viên
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={filteredEmployees}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }}
      />
      <EmployeeModal
        visible={visible}
        editingEmployee={editingEmployee}
        form={form}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        modalWidth={size.width < 768 ? "90%" : 520}
      />
    </div>
  );
};

export default EmployeeTable;
