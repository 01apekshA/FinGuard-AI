import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchWallet = createAsyncThunk("wallet/get", async () => {
  const { data } = await api.get("/wallet");
  return data;
});

export const fetchBeneficiaries = createAsyncThunk("wallet/beneficiaries", async () => {
  const { data } = await api.get("/beneficiaries");
  return data;
});

export const addBeneficiary = createAsyncThunk("wallet/addBeneficiary", async (payload) => {
  const { data } = await api.post("/beneficiaries", payload);
  return data;
});

export const deleteBeneficiary = createAsyncThunk("wallet/deleteBeneficiary", async (id) => {
  await api.delete(`/beneficiaries/${id}`);
  return id;
});

export const transferMoney = createAsyncThunk(
  "wallet/transfer",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/wallet/transfer", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Transfer failed");
    }
  }
);

export const depositMoney = createAsyncThunk(
  "wallet/deposit",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/wallet/deposit", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Deposit failed");
    }
  }
);

const slice = createSlice({
  name: "wallet",
  initialState: {
    wallet: null,
    beneficiaries: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchWallet.pending, (s) => {
      s.loading = true;
    })
      .addCase(fetchWallet.fulfilled, (s, a) => {
        s.loading = false;
        s.wallet = a.payload;
      })
      .addCase(fetchBeneficiaries.fulfilled, (s, a) => {
        s.beneficiaries = a.payload;
      })
      .addCase(addBeneficiary.fulfilled, (s, a) => {
        s.beneficiaries.unshift(a.payload);
      })
      .addCase(deleteBeneficiary.fulfilled, (s, a) => {
        s.beneficiaries = s.beneficiaries.filter((b) => b.id !== a.payload);
      });
  },
});

export default slice.reducer;
