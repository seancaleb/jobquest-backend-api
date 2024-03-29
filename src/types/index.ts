type AuthState = {
  isAuthenticated: boolean;
  tokenExpiration: number;
  role: "employer" | "admin" | "user";
  userId: string;
};
