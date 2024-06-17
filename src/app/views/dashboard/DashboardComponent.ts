import { defineComponent } from "vue";
import { useAuthStore } from "../../guards/authGuard";
import router from "../../core/router";
import { changeActiveItem } from "../../shared/sharedMetods";
import ClientesComponent from "./../../components/clientes-component/ClientesComponent.vue";
import UsuariosComponent from "../../components/usuarios-component/UsuariosComponent.vue";
import PrincipalComponent from "../../components/principal-component/PrincipalComponent.vue";
import RegistroComponent from "../../components/registro-component/RegistroComponent.vue";
import CatalogoComponent from "../../components/catalogo-component/CatalogoComponent.vue";
import VehiclesComponent from "../../components/vehiculos-component/VehiclesComponent.vue";
import { jwtDecode } from "jwt-decode";

interface DashboardComponentData {
  isDropdownOpen: boolean;
  showAlert: boolean;
  alertMessage: string;
  alertClass: string;
  items: ListItem[];
  clientesData: Cliente[];
  usuariosData: Usuario[];
  registerData: Register[];
  catalogData: Catalog[];
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

interface Usuario {
  ID: number;
  NOMBRE: string;
  APELLIDOS: string;
  FECHA_NACIMIENTO: string;
  CORREO: string;
  ESTATUS: number | string;
  ID_ROL: number;
}

interface Register {
  ID: number;
  ID_CLIENTE: number;
  ID_VEHICULO: number;
  FECHA_RENTA: string;
  FECHA_ENTREGA: string;
  FECHA_RETORNO: string;
  COSTO_TOTAL: number;
  KILOMETRAJE_INICIAL: number;
  KILOMETRAJE_FINAL: number;
  DESTINO_DE_VIAJE: string;
  ESTATUS: number | string;
}

interface Catalog {
  ID: number;
  DESCRIPCION: string;
  ID_CATALOGO: number;
  ESTATUS: string | number;
}

export default defineComponent({
  name: "DashboardComponent",
  components: {
    ClientesComponent,
    UsuariosComponent,
    PrincipalComponent,
    RegistroComponent,
    CatalogoComponent,
    VehiclesComponent,
  },
  data(): DashboardComponentData {
    return {
      isDropdownOpen: false,
      showAlert: false,
      alertMessage: "",
      alertClass: "",
      items: [
        {
          icon: "bi bi-bar-chart-fill mx-1",
          label: "Dashboard",
          active: false,
        },
        { icon: "bi bi-person-fill mx-1", label: "Clientes", active: false },
        { icon: "bi bi-people mx-1", label: "Usuarios", active: false },
        { icon: "bi bi-pencil mx-1", label: "Registro", active: false },
        { icon: "bi bi-book mx-1", label: "Catálogos", active: false },
        {
          icon: "bi bi-truck mx-1",
          label: "Vehículos",
          active: false,
        },
      ] as ListItem[],
      clientesData: [],
      usuariosData: [],
      registerData: [],
      catalogData: [],
      idUser: "",
      userName: "",
    };
  },
  computed: {
    isPrincipalActive() {
      return this.items.some(
        (item) => item.label === "Dashboard" && item.active
      );
    },
    isClientesActive() {
      return this.items.some(
        (item) => item.label === "Clientes" && item.active
      );
    },
    isUsuariosActive() {
      return this.items.some(
        (item) => item.label === "Usuarios" && item.active
      );
    },
    isRegisterActive() {
      return this.items.some(
        (item) => item.label === "Registro" && item.active
      );
    },
    isCatalogActive() {
      return this.items.some(
        (item) => item.label === "Catálogos" && item.active
      );
    },
    isVehiclesActive() {
      return this.items.some(
        (item) => item.label === "Vehículos" && item.active
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
      changeActiveItem(selectedItem, this.items);
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
