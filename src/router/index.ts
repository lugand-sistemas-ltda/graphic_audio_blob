import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import HomeView from '../views/HomeView.vue'
import VisualView from '../views/VisualView.vue'
import GenericWindow from '../views/GenericWindow.vue'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: MainLayout,
            children: [
                {
                    path: '',
                    name: 'home',
                    component: HomeView
                }
            ]
        },
        {
            path: '/visual',
            name: 'visual',
            component: VisualView
        },
        {
            path: '/window',
            name: 'window',
            component: GenericWindow
        }
    ]
})

export default router
