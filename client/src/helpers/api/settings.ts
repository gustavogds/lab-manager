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

export const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api
    .post("/accounts/settings/upload-profile-image/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const uploadLabLogo = async (file: File) => {
  const formData = new FormData();
  formData.append("logo", file);

  const response = await api
    .post("/core/settings/upload-logo/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
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

export const uploadAboutImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api
    .post("/core/settings/upload-about-image/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data,
  };
};

export const deleteAboutImage = async (imageId: number) => {
  const response = await api
    .delete(`/core/settings/delete-about-image/${imageId}/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};
