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
     * 
     * Uma janela é MAIN se:
     * 1. Foi a primeira a carregar (opener é null)
     * 2. NÃO tem query param childWindow=true
     * 3. NÃO foi aberta por window.open()
     * 
     * Janelas FILHAS sempre têm childWindow=true na URL
     */
    const isMainWindow = computed(() => {
        // ⚠️ CRITICAL: VueRouter usa hash mode (#/route?param=value)
        // Precisamos parsear o hash manualmente

        // 1. Verifica query do VueRouter (melhor fonte)
        const hasChildParamRouter = route.query.childWindow === 'true'

        // 2. Fallback: parseia hash manualmente
        const hash = window.location.hash // Ex: "#/window?childWindow=true"
        const hashQueryString = hash.includes('?') ? hash.split('?')[1] : ''
        const hashParams = new URLSearchParams(hashQueryString)
        const hasChildParamHash = hashParams.get('childWindow') === 'true'

        // 3. Verifica window.opener
        const hasOpener = !!window.opener

        // 4. Verifica se é rota de child window (/window, /visual)
        const isChildRoute = route.path.startsWith('/window') || route.path.startsWith('/visual')

        const hasChildParam = hasChildParamRouter || hasChildParamHash
        const isMain = !hasChildParam && !hasOpener && !isChildRoute

        console.log('[useWindowType] 🔍 Detecting window type:', {
            path: route.path,
            vueRouterQuery: route.query,
            hasChildParamRouter,
            hash,
            hashQueryString,
            hasChildParamHash,
            hasChildParam,
            hasOpener,
            isChildRoute,
            isMain,
            fullUrl: window.location.href
        })

        // Se tem query param childWindow=true, é definitivamente FILHA
        if (hasChildParam) {
            console.log('[useWindowType] ✅ CHILD WINDOW detected (childWindow=true in URL)')
            return false
        }

        // Se é rota de child window, é definitivamente FILHA
        if (isChildRoute) {
            console.log('[useWindowType] ✅ CHILD WINDOW detected (child route: /window or /visual)')
            return false
        }

        // Se foi aberta por outra janela (window.opener existe), é FILHA
        if (hasOpener) {
            console.log('[useWindowType] ✅ CHILD WINDOW detected (has window.opener)')
            return false
        }

        // Caso contrário, é MAIN
        console.log('[useWindowType] ✅ MAIN WINDOW detected (no childWindow param, no opener, not child route)')
        return true
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
     * 
     * ⚠️ CRITICAL: Usa isMainWindow (computed) para determinar comportamento
     */
    const windowConfig = computed<WindowConfig>(() => {
        const type = windowType.value
        const isMain = isMainWindow.value

        console.log('[useWindowType] 📋 Building window config:', {
            type,
            isMain,
            path: route.path
        })

        // ⚠️ CRITICAL: Se NÃO é MAIN, sempre retorna config de CHILD
        if (!isMain) {
            return {
                type,
                isMainWindow: false,
                shouldRenderHeader: false,
                shouldRenderSidebar: false,
                shouldRenderPlayer: false, // SEM player físico
                shouldRenderTitlebar: true,
                shouldRenderConfig: true
            }
        }

        // Janela MAIN (principal) - só se isMain === true
        return {
            type: 'main',
            isMainWindow: true,
            shouldRenderHeader: true,
            shouldRenderSidebar: true,
            shouldRenderPlayer: true, // Player físico com <audio>
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
