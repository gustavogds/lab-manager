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

export const saveProfile = async (formData: Record<string, any>) => {
  const response = await api
    .patch("/accounts/settings/", formData)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const getLabSettings = async () => {
  const response = await api.get("/core/settings/get/").catch((error) => {
    return error.response ? error.response : error;
  });

  return {
    success: response.status === 200,
    data: response.data,
  };
};

export const saveLabSettings = async (formData: Record<string, any>) => {
  const response = await api
    .patch("/core/settings/", formData)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};
