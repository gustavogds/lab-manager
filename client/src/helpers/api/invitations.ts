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

export type InvitationData = {
  email: string;
  roles: string[];
  name?: string;
  phone?: string;
  lattes?: string;
  bio?: string;
  position_ids?: number[];
};

export type Invitation = {
  id: number;
  email: string;
  roles: string[];
  name: string;
  phone: string;
  lattes: string;
  bio: string;
  positions: Array<{ id: number; name: string }>;
  invited_by: string | null;
  is_used: boolean;
  is_expired: boolean;
  is_valid: boolean;
  created_at: string;
  expires_at: string;
};

export const createInvitation = async (data: InvitationData) => {
  const response = await api
    .post("/accounts/invitations/create/", data)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const listInvitations = async () => {
  const response = await api
    .get("/accounts/invitations/")
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    data: response.data?.data || [],
  };
};

export const validateInvitation = async (token: string) => {
  const response = await api
    .get(`/accounts/invitations/${token}/validate/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    valid: response.data?.valid || false,
    data: response.data?.data || null,
    error: response.data?.error || null,
  };
};

export const deleteInvitation = async (invitationId: number) => {
  const response = await api
    .delete(`/accounts/invitations/${invitationId}/delete/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};

export const resendInvitation = async (invitationId: number) => {
  const response = await api
    .post(`/accounts/invitations/${invitationId}/resend/`)
    .catch((error) => {
      return error.response ? error.response : error;
    });

  return {
    success: response.status === 200,
    ...response.data,
  };
};
