import { login, logout, register, whoami } from "helpers/api/auth";
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
        message: response.error || "Something went wrong!",
      };
    }
  };

  static register = async (
    email: string,
    username: string,
    name: string,
    password: string,
    confirmPassword: string,
    role: string
  ) => {
    const response = await register(
      email,
      username,
      name,
      password,
      confirmPassword,
      role
    );

    if (response.success) {
      await AuthHandler.sync();

      return {
        success: true,
        message: "You have successfully registered!",
      };
    } else {
      return {
        success: false,
        message: response.error || "Something went wrong!",
      };
    }
  };

  static sync = async () => {
    const user = await whoami();
    loginUser(user.data)(AuthHandler.user.dispatch);
  };
}
