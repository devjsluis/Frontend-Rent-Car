import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./app/core/router";
import axios from "axios";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.config.globalProperties.$axios = axios;
app.mount("#app");
