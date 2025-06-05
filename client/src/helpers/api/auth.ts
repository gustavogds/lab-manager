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

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post("/auth/sign-in/", { email, password });
    return { success: true, ...response.data };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.error || "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
};

export const register = async (
  email: string,
  username: string,
  name: string,
  password: string,
  confirmPassword: string,
  role: string
) => {
  const response = await api
    .post("/auth/sign-up/", {
      email,
      username,
      name,
      password,
      confirmPassword,
      role,
    })
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const logout = async () => {
  const response = await api.post("/auth/sign-out/").catch((error) => {
    return error.response ? error.response : error;
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
  const response = await api.get("/auth/session/").catch((error) => {
    return error.response ? error.response : error;
  });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

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
