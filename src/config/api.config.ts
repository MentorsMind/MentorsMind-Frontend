export const apiConfig = {
  baseURL: "/api",
  wsURL: `${window.location.protocol.replace('http', 'ws')}//${window.location.host}/api/ws`,
  url: {
    auth: {
      login: "auth/login",
      signup: "auth/signup",
      me: "auth/me",
      logout: "auth/logout",
      forgotPassword: "auth/forgot-password",
      resetPassword: "auth/reset-password",
      verifyEmail: "auth/verify-email",
      resendVerification: "auth/resend-verification",
      refreshToken: "auth/refresh-token",
    },
    sessions: "/sessions",
    mentors: "/mentors",
    payments: "/payments",
    conversations: "/conversations",
    presence: "/presence",
    goals: "/goals",
    account: {
      profile: "users/me",
      avatar: "users/me/avatar",
      password: "auth/change-password",
      sessions: "auth/sessions",
    },
  },
};
