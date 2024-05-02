import { defineComponent } from "vue";
import { useAuthStore } from "../../guards/authGuard";
import router from "../../core/router";

interface DashboardComponentData {
  showAlert: boolean;
  alertMessage: string;
  alertClass: string;
}

export default defineComponent({
  name: "DashboardComponent",
  data(): DashboardComponentData {
    return {
      showAlert: false,
      alertMessage: "",
      alertClass: "",
    };
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("isShowAlert");
      const authStore = useAuthStore();
      authStore.isAuthenticated = false;
      router.push({ name: "Auth" });
    },
    validateSession() {
      const token = localStorage.getItem("token");
      const isShowAlert = localStorage.getItem("isShowAlert");
      if (token && !isShowAlert) {
        this.showAlert = true;
        this.alertMessage = "Inicio de sesión exitoso";
        this.alertClass = "alert alert-success";
        localStorage.setItem("isShowAlert", "true");
      }
    },
  },
  mounted() {
    this.validateSession();
    setTimeout(() => {
      this.showAlert = false;
      this.alertMessage = "";
      this.alertClass = "";
    }, 4000);
  },
});
