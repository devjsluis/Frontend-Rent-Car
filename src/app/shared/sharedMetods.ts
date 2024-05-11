import axios from "../../axiosConfig";

export async function changeActiveItem(
  selectedItem: ListItem,
  items: ListItem[],
  clientesData: Cliente[]
) {
  items.forEach((item) => {
    item.active = item === selectedItem;
  });

  if (selectedItem.label === "Clientes" && selectedItem.active) {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = token;
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/clientes/get`
        );
        clientesData = response.data.body;
        console.log("Datos de clientes:", clientesData);
      } else {
        console.error("No se encontró el token en localStorage.");
      }
    } catch (error) {
      console.error("Error al obtener los datos de clientes:", error);
    }
  }
}

interface ListItem {
  icon: string;
  label: string;
  active: boolean;
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
