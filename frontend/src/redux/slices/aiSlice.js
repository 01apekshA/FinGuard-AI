import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchFinancialHealth = createAsyncThunk("ai/health", async () => {
  const { data } = await api.get("/ai/financial-health");
  return data;
});

export const fetchSpendingPrediction = createAsyncThunk("ai/predict", async () => {
  const { data } = await api.get("/ai/spending-prediction");
  return data;
});

export const fetchBudgetAdvice = createAsyncThunk("ai/budget", async () => {
  const { data } = await api.get("/ai/budget-advice");
  return data;
});

export const fetchRiskScore = createAsyncThunk("ai/risk", async () => {
  const { data } = await api.get("/ai/risk-score");
  return data;
});

export const fetchFraudAlerts = createAsyncThunk("ai/fraud", async () => {
  const { data } = await api.get("/ai/fraud-alerts");
  return data;
});

export const sendAssistantMessage = createAsyncThunk(
  "ai/assistant",
  async ({ message, session_id }) => {
    const { data } = await api.post("/ai/assistant", { message, session_id });
    return data;
  }
);

const slice = createSlice({
  name: "ai",
  initialState: {
    health: null,
    prediction: null,
    budget: null,
    risk: null,
    fraudAlerts: [],
    chat: {
      sessionId: null,
      messages: [],
      sending: false,
    },
  },
  reducers: {
    pushUserMessage(state, action) {
      state.chat.messages.push({ role: "user", text: action.payload });
    },
    resetChat(state) {
      state.chat = { sessionId: null, messages: [], sending: false };
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchFinancialHealth.fulfilled, (s, a) => {
      s.health = a.payload;
    })
      .addCase(fetchSpendingPrediction.fulfilled, (s, a) => {
        s.prediction = a.payload;
      })
      .addCase(fetchBudgetAdvice.fulfilled, (s, a) => {
        s.budget = a.payload;
      })
      .addCase(fetchRiskScore.fulfilled, (s, a) => {
        s.risk = a.payload;
      })
      .addCase(fetchFraudAlerts.fulfilled, (s, a) => {
        s.fraudAlerts = a.payload;
      })
      .addCase(sendAssistantMessage.pending, (s) => {
        s.chat.sending = true;
      })
      .addCase(sendAssistantMessage.fulfilled, (s, a) => {
        s.chat.sending = false;
        s.chat.sessionId = a.payload.session_id;
        s.chat.messages.push({ role: "assistant", text: a.payload.response });
      })
      .addCase(sendAssistantMessage.rejected, (s) => {
        s.chat.sending = false;
      });
  },
});

export const { pushUserMessage, resetChat } = slice.actions;
export default slice.reducer;
