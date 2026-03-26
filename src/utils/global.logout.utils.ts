let logoutHandler: (() => void) | null = null;

export const setGlobalLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

export const triggerGlobalLogout = () => {
  if (logoutHandler) {
    logoutHandler();
  }
};
