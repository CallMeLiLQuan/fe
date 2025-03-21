export interface Owner {
  id: number;
  name: string;
  phone: string;
  address: string;
  email?: string;
  identityNumber?: string;
  landCount: number;
  created_date?: string;
  modified_date?: string;
  status?: string;
  description?: string;
  properties?: Property[];
}

export interface Property {
  id: number;
  plotNumber: string;
  area: number;
  address: string;
  status: string;
  documents?: Document[];
}

export interface Document {
  id: number;
  title: string;
  type: string;
  url: string;
  uploadDate: string;
}
