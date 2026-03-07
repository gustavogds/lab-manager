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
  is_former_member?: boolean;
  phone?: string;
  contact_email?: string;
  social_media?: string;
  lattes?: string;
  bio?: string;
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
  researchers: Array<{ id: number; order: number; show: boolean; is_former_member: boolean }>
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

export type Partnership = {
  id: number;
  name: string;
  logo: string | null;
  link: string | null;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
};

export const createPartnership = async (data: FormData) => {
  const response = await api
    .post("/content/partnerships/create/", data, {
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

export const listPartnerships = async () => {
  const response = await api
    .get("/content/partnerships/")
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data.data || [],
  };
};

export const listAllPartnerships = async () => {
  const response = await api
    .get("/content/partnerships/all/")
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data.data || [],
  };
};

export const updatePartnership = async (
  partnershipId: number,
  data: Partial<Partnership>
) => {
  const response = await api
    .patch(`/content/partnerships/${partnershipId}/update/`, data)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const updatePartnershipsConfig = async (
  partnerships: Array<{ id: number; order: number; is_active: boolean }>
) => {
  const response = await api
    .patch("/content/partnerships/config/", { partnerships })
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const deletePartnership = async (partnershipId: number) => {
  const response = await api
    .delete(`/content/partnerships/${partnershipId}/delete/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export type Room = {
  id: number;
  name: string;
  order: number;
  created_at: string;
  updated_at: string;
};

export type Equipment = {
  id: number;
  name: string;
  custom_id: string;
  room: Room | null;
  assigned_to: {
    id: number;
    name: string;
    email: string;
    profile_image: string | null;
  } | null;
  users: Array<{
    id: number;
    name: string;
    email: string;
    profile_image: string | null;
  }>;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
};

export const createEquipment = async (data: {
  name: string;
  custom_id: string;
  room_id?: number | null;
}) => {
  const response = await api
    .post("/content/equipment/create/", data)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export const listEquipment = async () => {
  const response = await api
    .get("/content/equipment/")
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, data: response.data.data || [] };
};

export const listAllEquipment = async () => {
  const response = await api
    .get("/content/equipment/all/")
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, data: response.data.data || [] };
};

export const updateEquipment = async (
  equipmentId: number,
  data: Partial<Equipment>
) => {
  const response = await api
    .patch(`/content/equipment/${equipmentId}/update/`, data)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export const updateEquipmentConfig = async (
  equipment: Array<{ id: number; order: number; is_active: boolean }>
) => {
  const response = await api
    .patch("/content/equipment/config/", { equipment })
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export const deleteEquipment = async (equipmentId: number) => {
  const response = await api
    .delete(`/content/equipment/${equipmentId}/delete/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export const createRoom = async (data: { name: string }) => {
  const response = await api
    .post("/content/rooms/create/", data)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export const listRooms = async () => {
  const response = await api
    .get("/content/rooms/")
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, data: response.data.data || [] };
};

export const updateRoom = async (roomId: number, data: Partial<Room>) => {
  const response = await api
    .patch(`/content/rooms/${roomId}/update/`, data)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export const deleteRoom = async (roomId: number) => {
  const response = await api
    .delete(`/content/rooms/${roomId}/delete/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export const generateReport = async (data: {
  name: string;
  format: "pdf" | "xlsx";
  sections: string[];
}) => {
  try {
    const response = await api.post("/content/reports/generate/", data, {
      responseType: "blob",
    });

    const contentType = response.headers["content-type"] || "";
    if (contentType.includes("application/json")) {
      const text = await (response.data as Blob).text();
      const json = JSON.parse(text);
      return { success: false, error: json.error || "Erro ao gerar relatório." };
    }

    const ext = data.format === "xlsx" ? "xlsx" : "pdf";
    const safeName = data.name.replace(/ /g, "_");
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeName}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: any) {
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        return { success: false, error: json.error || "Erro ao gerar relatório." };
      } catch {
        return { success: false, error: "Erro ao gerar relatório." };
      }
    }
    return { success: false, error: "Erro ao gerar relatório." };
  }
};
