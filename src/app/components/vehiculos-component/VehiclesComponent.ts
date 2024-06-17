import { defineComponent } from "vue";
import axios from "../../../axiosConfig";
import { Modal } from "bootstrap";
import { getStatus } from "../../shared/enums/status.enum";

interface VehiclesComponentData {
  nuevoCatalogo: NuevoCatalogo;
  tipoVehiculoData: Catalog[];
  marcasData: Catalog[];
  modelosData: Catalog[];
  aniosData: Catalog[];
  vehiclesData: Vehicle[];
  nuevoVehicle: NuevoVehicle;
  modal: any;
  modalEliminar: any;
  modalReactivar: any;
  vehicleSeleccionado: Vehicle | null;
  showAlert: boolean;
  alertMessage: string;
  alertClass: string;
  catalogoSeleccionado: Catalog | null;
  modoEdicion: boolean;
}

interface Catalog {
  ID: number;
  DESCRIPCION: string;
  ID_CATALOGO: number;
  ESTATUS: string | number;
}

interface NuevoCatalogo {
  DESCRIPCION: string;
  ID_CATALOGO: number;
  ESTATUS: string | number;
}

interface Vehicle {
  ID: number;
  FECHA_ALTA: string;
  ESTATUS: number | string;
  ID_TIPO_VEHICULO: number;
  ID_MARCA: number;
  ID_MODELO: number;
  ID_ANIO: number;
  NOTAS: string;
}

interface NuevoVehicle {
  FECHA_ALTA: string;
  ESTATUS: number | string;
  ID_TIPO_VEHICULO: number | string | null;
  ID_MARCA: number | string | null;
  ID_MODELO: number | string | null;
  ID_ANIO: number | string | null;
  NOTAS: string;
}

