import {
  login,
  logout,
  register,
  whoami,
  saveProfile,
  getLabSettings,
  saveLabSettings,
} from "helpers/api/auth";
import { loginUser, logoutUser } from "helpers/context/actions/user.js";
// import { IGlobalDataUser } from "../Enum";

export default class AuthHandler {
  static user: any;

  static logout = async () => {
    const response = await logout();

    if (response.success) {
      logoutUser()(AuthHandler.user.dispatch);

      return {
        success: true,
        message: "You have successfully logged out!",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong!",
      };
    }
  };

  static login = async (email: string, password: string) => {
    const response = await login({ email, password });

    if (response.success) {
      await AuthHandler.sync();

      return {
        success: true,
        message: "You have successfully logged!",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong!",
      };
    }
  };

  static register = async (
    email: string,
    password: string,
    username: string
  ) => {
    const response = await register(email, password, username);

    if (response.success) {
      await AuthHandler.sync();

      return {
        success: true,
        message: "You have successfully registered!",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong!",
      };
    }
  };

  static sync = async () => {
    const user = await whoami();
    loginUser(user.data)(AuthHandler.user.dispatch);
  };

  static saveProfile = async (data: any) => {
    const payload = {
      ...data,
      name: data.name || null,
      phone: data.phone || null,
      contact_email: data.contact_email || null,
      social_media: data.social_media || null,
      lattes: data.lattes || null,
      birthdate: data.birthdate || null,
      is_public: data.is_public,
    };
    const response = await saveProfile(payload);

    if (response.success) {
      return {
        success: true,
        message: response.message,
      };
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  };

  static getLabSettings = async () => {
    const response = await getLabSettings();

    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }
    return { success: false };
  };

  static saveLabSettings = async (data: any) => {
    const payload = {
      ...data,
      lab_name: data.lab_name || null,
      address: data.address || null,
      logo: data.logo || null,
      mission: data.mission || null,
      contact_email: data.contact_email || null,
      contact_phone: data.contact_phone || null,
    };
    const response = await saveLabSettings(payload);

    if (response.success) {
      return {
        success: true,
        message: response.message,
      };
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  };
}
