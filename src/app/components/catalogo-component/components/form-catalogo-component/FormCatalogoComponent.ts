import { defineComponent } from "vue";
import axios from "../../../../../axiosConfig";
import { jwtDecode } from "jwt-decode";

export default defineComponent({
  name: "FormCatalogoComponent",
  props: {
    activeTab: String,
    titleModal: String,
    modoEdicion: Boolean,
    cargarTipos: Function,
    cargarMarcas: Function,
    cargarModelos: Function,
    cargarAnios: Function,
    nuevoCatalogo: Object,
    catalogoSeleccionado: Object,
    modal: Object,
    manejarGuardarCatalogo: {
      type: Function,
      required: true,
    },
    mostrarAlerta: {
      type: Function,
      required: true,
    },
    resetModal: {
      type: Function,
      required: true,
    },
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
          await this.manejarGuardarCatalogo();
        });
      });
    },
    async guardarCatalogo() {
      try {
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
            const modalBackdrop = document.querySelector(".modal-backdrop");
            if (modalBackdrop) {
              modalBackdrop.parentNode?.removeChild(modalBackdrop);
            }
          } else {
            console.log("El modal no está inicializado correctamente");
          }

          if (this.activeTab === "Tipos de vehículo" && this.cargarTipos) {
            this.cargarTipos();
          } else if (this.activeTab === "Marcas" && this.cargarMarcas) {
            this.cargarMarcas();
          } else if (this.activeTab === "Modelos" && this.cargarModelos) {
            this.cargarModelos();
          } else if (this.activeTab === "Años" && this.cargarAnios) {
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
              const modalBackdrop = document.querySelector(".modal-backdrop");
              if (modalBackdrop) {
                modalBackdrop.parentNode?.removeChild(modalBackdrop);
              }
            } else {
              console.log("El modal no está inicializado correctamente");
            }
          }
        }
        console.error("Error al guardar el catálogo:", error);
      }
    },
  },
  mounted() {
    this.iniciarFormulario();
  },
});
