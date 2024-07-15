import { defineComponent } from "vue";
import axios from "../../../../../axiosConfig";
import { jwtDecode } from "jwt-decode";

export default defineComponent({
  name: "FormRegisterComponent",
  props: {
    titleModal: String,
    modoEdicion: Boolean,
    isFinalizarRenta: Boolean,
    editFinalizado: Boolean,
    clientesData: Object,
    vehiclesData: Object,
    cargarRegisterRent: Function,
    newRegister: Object,
    registerSelected: Object,
    modal: Object,
    manejarGuardarRegistro: {
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
          await this.manejarGuardarRegistro();
        });
      });
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

          if (this.cargarRegisterRent) {
            this.cargarRegisterRent();
          }
        } else {
          console.error("Error al crear el registro:", response.statusText);
        }
      } catch (error) {
        console.error("Error al guardar el registro:", error);
      }
    },
    calcularCostoTotal() {
      if (this.newRegister) {
        this.newRegister.COSTO_TOTAL =
          this.newRegister.PAGO_INICIAL + this.newRegister.PAGO_FINAL;
        return this.newRegister.COSTO_TOTAL;
      }
    },
  },
  mounted() {
    this.iniciarFormulario();
  },
});
