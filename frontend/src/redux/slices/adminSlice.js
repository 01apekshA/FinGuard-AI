import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchAdminUsers = createAsyncThunk("admin/users", async () => {
  const { data } = await api.get("/admin/users");
  return data;
});

export const updateUserKYC = createAsyncThunk(
  "admin/kyc",
  async ({ user_id, status }) => {
    const { data } = await api.patch(`/admin/users/${user_id}/kyc`, { status });
    return { user_id, kyc_status: data.kyc_status };
  }
);

export const toggleUserActive = createAsyncThunk("admin/toggle", async (user_id) => {
  const { data } = await api.patch(`/admin/users/${user_id}/toggle-active`);
  return { user_id, is_active: data.is_active };
});

export const fetchAllFraudAlerts = createAsyncThunk("admin/fraud", async () => {
  const { data } = await api.get("/admin/fraud-alerts");
  return data;
});

export const resolveFraudAlert = createAsyncThunk("admin/resolveFraud", async (id) => {
  await api.patch(`/admin/fraud-alerts/${id}/resolve`);
  return id;
});

export const fetchAllTransactions = createAsyncThunk("admin/transactions", async () => {
  const { data } = await api.get("/admin/transactions");
  return data;
});

export const fetchActivityLogs = createAsyncThunk("admin/activity", async () => {
  const { data } = await api.get("/admin/activity-logs");
  return data;
});

export const fetchPlatformStats = createAsyncThunk("admin/stats", async () => {
  const { data } = await api.get("/admin/platform-stats");
  return data;
});

const slice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    fraud: [],
    transactions: [],
    activity: [],
    stats: null,
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAdminUsers.fulfilled, (s, a) => {
      s.users = a.payload;
    })
      .addCase(updateUserKYC.fulfilled, (s, a) => {
        const u = s.users.find((x) => x.id === a.payload.user_id);
        if (u) u.kyc_status = a.payload.kyc_status;
      })
      .addCase(toggleUserActive.fulfilled, (s, a) => {
        const u = s.users.find((x) => x.id === a.payload.user_id);
        if (u) u.is_active = a.payload.is_active;
      })
      .addCase(fetchAllFraudAlerts.fulfilled, (s, a) => {
        s.fraud = a.payload;
      })
      .addCase(resolveFraudAlert.fulfilled, (s, a) => {
        const al = s.fraud.find((x) => x.id === a.payload);
        if (al) al.status = "resolved";
      })
      .addCase(fetchAllTransactions.fulfilled, (s, a) => {
        s.transactions = a.payload;
      })
      .addCase(fetchActivityLogs.fulfilled, (s, a) => {
        s.activity = a.payload;
      })
      .addCase(fetchPlatformStats.fulfilled, (s, a) => {
        s.stats = a.payload;
      });
  },
});

export default slice.reducer;
