export interface Owner {
  id: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  landCount: number;
  createdDate?: Date;
  properties?: { key: string; value: string | number | boolean }[];
}

export interface OwnerResponse {
  id: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  landCount: number;
  createdDate?: string;
  properties?: { key: string; value: string | number | boolean }[];
}

export const toOwner = (response: OwnerResponse): Owner => {
  return {
    ...response,
    createdDate: response.createdDate ? new Date(response.createdDate) : undefined,
  };
};

export const toOwnerResponse = (owner: Owner): OwnerResponse => {
  return {
    ...owner,
    createdDate: owner.createdDate ? owner.createdDate.toISOString() : undefined,
  };
};

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
