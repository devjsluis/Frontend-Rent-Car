import { defineComponent } from "vue";
import axios from "../../../axiosConfig";
import { Modal } from "bootstrap";
import { getStatus } from "../../shared/enums/status.enum";
import { jwtDecode } from "jwt-decode";

interface RegisterComponentData {
  clientesData: Cliente[];
  clienteSeleccionado: Cliente | null;
  vehiclesData: Vehiculo[];
  vehiculoSeleccionado: Vehiculo | null;
  registerData: Register[];
  newRegister: NewRegister;
  modal: any;
  modalEliminar: any;
  modalReactivar: any;
  registerSelected: Register | null;
  showAlert: boolean;
  alertMessage: string;
  alertClass: string;
  modoEdicion: boolean;
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
  PAGO_INICIAL: number;
  PAGO_FINAL: number;
  FINALIZADO: number;
}
interface NewRegister {
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
  PAGO_INICIAL: number;
  PAGO_FINAL: number;
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
  data(): RegisterComponentData {
    return {
      clienteSeleccionado: null,
      vehiculoSeleccionado: null,
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
        FECHA_ENTREGA: "",
        FECHA_RETORNO: "",
        COSTO_TOTAL: 0,
        KILOMETRAJE_INICIAL: 0,
        KILOMETRAJE_FINAL: 0,
        DESTINO_DE_VIAJE: "",
        ESTATUS: 1,
        PAGO_INICIAL: 0,
        PAGO_FINAL: 0,
        FINALIZADO: 0,
      } as NewRegister,
      modoEdicion: false,
    };
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

          await this.manejarGuardarRegistro();
        });
      });
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
      this.newRegister = {
        ID_CLIENTE: 0,
        ID_VEHICULO: 0,
        FECHA_RENTA: new Date().toISOString().slice(0, 10),
        FECHA_ENTREGA: "",
        FECHA_RETORNO: "",
        COSTO_TOTAL: 0,
        KILOMETRAJE_INICIAL: 0,
        KILOMETRAJE_FINAL: 0,
        DESTINO_DE_VIAJE: "",
        ESTATUS: 1,
        PAGO_INICIAL: 0,
        PAGO_FINAL: 0,
        FINALIZADO: 0,
      };
      this.registerSelected = null;
      this.modoEdicion = false;
      if (this.modal) {
        this.modal.hide();
      }
      this.resetValidation();
    },
    initModal() {
      const modalElement = document.getElementById("exampleModal");
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
    async finalizarRenta(register: Register) {
      this.modoEdicion = true;
      try {
        this.registerSelected = register;
        this.clienteSeleccionado =
          this.clientesData.find(
            (cliente) => cliente.ID === register.ID_CLIENTE
          ) || null;
        this.vehiculoSeleccionado =
          this.vehiclesData.find(
            (vehiculo) => vehiculo.ID === register.ID_VEHICULO
          ) || null;

        const modalElement = document.getElementById(
          "modalFinalizarRenta"
        ) as HTMLElement;
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
              register.FECHA_ENTREGA = "";
            }
            if (register.FECHA_RETORNO) {
              const fechaRetorno = register.FECHA_RETORNO.split("T")[0];
              register.FECHA_RETORNO = fechaRetorno;
            } else {
              register.FECHA_RETORNO = "";
            }

            register.COSTO_TOTAL = register.COSTO_TOTAL ?? 0;
            register.KILOMETRAJE_FINAL = register.KILOMETRAJE_FINAL ?? 0;
            register.FECHA_ENTREGA = register.FECHA_ENTREGA ?? "";

            register.ESTATUS = getStatus(register.ESTATUS);
            return register;
          });
          // console.log(this.registerData);
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
    async saveRegister() {
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
          `${import.meta.env.VITE_APP_API_URL}/rent/create`,
          this.newRegister
        );

        if (response.status === 201) {
          this.mostrarAlerta(
            "Registro creado satisfactoriamente",
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
            console.error("El modal no está inicializado correctamente");
          }

          this.newRegister = {
            ID_CLIENTE: 0,
            ID_VEHICULO: 0,
            FECHA_RENTA: new Date().toISOString().slice(0, 10),
            FECHA_ENTREGA: "",
            FECHA_RETORNO: "",
            COSTO_TOTAL: 0,
            KILOMETRAJE_INICIAL: 0,
            KILOMETRAJE_FINAL: 0,
            DESTINO_DE_VIAJE: "",
            ESTATUS: 1,
            PAGO_INICIAL: 0,
            PAGO_FINAL: 0,
            FINALIZADO: 0,
          };

          this.cargarRegisterRent();
        } else {
          console.error("Error al crear el registro:", response.statusText);
        }
      } catch (error) {
        console.error("Error al guardar el registro:", error);
      }
    },
    async editRegister(register: Register) {
      this.modoEdicion = true;
      try {
        this.registerSelected = register;
        this.clienteSeleccionado =
          this.clientesData.find(
            (cliente) => cliente.ID === register.ID_CLIENTE
          ) || null;
        this.vehiculoSeleccionado =
          this.vehiclesData.find(
            (vehiculo) => vehiculo.ID === register.ID_VEHICULO
          ) || null;
        const modalElement = document.getElementById(
          this.registerSelected.FINALIZADO === 0
            ? "exampleModal"
            : "modalEditarFinalizado"
        ) as HTMLElement;

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
    async guardarCambios() {
      try {
        if (this.newRegister.ESTATUS === "Activo") {
          this.newRegister.ESTATUS = 1;
        } else if (this.newRegister.ESTATUS === "Inactivo") {
          this.newRegister.ESTATUS = 0;
        } else if (this.newRegister.ESTATUS === "Indefinido") {
          this.newRegister.ESTATUS = 2;
        }

        if (this.registerSelected) {
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
          console.error("No se ha seleccionado un cliente o registro.");
        }
      } catch (error) {
        console.error("Error al guardar los cambios:", error);
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
    async manejarGuardarRegistro() {
      if (this.modoEdicion) {
        await this.guardarCambios();
      } else {
        await this.saveRegister();
      }
    },
    calcularCostoTotal() {
      this.newRegister.COSTO_TOTAL =
        this.newRegister.PAGO_INICIAL + this.newRegister.PAGO_FINAL;
      return this.newRegister.COSTO_TOTAL;
    },
  },
  mounted() {
    this.cargarRegisterRent();
    this.iniciarFormulario();
  },
});
