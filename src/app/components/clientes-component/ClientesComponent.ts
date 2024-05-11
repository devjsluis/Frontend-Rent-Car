import { defineComponent } from "vue";
import axios from "../../../axiosConfig";
import { Modal } from "bootstrap";
import { changeActiveItem } from "../../shared/sharedMetods";
import { getStatus } from "../../shared/enums/status.enum";
import { jwtDecode } from "jwt-decode";

interface ClientesComponentData {
  items: ListItem[];
  clientesData: Cliente[];
  nuevoCliente: NuevoCliente;
  modal: any;
  idUser: number;
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

interface NuevoCliente {
  NOMBRE: string;
  APELLIDOS: string;
  FECHA_NACIMIENTO: string;
  TELEFONO: string;
  CORREO: string;
  ESTATUS: number | string;
  ID_USUARIO_ALTA: number;
}

interface ListItem {
  icon: string;
  label: string;
  active: boolean;
}

export default defineComponent({
  name: "ClientesComponent",
  data(): ClientesComponentData {
    return {
      items: [
        { icon: "bi bi-person-fill mx-1", label: "Clientes", active: false },
        { icon: "bi bi-people mx-1", label: "Usuarios", active: false },
        { icon: "bi bi-pencil mx-1", label: "Registro", active: false },
      ] as ListItem[],
      clientesData: [],
      modal: null,
      idUser: 0,
      nuevoCliente: {
        NOMBRE: "",
        APELLIDOS: "",
        FECHA_NACIMIENTO: "",
        TELEFONO: "",
        CORREO: "",
        ESTATUS: 1,
        ID_USUARIO_ALTA: 0,
      } as NuevoCliente,
    };
  },
  methods: {
    initModal() {
      const modalElement = document.getElementById(
        "exampleModal"
      ) as HTMLElement;
      if (modalElement) {
        this.modal = new Modal(modalElement);
      }
    },
    async cargarClientes() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/clientes/get`
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
          console.log("Datos de clientes cargados:", this.clientesData);
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de clientes:", error);
      }
    },
    async guardarCliente() {
      try {
        const token = localStorage.getItem("token");
        if (token !== null) {
          const decodedToken: any = jwtDecode(token);
          if (decodedToken && decodedToken.id) {
            this.idUser = decodedToken.id;
            this.nuevoCliente.ID_USUARIO_ALTA = this.idUser;
            console.log(this.idUser, this.nuevoCliente);
          } else {
            console.error("Token JWT no contiene información de usuario");
          }
        }
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/clientes/create`,
          this.nuevoCliente
        );
        if (response.status === 201) {
          console.log("Cliente creado:", response.data);
          if (this.modal) {
            this.modal.hide();
            const modalBackdrop = document.querySelector(".modal-backdrop"); // Seleccionar el elemento con la clase 'modal-backdrop'
            if (modalBackdrop) {
              modalBackdrop.parentNode?.removeChild(modalBackdrop); // Eliminar el elemento del DOM
            }
          } else {
            console.log("El modal no está inicializado correctamente");
          }

          this.nuevoCliente = {
            NOMBRE: "",
            APELLIDOS: "",
            FECHA_NACIMIENTO: "",
            TELEFONO: "",
            CORREO: "",
            ESTATUS: 1,
            ID_USUARIO_ALTA: 0,
          };
          const clientesItem = this.items.find(
            (item) => item.label === "Clientes"
          );
          if (clientesItem) {
            changeActiveItem(clientesItem, this.items, this.clientesData);
            this.cargarClientes();
          } else {
            console.error(
              "No se encontró el elemento 'Clientes' en la lista items."
            );
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
    this.initModal();
    this.cargarClientes();
  },
});
