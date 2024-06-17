import { defineComponent } from "vue";
import axios from "../../../axiosConfig";
import { Modal } from "bootstrap";
import { getStatus } from "../../shared/enums/status.enum";
import { jwtDecode } from "jwt-decode";

interface ClientesComponentData {
  clientesData: Cliente[];
  nuevoCliente: NuevoCliente;
  modal: any;
  modalEliminar: any;
  modalReactivar: any;
  idUser: number;
  clienteSeleccionado: Cliente | null;
  showAlert: boolean;
  alertMessage: string;
  alertClass: string;
  modoEdicion: boolean;
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

interface NuevoCliente {
  NOMBRE: string;
  APELLIDOS: string;
  FECHA_NACIMIENTO: string;
  TELEFONO: string;
  CORREO: string;
  ESTATUS: number | string;
  ID_USUARIO_ALTA: number;
}

export default defineComponent({
  name: "ClientesComponent",
  data(): ClientesComponentData {
    return {
      clientesData: [],
      modal: null,
      modalReactivar: null,
      modalEliminar: null,
      idUser: 0,
      clienteSeleccionado: null,
      nuevoCliente: {
        NOMBRE: "",
        APELLIDOS: "",
        FECHA_NACIMIENTO: "",
        TELEFONO: "",
        CORREO: "",
        ESTATUS: 1,
        ID_USUARIO_ALTA: 0,
      } as NuevoCliente,
      showAlert: false,
      alertMessage: "",
      alertClass: "",
      modoEdicion: false,
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
      this.nuevoCliente = {
        NOMBRE: "",
        APELLIDOS: "",
        FECHA_NACIMIENTO: "",
        TELEFONO: "",
        CORREO: "",
        ESTATUS: 1,
        ID_USUARIO_ALTA: 0,
      };
      this.clienteSeleccionado = null;
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
    async cargarClientes() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          //PARA VERIFICAR EL ROL
          // const decodedToken: any = jwtDecode(token);
          // console.log(decodedToken.rol);
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/clientes/get`
          );
          this.clientesData = response.data.body.map((cliente: Cliente) => {
            if (cliente.FECHA_NACIMIENTO !== undefined) {
              const fechaNacimiento = cliente.FECHA_NACIMIENTO.split("T")[0];
              cliente.FECHA_NACIMIENTO = fechaNacimiento;
            } else {
              console.warn(
                `Fecha de nacimiento no definida para el cliente con ID: ${cliente.ID}`
              );
              cliente.FECHA_NACIMIENTO = "";
            }
            cliente.ESTATUS = getStatus(cliente.ESTATUS);
            return cliente;
          });
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de clientes:", error);
      }
    },
    async guardarCliente() {
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
          const telefonoInput = form.querySelector(
            "#telefono"
          ) as HTMLInputElement;
          const correoInput = form.querySelector("#correo") as HTMLInputElement;

          if (
            !nombreInput ||
            !apellidosInput ||
            !fechaNacimientoInput ||
            !telefonoInput ||
            !correoInput
          ) {
            console.error("No se pudieron encontrar los campos.");
            return;
          }

          const nombre = nombreInput.value;
          const apellidos = apellidosInput.value;
          const fechaNacimiento = fechaNacimientoInput.value;
          const telefono = telefonoInput.value;
          const correo = correoInput.value;

          if (
            !nombre ||
            !apellidos ||
            !fechaNacimiento ||
            !telefono ||
            !correo
          ) {
            console.error("Por favor, ingrese datos válidos.");
            return;
          }
        }

        const token = localStorage.getItem("token");
        if (token !== null) {
          const decodedToken: any = jwtDecode(token);
          if (decodedToken && decodedToken.id) {
            this.idUser = decodedToken.id;
            this.nuevoCliente.ID_USUARIO_ALTA = this.idUser;

            const response = await axios.post(
              `${import.meta.env.VITE_APP_API_URL}/clientes/create`,
              this.nuevoCliente
            );
            if (response.status === 201) {
              this.mostrarAlerta(
                "Cliente creado satisfactoriamente",
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

              this.nuevoCliente = {
                NOMBRE: "",
                APELLIDOS: "",
                FECHA_NACIMIENTO: "",
                TELEFONO: "",
                CORREO: "",
                ESTATUS: 1,
                ID_USUARIO_ALTA: 0,
              };
              this.cargarClientes();
            } else {
              console.error("Error al crear el cliente:", response.statusText);
            }
          } else {
            console.error("Token JWT no contiene información de usuario");
          }
        }
      } catch (error) {
        console.error("Error al guardar el cliente:", error);
      }
    },
    async editarCliente(cliente: Cliente) {
      this.modoEdicion = true;
      try {
        this.clienteSeleccionado = cliente; // Guarda el cliente seleccionado para edición
        const modalElement = document.getElementById(
          "exampleModal"
        ) as HTMLElement;
        if (modalElement) {
          this.modal = new Modal(modalElement);
          this.modal.show();
          this.nuevoCliente = {
            NOMBRE: cliente.NOMBRE,
            APELLIDOS: cliente.APELLIDOS,
            FECHA_NACIMIENTO: cliente.FECHA_NACIMIENTO,
            TELEFONO: cliente.TELEFONO,
            CORREO: cliente.CORREO,
            ESTATUS: cliente.ESTATUS,
            ID_USUARIO_ALTA: cliente.ID_USUARIO_ALTA,
          };
          modalElement.addEventListener("hidden.bs.modal", () => {
            // Resetear los datos cuando se cierra el modal
            this.resetModal();
          });
        } else {
          console.error("Elemento modal no encontrado.");
        }
      } catch (error) {
        console.error("Error al editar el cliente:", error);
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
          const telefonoInput = form.querySelector(
            "#telefono"
          ) as HTMLInputElement;
          const correoInput = form.querySelector("#correo") as HTMLInputElement;

          if (
            !nombreInput ||
            !apellidosInput ||
            !fechaNacimientoInput ||
            !telefonoInput ||
            !correoInput
          ) {
            console.error("No se pudieron encontrar los campos.");
            return;
          }

          const nombre = nombreInput.value;
          const apellidos = apellidosInput.value;
          const fechaNacimiento = fechaNacimientoInput.value;
          const telefono = telefonoInput.value;
          const correo = correoInput.value;

          if (
            !nombre ||
            !apellidos ||
            !fechaNacimiento ||
            !telefono ||
            !correo
          ) {
            console.error("Por favor, ingrese datos válidos.");
            return;
          }
        }

        if (this.clienteSeleccionado) {
          if (this.nuevoCliente.ESTATUS === "Activo") {
            this.nuevoCliente.ESTATUS = 1;
          } else if (this.nuevoCliente.ESTATUS === "Inactivo") {
            this.nuevoCliente.ESTATUS = 0;
          } else if (this.nuevoCliente.ESTATUS === "Indefinido") {
            this.nuevoCliente.ESTATUS = 2;
          }

          const response = await axios.put(
            `${import.meta.env.VITE_APP_API_URL}/clientes/update/${
              this.clienteSeleccionado.ID
            }`,
            this.nuevoCliente
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Cliente editado satisfactoriamente",
              "alert alert-success"
            );
            this.modal.hide();
            this.resetModal();
            this.cargarClientes();
          } else {
            console.error("Error al editar el cliente:", response.statusText);
          }
        } else {
          console.error("No hay cliente seleccionado para editar.");
        }
      } catch (error) {
        console.error("Error al guardar los cambios:", error);
      }
    },
    mostrarModalEliminar(cliente: Cliente) {
      this.clienteSeleccionado = cliente; // Establecer el cliente seleccionado para eliminar
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
    async eliminarClienteConfirmado() {
      try {
        if (this.clienteSeleccionado) {
          const response = await axios.delete(
            `${import.meta.env.VITE_APP_API_URL}/clientes/delete/${
              this.clienteSeleccionado.ID
            }`
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Cliente eliminado satisfactoriamente",
              "alert alert-success"
            );
            this.modalEliminar.hide();
            this.resetModal();
            this.cargarClientes();
          } else {
            console.error("Error al eliminar el cliente:", response.statusText);
          }
        } else {
          console.error("No hay cliente seleccionado para eliminar.");
        }
      } catch (error) {
        console.error("Error al eliminar el cliente:", error);
      }
    },
    mostrarModalReactivar(cliente: Cliente) {
      this.clienteSeleccionado = cliente; // Establecer el cliente seleccionado para reactivar
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
    async reactivarClienteConfirmado() {
      try {
        if (this.clienteSeleccionado) {
          const response = await axios.put(
            `${import.meta.env.VITE_APP_API_URL}/clientes/reactivate/${
              this.clienteSeleccionado.ID
            }`
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Cliente reactivado satisfactoriamente",
              "alert alert-success"
            );
            this.modalReactivar.hide();
            this.resetModal();
            this.cargarClientes();
          } else {
            console.error(
              "Error al reactivar el cliente:",
              response.statusText
            );
          }
        } else {
          console.error("No hay cliente seleccionado para reactivar.");
        }
      } catch (error) {
        console.error("Error al reactivar el cliente:", error);
      }
    },
    async manejarGuardarCliente() {
      if (this.modoEdicion) {
        await this.guardarCambios();
      } else {
        await this.guardarCliente();
      }
    },
  },
  mounted() {
    this.cargarClientes();

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

        this.manejarGuardarCliente();
      });
    }
  },
  // watch: {
  //   modoEdicion(newClienteId, oldClienteId) {
  //     if (newClienteId !== oldClienteId) {
  //       console.log("El ID del cliente ha cambiado:", newClienteId);
  //       // Aquí puedes agregar la lógica que necesites al cambiar el cliente seleccionado
  //     }
  //   },
  // },
});
