import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_PATH,
  withCredentials: true,
});

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await api
    .post("/auth/sign-in/", { email, password })
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return { success: response.status === 200, ...response.data };
};

export const register = async ({
  email,
  password,
  name,
  username,
  confirmPassword,
}: {
  email: string;
  password: string;
  username: string;
  name: string;
  confirmPassword: string;
}) => {
  const response = await api
    .post("/auth/sign-up/", {
      email,
      password,
      name,
      username,
      confirmPassword,
    })
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return { success: response.status === 200, ...response.data };
};
