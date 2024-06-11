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
        const token = localStorage.getItem("token");
        if (token !== null) {
          const decodedToken: any = jwtDecode(token);
          if (decodedToken && decodedToken.id) {
            this.idUser = decodedToken.id;
            this.nuevoCliente.ID_USUARIO_ALTA = this.idUser;
          } else {
            console.error("Token JWT no contiene información de usuario");
          }
        }
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
            const modalBackdrop = document.querySelector(".modal-backdrop"); // Seleccionar el elemento con la clase 'modal-backdrop'
            if (modalBackdrop) {
              modalBackdrop.parentNode?.removeChild(modalBackdrop); // Eliminar el elemento del DOM
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
      } catch (error) {
        console.error("Error al guardar el cliente:", error);
      }
    },
    async editarCliente(cliente: Cliente) {
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
        } else {
          console.error("Elemento modal no encontrado.");
        }
      } catch (error) {
        console.error("Error al editar el cliente:", error);
      }
    },
    async guardarCambios() {
      try {
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
            this.clienteSeleccionado = null;
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
            this.clienteSeleccionado = null;
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
            this.clienteSeleccionado = null;
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
  },
  mounted() {
    this.cargarClientes();
  },
});
