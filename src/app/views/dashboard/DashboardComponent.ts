import { defineComponent, ref } from "vue";
import { useAuthStore } from "../../guards/authGuard";
import router from "../../core/router";

export default defineComponent({
  name: "DashboardComponent",
  setup() {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;

    const showAlert = ref(false);
    const alertMessage = ref("");
    const alertClass = ref("");

    const logout = () => {
      localStorage.removeItem("token");
      authStore.isAuthenticated = false;
      router.push({ name: "Auth" });
    };

    if (isAuthenticated) {
      showAlert.value = true;
      alertMessage.value = "Inicio de sesión exitoso";
      alertClass.value = "alert alert-success";
    }

    setTimeout(() => {
      showAlert.value = false;
      alertMessage.value = "";
      alertClass.value = "";
    }, 4000);

    return {
      showAlert,
      alertMessage,
      alertClass,
      logout,
    };
  },
});
