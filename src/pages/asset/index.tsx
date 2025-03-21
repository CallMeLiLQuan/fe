const columns = [
  // ... Các cột hiện có
  {
    title: 'Phân loại',
    dataIndex: 'category',
    key: 'category',
    render: (text: string) => text === 'tree' ? 'Cây' : 'Khác',
  },
  // ... Các cột khác
]; 