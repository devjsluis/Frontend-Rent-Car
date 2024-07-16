import { defineComponent } from "vue";
import axios from "../../../axiosConfig";
import { Modal } from "bootstrap";
import { getStatus } from "../../shared/enums/status.enum";
import FormClientesComponent from "./components/form-clientes-component/FormClientesComponent.vue";

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
  titleModal: string;
}

interface Cliente {
  ID: number;
  NOMBRE: string;
  APELLIDOS: string;
  FECHA_NACIMIENTO: string | null;
  TELEFONO: string;
  CORREO: string;
  ESTATUS: number | string;
  ID_USUARIO_ALTA: number;
}

interface NuevoCliente {
  NOMBRE: string;
  APELLIDOS: string;
  FECHA_NACIMIENTO: string | null;
  TELEFONO: string;
  CORREO: string;
  ESTATUS: number | string;
  ID_USUARIO_ALTA: number;
}

export default defineComponent({
  name: "ClientesComponent",
  components: {
    FormClientesComponent,
  },
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
        FECHA_NACIMIENTO: null,
        TELEFONO: "",
        CORREO: "",
        ESTATUS: 1,
        ID_USUARIO_ALTA: 0,
      } as NuevoCliente,
      showAlert: false,
      alertMessage: "",
      alertClass: "",
      modoEdicion: false,
      titleModal: "",
    };
  },
  methods: {
    async manejarGuardarCliente() {
      if (this.modoEdicion) {
        await this.guardarCambios();
      } else {
        await (
          this.$refs.formulario as InstanceType<typeof FormClientesComponent>
        ).guardarCliente();
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
      this.nuevoCliente = {
        NOMBRE: "",
        APELLIDOS: "",
        FECHA_NACIMIENTO: null,
        TELEFONO: "",
        CORREO: "",
        ESTATUS: 1,
        ID_USUARIO_ALTA: 0,
      };
      this.clienteSeleccionado = null;
      this.modoEdicion = false;
      this.titleModal = "";
      if (this.modal) {
        this.modal.hide();
      }
      this.resetValidation();
    },
    initModal() {
      this.titleModal = "Agregar Cliente";
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
    async cargarClientes() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/clientes/get`
          );
          this.clientesData = response.data.body.map((cliente: Cliente) => {
            if (cliente.FECHA_NACIMIENTO) {
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
    async editarCliente(cliente: Cliente) {
      this.titleModal = "Editar Cliente";
      this.modoEdicion = true;
      try {
        this.clienteSeleccionado = cliente;
        const modalElement = document.getElementById("modal") as HTMLElement;
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
            this.resetModal();
          });
        } else {
          console.error("Elemento modal no encontrado.");
        }
      } catch (error) {
        console.error("Error al editar el cliente:", error);
      }
    },
    mostrarModalEliminar(cliente: Cliente) {
      this.clienteSeleccionado = cliente;
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
      this.clienteSeleccionado = cliente;
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
  },
  mounted() {
    this.cargarClientes();
  },
});
