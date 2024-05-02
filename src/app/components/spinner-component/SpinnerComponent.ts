import { defineComponent, computed, Ref } from "vue";
import { useLoadingStore } from "../../../loadingStore";

export default defineComponent({
  name: "SpinnerComponent",
  data() {
    const loadingStore = useLoadingStore();
    const isLoading: Ref<boolean> = computed(() => loadingStore.isLoading);
    return {
      isLoading,
    };
  },
});
