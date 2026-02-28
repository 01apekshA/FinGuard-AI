import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

const TOKEN_KEY = "fg_token";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem(
        TOKEN_KEY,
        data.access_token
      );

      return data.user;

    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ||
        "Login failed"
      );
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (
    { email, password, full_name },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/auth/register",
        {
          email,
          password,
          full_name,
        }
      );

      localStorage.setItem(
        TOKEN_KEY,
        data.access_token
      );

      return data.user;

    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ||
        "Registration failed"
      );
    }
  }
);

export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        "/auth/me"
      );

      return data;

    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ||
        "Not authenticated"
      );
    }
  }
);

// NEW GOOGLE LOGIN THUNK
export const googleLoginThunk =
  createAsyncThunk(
    "auth/googleLogin",
    async (
      { token, user },
      { rejectWithValue }
    ) => {
      try {
        localStorage.setItem(
          TOKEN_KEY,
          token
        );

        return user;

      } catch (err) {
        return rejectWithValue(
          "Google login failed"
        );
      }
    }
  );

const slice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    status: "idle",
    error: null,
  },

  reducers: {
    logout(state) {
      localStorage.removeItem(
        TOKEN_KEY
      );

      state.user = null;
      state.status = "idle";
      state.error = null;

      // backend logout
      api.post("/auth/logout")
        .catch(() => {});
    },

    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(
        loginThunk.pending,
        (s) => {
          s.status = "loading";
          s.error = null;
        }
      )

      .addCase(
        loginThunk.fulfilled,
        (s, a) => {
          s.status = "authed";
          s.user = a.payload;
        }
      )

      .addCase(
        loginThunk.rejected,
        (s, a) => {
          s.status = "error";
          s.error = a.payload;
        }
      )

      // REGISTER
      .addCase(
        registerThunk.pending,
        (s) => {
          s.status = "loading";
          s.error = null;
        }
      )

      .addCase(
        registerThunk.fulfilled,
        (s, a) => {
          s.status = "authed";
          s.user = a.payload;
        }
      )

      .addCase(
        registerThunk.rejected,
        (s, a) => {
          s.status = "error";
          s.error = a.payload;
        }
      )

      // FETCH ME
      .addCase(
        fetchMe.fulfilled,
        (s, a) => {
          s.status = "authed";
          s.user = a.payload;
        }
      )

      .addCase(
        fetchMe.rejected,
        (s) => {
          s.status = "unauth";
          s.user = null;
        }
      )

      // GOOGLE LOGIN
      .addCase(
        googleLoginThunk.pending,
        (s) => {
          s.status = "loading";
          s.error = null;
        }
      )

      .addCase(
        googleLoginThunk.fulfilled,
        (s, a) => {
          s.status = "authed";
          s.user = a.payload;
        }
      )

      .addCase(
        googleLoginThunk.rejected,
        (s, a) => {
          s.status = "error";
          s.error = a.payload;
        }
      );
  },
});

export const {
  logout,
  clearError,
} = slice.actions;

export default slice.reducer;