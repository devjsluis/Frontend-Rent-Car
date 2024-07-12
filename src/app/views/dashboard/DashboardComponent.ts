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
import axios from "../../../axiosConfig";
import { storage } from "../../../../firebaseConfig.ts";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

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
  showCropper: boolean;
  croppedImage: Blob | null;
  cropper: Cropper | null;
  imageURL: string | null;
  profileImageUrl: string;
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
      profileImageUrl: "",

      showCropper: false,
      croppedImage: null,
      cropper: null as Cropper | null,
      imageURL: "",
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
    mostrarAlerta(mensaje: string, estilo: string) {
      this.showAlert = true;
      this.alertMessage = mensaje;
      this.alertClass = estilo;
      setTimeout(() => {
        this.showAlert = false;
      }, 3000);
    },
    toggleDropdown(event?: Event) {
      if (event) event.preventDefault();
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    logout() {
      this.toggleDropdown();
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
    openFileDialog() {
      this.toggleDropdown();
      (this.$refs.fileInput as HTMLInputElement).click();
    },
    async handleFileChange(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        this.onImageChange(event); // Llama al método para manejar el recorte de la imagen
      }
    },
    async uploadProfileImage(file: File) {
      const storageReference = storageRef(
        storage,
        `profile_images/${file.name}`
      );
      await uploadBytes(storageReference, file);
      return getDownloadURL(storageReference);
    },
    async fetchProfileImage() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const decodedToken: any = jwtDecode(token);
          if (decodedToken && decodedToken.id) {
            this.idUser = decodedToken.id;
            // console.log(this.idUser);
            const response = await axios.get(
              `${import.meta.env.VITE_APP_API_URL}/users/get-profile-image`,
              {
                params: {
                  userID: this.idUser, // Envía userId como parámetro de la solicitud GET
                },
              }
            );
            // console.log(response);
            this.profileImageUrl =
              response.data.body && response.data.body.imageUrl
                ? response.data.body.imageUrl
                : "https://firebasestorage.googleapis.com/v0/b/rent-car-vue.appspot.com/o/user.png?alt=media&token=13c76a8f-ec19-49a0-9bb0-d26b44a51d99";
          }
        }
      } catch (error) {
        console.error("Error al obtener la imagen de perfil:", error);
      }
    },
    onImageChange(event: Event) {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            this.imageURL = result;
            this.showCropper = true;
            this.$nextTick(() => {
              const image = document.getElementById(
                "image"
              ) as HTMLImageElement | null;
              if (image) {
                this.cropper = new Cropper(image, {
                  aspectRatio: 1,
                  viewMode: 1,
                  autoCropArea: 1,
                });
              }
            });
          }
        };
        reader.readAsDataURL(file);
      }
    },
    cropImage() {
      if (this.cropper) {
        this.cropper.getCroppedCanvas().toBlob((blob: Blob | null) => {
          if (blob) {
            this.croppedImage = blob;
            this.uploadImage(blob);
          }
          this.showCropper = false;
          this.cropper?.destroy();
          this.cropper = null;
          this.imageURL = null;
        });
      }
    },
    closeCropper() {
      this.showCropper = false;
      this.cropper?.destroy();
      this.cropper = null;
      this.imageURL = null;
    },
    uploadImage(blob: Blob) {
      const storageReference = storageRef(
        storage,
        `profile_images/${Date.now()}`
      );
      uploadBytes(storageReference, blob).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url: string) => {
          this.profileImageUrl = url;
          this.updateProfileImageUrl(url);
        });
      });
    },
    async updateProfileImageUrl(url: string) {
      const token = localStorage.getItem("token");

      if (token) {
        axios.defaults.headers.common["Authorization"] = token;

        try {
          await axios.post(
            `${import.meta.env.VITE_APP_API_URL}/users/save-profile-image`,
            {
              imageUrl: url,
              ID: this.idUser,
            }
          );

          // console.log(response);
          // Muestra el mensaje de éxito
          this.mostrarAlerta(
            "Foto de perfil actualizada con éxito",
            "alert alert-success"
          );
        } catch (error) {
          console.error("Error al actualizar la foto de perfil:", error);
          // Muestra el mensaje de error
          this.mostrarAlerta(
            "Error al actualizar la foto de perfil",
            "alert alert-danger"
          );
        }
      } else {
        console.error("No se encontró el token en localStorage.");
        this.mostrarAlerta(
          "Error: No se encontró el token de autenticación",
          "alert alert-danger"
        );
      }
    },
  },
  mounted() {
    this.fetchProfileImage();
    this.validateSession();
    setTimeout(() => {
      this.showAlert = false;
      this.alertMessage = "";
      this.alertClass = "";
    }, 4000);
  },
});
