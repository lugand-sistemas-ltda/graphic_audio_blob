import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Composable para comportamento auto-hide com timer e hover
 * 
 * @example
 * ```ts
 * const { isVisible, setFixed, isFixed } = useAutoHide({
 *   hideDelay: 3000,
 *   containerRef: myElementRef
 * })
 * ```
 */

export interface UseAutoHideOptions {
    /**
     * Tempo em ms até esconder o elemento (padrão: 3000ms)
     */
    hideDelay?: number

    /**
     * Estado inicial (padrão: true - visível)
     */
    initialVisible?: boolean

    /**
     * Estado inicial do fixed (padrão: false)
     */
    initialFixed?: boolean

    /**
     * Referência ao container para detectar hover (opcional)
     */
    containerRef?: Ref<HTMLElement | null>

    /**
     * Callback quando visibilidade muda
     */
    onVisibilityChange?: (visible: boolean) => void
}

export interface UseAutoHideReturn {
    /**
     * Se o elemento está visível
     */
    isVisible: Ref<boolean>

    /**
     * Se o elemento está fixo (não esconde automaticamente)
     */
    isFixed: Ref<boolean>

    /**
     * Define se o elemento é fixo
     */
    setFixed: (fixed: boolean) => void

    /**
     * Força mostrar o elemento
     */
    show: () => void

    /**
     * Força esconder o elemento
     */
    hide: () => void

    /**
     * Reseta o timer de auto-hide
     */
    resetTimer: () => void
}

export function useAutoHide(options: UseAutoHideOptions = {}): UseAutoHideReturn {
    const {
        hideDelay = 3000,
        initialVisible = true,
        initialFixed = false,
        containerRef,
        onVisibilityChange
    } = options

    const isVisible = ref(initialVisible)
    const isFixed = ref(initialFixed)
    let hideTimer: number | null = null

    /**
     * Limpa o timer existente
     */
    const clearTimer = () => {
        if (hideTimer !== null) {
            clearTimeout(hideTimer)
            hideTimer = null
        }
    }

    /**
     * Inicia timer de auto-hide
     */
    const startTimer = () => {
        if (isFixed.value) return // Não esconde se está fixo

        clearTimer()
        hideTimer = setTimeout(() => {
            isVisible.value = false
            onVisibilityChange?.(false)
        }, hideDelay) as unknown as number
    }

    /**
     * Reseta o timer (cancela e reinicia)
     */
    const resetTimer = () => {
        if (!isFixed.value && isVisible.value) {
            startTimer()
        }
    }

    /**
     * Mostra o elemento
     */
    const show = () => {
        isVisible.value = true
        onVisibilityChange?.(true)
        resetTimer()
    }

    /**
     * Esconde o elemento
     */
    const hide = () => {
        if (!isFixed.value) {
            clearTimer()
            isVisible.value = false
            onVisibilityChange?.(false)
        }
    }

    /**
     * Define se o elemento é fixo
     */
    const setFixed = (fixed: boolean) => {
        isFixed.value = fixed

        if (fixed) {
            clearTimer()
            isVisible.value = true
            onVisibilityChange?.(true)
        } else {
            startTimer()
        }
    }

    /**
     * Handler de mouse enter
     */
    const handleMouseEnter = () => {
        show()
    }

    /**
     * Handler de mouse leave
     */
    const handleMouseLeave = () => {
        if (!isFixed.value) {
            startTimer()
        }
    }

    /**
     * Setup de listeners
     */
    onMounted(() => {
        if (containerRef?.value) {
            containerRef.value.addEventListener('mouseenter', handleMouseEnter)
            containerRef.value.addEventListener('mouseleave', handleMouseLeave)
        }

        // Inicia timer se não for fixo e estiver visível
        if (!isFixed.value && isVisible.value) {
            startTimer()
        }
    })

    /**
     * Cleanup
     */
    onUnmounted(() => {
        clearTimer()

        if (containerRef?.value) {
            containerRef.value.removeEventListener('mouseenter', handleMouseEnter)
            containerRef.value.removeEventListener('mouseleave', handleMouseLeave)
        }
    })

    return {
        isVisible,
        isFixed,
        setFixed,
        show,
        hide,
        resetTimer
    }
}
