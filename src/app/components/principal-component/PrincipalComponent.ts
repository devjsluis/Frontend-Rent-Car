import { defineComponent, computed, Ref, ref } from "vue";
import axios from "../../../axiosConfig";
import { useLoadingStore } from "../../../loadingStore";
import { getStatus } from "../../shared/enums/status.enum";
import Chart from "chart.js/auto"; // Importa Chart.js

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

export default defineComponent({
  name: "PrincipalComponent",
  data() {
    const clientesData = null;
    const loadingStore = useLoadingStore();
    const isLoading: Ref<boolean> = computed(() => loadingStore.isLoading);
    const ventas = ref(null);
    const clientes15days = ref(null);
    return {
      clientesData,
      isLoading,
      ventas,
      clientes15days,
      chart: null as Chart<"line", number[], string> | null,
      chart2: null as Chart<"bar", number[], string> | null,
    };
  },
  methods: {
    async ventasUltimos7Dias() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/rent/getLastDays`
          );
          this.ventas = response.data.body[0].COSTO_TOTAL;
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de clientes:", error);
      }
    },
    async clientesUltimos15Dias() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/clientes/getLastDays`
          );
          this.clientes15days = response.data.body[0].NUM_CLIENTES;
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de clientes:", error);
      }
    },
    async cargarClientes() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/clientes/getNew`
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
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de clientes:", error);
      }
    },
    initChart() {
      // Datos de ejemplo para el gráfico
      const data = {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [
          {
            label: "My First Dataset",
            data: [25, 19, 40, 41, 16, 15, 0],
            fill: false,
            borderColor: "rgb(255, 255, 255)",
            tension: 0.1,
          },
        ],
      };

      // Opciones del gráfico con animación de entrada
      const options = {
        animations: {
          x: {
            from: 0,
          },
          y: {
            from: 0,
          },
        },
        scales: {
          x: {
            display: false, // Oculta el eje x
          },
          y: {
            display: false, // Oculta el eje y
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: false, // Oculta la leyenda
          },
        },
      };

      // Crear el gráfico
      const ctx = document.getElementById("myChart") as HTMLCanvasElement;
      this.chart = new Chart(ctx, {
        type: "line",
        data: data,
        options: options,
      });

      const ctx2 = document.getElementById("myChart2") as HTMLCanvasElement;
      this.chart2 = new Chart(ctx2, {
        type: "bar",
        data: data,
        options: options,
      });
    },
  },
  mounted() {
    this.cargarClientes();
    this.ventasUltimos7Dias();
    this.clientesUltimos15Dias();
    this.initChart();
  },
});
