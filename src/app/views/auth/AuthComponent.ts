import axios from "../../../axiosConfig";
import { defineComponent, ref, Ref } from "vue";
import router from "../../core/router";

interface AuthComponentData {
  showAlert: Ref<boolean>;
  alertMessage: Ref<string>;
  alertClass: Ref<string>;
}

const AuthComponent = defineComponent({
  name: "AuthComponent",
  data(): AuthComponentData {
    return {
      showAlert: ref(false),
      alertMessage: ref(""),
      alertClass: ref(""),
    };
  },
  methods: {
    async handleSubmit(event: any) {
      event.preventDefault();
      event.stopPropagation();

      const form = event.target;

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }

      const emailInput = form.querySelector("#emailId");
      const passwordInput = form.querySelector("#passwordId");

      if (!emailInput || !passwordInput) {
        console.error(
          "No se pudo encontrar el campo de correo electrónico o contraseña."
        );
        return;
      }

      const email = emailInput.value;
      const password = passwordInput.value;

      if (!email || !password) {
        console.error(
          "Por favor, ingrese un correo electrónico y una contraseña válidos."
        );
        return;
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/users/login`,
          {
            CORREO: email,
            CONTRASENA: password,
          }
        );
        if (response?.status === 200) {
          localStorage.setItem("token", response.data.body.token);
          router.push({ name: "Dashboard" });
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          this.showAlert = true;
          if (error.response?.status === 400) {
            this.alertMessage = "Error en la solicitud del cliente";
            this.alertClass = "alert alert-danger";
          } else if (error.response?.status === 401) {
            this.alertMessage = "Credenciales incorrectas";
            this.alertClass = "alert alert-danger";
          } else if (error.response?.status === 404) {
            this.alertMessage = "Usuario no encontrado";
            this.alertClass = "alert alert-danger";
          } else {
            this.alertMessage = "Error desconocido";
            this.alertClass = "alert alert-danger";
          }
        }
        setTimeout(() => {
          this.showAlert = false;
          this.alertMessage = "";
          this.alertClass = "";
        }, 4000);
      }
    },
  },
  mounted() {
    const form = document.querySelector(".form-login");

    if (form) {
      form.addEventListener("submit", this.handleSubmit);
    }
  },
});

export default AuthComponent;
