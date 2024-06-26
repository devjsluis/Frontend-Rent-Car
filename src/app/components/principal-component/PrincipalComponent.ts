import { defineComponent, computed, Ref } from "vue";
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

interface Clientes15Days {
  Dia: string;
  Clientes_Registrados: number;
}

interface Ventas7Days {
  Dia: string;
  COSTO_TOTAL: number;
}

interface VentasAnuales {
  Mes: string;
  Ingresos: number;
}

interface Vehiculo {
  ID: number;
  nombre_vehiculo: string;
  cantidad_rentas: number;
}

export default defineComponent({
  name: "PrincipalComponent",
  data() {
    const clientesData = null;
    const loadingStore = useLoadingStore();
    const isLoading: Ref<boolean> = computed(() => loadingStore.isLoading);
    const clientes15days = 0;
    const clientesEn15Dias: Clientes15Days[] = [];
    const ventas7Days = 0;
    const ventasAnual: VentasAnuales[] = [];
    const ventasEn7Dias: Ventas7Days[] = [];
    const vehiculo: Vehiculo[] = [];
    const vehiculos: Vehiculo[] = [];
    return {
      clientesEn15Dias,
      clientesData,
      isLoading,
      ventas7Days,
      ventasEn7Dias,
      ventasAnual,
      clientes15days,
      chart: null as Chart<"line", number[], string> | null,
      chart2: null as Chart<"line", number[], string> | null,
      vehiculo,
      vehiculos,
    };
  },
  methods: {
    async ventasAnuales() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/rent/getAnual`
          );
          this.ventasAnual = response.data.body;

          if (this.ventasAnual.length) {
            this.initChartVentasAnuales(); // Ajusta el nombre de la función según sea necesario
          }
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de ventas:", error);
      }
    },
    async vehiculoMasRentado() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${
              import.meta.env.VITE_APP_API_URL
            }/vehiculos/getVehiculoMasRentado`
          );
          this.vehiculo = response.data.body;
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de ventas:", error);
      }
    },
    async vehiculosMasRentados() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${
              import.meta.env.VITE_APP_API_URL
            }/vehiculos/getVehiculosMasRentados`
          );
          this.vehiculos = response.data.body;

          if (this.vehiculos.length) {
            this.initChartVehiculosMasRentados(); // Ajusta el nombre de la función según sea necesario
          }
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de ventas:", error);
      }
    },
    async ventasUltimos7Dias() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/rent/getLastDays`
          );
          this.ventasEn7Dias = response.data.body.map((item: Ventas7Days) => ({
            ...item,
            Dia: item.Dia.split("T")[0], // Obtener solo la fecha sin la hora
          }));
          let sumaVentas = 0;
          this.ventasEn7Dias.forEach((item: Ventas7Days) => {
            sumaVentas += item.COSTO_TOTAL;
          });
          this.ventas7Days = sumaVentas; // Ajusta esto a tu estructura de datos

          if (this.ventasEn7Dias.length) {
            this.initChartVentas(); // Ajusta el nombre de la función según sea necesario
          }
        } else {
          console.error("No se encontró el token en localStorage.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de ventas:", error);
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
          this.clientesEn15Dias = response.data.body.map(
            (item: Clientes15Days) => ({
              ...item,
              Dia: item.Dia.split("T")[0], // Obtener solo la fecha sin la hora
            })
          );
          let sumaClientes = 0;
          this.clientesEn15Dias.forEach((item: Clientes15Days) => {
            sumaClientes += item.Clientes_Registrados;
          });
          this.clientes15days = sumaClientes;
          if (this.clientesEn15Dias.length) {
            this.initChartClientes15Dias();
          }
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
    initChartClientes15Dias() {
      // Obtener el canvas
      const canvas = document.getElementById(
        "myChart"
      ) as HTMLCanvasElement | null;

      if (!canvas) {
        console.error("Canvas not found");
        return;
      }

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Canvas context not found");
        return;
      }

      // Crear un gradiente lineal
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "#5856d6");
      gradient.addColorStop(1, "#6f67db");
      // Datos de ejemplo para el gráfico
      const data = {
        labels: this.clientesEn15Dias.map((item) => item.Dia),
        datasets: [
          {
            label: "Clientes registrados",
            data: this.clientesEn15Dias.map(
              (item) => item.Clientes_Registrados
            ),
            fill: false,
            pointBackgroundColor: gradient,
            pointRadius: 5,
            borderColor: "rgba(255, 255, 255, 0.5)",
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
      this.chart = new Chart(ctx, {
        type: "line",
        data: data,
        options: options,
      });
    },
    initChartVentas() {
      // Obtener el canvas
      const canvas = document.getElementById(
        "myChart2"
      ) as HTMLCanvasElement | null;

      if (!canvas) {
        console.error("Canvas not found");
        return;
      }

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Canvas context not found");
        return;
      }

      // Crear un gradiente lineal
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "#39f");
      gradient.addColorStop(1, "#2982cc");
      // Datos de ejemplo para el gráfico
      const data = {
        labels: this.ventasEn7Dias.map((item) => item.Dia),
        datasets: [
          {
            label: "Ingresos",
            data: this.ventasEn7Dias.map((item) => item.COSTO_TOTAL),
            fill: false,
            pointBackgroundColor: gradient,
            pointRadius: 5,
            borderColor: "rgba(255, 255, 255, 0.5)",
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

      this.chart2 = new Chart(ctx, {
        type: "line",
        data: data,
        options: options,
      });
    },
    initChartVehiculosMasRentados() {
      // Obtener el canvas
      const canvas = document.getElementById(
        "myChart3"
      ) as HTMLCanvasElement | null;

      if (!canvas) {
        console.error("Canvas not found");
        return;
      }

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Canvas context not found");
        return;
      }

      // Crear un gradiente lineal
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "#e55353");
      gradient.addColorStop(1, "#d93737");
      // Datos de ejemplo para el gráfico
      const data = {
        labels: this.vehiculos.map((item) => item.nombre_vehiculo),
        datasets: [
          {
            label: "Cantidad de rentas",
            data: this.vehiculos.map((item) => item.cantidad_rentas),
            fill: false,
            pointBackgroundColor: gradient,
            pointRadius: 5,
            borderColor: "rgba(255, 255, 255, 0.5)",
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

      this.chart2 = new Chart(ctx, {
        type: "line",
        data: data,
        options: options,
      });
    },
    initChartVentasAnuales() {
      // Obtener el canvas
      const canvas = document.getElementById(
        "myChart4"
      ) as HTMLCanvasElement | null;

      if (!canvas) {
        console.error("Canvas not found");
        return;
      }

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Canvas context not found");
        return;
      }

      // Crear un gradiente lineal
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "#f9b115");
      gradient.addColorStop(1, "#f6960b");
      // Datos de ejemplo para el gráfico
      const data = {
        labels: this.ventasAnual.map((item) => item.Mes),
        datasets: [
          {
            label: "Ingresos",
            data: this.ventasAnual.map((item) => item.Ingresos),
            fill: false,
            pointBackgroundColor: gradient,
            pointRadius: 5,
            borderColor: "rgba(255, 255, 255, 0.5)",
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

      this.chart2 = new Chart(ctx, {
        type: "line",
        data: data,
        options: options,
      });
    },
  },
  mounted() {
    this.cargarClientes();
    this.ventasUltimos7Dias();
    this.clientesUltimos15Dias();
    this.ventasAnuales();
    this.vehiculoMasRentado();
    this.vehiculosMasRentados();
  },
});
