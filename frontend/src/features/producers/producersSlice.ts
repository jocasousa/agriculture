import api from "@/api/api";
import { Producer } from "@/types/producer";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchProducers = createAsyncThunk<Producer[]>(
  "producers/fetchAll",
  async () => {
    const response = await api.get<Producer[]>("/producers");
    return response.data;
  }
);
