import { api } from "./api";

export const getTags = async (pageNumber = 1, pageSize = 100) => {
  const response = await api.get(`/document/tags?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  return response.data.data.items;
};
