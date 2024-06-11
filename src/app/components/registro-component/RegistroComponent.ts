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
        FECHA_RENTA: "",
        FECHA_ENTREGA: "",
        FECHA_RETORNO: "",
        COSTO_TOTAL: 0,
        KILOMETRAJE_INICIAL: 0,
        KILOMETRAJE_FINAL: 0,
        DESTINO_DE_VIAJE: "",
        ESTATUS: 1,
      } as NewRegister,
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
      this.newRegister = {
        ID_CLIENTE: 0,
        ID_VEHICULO: 0,
        FECHA_RENTA: "",
        FECHA_ENTREGA: "",
        FECHA_RETORNO: "",
        COSTO_TOTAL: 0,
        KILOMETRAJE_INICIAL: 0,
        KILOMETRAJE_FINAL: 0,
        DESTINO_DE_VIAJE: "",
        ESTATUS: 1,
      };
      this.registerSelected = null;
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
    async cargarRegisterRent() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/rent/get`
          );
          this.registerData = response.data.body.map((register: Register) => {
            if (register.FECHA_RENTA !== undefined) {
              const fechaRenta = register.FECHA_RENTA.split("T")[0];
              register.FECHA_RENTA = fechaRenta;
            } else {
              console.warn(
                `Fecha de nacimiento no definida para el register con ID: ${register.ID}`
              );
              register.FECHA_RENTA = "";
            }
            if (register.FECHA_ENTREGA !== undefined) {
              const fechaRenta = register.FECHA_ENTREGA.split("T")[0];
              register.FECHA_ENTREGA = fechaRenta;
            } else {
              console.warn(
                `Fecha de nacimiento no definida para el register con ID: ${register.ID}`
              );
              register.FECHA_ENTREGA = "";
            }
            if (register.FECHA_RETORNO !== undefined) {
              const fechaRenta = register.FECHA_RETORNO.split("T")[0];
              register.FECHA_RETORNO = fechaRenta;
            } else {
              console.warn(
                `Fecha de nacimiento no definida para el register con ID: ${register.ID}`
              );
              register.FECHA_RETORNO = "";
            }
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
        if (token !== null) {
          const decodedToken: any = jwtDecode(token);
          if (decodedToken && decodedToken.id) {
            // this.idUser = decodedToken.id;
            // this.nuevoCliente.ID_USUARIO_ALTA = this.idUser;
          } else {
            console.error("Token JWT no contiene información de usuario");
          }
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
            const modalBackdrop = document.querySelector(".modal-backdrop"); // Seleccionar el elemento con la clase 'modal-backdrop'
            if (modalBackdrop) {
              modalBackdrop.parentNode?.removeChild(modalBackdrop); // Eliminar el elemento del DOM
            }
          } else {
            console.log("El modal no está inicializado correctamente");
          }

          this.newRegister = {
            ID_CLIENTE: 0,
            ID_VEHICULO: 0,
            FECHA_RENTA: "",
            FECHA_ENTREGA: "",
            FECHA_RETORNO: "",
            COSTO_TOTAL: 0,
            KILOMETRAJE_INICIAL: 0,
            KILOMETRAJE_FINAL: 0,
            DESTINO_DE_VIAJE: "",
            ESTATUS: 1,
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
      try {
        this.registerSelected = register; // Guarda el registro seleccionado para edición

        // Encuentra el cliente correspondiente al ID seleccionado
        this.clienteSeleccionado =
          this.clientesData.find(
            (cliente) => cliente.ID === register.ID_CLIENTE
          ) || null;

        // Encuentra el vehículo correspondiente al ID seleccionado
        this.vehiculoSeleccionado =
          this.vehiclesData.find(
            (vehiculo) => vehiculo.ID === register.ID_VEHICULO
          ) || null;

        const modalElement = document.getElementById(
          "exampleModal"
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
            COSTO_TOTAL: register.COSTO_TOTAL,
            KILOMETRAJE_INICIAL: register.KILOMETRAJE_INICIAL,
            KILOMETRAJE_FINAL: register.KILOMETRAJE_FINAL,
            DESTINO_DE_VIAJE: register.DESTINO_DE_VIAJE,
            ESTATUS: register.ESTATUS,
          };
        } else {
          console.error("Elemento modal no encontrado.");
        }
      } catch (error) {
        console.error("Error al editar el registro:", error);
      }
    },
    async guardarCambios() {
      try {
        if (this.clienteSeleccionado) {
          if (this.newRegister.ESTATUS === "Activo") {
            this.newRegister.ESTATUS = 1;
          } else if (this.newRegister.ESTATUS === "Inactivo") {
            this.newRegister.ESTATUS = 0;
          } else if (this.newRegister.ESTATUS === "Indefinido") {
            this.newRegister.ESTATUS = 2;
          }

          if (this.registerSelected) {
            // Verificar si registerSelected está definido
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
              this.registerSelected = null;
              this.newRegister = {
                ID_CLIENTE: 0,
                ID_VEHICULO: 0,
                FECHA_RENTA: "",
                FECHA_ENTREGA: "",
                FECHA_RETORNO: "",
                COSTO_TOTAL: 0,
                KILOMETRAJE_INICIAL: 0,
                KILOMETRAJE_FINAL: 0,
                DESTINO_DE_VIAJE: "",
                ESTATUS: 1,
              };
              this.cargarRegisterRent();
            } else {
              console.error(
                "Error al editar el registro:",
                response.statusText
              );
            }
          } else {
            console.error("No hay registro seleccionado para editar.");
          }
        } else {
          console.error("No se ha seleccionado un cliente.");
        }
      } catch (error) {
        console.error("Error al guardar los cambios:", error);
      }
    },
    mostrarModalEliminar(register: Register) {
      this.registerSelected = register; // Establecer el registro seleccionado para eliminar
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
            this.registerSelected = null;
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
      this.registerSelected = register; // Establecer el registro seleccionado para reactivar
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
            this.registerSelected = null;
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
  },
  // watch: {
  //   "newRegister.ID_CLIENTE"(newClienteId, oldClienteId) {
  //     if (newClienteId !== oldClienteId) {
  //       console.log("El ID del cliente ha cambiado:", newClienteId);
  //       // Aquí puedes agregar la lógica que necesites al cambiar el cliente seleccionado
  //     }
  //   },
  // },
  mounted() {
    this.cargarRegisterRent();
  },
});
