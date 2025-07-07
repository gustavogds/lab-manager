import React, { CSSProperties, Suspense, useMemo } from "react";
import { createPortal } from "react-dom";

import "./index.scss";

interface ILAyout {
  scope: string;
  closeOnBackdropClick?: boolean;
  backdropColor?: string;
  backdropOpacity?: number;
  stack?: boolean;
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
}

const parseAlign = (direction: string) => {
  const align: CSSProperties = {
    justifyContent: "unset",
    alignItems: "unset",
  };

  switch (direction) {
    case "center":
      align.justifyContent = "center";
      align.alignItems = "center";
      break;
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
      align.alignItems = "flex-end";
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

const parseBackdropColor = (color: string, opacity: number) => {
  if (color.startsWith("rgb")) {
    return color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
  } else if (color.startsWith("#")) {
    return `${color}${Math.round(opacity * 255).toString(16)}`;
  }
};

const parseLayoutStyle = (config: any) => {
  const style: CSSProperties = {
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
  };

  if (config.stack) {
    style.overflow = "hidden";
  } else {
    style.overflow = "auto";
  }

  if (config.align) {
    const align = parseAlign(config.align);

    style.justifyContent = align.justifyContent;
    style.alignItems = align.alignItems;
  }

  if (config.backdropColor) {
    style.backgroundColor = parseBackdropColor(
      config.backdropColor,
      config.backdropOpacity || 1
    );
  }

  return style;
};

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

      let lastIndex = -1;
      let _open = [...rest1.open];

      _open.forEach((modal: any, index: number) => {
        if (modal.scope === action.payload.scope) {
          lastIndex = index;
        }
      });
      if (lastIndex !== -1) {
        _open.splice(lastIndex, 1);
      }

      rest1.open = _open;

      return rest1;
    case "REGISTER_LAYOUT":
      return {
        ...state,
        layouts: {
          ...state.layouts,
          [action.payload.scope]: action.payload,
        },
      };
    case "REGISTER_MODAL":
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modalId]: action.payload.modal,
        },
      };
    case "UNREGISTER_MODAL":
      const rest2 = { ...state };
      delete rest2.modals[action.payload.modalId];
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
    modals: {},
    config: {},
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

const registerLayout = (config: any) => (dispatch: any) => {
  dispatch({
    type: "REGISTER_LAYOUT",
    payload: config,
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

const popModal = (layout: any) => (dispatch: any) => {
  dispatch({
    type: "POP_MODAL",
    payload: {
      scope: layout.scope,
    },
  });
};

const Overlays = () => {
  const {
    modals: {
      state: { layouts, open: modalsOpen, modals: modalsRegistered },
    },
  }: any = useModal();

  const modals = useMemo(() => {
    const scopes: any = {};
    modalsOpen.forEach((modal: any) => {
      if (!scopes[modal.scope]) {
        scopes[modal.scope] = [];
      }
      scopes[modal.scope].push(modal);
    });
    return scopes;
  }, [modalsOpen, layouts]);

  return createPortal(
    <Suspense fallback={<div>Loading...</div>}>
      {layouts &&
        Object.values(layouts).map((layout: any) => {
          if (!modals[layout.scope] || modals[layout.scope].length === 0) {
            return null;
          }
          return (
            <div
              id={layout.scope}
              key={layout.scope}
              className={`modal-overlay ${layout.stack ? "stack" : ""}`}
              style={parseLayoutStyle(layout)}
              onClick={(e) => {
                if (layout.closeOnBackdropClick) {
                  e.stopPropagation();
                  popModal(layout)(modalsDispatch);
                }
              }}
            >
              {modals[layout.scope]?.map((modal: any) => {
                return (
                  <React.Fragment key={modal.id}>
                    {React.createElement(modalsRegistered[modal.modalId], {
                      key: modal.id,
                      ...modal,
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
    </Suspense>,
    document.body
  );
};

const Modal = ({ children, ...config }: any) => {
  const _config = {
    modalSize: "md",
    headerTitle: "Modal",
    disableHeader: false,
    disableFooter: false,
    canCancel: true,
    disableCancel: false,
    canConfirm: true,
    disableConfirm: false,
    onConfirm: () => {},
    onCancel: () => {},
    cancelLabel: "Cancel",
    confirmLabel: "Confirm",
    ...config,
  };

  const slots = React.Children.toArray(children).reduce(
    (acc: any, child: any) => {
      if (child.props.slot) {
        acc[child.props.slot] = child;
      } else {
        acc["body"] = child;
      }
      return acc;
    },
    {}
  );

  return (
    <div
      className={`modal ${_config.modalSize}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-content">
        {!_config.disableHeader && (
          <div className="modal-header">
            {slots.header ? (
              slots.header
            ) : (
              <h4 className="modal-title">{_config.headerTitle}</h4>
            )}
          </div>
        )}
        <div className="modal-body">{slots.body}</div>
        {!_config.disableFooter && (
          <div className="modal-footer">
            {slots.footer ? (
              slots.footer
            ) : (
              <>
                {_config.canCancel && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => _config.onCancel()}
                    disabled={_config.disableCancel}
                  >
                    {_config.cancelLabel}
                  </button>
                )}
                {_config.canConfirm && (
                  <button
                    type="button"
                    className="btn btn-primary pull-right"
                    onClick={() => _config.onConfirm()}
                    disabled={_config.disableConfirm}
                  >
                    {_config.confirmLabel}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

class ModalsHandler {
  static DEFAULT_LAYOUTS: ILAyout[] = [
    {
      scope: "modals",
      closeOnBackdropClick: true,
      backdropColor: "#000000",
      backdropOpacity: 0.4,
      align: "center",
    },
    {
      scope: "notifications",
      align: "top-right",
      stack: true,
    },
  ];

  static setup = () => {
    for (const layout of ModalsHandler.DEFAULT_LAYOUTS) {
      ModalsHandler.registerLayout(layout);
    }
  };

  static createModal = (modalId: string, props?: any) => {
    const id = randomId();
    const cancel = () => {
      removeModal(id)(modalsDispatch);
    };
    const promise = new Promise((resolve) => {
      const config = {
        scope: "modals",
        modalId: modalId,
        id: id,
        onConfirm: (data: any) => {
          cancel();
          resolve(data || "ok");
        },
        onCancel: () => {
          cancel();
          resolve("cancel");
        },
        ...props,
      };
      addModal(config)(modalsDispatch);
    });
    return { promise, cancel };
  };

  static createNotification = (props?: any) => {
    const id = randomId();
    const cancel = () => {
      removeModal(id)(modalsDispatch);
    };
    const promise = new Promise((resolve) => {
      const config = {
        scope: "notifications",
        modalId: "Notification",
        id: id,
        onConfirm: (data: any) => {
          cancel();
          resolve(data || "ok");
        },
        onCancel: () => {
          cancel();
          resolve("cancel");
        },
        ...props,
      };
      addModal(config)(modalsDispatch);
    });
    return { promise, cancel };
  };

  static registerLayout(config: ILAyout) {
    registerLayout(config)(modalsDispatch);
  }

  static registerModal = (modalId: string, modal: React.ElementType) => {
    registerModal(modalId, modal)(modalsDispatch);
  };
}

export { Modal, ModalProvider, Overlays, ModalsHandler };
