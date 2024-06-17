import { defineComponent } from "vue";
import axios from "../../../axiosConfig";
import { Modal } from "bootstrap";
import { getStatus } from "../../shared/enums/status.enum";
import { jwtDecode } from "jwt-decode";

interface CatalogComponentData {
  nuevoCatalogo: NuevoCatalogo;
  modal: any;
  modalEliminar: any;
  modalReactivar: any;
  showAlert: boolean;
  alertMessage: string;
  alertClass: string;
  activeTab: string;
  catalogData: Catalog[];
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

// interface Catalog {
//   ID: number;
//   DESCRIPCION: string;
//   ID_CATALOGO: number;
// }

export default defineComponent({
  name: "CatalogoComponent",
  data(): CatalogComponentData {
    return {
      modal: null,
      modalReactivar: null,
      modalEliminar: null,
      showAlert: false,
      alertMessage: "",
      alertClass: "",
      activeTab: "Tipos de vehículo",
      catalogData: [],
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
    resetModal() {
      this.nuevoCatalogo = {
        DESCRIPCION: "",
        ESTATUS: 1,
        ID_CATALOGO: this.nuevoCatalogo.ID_CATALOGO,
      };
      this.catalogoSeleccionado = null;
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
    async guardarCatalogo() {
      try {
        const form = document.querySelector(".form") as HTMLFormElement | null;

        if (form) {
          const descripcionInput = form.querySelector(
            "#descripcion"
          ) as HTMLInputElement;

          if (!descripcionInput) {
            console.error("No se pudieron encontrar los campos.");
            return;
          }

          const descripcion = descripcionInput.value;

          if (!descripcion) {
            console.error("Por favor, ingrese datos válidos.");
            return;
          }
        }
        const token = localStorage.getItem("token");
        if (token !== null) {
          const decodedToken: any = jwtDecode(token);
          if (decodedToken && decodedToken.id) {
          } else {
            console.error("Token JWT no contiene información de usuario");
          }
        }
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/elementos/create`,
          this.nuevoCatalogo
        );
        if (response.status === 201) {
          this.mostrarAlerta(
            "Catálogo creado satisfactoriamente",
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

          this.nuevoCatalogo = {
            DESCRIPCION: "",
            ESTATUS: 1,
            ID_CATALOGO: this.nuevoCatalogo.ID_CATALOGO,
          };
          if (this.activeTab === "Tipos de vehículo") {
            this.cargarTipos();
          } else if (this.activeTab === "Marcas") {
            this.cargarMarcas();
          } else if (this.activeTab === "Modelos") {
            this.cargarModelos();
          } else if (this.activeTab === "Años") {
            this.cargarAnios();
          }
        } else {
          console.error("Error al crear el catálogo:", response.statusText);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 409) {
            this.mostrarAlerta(
              "No se puede crear el catálogo porque esta descripción ya existe",
              "alert alert-danger"
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

            this.nuevoCatalogo = {
              DESCRIPCION: "",
              ESTATUS: 1,
              ID_CATALOGO: this.nuevoCatalogo.ID_CATALOGO,
            };
          }
        }
        console.error("Error al guardar el catálogo:", error);
      }
    },
    async editarCatalogo(catalogo: Catalog) {
      this.modoEdicion = true;
      try {
        this.catalogoSeleccionado = catalogo;
        const modalElement = document.getElementById(
          "exampleModal"
        ) as HTMLElement;
        if (modalElement) {
          this.modal = new Modal(modalElement);
          this.modal.show();
          this.nuevoCatalogo = {
            DESCRIPCION: catalogo.DESCRIPCION,
            ESTATUS: 1,
            ID_CATALOGO: catalogo.ID_CATALOGO,
          };
          modalElement.addEventListener("hidden.bs.modal", () => {
            // Resetear los datos cuando se cierra el modal
            this.resetModal();
          });
        } else {
          console.error("Elemento modal no encontrado.");
        }
      } catch (error) {
        console.error("Error al editar el catálogo:", error);
      }
    },
    async guardarCambios() {
      try {
        const form = document.querySelector(".form") as HTMLFormElement | null;

        if (form) {
          const descripcionInput = form.querySelector(
            "#descripcion"
          ) as HTMLInputElement;

          if (!descripcionInput) {
            console.error("No se pudieron encontrar los campos.");
            return;
          }

          const descripcion = descripcionInput.value;

          if (!descripcion) {
            console.error("Por favor, ingrese datos válidos.");
            return;
          }
        }
        if (this.catalogoSeleccionado) {
          if (this.nuevoCatalogo.ESTATUS === "Activo") {
            this.nuevoCatalogo.ESTATUS = 1;
          } else if (this.nuevoCatalogo.ESTATUS === "Inactivo") {
            this.nuevoCatalogo.ESTATUS = 0;
          } else if (this.nuevoCatalogo.ESTATUS === "Indefinido") {
            this.nuevoCatalogo.ESTATUS = 2;
          }

          const response = await axios.put(
            `${import.meta.env.VITE_APP_API_URL}/elementos/update/${
              this.catalogoSeleccionado.ID
            }`,
            this.nuevoCatalogo
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Catálogo editado satisfactoriamente",
              "alert alert-success"
            );
            this.modal.hide();
            this.resetModal();
            if (this.activeTab === "Tipos de vehículo") {
              this.cargarTipos();
            } else if (this.activeTab === "Marcas") {
              this.cargarMarcas();
            } else if (this.activeTab === "Modelos") {
              this.cargarModelos();
            } else if (this.activeTab === "Años") {
              this.cargarAnios();
            }
          } else {
            console.error("Error al editar el catálogo:", response.statusText);
          }
        } else {
          console.error("No hay catálogo seleccionado para editar.");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 409) {
            this.mostrarAlerta(
              "No se puede actualizar el catálogo porque esa descripción ya existe",
              "alert alert-danger"
            );

            this.modal.hide();
            this.catalogoSeleccionado = null;
            this.nuevoCatalogo = {
              DESCRIPCION: "",
              ESTATUS: 1,
              ID_CATALOGO: this.nuevoCatalogo.ID_CATALOGO,
            };
          }
        }
        console.error("Error al guardar los cambios:", error);
      }
    },
    mostrarModalEliminar(catalogo: Catalog) {
      this.catalogoSeleccionado = catalogo;
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
    async eliminarCatalogoConfirmado() {
      try {
        if (this.catalogoSeleccionado) {
          const response = await axios.delete(
            `${import.meta.env.VITE_APP_API_URL}/elementos/delete/${
              this.catalogoSeleccionado.ID
            }`
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Catálogo eliminado satisfactoriamente",
              "alert alert-success"
            );
            this.modalEliminar.hide();
            this.resetModal();
            if (this.activeTab === "Tipos de vehículo") {
              this.cargarTipos();
            } else if (this.activeTab === "Marcas") {
              this.cargarMarcas();
            } else if (this.activeTab === "Modelos") {
              this.cargarModelos();
            } else if (this.activeTab === "Años") {
              this.cargarAnios();
            }
          } else {
            console.error(
              "Error al eliminar el catálogo:",
              response.statusText
            );
          }
        } else {
          console.error("No hay catálogo seleccionado para eliminar.");
        }
      } catch (error) {
        console.error("Error al eliminar el catálogo:", error);
      }
    },
    mostrarModalReactivar(catalogo: Catalog) {
      this.catalogoSeleccionado = catalogo;
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
    async reactivarCatalogoConfirmado() {
      try {
        if (this.catalogoSeleccionado) {
          const response = await axios.put(
            `${import.meta.env.VITE_APP_API_URL}/elementos/reactivate/${
              this.catalogoSeleccionado.ID
            }`
          );
          if (response.status === 200) {
            this.mostrarAlerta(
              "Catálogo reactivado satisfactoriamente",
              "alert alert-success"
            );
            this.modalReactivar.hide();
            this.resetModal();
            if (this.activeTab === "Tipos de vehículo") {
              this.cargarTipos();
            } else if (this.activeTab === "Marcas") {
              this.cargarMarcas();
            } else if (this.activeTab === "Modelos") {
              this.cargarModelos();
            } else if (this.activeTab === "Años") {
              this.cargarAnios();
            }
          } else {
            console.error(
              "Error al reactivar el catálogo:",
              response.statusText
            );
          }
        } else {
          console.error("No hay catálogo seleccionado para reactivar.");
        }
      } catch (error) {
        console.error("Error al reactivar el catálogo:", error);
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
    async cargarTipos() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;

          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/elementos/getTipos`
          );
          this.catalogData = response.data.body.map((catalogo: Catalog) => {
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
    async cargarMarcas() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;

          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/elementos/getMarcas`
          );
          this.catalogData = response.data.body.map((catalogo: Catalog) => {
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
            `${import.meta.env.VITE_APP_API_URL}/elementos/getModelos`
          );
          this.catalogData = response.data.body.map((catalogo: Catalog) => {
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
            `${import.meta.env.VITE_APP_API_URL}/elementos/getAnios`
          );
          this.catalogData = response.data.body.map((catalogo: Catalog) => {
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
    setActiveTab(tab: string) {
      this.activeTab = tab;
      if (tab === "Tipos de vehículo") {
        this.nuevoCatalogo.ID_CATALOGO = 1;
        this.cargarTipos();
      } else if (tab === "Marcas") {
        this.nuevoCatalogo.ID_CATALOGO = 2;
        this.cargarMarcas();
      } else if (tab === "Modelos") {
        this.nuevoCatalogo.ID_CATALOGO = 3;
        this.cargarModelos();
      } else if (tab === "Años") {
        this.nuevoCatalogo.ID_CATALOGO = 4;
        this.cargarAnios();
      }
    },
    async manejarGuardarCatalogo() {
      if (this.modoEdicion) {
        await this.guardarCambios();
      } else {
        await this.guardarCatalogo();
      }
    },
  },
  mounted() {
    this.cargarTipos();

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

        this.manejarGuardarCatalogo();
      });
    }
  },
  // watch: {
  //   "nuevoCatalogo.ID_CATALOGO"(newClienteId, oldClienteId) {
  //     if (newClienteId !== oldClienteId) {
  //       console.log("El ID del cliente ha cambiado:", newClienteId);
  //       // Aquí puedes agregar la lógica que necesites al cambiar el cliente seleccionado
  //     }
  //   },
  // },
});
