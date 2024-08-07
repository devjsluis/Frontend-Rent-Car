import { defineComponent } from "vue";
import axios from "../../../axiosConfig";
import { Modal } from "bootstrap";
import { getStatus } from "../../shared/enums/status.enum";
import { jwtDecode } from "jwt-decode";
import FormUsuariosComponent from "./components/form-usuarios-component/FormUsuariosComponent.vue";

interface DecodedToken {
  rol: number;
}

interface UsuariosComponentData {
  usuariosData: Usuario[];
  nuevoUsuario: NuevoUsuario;
  modal: any;
  modalEliminar: any;
  modalReactivar: any;
  usuarioSeleccionado: Usuario | null;
  showAlert: boolean;
  alertMessage: string;
  alertClass: string;
  modoEdicion: boolean;
  idUser: any;
  titleModal: string;
  decodedToken: DecodedToken | null;
}

interface Usuario {
  ID: number;
  NOMBRE: string;
  APELLIDOS: string;
  FECHA_NACIMIENTO: string | null;
  CORREO: string;
  CONTRASENA: string;
  ESTATUS: number | string;
  ID_ROL: number;
}

interface NuevoUsuario {
  NOMBRE: string;
  APELLIDOS: string;
  FECHA_NACIMIENTO: string | null;
  CORREO: string;
  CONTRASENA: string;
  ESTATUS: number | string;
  ID_ROL: number | string;
}

