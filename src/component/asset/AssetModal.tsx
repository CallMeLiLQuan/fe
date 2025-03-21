"use client";

import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  App,
} from "antd";
import { Asset } from "@/service/asset.service";
import { useAssets } from "@/component/contexts/AssetContext";
import moment from "moment";
import locale from "antd/locale/vi_VN";

const { TextArea } = Input;
const { Option } = Select;

interface AssetModalProps {
  visible: boolean;
  onCancel: () => void;
  editingAsset: Asset | null;
  form: any;
}

const AssetModal: React.FC<AssetModalProps> = ({
  visible,
  onCancel,
  editingAsset,
  form,
}) => {
  const { message } = App.useApp();
  const { addAsset, updateAsset } = useAssets();
  const [loading, setLoading] = React.useState(false);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Xử lý ngày tháng
      if (values.purchaseDate) {
        values.purchaseDate = values.purchaseDate.toISOString();
      }

      // Thêm các giá trị mặc định
      const payload = {
        ...values,
        properties: values.properties || [],
        landName: values.landName || "Default Land",
        areaName: values.areaName || "Default Area",
      };

      console.log('Dữ liệu gửi lên server:', payload);

      if (editingAsset) {
        // Cập nhật
        const success = await updateAsset(editingAsset.id, payload);
        if (success) {
          message.success("Cập nhật tài sản thành công");
          onCancel();
        }
      } else {
        // Thêm mới
        const success = await addAsset(payload);
        if (success) {
          message.success("Thêm tài sản mới thành công");
          onCancel();
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý form:", error);
      message.error("Vui lòng kiểm tra lại thông tin!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingAsset ? "Chỉnh sửa tài sản" : "Thêm tài sản mới"}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "available",
          type: "equipment",
          category: "other",
          quantity: 1,
        }}
      >
        <Form.Item
          name="name"
          label="Tên tài sản"
          rules={[{ required: true, message: "Vui lòng nhập tên tài sản!" }]}
        >
          <Input placeholder="Nhập tên tài sản" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <TextArea
            placeholder="Nhập mô tả tài sản"
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Form.Item>

        <Form.Item
          name="type"
          label="Loại tài sản"
          rules={[{ required: true, message: "Vui lòng chọn loại tài sản!" }]}
        >
          <Select placeholder="Chọn loại tài sản">
            <Option value="equipment">Thiết bị</Option>
            <Option value="furniture">Nội thất</Option>
            <Option value="vehicle">Phương tiện</Option>
            <Option value="electronics">Điện tử</Option>
            <Option value="software">Phần mềm</Option>
            <Option value="land">Đất đai</Option>
            <Option value="building">Tòa nhà</Option>
            <Option value="other">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value="available">Khả dụng</Option>
            <Option value="in_use">Đang sử dụng</Option>
            <Option value="maintenance">Bảo trì</Option>
            <Option value="reserved">Đã đặt trước</Option>
            <Option value="retired">Đã loại bỏ</Option>
          </Select>
        </Form.Item>

        <Form.Item name="location" label="Vị trí">
          <Input placeholder="Nhập vị trí tài sản" />
        </Form.Item>

        <Form.Item
          name="value"
          label="Giá trị (VNĐ)"
        >
          <InputNumber
            style={{ width: "100%" }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => value ? Number(value.replace(/\D/g, "")) : 0}
            placeholder="Nhập giá trị tài sản"
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Số lượng"
          rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
        >
          <InputNumber
            min={1}
            style={{ width: "100%" }}
            placeholder="Nhập số lượng"
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Phân loại"
          rules={[{ required: true, message: "Vui lòng chọn phân loại!" }]}
        >
          <Select placeholder="Chọn phân loại">
            <Option value="office">Văn phòng</Option>
            <Option value="it">Công nghệ thông tin</Option>
            <Option value="furniture">Nội thất</Option>
            <Option value="equipment">Thiết bị</Option>
            <Option value="other">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item name="purchaseDate" label="Ngày mua">
          <DatePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày mua"
            locale={locale.DatePicker}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssetModal; 