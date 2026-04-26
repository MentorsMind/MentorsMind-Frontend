export const apiConfig = {
  url: {
    auth: {
      login: "auth/login",
      signup: "auth/signup",
      me: "auth/me",
    },
    users: {
      me: "/users/me",
      byId: "/users",
    },
    admin: {
      users: "/admin/users",
    },
    sessions: "/sessions",
    mentors: "/mentors",
    payments: "/payments",
  },
};
