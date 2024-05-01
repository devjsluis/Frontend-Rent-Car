import { createRouter, createWebHistory } from "vue-router";
import AuthComponent from "../../views/auth/AuthComponent.vue";
import DashboardComponent from "../../views/dashboard/DashboardComponent.vue";
import RegisterComponent from "../../views/register/RegisterComponent.vue";
import { authGuard } from "../../guards/authGuard";

const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    {
      path: "/login",
      name: "Auth",
      component: AuthComponent,
      beforeEnter: authGuard,
    },
    {
      path: "/",
      name: "Dashboard",
      component: DashboardComponent,
      beforeEnter: authGuard,
    },
    {
      path: "/register",
      name: "Register",
      component: RegisterComponent,
      beforeEnter: authGuard,
    },
    { path: "/:pathMatch(.*)*", name: "NotFound", redirect: "/login" },
  ],
});

export default router;
