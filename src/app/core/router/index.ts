import { createRouter, createWebHistory } from 'vue-router'
import AuthComponent from '../../views/auth/AuthComponent.vue'

const router = createRouter({
    history: createWebHistory('/'),
    routes: [
        {
            path: '/',
            name: 'Auth',
            component: AuthComponent
        }
    ]
})

export default router
