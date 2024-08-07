import { defineComponent } from "vue";
import axios from "../../../axiosConfig";
import { Modal } from "bootstrap";
import { getStatus } from "../../shared/enums/status.enum";
import FormRegisterComponent from "./components/form-register-component/FormRegisterComponent.vue";

interface RegisterComponentData {
  clientesData: Cliente[];
  vehiclesData: Vehiculo[];
  registerData: Register[];
  modalEliminar: any;
  modalReactivar: any;
  showAlert: boolean;
  alertMessage: string;
  alertClass: string;
  registerSelected: Register | null;
  newRegister: NewRegister;
  modal: any;

  modoEdicion: boolean;
  titleModal: string;
  isFinalizarRenta: boolean;
  editFinalizado: boolean;
}
interface Register {
  ID: number;
  ID_CLIENTE: number;
  ID_VEHICULO: number;
  FECHA_RENTA: string | null;
  FECHA_ENTREGA: string | null;
  FECHA_RETORNO: string | null;
  COSTO_TOTAL: number;
  KILOMETRAJE_INICIAL: number;
  KILOMETRAJE_FINAL: number;
  DESTINO_DE_VIAJE: string;
  ESTATUS: number | string;
  PAGO_INICIAL: number;
  PAGO_FINAL: number;
  FINALIZADO: number;
}
interface NewRegister {
  ID_CLIENTE: number;
  ID_VEHICULO: number;
  FECHA_RENTA: string | null;
  FECHA_ENTREGA: string | null;
  FECHA_RETORNO: string | null;
  COSTO_TOTAL: number | null;
  KILOMETRAJE_INICIAL: number | null;
  KILOMETRAJE_FINAL: number | null;
  DESTINO_DE_VIAJE: string;
  ESTATUS: number | string;
  PAGO_INICIAL: number | null;
  PAGO_FINAL: number | null;
  FINALIZADO: number;
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
interface Vehiculo {
  ID: number;
  FECHA_ALTA: string;
  ESTATUS: number | string;
  ID_TIPO_VEHICULO: number;
  ID_MARCA: number;
  ID_MODELO: number;
  ID_ANIO: number;
  NOTAS: string;
  MARCA: string;
  MODELO: string;
  ANIO: string;
}

export default defineComponent({
  name: "RegisterComponent",
  components: {
    FormRegisterComponent,
  },
  data(): RegisterComponentData {
    return {
      clientesData: [],
      registerData: [],
      vehiclesData: [],
      modal: null,
      modalReactivar: null,
      modalEliminar: null,
      showAlert: false,
      alertMessage: "",
      alertClass: "",
      registerSelected: null,
      newRegister: {
        ID_CLIENTE: 0,
        ID_VEHICULO: 0,
        FECHA_RENTA: new Date().toISOString().slice(0, 10),
        FECHA_ENTREGA: null,
        FECHA_RETORNO: null,
        COSTO_TOTAL: null,
        KILOMETRAJE_INICIAL: null,
        KILOMETRAJE_FINAL: null,
        DESTINO_DE_VIAJE: "",
        ESTATUS: 1,
        PAGO_INICIAL: null,
        PAGO_FINAL: null,
        FINALIZADO: 0,
      } as NewRegister,
      modoEdicion: false,
      titleModal: "",
      isFinalizarRenta: false,
      editFinalizado: false,
    };
  },
  methods: {
    async manejarGuardarRegistro() {
      if (this.modoEdicion) {
        await this.guardarCambios();
      } else {
        await (
          this.$refs.formulario as InstanceType<typeof FormRegisterComponent>
        ).saveRegister();
      }
    },
    resetValidation() {
      const form = document.querySelector(".form") as HTMLFormElement | null;
      if (form) {
        form.classList.remove("was-validated");
      }
    },
    resetModal() {
      this.newRegister = {
        ID_CLIENTE: 0,
        ID_VEHICULO: 0,
        FECHA_RENTA: new Date().toISOString().slice(0, 10),
        FECHA_ENTREGA: null,
        FECHA_RETORNO: null,
        COSTO_TOTAL: null,
        KILOMETRAJE_INICIAL: null,
        KILOMETRAJE_FINAL: null,
        DESTINO_DE_VIAJE: "",
        ESTATUS: 1,
        PAGO_INICIAL: null,
        PAGO_FINAL: null,
        FINALIZADO: 0,
      };
      this.registerSelected = null;
      this.modoEdicion = false;
      this.titleModal = "";
      this.isFinalizarRenta = false;
      this.editFinalizado = false;
      if (this.modal) {
        this.modal.hide();
      }
      this.resetValidation();
    },
    initModal() {
      this.titleModal = "Agregar Registro";
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
    async editRegister(register: Register) {
      this.modoEdicion = true;
      this.titleModal = "Editar Registro";
      if (register.FINALIZADO === 1) {
        this.editFinalizado = true;
      }
      try {
        this.registerSelected = register;
        const modalElement = document.getElementById("modal") as HTMLElement;

        if (modalElement) {
          this.modal = new Modal(modalElement);
          this.modal.show();
          this.newRegister = {
            ID_CLIENTE: register.ID_CLIENTE,
            ID_VEHICULO: register.ID_VEHICULO,
            FECHA_RENTA: register.FECHA_RENTA,
            FECHA_ENTREGA: register.FECHA_ENTREGA,
            FECHA_RETORNO: register.FECHA_RETORNO,
            PAGO_INICIAL: register.PAGO_INICIAL,
            PAGO_FINAL: register.PAGO_FINAL,
            COSTO_TOTAL: register.COSTO_TOTAL,
            KILOMETRAJE_INICIAL: register.KILOMETRAJE_INICIAL,
            KILOMETRAJE_FINAL: register.KILOMETRAJE_FINAL,
            DESTINO_DE_VIAJE: register.DESTINO_DE_VIAJE,
            ESTATUS: register.ESTATUS,
            FINALIZADO: register.FINALIZADO,
          };
          modalElement.addEventListener("hidden.bs.modal", () => {
            this.resetModal();
          });
        } else {
          console.error("Elemento modal no encontrado.");
        }
      } catch (error) {
        console.error("Error al editar el registro:", error);
      }
    },
    async finalizarRenta(register: Register) {
      this.modoEdicion = true;
      this.titleModal = "Finalizar Renta";
      this.isFinalizarRenta = true;
      try {
        this.registerSelected = register;

        const modalElement = document.getElementById("modal") as HTMLElement;
        if (modalElement) {
          this.modal = new Modal(modalElement);
          this.modal.show();

          this.newRegister = {
            ID_CLIENTE: register.ID_CLIENTE,
            ID_VEHICULO: register.ID_VEHICULO,
            FECHA_RENTA: register.FECHA_RENTA,
            FECHA_ENTREGA: register.FECHA_ENTREGA,
            FECHA_RETORNO: register.FECHA_RETORNO,
            PAGO_INICIAL: register.PAGO_INICIAL,
            PAGO_FINAL: register.PAGO_FINAL,
            COSTO_TOTAL: register.COSTO_TOTAL,
            KILOMETRAJE_INICIAL: register.KILOMETRAJE_INICIAL,
            KILOMETRAJE_FINAL: register.KILOMETRAJE_FINAL,
            DESTINO_DE_VIAJE: register.DESTINO_DE_VIAJE,
            ESTATUS: register.ESTATUS,
            FINALIZADO: 1,
          };

          modalElement.addEventListener("hidden.bs.modal", () => {
            this.resetModal();
          });
        } else {
          console.error("No se encontró el elemento modal.");
        }
      } catch (error) {
        console.error("Error al editar el registro:", error);
      }
    },
    async guardarCambios() {
      try {
        if (this.registerSelected) {
          if (this.newRegister.ESTATUS === "Activo") {
            this.newRegister.ESTATUS = 1;
          } else if (this.newRegister.ESTATUS === "Inactivo") {
            this.newRegister.ESTATUS = 0;
          } else if (this.newRegister.ESTATUS === "Indefinido") {
            this.newRegister.ESTATUS = 2;
          }

          const response = await axios.put(
            `${import.meta.env.VITE_APP_API_URL}/rent/update/${
              this.registerSelected.ID
            }`,
            this.newRegister
          );

          if (response.status === 200) {
            this.mostrarAlerta(
              "Registro editado satisfactoriamente",
              "alert alert-success"
            );
            this.modal.hide();
            this.resetModal();
            this.cargarRegisterRent();
          } else {
            console.error("Error al editar el registro:", response.statusText);
          }
        } else {
          console.error("No se ha seleccionado un registro.");
        }
      } catch (error) {
        console.error("Error al guardar los cambios:", error);
      }
    },
    async cargarRegisterRent() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/rent/get`
          );
          this.registerData = response.data.body.map((register: Register) => {
            if (register.FECHA_RENTA) {
              const fechaRenta = register.FECHA_RENTA.split("T")[0];
              register.FECHA_RENTA = fechaRenta;
            } else {
              register.FECHA_RENTA = "";
            }
            if (register.FECHA_ENTREGA) {
              const fechaEntrega = register.FECHA_ENTREGA.split("T")[0];
              register.FECHA_ENTREGA = fechaEntrega;
            } else {
              register.FECHA_ENTREGA = null;
            }
            if (register.FECHA_RETORNO) {
              const fechaRetorno = register.FECHA_RETORNO.split("T")[0];
              register.FECHA_RETORNO = fechaRetorno;
            } else {
              register.FECHA_RETORNO = "";
            }

            register.COSTO_TOTAL = register.COSTO_TOTAL ?? null;
            register.KILOMETRAJE_FINAL = register.KILOMETRAJE_FINAL ?? null;
            register.FECHA_ENTREGA = register.FECHA_ENTREGA ?? null;

            register.ESTATUS = getStatus(register.ESTATUS);
            return register;
          });
          this.cargarClient();
          this.cargarVehicles();
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de registros:", error);
      }
    },
    async cargarClient() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/clientes/getByName`
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
    async cargarVehicles() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/vehiculos/getVehicles`
          );
          this.vehiclesData = response.data.body.map((vehiculo: Vehiculo) => {
            if (vehiculo.FECHA_ALTA !== undefined) {
              const fechaAlta = vehiculo.FECHA_ALTA.split("T")[0];
              vehiculo.FECHA_ALTA = fechaAlta;
            } else {
              console.warn(
                `Fecha de alta no definida para el vehículo con ID: ${vehiculo.ID}`
              );
              vehiculo.FECHA_ALTA = "";
            }
            vehiculo.ESTATUS = getStatus(vehiculo.ESTATUS);
            return vehiculo;
          });
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de clientes:", error);
      }
    },
    mostrarModalEliminar(register: Register) {
      this.registerSelected = register;
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
    mostrarModalReactivar(register: Register) {
      this.registerSelected = register;
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
    async deleteRegister() {
      try {
        if (this.registerSelected) {
          const response = await axios.delete(
            `${import.meta.env.VITE_APP_API_URL}/rent/delete/${
              this.registerSelected.ID
            }`
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Registro eliminado satisfactoriamente",
              "alert alert-success"
            );
            this.modalEliminar.hide();
            this.resetModal();
            this.cargarRegisterRent();
          } else {
            console.error(
              "Error al eliminar el registro:",
              response.statusText
            );
          }
        } else {
          console.error("No hay registro seleccionado para eliminar.");
        }
      } catch (error) {
        console.error("Error al eliminar el registro:", error);
      }
    },
    async reactivateRegister() {
      try {
        if (this.registerSelected) {
          const response = await axios.put(
            `${import.meta.env.VITE_APP_API_URL}/rent/reactivate/${
              this.registerSelected.ID
            }`
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Registro reactivado satisfactoriamente",
              "alert alert-success"
            );
            this.modalReactivar.hide();
            this.resetModal();
            this.cargarRegisterRent();
          } else {
            console.error(
              "Error al reactivar el registro:",
              response.statusText
            );
          }
        } else {
          console.error("No hay registro seleccionado para reactivar.");
        }
      } catch (error) {
        console.error("Error al reactivar el registro:", error);
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
  },
  mounted() {
    this.cargarRegisterRent();
  },
});