export default defineComponent({
  name: "VehiclesComponent",
  data(): VehiclesComponentData {
    return {
      vehiclesData: [],
      marcasData: [],
      modelosData: [],
      aniosData: [],
      modal: null,
      modalReactivar: null,
      modalEliminar: null,
      vehicleSeleccionado: null,
      nuevoVehicle: {
        FECHA_ALTA: new Date().toISOString().slice(0, 10),
        ESTATUS: 1,
        ID_TIPO_VEHICULO: "",
        ID_MARCA: "",
        ID_MODELO: "",
        ID_ANIO: "",
        NOTAS: "",
      } as NuevoVehicle,
      showAlert: false,
      alertMessage: "",
      alertClass: "",
      tipoVehiculoData: [],
      catalogoSeleccionado: null,
      nuevoCatalogo: {
        DESCRIPCION: "",
        ID_CATALOGO: 1,
      } as NuevoCatalogo,
      modoEdicion: false,
    };
  },
  methods: {
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
      this.nuevoVehicle = {
        FECHA_ALTA: new Date().toISOString().slice(0, 10),
        ESTATUS: 1,
        ID_TIPO_VEHICULO: "",
        ID_MARCA: "",
        ID_MODELO: "",
        ID_ANIO: "",
        NOTAS: "",
      };
      this.vehicleSeleccionado = null;
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
    async cargarVehiculos() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/vehiculos/getVehiclesAll`
          );
          this.vehiclesData = response.data.body.map((vehicle: Vehicle) => {
            if (vehicle.FECHA_ALTA !== undefined) {
              const fechaAlta = vehicle.FECHA_ALTA.split("T")[0];
              vehicle.FECHA_ALTA = fechaAlta;
            } else {
              console.warn(
                `Fecha de nacimiento no definida para el vehicle con ID: ${vehicle.ID}`
              );
              vehicle.FECHA_ALTA = "";
            }
            vehicle.ESTATUS = getStatus(vehicle.ESTATUS);
            return vehicle;
          });
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de vehículos:", error);
      }
    },
    async cargarTiposDeVehiculo() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;

          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/elementos/getTipos2`
          );
          this.tipoVehiculoData = response.data.body.map(
            (catalogo: Catalog) => {
              catalogo.ESTATUS = getStatus(catalogo.ESTATUS);
              return catalogo;
            }
          );
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de catálogos:", error);
      }
    },
    async cargarMarcas() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;

          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/elementos/getMarcas2`
          );
          this.marcasData = response.data.body.map((catalogo: Catalog) => {
            catalogo.ESTATUS = getStatus(catalogo.ESTATUS);
            return catalogo;
          });
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de catálogos:", error);
      }
    },
    async cargarModelos() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;

          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/elementos/getModelos2`
          );
          this.modelosData = response.data.body.map((catalogo: Catalog) => {
            catalogo.ESTATUS = getStatus(catalogo.ESTATUS);
            return catalogo;
          });
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de catálogos:", error);
      }
    },
    async cargarAnios() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/elementos/getAnios2`
          );
          this.aniosData = response.data.body.map((catalogo: Catalog) => {
            catalogo.ESTATUS = getStatus(catalogo.ESTATUS);
            return catalogo;
          });
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de catálogos:", error);
      }
    },
    async guardarVehiculo() {
      try {
        const form = document.querySelector(".form") as HTMLFormElement | null;

        if (form) {
          const fechaAltaInput = form.querySelector(
            "#fechaAlta"
          ) as HTMLInputElement;
          const idTipoSelect = form.querySelector(
            "#idTipo"
          ) as HTMLSelectElement;
          const idMarcaSelect = form.querySelector(
            "#marca"
          ) as HTMLSelectElement;
          const idModeloSelect = form.querySelector(
            "#modelo"
          ) as HTMLSelectElement;
          const idAnioSelect = form.querySelector("#anio") as HTMLSelectElement;

          if (
            !fechaAltaInput ||
            !idTipoSelect ||
            !idMarcaSelect ||
            !idModeloSelect ||
            !idAnioSelect
          ) {
            console.error("No se pudieron encontrar los campos.");
            return;
          }

          const fechaAlta = fechaAltaInput.value;
          const idTipo = idTipoSelect.value;
          const idMarca = idMarcaSelect.value;
          const idModelo = idModeloSelect.value;
          const idAnio = idAnioSelect.value;

          if (!fechaAlta || !idTipo || !idMarca || !idModelo || !idAnio) {
            console.error("Por favor, ingrese datos válidos.");
            return;
          }
        }
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/vehiculos/create`,
          this.nuevoVehicle
        );
        if (response.status === 201) {
          this.mostrarAlerta(
            "Vehículo creado satisfactoriamente",
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

          this.nuevoVehicle = {
            FECHA_ALTA: new Date().toISOString().slice(0, 10),
            ESTATUS: 1,
            ID_TIPO_VEHICULO: "",
            ID_MARCA: "",
            ID_MODELO: "",
            ID_ANIO: "",
            NOTAS: "",
          };
          this.cargarVehiculos();
        } else {
          console.error("Error al crear el vehículo:", response.statusText);
        }
      } catch (error) {
        console.error("Error al guardar el vehículo:", error);
      }
    },
    async editarVehiculo(vehiculo: Vehicle) {
      this.modoEdicion = true;
      try {
        this.vehicleSeleccionado = vehiculo; // Guarda el vehículo seleccionado para edición
        const modalElement = document.getElementById(
          "exampleModal"
        ) as HTMLElement;
        if (modalElement) {
          this.modal = new Modal(modalElement);
          this.modal.show();
          this.nuevoVehicle = {
            FECHA_ALTA: vehiculo.FECHA_ALTA,
            ESTATUS: vehiculo.ESTATUS,
            ID_TIPO_VEHICULO: vehiculo.ID_TIPO_VEHICULO,
            ID_MARCA: vehiculo.ID_MARCA,
            ID_MODELO: vehiculo.ID_MODELO,
            ID_ANIO: vehiculo.ID_ANIO,
            NOTAS: vehiculo.NOTAS,
          };
          modalElement.addEventListener("hidden.bs.modal", () => {
            // Resetear los datos cuando se cierra el modal
            this.resetModal();
          });
        } else {
          console.error("Elemento modal no encontrado.");
        }
      } catch (error) {
        console.error("Error al editar el vehículo:", error);
      }
    },
    async guardarCambios() {
      try {
        const form = document.querySelector(".form") as HTMLFormElement | null;

        if (form) {
          const fechaAltaInput = form.querySelector(
            "#fechaAlta"
          ) as HTMLInputElement;
          const idTipoSelect = form.querySelector(
            "#idTipo"
          ) as HTMLSelectElement;
          const idMarcaSelect = form.querySelector(
            "#marca"
          ) as HTMLSelectElement;
          const idModeloSelect = form.querySelector(
            "#modelo"
          ) as HTMLSelectElement;
          const idAnioSelect = form.querySelector("#anio") as HTMLSelectElement;

          if (
            !fechaAltaInput ||
            !idTipoSelect ||
            !idMarcaSelect ||
            !idModeloSelect ||
            !idAnioSelect
          ) {
            console.error("No se pudieron encontrar los campos.");
            return;
          }

          const fechaAlta = fechaAltaInput.value;
          const idTipo = idTipoSelect.value;
          const idMarca = idMarcaSelect.value;
          const idModelo = idModeloSelect.value;
          const idAnio = idAnioSelect.value;

          if (!fechaAlta || !idTipo || !idMarca || !idModelo || !idAnio) {
            console.error("Por favor, ingrese datos válidos.");
            return;
          }
        }
        if (this.vehicleSeleccionado) {
          if (this.nuevoVehicle.ESTATUS === "Activo") {
            this.nuevoVehicle.ESTATUS = 1;
          } else if (this.nuevoVehicle.ESTATUS === "Inactivo") {
            this.nuevoVehicle.ESTATUS = 0;
          } else if (this.nuevoVehicle.ESTATUS === "Indefinido") {
            this.nuevoVehicle.ESTATUS = 2;
          }

          const response = await axios.put(
            `${import.meta.env.VITE_APP_API_URL}/vehiculos/update/${
              this.vehicleSeleccionado.ID
            }`,
            this.nuevoVehicle
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Vehículo editado satisfactoriamente",
              "alert alert-success"
            );
            this.modal.hide();
            this.resetModal();
            this.cargarVehiculos();
          } else {
            console.error("Error al editar el vehículo:", response.statusText);
          }
        } else {
          console.error("No hay vehículo seleccionado para editar.");
        }
      } catch (error) {
        console.error("Error al guardar los cambios:", error);
      }
    },
    mostrarModalEliminar(vehiculo: Vehicle) {
      this.vehicleSeleccionado = vehiculo; // Establecer el vehiculo seleccionado para eliminar
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
    async eliminarVehiculoConfirmado() {
      try {
        if (this.vehicleSeleccionado) {
          const response = await axios.delete(
            `${import.meta.env.VITE_APP_API_URL}/vehiculos/delete/${
              this.vehicleSeleccionado.ID
            }`
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Vehículo eliminado satisfactoriamente",
              "alert alert-success"
            );
            this.modalEliminar.hide();
            this.resetModal();
            this.cargarVehiculos();
          } else {
            console.error(
              "Error al eliminar el vehiculo:",
              response.statusText
            );
          }
        } else {
          console.error("No hay vehiculo seleccionado para eliminar.");
        }
      } catch (error) {
        console.error("Error al eliminar el vehiculo:", error);
      }
    },
    mostrarModalReactivar(vehiculo: Vehicle) {
      this.vehicleSeleccionado = vehiculo; // Establecer el vehiculo seleccionado para reactivar
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
    async reactivarVehiculoConfirmado() {
      try {
        if (this.vehicleSeleccionado) {
          const response = await axios.put(
            `${import.meta.env.VITE_APP_API_URL}/vehiculos/reactivate/${
              this.vehicleSeleccionado.ID
            }`
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Vehículo reactivado satisfactoriamente",
              "alert alert-success"
            );
            this.modalReactivar.hide();
            this.resetModal();
            this.cargarVehiculos();
          } else {
            console.error(
              "Error al reactivar el vehiculo:",
              response.statusText
            );
          }
        } else {
          console.error("No hay vehiculo seleccionado para reactivar.");
        }
      } catch (error) {
        console.error("Error al reactivar el vehiculo:", error);
      }
    },
    async manejarGuardarVehiculo() {
      if (this.modoEdicion) {
        await this.guardarCambios();
      } else {
        await this.guardarVehiculo();
      }
    },
  },
  mounted() {
    this.cargarVehiculos();
    this.cargarTiposDeVehiculo();
    this.cargarMarcas();
    this.cargarModelos();
    this.cargarAnios();

    // Asociar evento submit una sola vez
    const form = document.querySelector(".form") as HTMLFormElement | null;
    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!form.checkValidity()) {
          form.classList.add("was-validated");
          return;
        }

        this.manejarGuardarVehiculo();
      });
    }
  },
});
