import axios from "axios";

const API_URL = "/task-documents";

export const createDocument = async (documentData: any) => {
  const response = await axios.post(API_URL, documentData);
  return response.data;
};

export const fetchDocuments = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const updateDocument = async (id: string, documentData: any) => {
  const response = await axios.patch(`${API_URL}/${id}`, documentData);
  return response.data;
};

export const deleteDocument = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
