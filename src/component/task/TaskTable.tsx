"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  message,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import moment from "moment";
import TaskModal from "./TaskModal";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  fetchEmployees,
} from "@/service/task.service";
import { fetchTaskDocuments } from "@/service/taskDocument.service";
import { Task, Employee } from "@/model/task.model";

const { Option } = Select;

interface TaskDocumentsMap {
  [taskId: number]: Array<{
    id: number;
    fileName: string;
    filePath?: string; // hoặc fileUrl nếu dùng URL công khai
    description?: string;
    taskId: number;
    createdAt?: string;
  }>;
}

const TaskTable: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [taskDocuments, setTaskDocuments] = useState<TaskDocumentsMap>({});
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();

  // State cho modal xác nhận xoá
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);

  // State cho tìm kiếm và lọc
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (error) {
      message.error("Không thể tải danh sách công việc");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const empData = await fetchEmployees();
      setEmployees(empData);
    } catch (error) {
      message.error("Không thể tải danh sách nhân viên");
    }
  };

  const loadTaskDocuments = async () => {
    try {
      const docs = await fetchTaskDocuments();
      // Nhóm các task document theo taskId
      const grouped: TaskDocumentsMap = {};
      docs.forEach((doc) => {
        if (!grouped[doc.taskId]) {
          grouped[doc.taskId] = [];
        }
        grouped[doc.taskId].push(doc);
      });
      setTaskDocuments(grouped);
    } catch (error) {
      message.error("Không thể tải danh sách đính kèm");
    }
  };

  useEffect(() => {
    loadTasks();
    loadEmployees();
    loadTaskDocuments();
  }, []);

  const handleEdit = (record: Task) => {
    setEditingTask(record);
    setVisible(true);
    form.setFieldsValue({
      ...record,
      created_date: record.created_date ? moment(record.created_date) : null,
      end_date: record.end_date ? moment(record.end_date) : null,
    });
  };

  const handleDelete = (id: number) => {
    setDeleteTaskId(id);
    setConfirmVisible(true);
  };

  const handleConfirmOk = async () => {
    if (deleteTaskId === null) return;
    try {
      await deleteTask(deleteTaskId);
      message.success("Xoá công việc thành công");
      loadTasks();
    } catch (error) {
      message.error("Không thể xoá công việc");
    } finally {
      setConfirmVisible(false);
      setDeleteTaskId(null);
    }
  };

  const handleConfirmCancel = () => {
    setConfirmVisible(false);
    setDeleteTaskId(null);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      ?.toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus = filterStatus ? task.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 50 },
    { title: "Tiêu đề", dataIndex: "title", key: "title", width: 150 },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
    },
    {
      title: "Người phụ trách",
      key: "assigneeName",
      width: 120,
      render: (_: any, record: Task) => {
        const emp = employees.find((e) => e.id === record.assigneeId);
        return emp ? emp.name : "";
      },
    },
    {
      title: "Người phê duyệt",
      key: "approverName",
      width: 120,
      render: (_: any, record: Task) => {
        const emp = employees.find((e) => e.id === record.approverId);
        return emp ? emp.name : "";
      },
    },
    {
      title: "Chi phí",
      dataIndex: "cost",
      key: "cost",
      width: 100,
      render: (cost: number | null) => (cost != null ? cost : ""),
    },
    {
      title: "Chi phí thực tế",
      dataIndex: "actualCost",
      key: "actualCost",
      width: 120,
      render: (actualCost: number | null) =>
        actualCost != null ? actualCost : "",
    },
    // {
    //   title: "Đính kèm",
    //   key: "attachment",
    //   width: 150,
    //   render: (_: unknown, record: Task) => {
    //     // Nếu record.id có thể là undefined, ta kiểm tra trước
    //     if (!record.id) {
    //       return "";
    //     }

    //     // Ép kiểu hoặc khai báo rõ ràng docs là DocumentItem[]
    //     const docs: DocumentItem[] = taskDocuments[record.id] || [];

    //     if (docs.length === 0) return "";

    //     return docs.map((doc: DocumentItem, index: number) => {
    //       // Kiểm tra nếu file là ảnh (dựa trên extension)
    //       if (doc.filePath && doc.filePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
    //         return (
    //           <img
    //             key={index}
    //             src={doc.filePath}
    //             alt={doc.fileName}
    //             style={{ width: 50, height: 50, marginRight: 8 }}
    //           />
    //         );
    //       }
    //       // Nếu không phải ảnh, hiển thị link
    //       return (
    //         <a
    //           key={index}
    //           href={doc.filePath}
    //           target="_blank"
    //           rel="noopener noreferrer"
    //           style={{ marginRight: 8 }}
    //         >
    //           {doc.fileName}
    //         </a>
    //       );
    //     });
    //   },
    // },

    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      key: "created_date",
      width: 120,
      render: (date: string) => (date ? moment(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "end_date",
      key: "end_date",
      width: 120,
      render: (date: string) => (date ? moment(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_: any, record: Task) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button type="default" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button
            type="default"
            danger
            onClick={() => handleDelete(record.id!)}
          >
            Xoá
          </Button>
        </div>
      ),
    },
  ];

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (values.created_date) {
        values.created_date = values.created_date.toISOString();
      }
      if (values.end_date) {
        values.end_date = values.end_date.toISOString();
      }
      if (editingTask) {
        await updateTask(editingTask.id!, values);
        message.success("Cập nhật công việc thành công");
      } else {
        await createTask(values);
        message.success("Tạo công việc thành công");
      }
      setVisible(false);
      form.resetFields();
      setEditingTask(null);
      loadTasks();
      // Tải lại danh sách đính kèm sau khi thay đổi
      loadTaskDocuments();
    } catch (error) {
      message.error("Không thể lưu thông tin công việc");
    }
  };

  const handleModalCancel = () => {
    setVisible(false);
    form.resetFields();
    setEditingTask(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý Công việc</h2>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Input
            placeholder="Tìm kiếm theo tiêu đề"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: "100%" }}
            value={filterStatus || undefined}
            onChange={(value) => setFilterStatus(value)}
            allowClear
          >
            <Option value="chưa xong">Chưa xong</Option>
            <Option value="hoàn thành">Hoàn thành</Option>
          </Select>
        </Col>
      </Row>
      <Button
        type="primary"
        onClick={() => {
          setVisible(true);
          setEditingTask(null);
          form.resetFields();
        }}
        style={{ marginBottom: 16 }}
      >
        Thêm Công việc
      </Button>
      <Table
        columns={columns}
        dataSource={filteredTasks}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }}
      />
      <TaskModal
        visible={visible}
        editingTask={editingTask}
        form={form}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
      {/* Modal xác nhận xoá */}
      <Modal
        visible={confirmVisible}
        title="Xác nhận xoá"
        onOk={handleConfirmOk}
        onCancel={handleConfirmCancel}
        okText="Có"
        cancelText="Không"
        zIndex={10000}
      >
        <p>Bạn có chắc chắn muốn xoá công việc này?</p>
      </Modal>
    </div>
  );
};

export default TaskTable;
