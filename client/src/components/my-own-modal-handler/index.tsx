import React, { CSSProperties, Suspense } from "react";
import { createPortal } from "react-dom";

import "./index.scss";

const randomId = (size = 8) => {
  return Math.random().toString(36).substring(size);
};

let modalsDispatch: any;

const modalsReducerInitialState = {};
const modalsReducer = (
  state: any = modalsReducerInitialState,
  action: {
    type: string;
    payload: any;
  }
) => {
  switch (action.type) {
    case "ADD_MODAL":
      return {
        ...state,
        open: [...state.open, action.payload],
      };
    case "REMOVE_MODAL":
      const rest = { ...state };
      rest.open = rest.open.filter(
        (modal: any) => modal.id !== action.payload.id
      );
      return rest;
    case "POP_MODAL":
      const rest1 = { ...state };
      rest1.open.pop();
      return rest1;
    case "REGISTER_MODAL":
      return {
        ...state,
        register: {
          ...state.register,
          [action.payload.modalId]: action.payload.modal,
        },
      };
    case "UNREGISTER_MODAL":
      const rest2 = { ...state };
      delete rest2.register[action.payload.modalId];
      return rest2;
    case "SETUP_MODALS":
      return {
        ...state,
        config: action.payload,
      };
    default:
      throw new Error(`Invalid action type, modals.${action.type}`);
  }
};

const ModalContext = React.createContext({});
const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modals, _modalsDispatch] = React.useReducer(modalsReducer, {
    open: [],
    register: {},
    config: {
      closeOnBackdropClick: true,
      backdropColor: "#000000",
      backdropOpacity: 0.5,
      align: "center",
    },
  });
  const value = {
    modals: {
      state: modals,
      dispatch: _modalsDispatch,
    },
  };
  modalsDispatch = _modalsDispatch;
  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};
const useModal = () => {
  const context: any = React.useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

const addModal = (config: any) => (dispatch: any) => {
  dispatch({
    type: "ADD_MODAL",
    payload: {
      ...config,
    },
  });
};

const removeModal = (id: string) => (dispatch: any) => {
  dispatch({
    type: "REMOVE_MODAL",
    payload: {
      id,
    },
  });
};

const registerModal =
  (modalId: string, modal: React.ElementType) => (dispatch: any) => {
    dispatch({
      type: "REGISTER_MODAL",
      payload: {
        modalId,
        modal,
      },
    });
  };

const popModal = () => (dispatch: any) => {
  dispatch({
    type: "POP_MODAL",
    payload: {},
  });
};

const setupModals = (config: any) => (dispatch: any) => {
  dispatch({
    type: "SETUP_MODALS",
    payload: {
      ...config,
    },
  });
};

const Overlays = () => {
  const {
    modals: {
      state: { open: modalsOpen, register: modalsRegistered, config },
    },
  }: any = useModal();

  const parseBackdropColor = (color: string, opacity: number) => {
    if (color.startsWith("rgb")) {
      return color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
    } else if (color.startsWith("#")) {
      return `${color}${Math.round(opacity * 255).toString(16)}`;
    }
  };

  const parseAlign = (direction: string) => {
    const align = {
      justifyContent: "center",
      alignItems: "center",
    };

    switch (direction) {
      case "left":
        align.justifyContent = "flex-start";
        break;
      case "right":
        align.justifyContent = "flex-end";
        break;
      case "top":
        align.alignItems = "flex-start";
        break;
      case "bottom":
        align.alignItems = "flex-end";
        break;
      case "top-left":
        align.justifyContent = "flex-start";
        align.alignItems = "flex-start";
        break;
      case "top-right":
        align.justifyContent = "flex-end";
        align.alignItems = "flex-start";
        break;
      case "bottom-left":
        align.justifyContent = "flex-start";
        align.alignItems = "flex-end";
        break;
      case "bottom-right":
        align.justifyContent = "flex-end";
        align.alignItems = "flex-end";
        break;
      default:
        break;
    }

    return align;
  };

  const parsePosition = (direction: string) => {
    const position: CSSProperties = {
      // position: "absolute"
      // left: "0",
      // top: "0"
    };

    switch (direction) {
      case "left":
        position.left = "0";
        break;
      case "right":
        position.right = "0";
        break;
      case "top":
        position.top = "0";
        break;
      case "bottom":
        position.bottom = "0";
        break;
      case "top-left":
        position.left = "0";
        position.top = "0";
        break;
      case "top-right":
        position.right = "0";
        position.top = "0";
        break;
      case "bottom-left":
        position.left = "0";
        position.bottom = "0";
        break;
      case "bottom-right":
        position.right = "0";
        position.bottom = "0";
        break;
      default:
        break;
    }

    return position;
  };

  return createPortal(
    <Suspense fallback={<div>Loading...</div>}>
      <div
        id="modals"
        style={{
          display: Object.values(modalsOpen || []).length ? "flex" : "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: parseBackdropColor(
            config.backdropColor,
            config.backdropOpacity
          ),
          zIndex: 9999,
          ...parseAlign(config.align),
        }}
        onClick={(e) => {
          if (config.closeOnBackdropClick) {
            e.stopPropagation();
            popModal()(modalsDispatch);
          }
        }}
      >
        {modalsOpen.map((overlay: any) => {
          return (
            <div
              key={overlay.id}
              style={parsePosition(overlay.props.position)}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {React.createElement(modalsRegistered[overlay.modalId], {
                key: overlay.id,
                ...overlay,
              })}
            </div>
          );
        })}
      </div>
    </Suspense>,
    document.body
  );
};

class ModalsHandler {
  static setup(config: {
    closeOnBackdropClick?: boolean;
    backdropColor?: string;
    backdropOpacity?: number;
    align?:
      | "center"
      | "left"
      | "right"
      | "top"
      | "bottom"
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right";
  }) {
    const { closeOnBackdropClick, backdropColor, backdropOpacity, align } =
      config;

    if (backdropColor) {
      if (backdropColor.startsWith("rgba")) {
        throw new Error(
          `backdropColor must be in rgb format, instead of ${backdropColor}. If you want to use the opacity, use backdropOpacity to control it.`
        );
      }
      if (backdropColor.startsWith("#") && backdropColor.length !== 7) {
        throw new Error(
          `backdropColor must be in #rrggbb format, instead of ${backdropColor}. If you want to use the opacity, use backdropOpacity to control it.`
        );
      }
      if (!backdropColor.startsWith("rgb") && !backdropColor.startsWith("#")) {
        throw new Error(
          `backdropColor must be in 'rgb(r, g, b)' or '#rrggbb' format. Instead of ${backdropColor}.`
        );
      }
    }

    setupModals({
      closeOnBackdropClick,
      backdropColor,
      backdropOpacity,
      align,
    })(modalsDispatch);
  }

  static createModal = (modalId: string, props: any) => {
    const id = randomId();
    const cancel = () => {
      removeModal(id)(modalsDispatch);
    };
    const promise = new Promise((resolve) => {
      const config = {
        modalId: modalId,
        id: id,
        props,
        onConfirm: (data: any) => {
          cancel();
          resolve(data);
        },
        onCancel: () => {
          cancel();
          resolve(null);
        },
      };
      addModal(config)(modalsDispatch);
    });
    return { promise, cancel };
  };

  static registerModal = (modalId: string, modal: React.ElementType) => {
    registerModal(modalId, modal)(modalsDispatch);
  };
}

export { ModalProvider, Overlays, ModalsHandler };
