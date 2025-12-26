import { ref, onMounted, onUnmounted } from 'vue'

interface VisibilityReloadOptions {
    /** Seletor CSS do elemento a observar (ex: '.sound-control') */
    selector: string
    /** Callback executado quando o componente fica visível */
    onVisible: () => void
}

/**
 * Composable que detecta quando um componente fica visível
 * (seja por v-if ou v-show) e executa uma ação (como recarregar o estado do localStorage)
 * 
 * @example
 * ```ts
 * const { reloadState } = useCollapsible({ id: 'my-component' })
 * useVisibilityReload({
 *   selector: '.my-component',
 *   onVisible: reloadState
 * })
 * ```
 */
export function useVisibilityReload(options: VisibilityReloadOptions) {
    const { selector, onVisible } = options
    const wasVisible = ref(false)
    let observer: MutationObserver | null = null

    const checkVisibility = () => {
        const element = document.querySelector(selector) as HTMLElement

        // Verifica se existe E se está visível (não tem display: none do v-show)
        const isVisible = element !== null && element.style.display !== 'none'

        if (isVisible && !wasVisible.value) {
            // Componente acabou de ficar visível
            onVisible()
        }

        wasVisible.value = isVisible
    }

    onMounted(() => {
        // Checa visibilidade inicial
        checkVisibility()

        // Observa mudanças no DOM (v-if) e mudanças de atributos (v-show)
        observer = new MutationObserver(checkVisibility)
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        })
    })

    onUnmounted(() => {
        // Limpa o observer quando o componente for desmontado
        if (observer) {
            observer.disconnect()
            observer = null
        }
    })

    return {
        wasVisible
    }
}
