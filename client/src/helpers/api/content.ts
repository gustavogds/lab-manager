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

export type Project = {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  members: Array<{
    id: number;
    name: string;
    email: string;
    profile_image: string | null;
  }>;
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

export const createProject = async (data: {
  title: string;
  description: string;
}) => {
  const response = await api
    .post("/content/projects/create/", data)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const listProjects = async () => {
  const response = await api
    .get("/content/projects/")
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data.data || [],
  };
};

export const getProject = async (projectId: number) => {
  const response = await api
    .get(`/content/projects/${projectId}/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data.data,
  };
};

export const updateProject = async (
  projectId: number,
  data: Partial<Project>
) => {
  const response = await api
    .patch(`/content/projects/${projectId}/update/`, data)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const deleteProject = async (projectId: number) => {
  const response = await api
    .delete(`/content/projects/${projectId}/delete/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

// User type for member management
export type User = {
  id: number;
  name: string;
  email: string;
  profile_image: string | null;
  position?: string;
  researcher_order?: number;
  show_in_researchers?: boolean;
  phone?: string;
  contact_email?: string;
  social_media?: string;
  lattes?: string;
  role?: string;
};

export type Researcher = User;

export const listApprovedUsers = async () => {
  const response = await api
    .get("/accounts/list-approved/")
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data.users || [],
  };
};

export const listResearchers = async () => {
  const response = await api
    .get("/accounts/researchers/")
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data.users || [],
  };
};

export const listAllResearchers = async () => {
  const response = await api
    .get("/accounts/researchers/all/")
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data.users || [],
  };
};

export const updateResearchersConfig = async (
  researchers: Array<{ id: number; order: number; show: boolean }>
) => {
  const response = await api
    .patch("/accounts/researchers/config/", { researchers })
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};
