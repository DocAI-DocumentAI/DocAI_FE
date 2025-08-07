import { api } from "./api";

export interface Tag {
  id: string;
  name: string;
  createdBy: string;
  createdByName: string;
  createdTime: string;
  lastUpdatedBy: string | null;
  lastUpdatedByName: string | null;
  lastUpdatedTime: string | null;
}

export const getTags = async (pageNumber = 1, pageSize = 10) => {
  const response = await api.get(`/document/tags?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  return response.data.data;
};

export const createTag = async (data: { name: string }) => {
  const response = await api.post('/document/tags', data);
  return response.data;
};

export const updateTag = async (id: string, data: { name: string }) => {
  const response = await api.put(`/document/tags/${id}`, data);
  return response.data;
};

export const deleteTag = async (id: string) => {
  const response = await api.delete(`/document/tags/${id}`);
  return response.data;
};
