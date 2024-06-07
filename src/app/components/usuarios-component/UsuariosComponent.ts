import { defineComponent } from "vue";
import axios from "../../../axiosConfig";
import { Modal } from "bootstrap";
import { getStatus } from "../../shared/enums/status.enum";

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
}

interface Usuario {
  ID: number;
  NOMBRE: string;
  APELLIDOS: string;
  FECHA_NACIMIENTO: string;
  CORREO: string;
  CONTRASENA: string;
  ESTATUS: number | string;
  ID_ROL: number;
}

interface NuevoUsuario {
  NOMBRE: string;
  APELLIDOS: string;
  FECHA_NACIMIENTO: string;
  CORREO: string;
  CONTRASENA: string;
  ESTATUS: number | string;
  ID_ROL: number;
}

export default defineComponent({
  name: "UsuariosComponent",
  data(): UsuariosComponentData {
    return {
      usuariosData: [],
      modal: null,
      modalReactivar: null,
      modalEliminar: null,
      usuarioSeleccionado: null,
      nuevoUsuario: {
        NOMBRE: "",
        APELLIDOS: "",
        FECHA_NACIMIENTO: "",
        CORREO: "",
        CONTRASENA: "",
        ESTATUS: 1,
        ID_ROL: 1,
      } as NuevoUsuario,
      showAlert: false,
      alertMessage: "",
      alertClass: "",
    };
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
    resetModal() {
      this.nuevoUsuario = {
        NOMBRE: "",
        APELLIDOS: "",
        FECHA_NACIMIENTO: "",
        CORREO: "",
        CONTRASENA: "",
        ESTATUS: 1,
        ID_ROL: 1,
      };
      this.usuarioSeleccionado = null;
    },
    initModal() {
      const modalElement = document.getElementById(
        "exampleModal"
      ) as HTMLElement;
      if (modalElement) {
        this.modal = new Modal(modalElement);
        modalElement.addEventListener("hidden.bs.modal", () => {
          // Resetear los datos cuando se cierra el modal
          this.nuevoUsuario = {
            NOMBRE: "",
            APELLIDOS: "",
            FECHA_NACIMIENTO: "",
            CORREO: "",
            CONTRASENA: "",
            ESTATUS: 1,
            ID_ROL: 1,
          };
          this.usuarioSeleccionado = null;
        });
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
            if (usuario.FECHA_NACIMIENTO !== undefined) {
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
    async guardarUsuario() {
      try {
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
            const modalBackdrop = document.querySelector(".modal-backdrop"); // Seleccionar el elemento con la clase 'modal-backdrop'
            if (modalBackdrop) {
              modalBackdrop.parentNode?.removeChild(modalBackdrop); // Eliminar el elemento del DOM
            }
          } else {
            console.log("El modal no está inicializado correctamente");
          }

          this.nuevoUsuario = {
            NOMBRE: "",
            APELLIDOS: "",
            FECHA_NACIMIENTO: "",
            CORREO: "",
            CONTRASENA: "",
            ESTATUS: 1,
            ID_ROL: 1,
          };
          this.cargarUsuarios();
        } else {
          console.error("Error al crear el usuario:", response.statusText);
        }
      } catch (error) {
        console.error("Error al guardar el usuario:", error);
      }
    },
    async editarUsuario(usuario: Usuario) {
      try {
        this.usuarioSeleccionado = usuario; // Guarda el usuario seleccionado para edición
        const modalElement = document.getElementById(
          "exampleModal"
        ) as HTMLElement;
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
        } else {
          console.error("Elemento modal no encontrado.");
        }
      } catch (error) {
        console.error("Error al editar el usuario:", error);
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
            this.usuarioSeleccionado = null;
            this.nuevoUsuario = {
              NOMBRE: "",
              APELLIDOS: "",
              FECHA_NACIMIENTO: "",
              CORREO: "",
              CONTRASENA: "",
              ESTATUS: 1,
              ID_ROL: 1,
            };
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
    mostrarModalEliminar(usuario: Usuario) {
      this.usuarioSeleccionado = usuario; // Establecer el usuario seleccionado para eliminar
      const confirmarEliminacionModal = document.getElementById(
        "confirmarEliminacionModal"
      );
      if (confirmarEliminacionModal) {
        this.modalEliminar = new Modal(confirmarEliminacionModal);
        this.modalEliminar.show(); // Mostrar el modal de confirmación de eliminación
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
            this.usuarioSeleccionado = null;
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
      this.usuarioSeleccionado = usuario; // Establecer el usuario seleccionado para reactivar
      const confirmarReactivacionModal = document.getElementById(
        "confirmarReactivacionModal"
      );
      if (confirmarReactivacionModal) {
        this.modalReactivar = new Modal(confirmarReactivacionModal);
        this.modalReactivar.show(); // Mostrar el modal de confirmación de reactivación
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
            this.usuarioSeleccionado = null;
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
    this.initModal();
    this.cargarUsuarios();
  },
});
