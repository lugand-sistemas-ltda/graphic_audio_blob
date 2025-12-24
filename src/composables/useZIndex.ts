import { ref } from 'vue'

/**
 * Sistema de gerenciamento de z-index para componentes drag-drop
 * 
 * Camadas:
 * - Elementos estáticos (títulos, etc): 10000+
 * - Componentes drag-drop: 1000 + ordem dinâmica
 * 
 * Ao clicar em um componente, ele vem para frente
 */

// Z-index base para componentes drag-drop
const BASE_Z_INDEX = 1000

// Contador global de cliques (incrementa a cada foco)
const globalZIndexCounter = ref(0)

// Mapa de z-index por componente ID
const componentZIndexes = ref<Map<string, number>>(new Map())

export const useZIndex = () => {
    /**
     * Traz um componente para frente quando clicado
     */
    const bringToFront = (componentId: string) => {
        globalZIndexCounter.value++
        componentZIndexes.value.set(componentId, BASE_Z_INDEX + globalZIndexCounter.value)
    }

    /**
     * Obtém o z-index atual de um componente
     */
    const getZIndex = (componentId: string): number => {
        if (!componentZIndexes.value.has(componentId)) {
            // Inicializa com z-index base na primeira vez
            componentZIndexes.value.set(componentId, BASE_Z_INDEX)
        }
        return componentZIndexes.value.get(componentId) || BASE_Z_INDEX
    }

    /**
     * Reseta todos os z-indexes (útil para debug)
     */
    const resetAllZIndexes = () => {
        globalZIndexCounter.value = 0
        componentZIndexes.value.clear()
    }

    return {
        bringToFront,
        getZIndex,
        resetAllZIndexes,
        BASE_Z_INDEX
    }
}
