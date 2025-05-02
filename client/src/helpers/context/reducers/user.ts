import { LOGIN_USER, LOGOUT_USER } from "helpers/context/contants";

const initialState = {};

const user = (
  state = initialState,
  {
    type,
    payload,
  }: {
    type: string;
    payload: any;
  }
) => {
  switch (type) {
    case LOGOUT_USER:
      return initialState;
    case LOGIN_USER:
      return {
        ...state,
        ...payload,
      };
    default:
      throw new Error(`Invalid action type, user.${type}`);
  }
};

export default user;
