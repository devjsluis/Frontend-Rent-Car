import axios from "axios";
import { useLoadingStore } from "./loadingStore";

axios.interceptors.request.use(
  (config) => {
    const loadingStore = useLoadingStore();
    loadingStore.setLoading(true);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    const loadingStore = useLoadingStore();
    loadingStore.setLoading(false);
    return response;
  },
  (error) => {
    const loadingStore = useLoadingStore();
    loadingStore.setLoading(false);
    return Promise.reject(error);
  }
);

export default axios;
