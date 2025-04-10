"use client";
import React, { useEffect } from "react";
import { Modal, Form, Input, App } from "antd";
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
  const { message } = App.useApp();
  const [form] = Form.useForm();

  useEffect(() => {
    if (owner) {
      // Exclude non-form fields when setting form values
      const { name, phone, address, email } = owner;
      form.setFieldsValue({ name, phone, address, email });
    } else {
      form.resetFields();
    }
  }, [owner, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Prepare data for API
      const ownerData = {
        ...values,
        landCount: owner?.landCount || 0,
      };
      
      console.log('Submitting owner data:', ownerData);
      
      if (owner) {
        await updateOwner(String(owner.id), ownerData);
        message.success("Cập nhật thành công");
      } else {
        await createOwner(ownerData);
        message.success("Thêm mới thành công");
      }
      onSuccess();
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("Có lỗi xảy ra");
      }
    }
  };

  return (
    <Modal
      title={owner ? "Chỉnh sửa chủ đất" : "Thêm mới chủ đất"}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose={true}
    >
      <Form form={form} layout="vertical" preserve={false}>
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
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input />
        </Form.Item>
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
      </Form>
    </Modal>
  );
};

export default OwnerModal;
