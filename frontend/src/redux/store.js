import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import walletReducer from "./slices/walletSlice";
import transactionReducer from "./slices/transactionSlice";
import analyticsReducer from "./slices/analyticsSlice";
import aiReducer from "./slices/aiSlice";
import adminReducer from "./slices/adminSlice";
// Centralized Redux store configuration
export const store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    transactions: transactionReducer,
    analytics: analyticsReducer,
    ai: aiReducer,
    admin: adminReducer,
  },
});
