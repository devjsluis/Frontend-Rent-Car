import { defineComponent } from "vue";
import { useAuthStore } from "../../guards/authGuard";
import router from "../../core/router";
import { changeActiveItem } from "../../shared/sharedMetods";
import ClientesComponent from "./../../components/clientes-component/ClientesComponent.vue";
import { jwtDecode } from "jwt-decode";

interface DashboardComponentData {
  isDropdownOpen: boolean;
  showAlert: boolean;
  alertMessage: string;
  alertClass: string;
  items: ListItem[];
  clientesData: Cliente[];
  idUser: string;
  userName: string;
}

interface ListItem {
  icon: string;
  label: string;
  active: boolean;
}

interface Cliente {
  ID: number;
  NOMBRE: string;
  APELLIDOS: string;
  FECHA_NACIMIENTO: string;
  TELEFONO: string;
  CORREO: string;
  ESTATUS: number | string;
  ID_USUARIO_ALTA: number;
}

export default defineComponent({
  name: "DashboardComponent",
  components: {
    ClientesComponent,
  },
  data(): DashboardComponentData {
    return {
      isDropdownOpen: false,
      showAlert: false,
      alertMessage: "",
      alertClass: "",
      items: [
        { icon: "bi bi-person-fill mx-1", label: "Clientes", active: false },
        { icon: "bi bi-people mx-1", label: "Usuarios", active: false },
        { icon: "bi bi-pencil mx-1", label: "Registro", active: false },
      ] as ListItem[],
      clientesData: [],
      idUser: "",
      userName: "",
    };
  },
  computed: {
    isClientesActive() {
      return this.items.some(
        (item) => item.label === "Clientes" && item.active
      );
    },
  },
  methods: {
    toggleDropdown(event: Event) {
      event.preventDefault();
      this.isDropdownOpen = !this.isDropdownOpen;
    },
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
      if (token !== null) {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken && decodedToken.nombre) {
          this.userName = decodedToken.nombre;
          this.idUser = decodedToken.id;
          console.log(this.userName, this.idUser);
        } else {
          console.error("Token JWT no contiene información de usuario");
        }
      }
      if (token && !isShowAlert) {
        this.showAlert = true;
        this.alertMessage = "Inicio de sesión exitoso";
        this.alertClass = "alert alert-success";
        localStorage.setItem("isShowAlert", "true");
      }
    },
    async changeActiveItem(selectedItem: ListItem) {
      changeActiveItem(selectedItem, this.items, this.clientesData);
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
