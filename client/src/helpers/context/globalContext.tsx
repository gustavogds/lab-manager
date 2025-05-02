// @ts-nocheck
import { GlobalData } from "helpers/services";
import React from "react";
import userReducer from "helpers/context/reducers/user";

const GlobalDataContext = React.createContext({});

const GlobalDataProvider = ({ children }) => {
  const [user, userDispatch] = React.useReducer(userReducer, {});
  const value = {
    user: {
      state: user,
      dispatch: userDispatch,
    },
  };

  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  );
};

const useGlobalData = () => {
  const context = React.useContext(GlobalDataContext);

  if (context === undefined) {
    throw new Error("useGlobalData must be used within a GlobalDataProvider");
  }

  return context;
};

export { GlobalDataProvider, useGlobalData };
