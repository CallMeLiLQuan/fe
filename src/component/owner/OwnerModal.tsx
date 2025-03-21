"use client";
import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";
import { Owner } from "@/model/owner.model";
import { createOwner, updateOwner } from "@/service/owner.service";

interface OwnerModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  owner?: Owner | null;
}

const OwnerModal: React.FC<OwnerModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  owner,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (owner) {
      form.setFieldsValue(owner);
    } else {
      form.resetFields();
    }
  }, [owner, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (owner) {
        // Cập nhật owner
        await updateOwner(owner.id, values);
        message.success("Cập nhật thành công");
      } else {
        // Tạo mới owner
        await createOwner(values);
        message.success("Thêm mới thành công");
      }
      onSuccess();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("Có lỗi xảy ra");
      }
    }
  };

  return (
    <Modal
      title={owner ? "Chỉnh sửa Owner" : "Thêm mới Owner"}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input />
        </Form.Item>
        {/* Thêm trường Số điện thoại */}
        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Số lượng đất"
          name="landCount"
          rules={[{ required: true, message: "Vui lòng nhập số lượng đất" }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OwnerModal;
