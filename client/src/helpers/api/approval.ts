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

export const listUnapprovedUsers = async () => {
  const response = await api.get("/accounts/list-unapproved/");
  return response.data.users || [];
};

export const approveUser = async (userId: number) => {
  const response = await api.post("/accounts/approve/", { id: userId });
  return response.data;
};

export const rejectUser = async (userId: number) => {
  const response = await api.post("/accounts/reject/", { id: userId });
  return response.data;
};
