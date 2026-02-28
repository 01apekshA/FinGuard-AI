import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchTransactions = createAsyncThunk(
  "transactions/list",
  async (params = {}) => {
    const { data } = await api.get("/transactions", { params });
    return data;
  }
);

export const fetchRecentTransactions = createAsyncThunk(
  "transactions/recent",
  async (limit = 8) => {
    const { data } = await api.get("/transactions/recent", { params: { limit } });
    return data;
  }
);

const slice = createSlice({
  name: "transactions",
  initialState: {
    items: [],
    recent: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchTransactions.pending, (s) => {
      s.loading = true;
    })
      .addCase(fetchTransactions.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchRecentTransactions.fulfilled, (s, a) => {
        s.recent = a.payload;
      });
  },
});

export default slice.reducer;
