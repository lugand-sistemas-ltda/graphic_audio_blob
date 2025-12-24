import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Composable para detectar e gerenciar tipo de janela
 * 
 * Tipos:
 * - 'main': Janela principal (rota '/')
 * - 'visual': Janela visual (rota '/visual')
 * - 'generic': Janela genérica (rota '/window')
 */

export type WindowType = 'main' | 'visual' | 'generic'

export interface WindowConfig {
    type: WindowType
    isMainWindow: boolean
    shouldRenderHeader: boolean
    shouldRenderSidebar: boolean
    shouldRenderPlayer: boolean
    shouldRenderTitlebar: boolean
    shouldRenderConfig: boolean
}

export function useWindowType() {
    const route = useRoute()

    /**
     * Detecta se é janela main ou filha
     * Main: não tem window.opener e não tem query param childWindow
     */
    const isMainWindow = computed(() => {
        return !window.opener && !route.query.childWindow
    })

    /**
     * Detecta tipo da janela baseado na rota
     */
    const windowType = computed<WindowType>(() => {
        const path = route.path

        if (path === '/' || path === '') return 'main'
        if (path.startsWith('/visual')) return 'visual'
        if (path.startsWith('/window')) return 'generic'

        return 'main' // fallback
    })

    /**
     * Configuração de renderização baseada no tipo
     */
    const windowConfig = computed<WindowConfig>(() => {
        const type = windowType.value

        // Janela MAIN (principal)
        if (type === 'main') {
            return {
                type: 'main',
                isMainWindow: true,
                shouldRenderHeader: true,
                shouldRenderSidebar: true,
                shouldRenderPlayer: true, // Player físico com <audio>
                shouldRenderTitlebar: false,
                shouldRenderConfig: false
            }
        }

        // Janela VISUAL (apenas efeitos visuais)
        if (type === 'visual') {
            return {
                type: 'visual',
                isMainWindow: false,
                shouldRenderHeader: false,
                shouldRenderSidebar: false,
                shouldRenderPlayer: false, // SEM player físico
                shouldRenderTitlebar: true, // Barra de título customizada
                shouldRenderConfig: true // Painel de configuração
            }
        }

        // Janela GENERIC (componentes customizados)
        if (type === 'generic') {
            return {
                type: 'generic',
                isMainWindow: false,
                shouldRenderHeader: false,
                shouldRenderSidebar: false,
                shouldRenderPlayer: false, // SEM player físico
                shouldRenderTitlebar: true,
                shouldRenderConfig: true
            }
        }

        // Fallback
        return {
            type: 'main',
            isMainWindow: true,
            shouldRenderHeader: true,
            shouldRenderSidebar: true,
            shouldRenderPlayer: true,
            shouldRenderTitlebar: false,
            shouldRenderConfig: false
        }
    })

    /**
     * Gera windowId único
     */
    const generateWindowId = () => {
        const type = windowType.value
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 9)
        return `${type}-${timestamp}-${random}`
    }

    return {
        windowType,
        isMainWindow,
        windowConfig,
        generateWindowId
    }
}
