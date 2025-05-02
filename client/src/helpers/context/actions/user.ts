import { LOGIN_USER, LOGOUT_USER } from "helpers/context/contants";

export const loginUser = (payload: any) => (dispatch: any) => {
  dispatch({
    type: LOGIN_USER,
    payload,
  });
};

export const logoutUser = () => (dispatch: any) => {
  dispatch({
    type: LOGOUT_USER,
    payload: {},
  });
};
