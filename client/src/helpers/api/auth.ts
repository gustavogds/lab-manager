import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_PATH,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": cookies.get("csrftoken"),
  },
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

export const register = async (
  email: string,
  password: string,
  username: string
) => {
  const response = await api
    .post("/auth/sign-up/", {
      email,
      password,
      username,
    })
    .catch((err) => {
      return err.response ? err.response : err;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const logout = async () => {
  const response = await api.post("/auth/sign-out/").catch((err) => {
    return err.response ? err.response : err;
  });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const sync = async () => {
  const response = await api.get("/auth/sync/").catch((error) => {
    return error.response ? error.response : error;
  });
  return { success: response.status === 200, ...response.data };
};

export const whoami = async () => {
  const response = await api.get("/auth/whoami/").catch((error) => {
    return error.response ? error.response : error;
  });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const getSession = async () => {
  const response = await api.get("/auth/session/").catch((err) => {
    return err.response ? err.response : err;
  });

  return {
    success: response.status === 200,
    ...response.data,
  };
};