export default defineComponent({
  name: "UsuariosComponent",
  components: {
    FormUsuariosComponent,
  },
  data(): UsuariosComponentData {
    return {
      decodedToken: null as DecodedToken | null,
      usuariosData: [],
      modal: null,
      modalReactivar: null,
      modalEliminar: null,
      usuarioSeleccionado: null,
      nuevoUsuario: {
        NOMBRE: "",
        APELLIDOS: "",
        FECHA_NACIMIENTO: null,
        CORREO: "",
        CONTRASENA: "",
        ESTATUS: 1,
        ID_ROL: "",
      } as NuevoUsuario,
      showAlert: false,
      alertMessage: "",
      alertClass: "",
      modoEdicion: false,
      idUser: null,
      titleModal: "",
    };
  },
  methods: {
    decodeToken() {
      const token = localStorage.getItem("token");
      if (token) {
        this.decodedToken = jwtDecode(token);
      } else {
        console.error("No token found in localStorage");
      }
    },
    async manejarGuardarUsuario() {
      if (this.modoEdicion) {
        await this.guardarCambios();
      } else {
        await (
          this.$refs.formulario as InstanceType<typeof FormUsuariosComponent>
        ).guardarUsuario();
      }
    },
    async guardarCambios() {
      try {
        if (this.usuarioSeleccionado) {
          if (this.nuevoUsuario.ESTATUS === "Activo") {
            this.nuevoUsuario.ESTATUS = 1;
          } else if (this.nuevoUsuario.ESTATUS === "Inactivo") {
            this.nuevoUsuario.ESTATUS = 0;
          } else if (this.nuevoUsuario.ESTATUS === "Indefinido") {
            this.nuevoUsuario.ESTATUS = 2;
          }

          const response = await axios.put(
            `${import.meta.env.VITE_APP_API_URL}/users/update/${
              this.usuarioSeleccionado.ID
            }`,
            this.nuevoUsuario
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Usuario editado satisfactoriamente",
              "alert alert-success"
            );
            this.modal.hide();
            this.resetModal();
            this.cargarUsuarios();
          } else {
            console.error("Error al editar el usuario:", response.statusText);
          }
        } else {
          console.error("No hay usuario seleccionado para editar.");
        }
      } catch (error) {
        console.error("Error al guardar los cambios:", error);
      }
    },
    resetValidation() {
      const form = document.querySelector(".form") as HTMLFormElement | null;
      if (form) {
        form.classList.remove("was-validated");
      }
    },
    mostrarAlerta(mensaje: string, estilo: string) {
      this.showAlert = true;
      this.alertMessage = mensaje;
      this.alertClass = estilo;
      setTimeout(() => {
        this.showAlert = false;
      }, 3000);
    },
    resetModal() {
      this.nuevoUsuario = {
        NOMBRE: "",
        APELLIDOS: "",
        FECHA_NACIMIENTO: null,
        CORREO: "",
        CONTRASENA: "",
        ESTATUS: 1,
        ID_ROL: "",
      };
      this.usuarioSeleccionado = null;
      this.modoEdicion = false;
      this.titleModal = "";
      if (this.modal) {
        this.modal.hide();
      }
      this.resetValidation();
    },
    initModal() {
      this.titleModal = "Agregar Usuario";
      const modalElement = document.getElementById("modal");
      if (modalElement) {
        this.modal = new Modal(modalElement);
        modalElement.addEventListener("hidden.bs.modal", () => {
          this.resetModal();
        });
        this.modal.show();
      } else {
        console.error("No se encontró el elemento modal.");
      }
    },
    async cargarUsuarios() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/users/get`
          );
          this.usuariosData = response.data.body.map((usuario: Usuario) => {
            if (usuario.FECHA_NACIMIENTO) {
              const fechaNacimiento = usuario.FECHA_NACIMIENTO.split("T")[0];
              usuario.FECHA_NACIMIENTO = fechaNacimiento;
            } else {
              console.warn(
                `Fecha de nacimiento no definida para el usuario con ID: ${usuario.ID}`
              );
              usuario.FECHA_NACIMIENTO = "";
            }
            usuario.ESTATUS = getStatus(usuario.ESTATUS);
            return usuario;
          });
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de usuarios:", error);
      }
    },
    async editarUsuario(usuario: Usuario) {
      this.titleModal = "Editar Usuario";
      this.modoEdicion = true;
      try {
        this.usuarioSeleccionado = usuario;
        const modalElement = document.getElementById("modal") as HTMLElement;
        if (modalElement) {
          this.modal = new Modal(modalElement);
          this.modal.show();
          this.nuevoUsuario = {
            NOMBRE: usuario.NOMBRE,
            APELLIDOS: usuario.APELLIDOS,
            FECHA_NACIMIENTO: usuario.FECHA_NACIMIENTO,
            CORREO: usuario.CORREO,
            CONTRASENA: usuario.CONTRASENA,
            ESTATUS: usuario.ESTATUS,
            ID_ROL: usuario.ID_ROL,
          };
          modalElement.addEventListener("hidden.bs.modal", () => {
            this.resetModal();
          });
        } else {
          console.error("Elemento modal no encontrado.");
        }
      } catch (error) {
        console.error("Error al editar el usuario:", error);
      }
    },
    mostrarModalEliminar(usuario: Usuario) {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken && decodedToken.id) {
          this.idUser = decodedToken.id;
        }

        if (usuario.ID === this.idUser) {
          this.mostrarAlerta(
            "No puedes eliminar tu propio usuario",
            "alert alert-warning"
          );
          return;
        }
      }
      this.usuarioSeleccionado = usuario;
      const confirmarEliminacionModal = document.getElementById(
        "confirmarEliminacionModal"
      );
      if (confirmarEliminacionModal) {
        this.modalEliminar = new Modal(confirmarEliminacionModal);
        this.modalEliminar.show();
      } else {
        console.error(
          "No se encontró el elemento modal de confirmación de eliminación."
        );
      }
    },
    async eliminarUsuarioConfirmado() {
      try {
        if (this.usuarioSeleccionado) {
          const response = await axios.delete(
            `${import.meta.env.VITE_APP_API_URL}/users/delete/${
              this.usuarioSeleccionado.ID
            }`
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Usuario eliminado satisfactoriamente",
              "alert alert-success"
            );
            this.modalEliminar.hide();
            this.resetModal();
            this.cargarUsuarios();
          } else {
            console.error("Error al eliminar el usuario:", response.statusText);
          }
        } else {
          console.error("No hay usuario seleccionado para eliminar.");
        }
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
      }
    },
    mostrarModalReactivar(usuario: Usuario) {
      this.usuarioSeleccionado = usuario;
      const confirmarReactivacionModal = document.getElementById(
        "confirmarReactivacionModal"
      );
      if (confirmarReactivacionModal) {
        this.modalReactivar = new Modal(confirmarReactivacionModal);
        this.modalReactivar.show();
      } else {
        console.error(
          "No se encontró el elemento modal de confirmación de reactivación."
        );
      }
    },
    async reactivarUsuarioConfirmado() {
      try {
        if (this.usuarioSeleccionado) {
          const response = await axios.put(
            `${import.meta.env.VITE_APP_API_URL}/users/reactivate/${
              this.usuarioSeleccionado.ID
            }`
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Usuario reactivado satisfactoriamente",
              "alert alert-success"
            );
            this.modalReactivar.hide();
            this.resetModal();
            this.cargarUsuarios();
          } else {
            console.error(
              "Error al reactivar el usuario:",
              response.statusText
            );
          }
        } else {
          console.error("No hay usuario seleccionado para reactivar.");
        }
      } catch (error) {
        console.error("Error al reactivar el usuario:", error);
      }
    },
  },
  mounted() {
    this.cargarUsuarios();
    this.decodeToken();
  },
});
