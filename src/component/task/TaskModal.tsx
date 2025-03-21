"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  InputNumber,
  Checkbox,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import type { FormInstance } from "antd/es/form";
import { fetchAreas, fetchEmployees } from "@/service/task.service";
// Sử dụng API upload file từ service Task Document (đảm bảo đường dẫn import chính xác)
import { uploadTaskDocument } from "@/service/taskDocument.service";
import { Task } from "@/model/task.model";

const { Option } = Select;

export interface Employee {
  id: number;
  name: string;
}

export interface Area {
  id: number;
  name: string;
}

interface TaskModalProps {
  visible: boolean;
  editingTask: Task | null;
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  editingTask,
  form,
  onOk,
  onCancel,
}) => {
  // Lưu danh sách employee và area lấy từ API
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  // Khi modal mở, load danh sách employee và area
  useEffect(() => {
    if (visible) {
      const loadData = async () => {
        try {
          const empData = await fetchEmployees();
          setEmployees(empData);
        } catch (error) {
          console.error("Error loading employees", error);
        }
        try {
          const areaData = await fetchAreas();
          setAreas(areaData);
        } catch (error) {
          console.error("Error loading areas", error);
        }
      };
      loadData();
    }
  }, [visible]);

  // Custom upload sử dụng API uploadTaskDocument
  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      // Nếu cần gửi thêm dữ liệu (ví dụ taskId, mô tả) bạn có thể truyền vào additionalData
      const response = await uploadTaskDocument(file);
      // Khi upload thành công, onSuccess trả về response từ API
      onSuccess(response);
    } catch (error) {
      onError(error);
    }
  };

  // Hàm xử lý dữ liệu file từ Upload component
  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e && e.fileList;
  };

  // Khi modal mở, set giá trị cho form nếu đang chỉnh sửa task
  useEffect(() => {
    if (visible) {
      if (editingTask) {
        form.setFieldsValue({
          ...editingTask,
          created_date: editingTask.created_date
            ? moment(editingTask.created_date)
            : null,
          end_date: editingTask.end_date ? moment(editingTask.end_date) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingTask, form]);

  return (
    <Modal
      visible={visible}
      title={editingTask ? "Chỉnh sửa Công việc" : "Thêm Công việc"}
      onOk={onOk}
      onCancel={onCancel}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[
            { required: true, message: "Vui lòng nhập tiêu đề công việc" },
          ]}
        >
          <Input placeholder="Nhập tiêu đề công việc" />
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} placeholder="Nhập mô tả công việc" />
        </Form.Item>
        <Form.Item
          name="assigneeId"
          label="Người phụ trách"
          rules={[{ required: true, message: "Chọn người phụ trách" }]}
        >
          <Select placeholder="Chọn người phụ trách">
            {employees.map((emp) => (
              <Option key={emp.id} value={emp.id}>
                {emp.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="approverId"
          label="Người phê duyệt"
          rules={[{ required: true, message: "Chọn người phê duyệt" }]}
        >
          <Select placeholder="Chọn người phê duyệt">
            {employees.map((emp) => (
              <Option key={emp.id} value={emp.id}>
                {emp.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="parentTask" label="Công việc cha">
          <Input placeholder="Nhập tiêu đề công việc cha (nếu có)" />
        </Form.Item>
        <Form.Item name="isRecurring" label="Lặp lại" valuePropName="checked">
          <Checkbox style={{ textAlign: "left", display: "block" }} />
        </Form.Item>
        <Form.Item name="recurrencePattern" label="Chu kỳ">
          <Input placeholder="VD: Hàng tuần, hàng tháng..." />
        </Form.Item>
        <Form.Item name="cost" label="Chi phí">
          <InputNumber placeholder="Nhập chi phí" type="number" />
        </Form.Item>
        <Form.Item name="actualCost" label="Chi phí thực tế">
          <InputNumber placeholder="Nhập chi phí thực tế" type="number" />
        </Form.Item>
        {/* <Form.Item
          name="attachment"
          label="Đính kèm"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            name="attachment"
            customRequest={customUpload}
            listType="text"
          >
            <Button icon={<UploadOutlined />}>Tải file</Button>
          </Upload>
        </Form.Item> */}
        <Form.Item
          name="areaId"
          label="Khu vực"
          rules={[{ required: true, message: "Chọn khu vực" }]}
        >
          <Select placeholder="Chọn khu vực">
            {areas.map((area) => (
              <Option key={area.id} value={area.id}>
                {area.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: "Chọn trạng thái" }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value="chưa xong">Chưa xong</Option>
            <Option value="hoàn thành">Hoàn thành</Option>
          </Select>
        </Form.Item>
        <Form.Item name="created_date" label="Ngày tạo">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="end_date" label="Ngày kết thúc">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskModal;
