"use client";

import TaskTable from "@/component/task/TaskTable";

export default function DemoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Danh sách dự án</h1>
      <TaskTable />
    </div>
  );
}
