import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style/index.scss'
import App from './App.vue'
import router from './router'
import { vDraggable } from './directives/vDraggable'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Registra diretiva de drag-and-drop globalmente
app.directive('draggable', vDraggable)

app.mount('#app')
