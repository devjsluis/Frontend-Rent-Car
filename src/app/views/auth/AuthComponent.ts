import { defineComponent, onMounted } from "vue";

const AuthComponent = defineComponent({
  name: "AuthComponent",
  setup() {
    onMounted(() => {
      const form = document.querySelector(
        ".needs-validation"
      ) as HTMLFormElement | null;

      if (form) {
        form.addEventListener("submit", (event) => {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }

          form.classList.add("was-validated");
        });
      }
    });
  },
});

export default AuthComponent;
