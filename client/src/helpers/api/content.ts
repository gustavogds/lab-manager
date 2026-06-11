import axios from "axios";
import Cookies from "universal-cookie";
import { getCurrentLang } from "helpers/i18n";

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

export type ContentImage = {
  id: number;
  image: string;
  order: number;
};

export type ResearchArea = {
  id: number;
  title_pt: string;
  title_en: string;
  description_pt: string;
  description_en: string;
  link: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  images?: ContentImage[];
};

export type Project = {
  id: number;
  title_pt: string;
  title_en: string;
  description_pt: string;
  description_en: string;
  link: string;
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
  images?: ContentImage[];
};

export const createResearchArea = async (data: {
  title_pt: string;
  title_en: string;
  description_pt: string;
  description_en: string;
  link?: string;
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
    data: response.data?.data || [],
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
    data: response.data?.data,
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

export const uploadResearchAreaImage = async (areaId: number, file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api
    .post(`/content/research-areas/${areaId}/images/upload/`, formData, {
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

export const deleteResearchAreaImage = async (imageId: number) => {
  const response = await api
    .delete(`/content/research-areas/images/${imageId}/delete/`)
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
  title_pt: string;
  title_en: string;
  description_pt: string;
  description_en: string;
  link?: string;
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
    data: response.data?.data || [],
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
    data: response.data?.data,
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

export const uploadProjectImage = async (projectId: number, file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api
    .post(`/content/projects/${projectId}/images/upload/`, formData, {
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

export const deleteProjectImage = async (imageId: number) => {
  const response = await api
    .delete(`/content/projects/images/${imageId}/delete/`)
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
  username?: string;
  profile_image: string | null;
  position?: Position | null;
  positions?: Position[];
  room?: Room | null;
  researcher_order?: number;
  show_in_researchers?: boolean;
  is_former_member?: boolean;
  phone?: string;
  contact_email?: string;
  social_media?: string;
  lattes?: string;
  bio_pt?: string;
  bio_en?: string;
  roles?: string[];
  is_active?: boolean;
  is_approved?: boolean;
  email_validated?: boolean;
  date_joined?: string;
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
    data: response.data?.data || [],
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
    data: response.data?.data || [],
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

export type RoomSection = {
  id: number;
  name: string;
  room_id: number;
  order: number;
  created_at: string;
  updated_at: string;
};

export type Position = {
  id: number;
  name_pt: string;
  name_en: string;
  is_visible: boolean;
  order: number;
};

export type IdentificationCategory = {
  id: number;
  name: string;
  order: number;
  created_at: string;
  updated_at: string;
};

export type EquipmentState = {
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
  observation: string;
  identification_category: IdentificationCategory | null;
  equipment_state: EquipmentState | null;
  room: Room | null;
  section: RoomSection | null;
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
  observation?: string;
  room_id?: number | null;
  identification_category_id?: number | null;
  equipment_state_id?: number | null;
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
  return { success: response.status === 200, data: response.data?.data || [] };
};

export const listAllEquipment = async () => {
  const response = await api
    .get("/content/equipment/all/")
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, data: response.data?.data || [] };
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
  equipment: Array<{
    id: number;
    order?: number;
    is_active?: boolean;
    room_id?: number | null;
    section_id?: number | null;
  }>
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
  return { success: response.status === 200, data: response.data?.data || [] };
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

// Room Section APIs

export const createRoomSection = async (roomId: number, data: { name: string }) => {
  const response = await api
    .post(`/content/rooms/${roomId}/sections/create/`, data)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export const listRoomSections = async (roomId: number) => {
  const response = await api
    .get(`/content/rooms/${roomId}/sections/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, data: response.data?.data || [] };
};

export const listAllSections = async () => {
  const response = await api
    .get("/content/sections/")
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, data: response.data?.data || [] };
};

export const updateRoomSection = async (
  sectionId: number,
  data: Partial<RoomSection>
) => {
  const response = await api
    .patch(`/content/sections/${sectionId}/update/`, data)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export const deleteRoomSection = async (sectionId: number) => {
  const response = await api
    .delete(`/content/sections/${sectionId}/delete/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

// Identification Category APIs

export const createIdentificationCategory = async (data: { name: string }) => {
  const response = await api
    .post("/content/identification-categories/create/", data)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export const listIdentificationCategories = async () => {
  const response = await api
    .get("/content/identification-categories/")
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, data: response.data?.data || [] };
};

export const updateIdentificationCategory = async (
  categoryId: number,
  data: Partial<IdentificationCategory>
) => {
  const response = await api
    .patch(`/content/identification-categories/${categoryId}/update/`, data)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export const deleteIdentificationCategory = async (categoryId: number) => {
  const response = await api
    .delete(`/content/identification-categories/${categoryId}/delete/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

// Equipment State APIs

export const createEquipmentState = async (data: { name: string }) => {
  const response = await api
    .post("/content/equipment-states/create/", data)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export const listEquipmentStates = async () => {
  const response = await api
    .get("/content/equipment-states/")
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, data: response.data?.data || [] };
};

export const updateEquipmentState = async (
  stateId: number,
  data: Partial<EquipmentState>
) => {
  const response = await api
    .patch(`/content/equipment-states/${stateId}/update/`, data)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export const deleteEquipmentState = async (stateId: number) => {
  const response = await api
    .delete(`/content/equipment-states/${stateId}/delete/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });
  return { success: response.status === 200, ...response.data };
};

export type ReportColumnConfig = {
  key: string;
  label_pt: string;
  label_en: string;
};

export type ReportSectionConfig = {
  label_pt: string;
  label_en: string;
  columns: ReportColumnConfig[];
  supports_room_grouping: boolean;
  supports_section_grouping: boolean;
};

export type ReportConfig = {
  [sectionKey: string]: ReportSectionConfig;
};

export type ReportSectionOptions = {
  columns: string[];
  group_by_room?: boolean;
  group_by_section?: boolean;
};

export type ReportSections = {
  [sectionKey: string]: ReportSectionOptions;
};

export const getReportConfig = async () => {
  const response = await api
    .get("/content/reports/config/")
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data?.data as ReportConfig,
  };
};

export const generateReport = async (data: {
  name: string;
  format: "pdf" | "xlsx";
  sections: ReportSections;
}) => {
  try {
    const response = await api.post(
      "/content/reports/generate/",
      {
        ...data,
        language: getCurrentLang(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      { responseType: "blob" }
    );

    const contentType = String(response.headers["content-type"] || "");
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

export const listPositions = async () => {
  const response = await api
    .get("/accounts/positions/")
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data?.data || [],
  };
};

export const createPosition = async (data: { name_pt?: string; name_en?: string }) => {
  const response = await api
    .post("/accounts/positions/create/", data)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const updatePosition = async (
  id: number,
  data: { name_pt?: string; name_en?: string; order?: number; is_visible?: boolean }
) => {
  const response = await api
    .patch(`/accounts/positions/${id}/update/`, data)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const deletePosition = async (id: number) => {
  const response = await api
    .delete(`/accounts/positions/${id}/delete/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const listAllUsers = async () => {
  const response = await api
    .get("/accounts/users/")
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data?.data || [],
  };
};

export const updateUser = async (
  id: number,
  data: {
    roles?: string[];
    position_ids?: number[];
    position_id?: number | null;
    room_id?: number | null;
    is_active?: boolean;
    is_approved?: boolean;
  }
) => {
  const response = await api
    .patch(`/accounts/users/${id}/update/`, data)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const deleteUser = async (id: number) => {
  const response = await api
    .delete(`/accounts/users/${id}/delete/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};
