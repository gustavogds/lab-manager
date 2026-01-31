import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_PATH,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const csrfToken = cookies.get("csrftoken");
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

export type ResearchArea = {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
};

export const createResearchArea = async (data: {
  title: string;
  description: string;
}) => {
  const response = await api
    .post("/content/research-areas/create/", data)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const listResearchAreas = async () => {
  const response = await api
    .get("/content/research-areas/")
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data.data || [],
  };
};

export const getResearchArea = async (areaId: number) => {
  const response = await api
    .get(`/content/research-areas/${areaId}/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data.data,
  };
};

export const updateResearchArea = async (
  areaId: number,
  data: Partial<ResearchArea>
) => {
  const response = await api
    .patch(`/content/research-areas/${areaId}/update/`, data)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const deleteResearchArea = async (areaId: number) => {
  const response = await api
    .delete(`/content/research-areas/${areaId}/delete/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};
