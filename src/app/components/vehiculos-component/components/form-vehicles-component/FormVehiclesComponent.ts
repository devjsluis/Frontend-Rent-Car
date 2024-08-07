import { defineComponent } from "vue";
import axios from "../../../../../axiosConfig";
import { jwtDecode } from "jwt-decode";

export default defineComponent({
  name: "FormVehiclesComponent",
  props: {
    titleModal: String,
    modoEdicion: Boolean,
    cargarVehiculos: Function,
    nuevoVehicle: Object,
    vehicleSeleccionado: Object,
    modal: Object,
    tipoVehiculoData: Object,
    marcasData: Object,
    modelosData: Object,
    aniosData: Object,
    manejarGuardarVehiculo: {
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
          await this.manejarGuardarVehiculo();
        });
      });
    },
    async guardarVehiculo() {
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
          if (this.cargarVehiculos) {
            this.cargarVehiculos();
          }
        } else {
          console.error("Error al crear el vehículo:", response.statusText);
        }
      } catch (error) {
        console.error("Error al guardar el vehículo:", error);
      }
    },
  },
  mounted() {
    this.iniciarFormulario();
  },
});
