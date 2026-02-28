import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchCashflow = createAsyncThunk("analytics/cashflow", async () => {
  const { data } = await api.get("/analytics/cashflow", { params: { months: 6 } });
  return data.series;
});

export const fetchExpenseBreakdown = createAsyncThunk("analytics/expense", async () => {
  const { data } = await api.get("/analytics/expense-breakdown");
  return data;
});

export const fetchSpendingTrend = createAsyncThunk("analytics/trend", async () => {
  const { data } = await api.get("/analytics/spending-trend", { params: { days: 14 } });
  return data.points;
});

export const fetchSummary = createAsyncThunk("analytics/summary", async () => {
  const { data } = await api.get("/analytics/summary");
  return data;
});

const slice = createSlice({
  name: "analytics",
  initialState: {
    cashflow: [],
    expense: { breakdown: [], total: 0 },
    trend: [],
    summary: { income: 0, expense: 0, savings: 0, tx_count: 0 },
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCashflow.fulfilled, (s, a) => {
      s.cashflow = a.payload;
    })
      .addCase(fetchExpenseBreakdown.fulfilled, (s, a) => {
        s.expense = a.payload;
      })
      .addCase(fetchSpendingTrend.fulfilled, (s, a) => {
        s.trend = a.payload;
      })
      .addCase(fetchSummary.fulfilled, (s, a) => {
        s.summary = a.payload;
      });
  },
});

export default slice.reducer;
