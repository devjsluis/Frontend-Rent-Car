import { defineStore } from "pinia";

interface LoadingState {
  isLoading: boolean;
}

export const useLoadingStore = defineStore({
  id: "loading",
  state: (): LoadingState => ({
    isLoading: false,
  }),
  actions: {
    setLoading(value: boolean) {
      this.isLoading = value;
    },
  },
});
