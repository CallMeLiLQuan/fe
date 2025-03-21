"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Button,
  Space,
  Tabs,
  Table,
  App,
  Descriptions,
  Modal,
  Form,
  Input,
  Popconfirm,
  Select
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { getAreaById, updateArea, assignEmployeeToArea, createTask, removeEmployeeFromArea, deleteTask } from "@/service/area.service";
import { Area, AreaClassification } from "@/model/area.model";
import { Employee } from "@/model/employee.model";
import { Task } from "@/model/task.model";
import { updateLand } from "@/service/land.service";
import { toApiCoordinates } from "@/model/coordinate.model";
import dynamic from 'next/dynamic';

const ViewOnlyMap = dynamic(() => import('@/component/map/ViewOnlyMap'), { ssr: false });

interface TableEmployee extends Employee {
  key: string;
}

interface TableTask extends Task {
  key: string;
}

interface EmployeeFormValues {
  id: number;
  name: string;
  position: string;
}

interface TaskFormValues {
  title: string;
  description: string;
  status: string;
}

interface AreaFormValues {
  name: string;
  areaName: string;
  landPlot: string;
  status: 'available' | 'in-use' | 'pending';
  area: number;
  usage: string;
  classification: AreaClassification;
}

interface LandFormValues {
  name: string;
  address: string;
  area: number;
  price: number;
  location: string;
  areaCount: number;
}

