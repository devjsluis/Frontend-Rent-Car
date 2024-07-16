import { defineComponent } from "vue";
import axios from "../../../../../axiosConfig";
import { jwtDecode } from "jwt-decode";

export default defineComponent({
  name: "FormClientesComponent",
  props: {
    titleModal: String,
    modoEdicion: Boolean,
    cargarClientes: Function,
    nuevoCliente: Object,
    clienteSeleccionado: Object,
    modal: Object,
    manejarGuardarCliente: {
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
          await this.manejarGuardarCliente();
        });
      });
    },
    async guardarCliente() {
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

        if (this.nuevoCliente) {
          this.nuevoCliente.ID_USUARIO_ALTA = decodedToken.id;
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
            const modalBackdrop = document.querySelector(".modal-backdrop");
            if (modalBackdrop) {
              modalBackdrop.parentNode?.removeChild(modalBackdrop);
            }
          } else {
            console.log("El modal no está inicializado correctamente");
          }

          if (this.cargarClientes) {
            this.cargarClientes();
          }
        } else {
          console.error("Error al crear el cliente:", response.statusText);
        }
      } catch (error) {
        console.error("Error al guardar el cliente:", error);
      }
    },
  },
  mounted() {
    this.iniciarFormulario();
  },
});
