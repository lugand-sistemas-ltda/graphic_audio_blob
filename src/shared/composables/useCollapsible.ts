import { ref, watch } from 'vue'

interface CollapsibleOptions {
    /** ID único para persistir estado no localStorage */
    id: string
    /** Estado inicial (true = expandido, false = colapsado) */
    initialState?: boolean
}

export function useCollapsible(options: CollapsibleOptions) {
    const { id, initialState = true } = options

    const isExpanded = ref(initialState)
    const storageKey = `collapsible-${id}`

    // Carrega estado salvo do localStorage
    const loadState = () => {
        const saved = localStorage.getItem(storageKey)
        if (saved !== null) {
            try {
                isExpanded.value = JSON.parse(saved)
            } catch (error) {
                console.warn(`Failed to parse collapsible state for ${id}:`, error)
            }
        }
    }

    // Salva estado no localStorage
    const saveState = () => {
        localStorage.setItem(storageKey, JSON.stringify(isExpanded.value))
    }

    // Toggle entre expandido e colapsado
    const toggle = () => {
        isExpanded.value = !isExpanded.value
    }

    // Expande o componente
    const expand = () => {
        isExpanded.value = true
    }

    // Colapsa o componente
    const collapse = () => {
        isExpanded.value = false
    }

    // Carrega estado inicial
    loadState()

    // Auto-salva quando muda
    watch(isExpanded, () => {
        saveState()
    })

    // Força o reload do estado do localStorage
    const reloadState = () => {
        loadState()
    }

    return {
        isExpanded,
        toggle,
        expand,
        collapse,
        reloadState
    }
}