export default function AreaDetail() {
  const router = useRouter();
  const params = useParams();
  const [area, setArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isEmployeeModalVisible, setIsEmployeeModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLandEditModalVisible, setIsLandEditModalVisible] = useState(false);
  const [taskForm] = Form.useForm<TaskFormValues>();
  const [employeeForm] = Form.useForm<EmployeeFormValues>();
  const [areaForm] = Form.useForm<AreaFormValues>();
  const [landForm] = Form.useForm<LandFormValues>();
  const { message: messageApi } = App.useApp();

  useEffect(() => {
    const loadArea = async () => {
      try {
        const areaId = Array.isArray(params?.id) ? params.id[0] : params?.id;
        
        if (!areaId) {
          console.error('Area ID is undefined');
          messageApi.error('Invalid area ID');
          setLoading(false);
          return;
        }
        
        const response = await getAreaById(parseInt(areaId));
        console.log('Raw data from API:', response);
        
        if (!response) {
          messageApi.error('No data received from server');
          setLoading(false);
          return;
        }

        setArea(response);
        
        // Initialize form values after area data is loaded
        if (response) {
          areaForm.setFieldsValue({
            name: response.name,
            areaName: response.areaName,
            landPlot: response.landPlot,
            status: response.status,
            area: response.area,
            usage: response.usage,
            classification: response.classification
          });

          if (response.land) {
            landForm.setFieldsValue({
              name: response.land.name,
              address: response.land.address,
              area: response.land.area,
              price: response.land.price,
              location: response.land.location,
              areaCount: response.land.areaCount
            });
          }
        }
      } catch (error) {
        console.error('Error loading area:', error);
        messageApi.error('Failed to load area details');
      } finally {
        setLoading(false);
      }
    };
    
    loadArea();

    return () => {
      areaForm.resetFields();
      employeeForm.resetFields();
      taskForm.resetFields();
      landForm.resetFields();
    };
  }, [params, messageApi, areaForm, employeeForm, taskForm, landForm]);

  const handleAreaEdit = async (values: AreaFormValues) => {
    try {
      if (!area?.id) {
        messageApi.error('Area ID is missing');
        return;
      }

      const updatedArea = await updateArea(area.id, {
        ...values,
        coordinates: area.coordinates ? toApiCoordinates(area.coordinates) : undefined
      });

      if (updatedArea) {
        setArea(updatedArea);
        messageApi.success('Area updated successfully');
        setIsEditModalVisible(false);
      }
    } catch (error) {
      console.error('Error updating area:', error);
      messageApi.error('Failed to update area');
    }
  };

  const handleEmployeeAdd = async (values: EmployeeFormValues) => {
    try {
      if (!area?.id) return;

      setLoading(true);
      const response = await assignEmployeeToArea(area.id, values.id);
      if (response) {
        setArea(prev => {
          if (!prev) return null;
          const updatedEmployees = [...(prev.employees as Employee[])];
          if (!updatedEmployees.some(emp => emp.id === response.id)) {
            updatedEmployees.push(response as Employee);
          }
          return {
            ...prev,
            employees: updatedEmployees
          };
        });
        setIsEmployeeModalVisible(false);
        employeeForm.resetFields();
        messageApi.success('Employee added successfully');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      messageApi.error('Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAdd = async (values: TaskFormValues) => {
    try {
      if (!area?.id) return;

      setLoading(true);
      const response = await createTask(area.id, {
        ...values,
        areaId: area.id
      });
      
      if (response) {
        setArea(prev => {
          if (!prev) return null;
          const updatedTasks = [...(prev.tasks as Task[])];
          if (!updatedTasks.some(task => task.id === response.id)) {
            updatedTasks.push(response as Task);
          }
          return {
            ...prev,
            tasks: updatedTasks
          };
        });
        setIsTaskModalVisible(false);
        taskForm.resetFields();
        messageApi.success('Task added successfully');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      messageApi.error('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeRemove = async (employeeId: number) => {
    try {
      if (!area?.id) return;
      
      await removeEmployeeFromArea(area.id, employeeId);
      setArea(prev => prev ? {
        ...prev,
        employees: (prev.employees as Employee[]).filter(emp => emp.id !== employeeId)
      } : null);
      messageApi.success('Employee removed successfully');
    } catch (error) {
      console.error('Error removing employee:', error);
      messageApi.error('Failed to remove employee');
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    try {
      if (!area?.id) return;
      
      await deleteTask(area.id, taskId);
      setArea(prev => prev ? {
        ...prev,
        tasks: (prev.tasks as Task[]).filter(task => task.id !== taskId)
      } : null);
      messageApi.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      messageApi.error('Failed to delete task');
    }
  };

  const handleLandEdit = async (values: LandFormValues) => {
    try {
      if (!area?.land?.id) {
        messageApi.error('Land ID is missing');
        return;
      }

      const updatedLand = await updateLand(area.land.id, values);
      if (updatedLand) {
        setArea(prev => prev ? { ...prev, land: updatedLand } : null);
        messageApi.success('Land updated successfully');
        setIsLandEditModalVisible(false);
      }
    } catch (error) {
      console.error('Error updating land:', error);
      messageApi.error('Failed to update land');
    }
  };

  const tabItems = [
    {
      key: 'info',
      label: 'Basic Information',
      children: (
        <Card>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Name">{area?.name}</Descriptions.Item>
            <Descriptions.Item label="Area Name">{area?.areaName}</Descriptions.Item>
            <Descriptions.Item label="Land Plot">{area?.landPlot}</Descriptions.Item>
            <Descriptions.Item label="Status">{area?.status}</Descriptions.Item>
            <Descriptions.Item label="Area">{area?.area} m²</Descriptions.Item>
            <Descriptions.Item label="Usage">{area?.usage}</Descriptions.Item>
            <Descriptions.Item label="Classification">{area?.classification}</Descriptions.Item>
          </Descriptions>
          <div className="mt-4 flex justify-end">
            <Button 
              type="primary"
              onClick={() => router.push(`/area/${area?.id}`)}
            >
              View Details
            </Button>
          </div>
        </Card>
      )
    },
    {
      key: 'map',
      label: 'Map View',
      children: (
        <div className="h-[600px] mb-6">
          {area?.coordinates && (
            <ViewOnlyMap
              coordinates={area.coordinates}
            />
          )}
        </div>
      )
    },
    {
      key: 'employees',
      label: 'Employees',
      children: (
        <div>
          <div className="mb-4">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsEmployeeModalVisible(true)}
            >
              Add Employee
            </Button>
          </div>
          <Table<TableEmployee>
            rowKey="id"
            dataSource={(area?.employees as Employee[] || []).map(emp => ({
              ...emp,
              key: String(emp.id)
            }))}
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name'
              },
              {
                title: 'Position',
                dataIndex: 'position',
                key: 'position'
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record: TableEmployee) => (
                  <Space>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                        employeeForm.setFieldsValue(record);
                        setIsEmployeeModalVisible(true);
                      }}
                    />
                    <Popconfirm
                      title="Are you sure you want to remove this employee?"
                      onConfirm={() => handleEmployeeRemove(record.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  </Space>
                )
              }
            ]}
          />
        </div>
      )
    },
    {
      key: 'tasks',
      label: 'Tasks',
      children: (
        <div>
          <div className="mb-4">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsTaskModalVisible(true)}
            >
              Add Task
            </Button>
          </div>
          <Table<TableTask>
            rowKey="id"
            dataSource={(area?.tasks as Task[] || []).map(task => ({
              ...task,
              key: String(task.id || '')
            }))}
          columns={[
              {
                title: 'Title',
                dataIndex: 'title',
                key: 'title'
              },
              {
                title: 'Description',
                dataIndex: 'description',
                key: 'description'
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status'
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record: TableTask) => (
                  <Space>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                        taskForm.setFieldsValue(record);
                        setIsTaskModalVisible(true);
                      }}
                    />
                    <Popconfirm
                      title="Are you sure you want to delete this task?"
                      onConfirm={() => handleTaskDelete(record.id || 0)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  </Space>
                )
              }
            ]}
          />
        </div>
      )
    }
  ];

  if (loading) return <div>Loading...</div>;
  if (!area) return <div>Area not found</div>;

  return (
    <div className="p-6">
      <Card className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{area.name}</h1>
            <p className="text-gray-600">{area.areaName}</p>
          </div>
          <Space>
            <Button 
              icon={<EditOutlined />}
              onClick={() => setIsLandEditModalVisible(true)}
            >
              Edit Land
            </Button>
            <Button 
              icon={<EditOutlined />}
              onClick={() => setIsEditModalVisible(true)}
            >
              Edit Area
            </Button>
          </Space>
        </div>
      </Card>

      <Tabs defaultActiveKey="info" items={tabItems} />

      <Form form={areaForm} component={false} onFinish={handleAreaEdit}>
        <Modal
          title="Edit Area"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          onOk={() => areaForm.submit()}
          destroyOnClose={false}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Area Name"
            name="areaName"
            rules={[{ required: true, message: 'Please input the area name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Land Plot"
            name="landPlot"
            rules={[{ required: true, message: 'Please input the land plot!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select>
              <Select.Option value="available">Available</Select.Option>
              <Select.Option value="in-use">In Use</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Area (m²)"
            name="area"
            rules={[{ required: true, message: 'Please input the area!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Usage"
            name="usage"
            rules={[{ required: true, message: 'Please input the usage!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Classification"
            name="classification"
            rules={[{ required: true, message: 'Please select the classification!' }]}
          >
            <Select>
              <Select.Option value={AreaClassification.PLANT}>Plant</Select.Option>
              <Select.Option value={AreaClassification.OTHER}>Other</Select.Option>
            </Select>
          </Form.Item>
        </Modal>
      </Form>

      <Form form={landForm} component={false} onFinish={handleLandEdit}>
        <Modal
          title="Edit Land"
          open={isLandEditModalVisible}
          onCancel={() => setIsLandEditModalVisible(false)}
          onOk={() => landForm.submit()}
          destroyOnClose={false}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: 'Please input the address!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Area (m²)"
            name="area"
            rules={[{ required: true, message: 'Please input the area!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: 'Please input the price!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: 'Please input the location!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Area Count"
            name="areaCount"
            rules={[{ required: true, message: 'Please input the area count!' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Modal>
      </Form>

      <Modal
        title="Add Employee"
        open={isEmployeeModalVisible}
        onCancel={() => {
          setIsEmployeeModalVisible(false);
        }}
        onOk={() => employeeForm.submit()}
        destroyOnClose={false}
      >
        <Form
          form={employeeForm}
          layout="vertical"
          onFinish={handleEmployeeAdd}
          preserve={true}
        >
          <Form.Item
            label="Employee ID"
            name="id"
            rules={[{ required: true, message: 'Please input employee ID!' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Task"
        open={isTaskModalVisible}
        onCancel={() => {
          setIsTaskModalVisible(false);
        }}
        onOk={() => taskForm.submit()}
        destroyOnClose={false}
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleTaskAdd}
          preserve={true}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please input task title!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input task description!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select task status!' }]}
          >
            <Select>
              <Select.Option value="TODO">To Do</Select.Option>
              <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
              <Select.Option value="COMPLETED">Completed</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
