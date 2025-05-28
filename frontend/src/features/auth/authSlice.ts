import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 1. Lê o estado inicial do localStorage
const persistedAuth = localStorage.getItem("isAuthenticated") === "true";

interface AuthState {
  isAuthenticated: boolean;
  error?: string;
}

const initialState: AuthState = {
  isAuthenticated: persistedAuth,
  error: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ user: string; pass: string }>) {
      const { user, pass } = action.payload;
      if (user === "admin" && pass === "123456") {
        state.isAuthenticated = true;
        state.error = undefined;
        localStorage.setItem("isAuthenticated", "true");
      } else {
        state.error = "Usuário ou senha inválidos";
      }
    },
    logout(state) {
      state.isAuthenticated = false;
      state.error = undefined;
      localStorage.removeItem("isAuthenticated");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
