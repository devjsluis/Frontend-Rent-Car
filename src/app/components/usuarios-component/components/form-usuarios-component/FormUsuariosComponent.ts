import { defineComponent } from "vue";
import axios from "../../../../../axiosConfig";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  rol: number;
}

export default defineComponent({
  name: "FormUsuariosComponent",
  data() {
    return {
      decodedToken: null as DecodedToken | null,
      rolesData: [
        { ID: 1, NOMBRE: "Administrador" },
        { ID: 2, NOMBRE: "Gerente" },
        { ID: 3, NOMBRE: "Vendedor" },
      ],
      filteredRoles: [{}],
    };
  },

  props: {
    titleModal: String,
    modoEdicion: Boolean,
    cargarUsuarios: Function,
    nuevoUsuario: Object,
    usuarioSeleccionado: Object,
    modal: Object,
    manejarGuardarUsuario: {
      type: Function,
      required: true,
    },
    mostrarAlerta: {
      type: Function,
      required: true,
    },
    resetModal: {
      type: Function,
      required: true,
    },
  },
  methods: {
    iniciarFormulario() {
      const forms = document.querySelectorAll<HTMLFormElement>(".form");
      forms.forEach((form) => {
        form.addEventListener("submit", async (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
          }
          await this.manejarGuardarUsuario();
        });
      });
    },
    async guardarUsuario() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token JWT no encontrado en el almacenamiento local");
          return;
        }
        const decodedToken: any = jwtDecode(token);
        if (!decodedToken || !decodedToken.id) {
          console.error("Token JWT no contiene información de usuario");
          return;
        }
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/users/create`,
          this.nuevoUsuario
        );
        if (response.status === 201) {
          this.mostrarAlerta(
            "Usuario creado satisfactoriamente",
            "alert alert-success"
          );
          if (this.modal) {
            this.modal.hide();
            this.resetModal();
            const modalBackdrop = document.querySelector(".modal-backdrop");
            if (modalBackdrop) {
              modalBackdrop.parentNode?.removeChild(modalBackdrop);
            }
          } else {
            console.log("El modal no está inicializado correctamente");
          }
          if (this.cargarUsuarios) {
            this.cargarUsuarios();
          }
        } else {
          console.error("Error al crear el usuario:", response.statusText);
        }
      } catch (error) {
        console.error("Error al guardar el usuario:", error);
      }
    },
    decodeToken() {
      const token = localStorage.getItem("token");
      if (token) {
        this.decodedToken = jwtDecode(token);
        this.filterRoles();
      } else {
        console.error("No token found in localStorage");
      }
    },
    filterRoles() {
      if (this.decodedToken && this.decodedToken.rol !== 1) {
        this.filteredRoles = this.rolesData.filter((rol) => rol.ID === 3);
      } else {
        this.filteredRoles = this.rolesData;
      }
    },
  },
  mounted() {
    this.iniciarFormulario();
    this.decodeToken();
  },
});
