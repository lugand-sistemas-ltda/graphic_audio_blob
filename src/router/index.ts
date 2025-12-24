import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        // Janela MAIN - Layout completo com Header + Sidebar
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
        // Janela VISUAL - MainLayout com configuração de janela visual
        // Renderiza apenas efeitos visuais, sem controles
        {
            path: '/visual',
            name: 'visual',
            component: MainLayout,
            children: [
                {
                    path: '',
                    name: 'visual-content',
                    component: HomeView // Usa mesma view, mas config diferente
                }
            ]
        },
        // Janela GENERIC - MainLayout com configuração de janela genérica
        // Permite adicionar componentes customizados
        {
            path: '/window',
            name: 'window',
            component: MainLayout,
            children: [
                {
                    path: '',
                    name: 'window-content',
                    component: HomeView // Usa mesma view, mas config diferente
                }
            ]
        }
    ]
})

export default router
