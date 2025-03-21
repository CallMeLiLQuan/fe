"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import { fetchAreas } from "@/service/employee.service"; // API lấy danh sách khu vực
import { Employee } from "@/model/employee.model";

const { Option } = Select;

export interface Area {
  id: number;
  name: string;
}

interface EmployeeModalProps {
  visible: boolean;
  editingEmployee: Employee | null;
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
  /**
   * Thuộc tính tùy chọn cho phép bạn điều chỉnh độ rộng của Modal.
   * Nếu không truyền, Ant Design sẽ sử dụng độ rộng mặc định.
   */
  modalWidth?: string | number;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  visible,
  editingEmployee,
  form,
  onOk,
  onCancel,
  modalWidth, // Thêm prop modalWidth
}) => {
  const [areas, setAreas] = useState<Area[]>([]);

  // Tải danh sách khu vực khi modal mở
  useEffect(() => {
    if (visible) {
      const loadAreasData = async () => {
        try {
          const data = await fetchAreas();
          setAreas(data);
        } catch (error) {
          console.error("Không thể tải danh sách khu vực", error);
        }
      };
      loadAreasData();
    }
  }, [visible]);

  // Khi modal mở, nếu có employee cần chỉnh sửa thì set dữ liệu vào form
  // nếu không thì reset form
  useEffect(() => {
    if (visible) {
      if (editingEmployee) {
        form.setFieldsValue(editingEmployee);
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingEmployee, form]);

  return (
    <Modal
      open={visible}
      title={editingEmployee ? "Chỉnh sửa Nhân viên" : "Thêm Nhân viên"}
      onOk={onOk}
      onCancel={onCancel}
      destroyOnClose
      // Sử dụng modalWidth để điều chỉnh độ rộng của Modal
      width={modalWidth}
    >
      <Form form={form} layout="vertical">
        {/* Thông tin Employee */}
        <Form.Item
          name="name"
          label="Họ tên"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input placeholder="Nhập họ tên" />
        </Form.Item>
        <Form.Item
          name="position"
          label="Chức vụ"
          rules={[{ required: true, message: "Vui lòng nhập chức vụ" }]}
        >
          <Input placeholder="Nhập chức vụ" />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại">
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input placeholder="Nhập email" />
        </Form.Item>
        <Form.Item
          name="areaId"
          label="Khu vực"
          rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}
        >
          <Select placeholder="Chọn khu vực">
            {areas.map((area) => (
              <Option key={area.id} value={area.id}>
                {area.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Thông tin tài khoản user */}
        <Form.Item
          name="username"
          label="Tài khoản"
          rules={[{ required: true, message: "Vui lòng nhập tên tài khoản" }]}
        >
          <Input placeholder="Nhập tên tài khoản" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>
        {/* Chọn vai trò */}
        <Form.Item
          name="roleId"
          label="Vai trò"
          rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
        >
          <Select placeholder="Chọn vai trò">
            <Option value={1}>Admin</Option>
            <Option value={2}>Manager</Option>
            <Option value={3}>Employee</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmployeeModal;
