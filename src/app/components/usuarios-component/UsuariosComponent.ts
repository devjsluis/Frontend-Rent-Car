import { defineComponent } from "vue";
import axios from "../../../axiosConfig";
import { Modal } from "bootstrap";
import { getStatus } from "../../shared/enums/status.enum";
import { jwtDecode } from "jwt-decode";

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
      modoEdicion: false,
      idUser: null,
    };
  },
  methods: {
    resetValidation() {
      const form = document.querySelector(
        ".form-login"
      ) as HTMLFormElement | null;
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
        FECHA_NACIMIENTO: "",
        CORREO: "",
        CONTRASENA: "",
        ESTATUS: 1,
        ID_ROL: 1,
      };
      this.usuarioSeleccionado = null;
      this.modoEdicion = false;
      if (this.modal) {
        this.modal.hide(); // Ocultar el modal si está abierto
      }
      this.resetValidation();
    },
    initModal() {
      const modalElement = document.getElementById("exampleModal");
      if (modalElement) {
        this.modal = new Modal(modalElement);
        modalElement.addEventListener("hidden.bs.modal", () => {
          // Resetear los datos cuando se cierra el modal
          this.resetModal();
        });
        this.modal.show(); // Mostrar el modal
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
        const form = document.querySelector(
          ".form-login"
        ) as HTMLFormElement | null;

        if (form) {
          const nombreInput = form.querySelector("#nombre") as HTMLInputElement;
          const apellidosInput = form.querySelector(
            "#apellidos"
          ) as HTMLInputElement;
          const fechaNacimientoInput = form.querySelector(
            "#fechaNacimiento"
          ) as HTMLInputElement;
          const correoInput = form.querySelector("#correo") as HTMLInputElement;
          const contrasenaInput = form.querySelector(
            "#contrasena"
          ) as HTMLInputElement;

          if (
            !nombreInput ||
            !apellidosInput ||
            !fechaNacimientoInput ||
            !contrasenaInput ||
            !correoInput
          ) {
            console.error("No se pudieron encontrar los campos.");
            return;
          }

          const nombre = nombreInput.value;
          const apellidos = apellidosInput.value;
          const fechaNacimiento = fechaNacimientoInput.value;
          const contrasena = contrasenaInput.value;
          const correo = correoInput.value;

          if (
            !nombre ||
            !apellidos ||
            !fechaNacimiento ||
            !contrasena ||
            !correo
          ) {
            console.error("Por favor, ingrese datos válidos.");
            return;
          }
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
      this.modoEdicion = true;
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
          modalElement.addEventListener("hidden.bs.modal", () => {
            // Resetear los datos cuando se cierra el modal
            this.resetModal();
          });
        } else {
          console.error("Elemento modal no encontrado.");
        }
      } catch (error) {
        console.error("Error al editar el usuario:", error);
      }
    },
    async guardarCambios() {
      try {
        const form = document.querySelector(
          ".form-login"
        ) as HTMLFormElement | null;

        if (form) {
          const nombreInput = form.querySelector("#nombre") as HTMLInputElement;
          const apellidosInput = form.querySelector(
            "#apellidos"
          ) as HTMLInputElement;
          const fechaNacimientoInput = form.querySelector(
            "#fechaNacimiento"
          ) as HTMLInputElement;
          const correoInput = form.querySelector("#correo") as HTMLInputElement;
          const contrasenaInput = form.querySelector(
            "#contrasena"
          ) as HTMLInputElement;

          if (
            !nombreInput ||
            !apellidosInput ||
            !fechaNacimientoInput ||
            !contrasenaInput ||
            !correoInput
          ) {
            console.error("No se pudieron encontrar los campos.");
            return;
          }

          const nombre = nombreInput.value;
          const apellidos = apellidosInput.value;
          const fechaNacimiento = fechaNacimientoInput.value;
          const contrasena = contrasenaInput.value;
          const correo = correoInput.value;

          if (
            !nombre ||
            !apellidos ||
            !fechaNacimiento ||
            !contrasena ||
            !correo
          ) {
            console.error("Por favor, ingrese datos válidos.");
            return;
          }
        }
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
    mostrarModalEliminar(usuario: Usuario) {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken && decodedToken.id) {
          this.idUser = decodedToken.id;
        }

        if (usuario.ID === this.idUser) {
          // Aquí puedes mostrar un mensaje o alguna otra acción, ya que no debería permitir eliminar
          this.mostrarAlerta(
            "No puedes eliminar tu propio usuario",
            "alert alert-warning"
          );
          return;
        }
      }
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
    async manejarGuardarUsuario() {
      if (this.modoEdicion) {
        await this.guardarCambios();
      } else {
        await this.guardarUsuario();
      }
    },
  },
  mounted() {
    this.cargarUsuarios();

    // Asociar evento submit una sola vez
    const form = document.querySelector(
      ".form-login"
    ) as HTMLFormElement | null;
    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!form.checkValidity()) {
          form.classList.add("was-validated");
          return;
        }

        this.manejarGuardarUsuario();
      });
    }
  },
});
