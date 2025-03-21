export interface Task {
  id?: number;
  title: string;
  description?: string;
  assigneeId?: number;
  approverId?: number;
  parentTask?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  cost?: number;
  actualCost?: number;
  attachment?: any;
  areaId?: number; // dùng cho "Khu vực"
  status?: string;
  created_date?: string;
  end_date?: string;
}

export interface Employee {
  id: number;
  name: string;
  department?: string;
}

export interface Area {
  id: number;
  name: string;
}
