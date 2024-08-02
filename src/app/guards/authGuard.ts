import { RouteLocationNormalized, NavigationGuardNext } from "vue-router";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
  }),
});

export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();
  if (localStorage.getItem("token")) {
    authStore.isAuthenticated = true;
  } else {
    authStore.isAuthenticated = false;
  }

  if (authStore.isAuthenticated) {
    if (to.name !== "Auth") {
      next();
    } else {
      next({ name: "Dashboard" });
    }
  } else {
    if (to.name !== "Auth") {
      next({ name: "Auth" });
    } else {
      next();
    }
  }
}
