import axios from "../../../axiosConfig";
import { defineComponent, onMounted, ref } from "vue";

const AuthComponent = defineComponent({
  name: "AuthComponent",
  setup() {
    const showAlert = ref(false);
    const alertMessage = ref("");
    const alertClass = ref("");
    onMounted(() => {
      const form = document.querySelector(
        ".form-login"
      ) as HTMLFormElement | null;

      if (form) {
        form.addEventListener("submit", async (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
          }

          const emailInput = form.querySelector("#emailId") as HTMLInputElement;
          const passwordInput = form.querySelector(
            "#passwordId"
          ) as HTMLInputElement;

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
              showAlert.value = true;
              alertMessage.value = "Inicio de sesión exitoso";
              alertClass.value = "alert alert-success";
            }
          } catch (error) {
            if (axios.isAxiosError(error)) {
              if (error.response?.status === 400) {
                showAlert.value = true;
                alertMessage.value = "Error en la solicitud del cliente";
                alertClass.value = "alert alert-danger";
              } else if (error.response?.status === 401) {
                showAlert.value = true;
                alertMessage.value = "Credenciales incorrectas";
                alertClass.value = "alert alert-danger";
              } else if (error.response?.status === 404) {
                showAlert.value = true;
                alertMessage.value = "Usuario no encontrado";
                alertClass.value = "alert alert-danger";
              } else {
                showAlert.value = true;
                alertMessage.value = "Error desconocido";
                alertClass.value = "alert alert-danger";
              }
            }
          }
          setTimeout(() => {
            showAlert.value = false;
            alertMessage.value = "";
            alertClass.value = "";
          }, 4000);
        });
      }
    });
    return { showAlert, alertMessage, alertClass };
  },
});

export default AuthComponent;
