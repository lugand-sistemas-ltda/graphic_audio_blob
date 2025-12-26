import { ref, watch, reactive, inject, computed } from 'vue'
import { useZIndex } from './useZIndex'

/**
 * Sistema de gerenciamento central de componentes drag-drop
 * Controla visibilidade e estado de expansão de todos os componentes
 * 
 * AGORA: Cada janela tem seu próprio estado de componentes independente
 * IMPORTANTE: Este composable gerencia apenas UI local (visibilidade visual)
 * Para ownership (adicionar/remover da janela), use GlobalState APIs
 */

export interface ManagedComponent {
    id: string
    name: string
    category: 'visual' | 'audio' | 'debug' | 'system'
    visible: boolean
    collapsibleId?: string // ID usado pelo useCollapsible
}

// Instância do gerenciador de z-index
const zIndexManager = useZIndex()

// ========================================
// ESTADO POR JANELA (Map de windowId → componentes)
// ========================================
const componentsByWindow = reactive(new Map<string, Map<string, ManagedComponent>>())

// Trigger para forçar reatividade quando necessário
const componentsTrigger = ref(0)

// Flag para controle global de visibilidade (por janela)
const allHiddenByWindow = reactive(new Map<string, boolean>())

// Snapshot do estado de visibilidade antes de esconder tudo (por janela)
const visibilitySnapshotByWindow = reactive(new Map<string, Map<string, boolean>>())

// Carrega configurações do localStorage (por janela)
const loadConfig = (windowId: string) => {
    const saved = localStorage.getItem(`component-manager-config-${windowId}`)
    if (saved) {
        try {
            const config = JSON.parse(saved)

            // Restaura visibilidade
            if (config.visibility) {
                const components = componentsByWindow.get(windowId)
                if (components) {
                    Object.entries(config.visibility).forEach(([id, visible]) => {
                        const component = components.get(id)
                        if (component) {
                            component.visible = visible as boolean
                        }
                    })
                }
            }

            // Restaura estado de visibilidade global
            if (config.allHidden !== undefined) {
                allHiddenByWindow.set(windowId, config.allHidden)
            }

            // Restaura snapshot de visibilidade
            if (config.visibilitySnapshot) {
                const snapshot = new Map<string, boolean>()
                Object.entries(config.visibilitySnapshot).forEach(([id, visible]) => {
                    snapshot.set(id, !!visible)
                })
                visibilitySnapshotByWindow.set(windowId, snapshot)
            }
        } catch (e) {
            console.error(`[ComponentManager] Error loading config for window ${windowId}:`, e)
        }
    }
}

// Salva configurações no localStorage (por janela)
const saveConfig = (windowId: string) => {
    const components = componentsByWindow.get(windowId)
    if (!components) return

    const visibility: Record<string, boolean> = {}
    components.forEach((component, id) => {
        visibility[id] = component.visible
    })

    const snapshot: Record<string, boolean> = {}
    const windowSnapshot = visibilitySnapshotByWindow.get(windowId)
    if (windowSnapshot) {
        windowSnapshot.forEach((visible, id) => {
            snapshot[id] = visible
        })
    }

    const config = {
        visibility,
        allHidden: allHiddenByWindow.get(windowId) || false,
        visibilitySnapshot: snapshot
    }

    localStorage.setItem(`component-manager-config-${windowId}`, JSON.stringify(config))
}

export const useComponentManager = () => {
    // Injeta windowId do contexto (fornecido pelo App.vue ou MainLayout)
    const windowId = inject<string>('windowId', 'unknown')

    console.log('[ComponentManager] Initialized for window:', windowId)

    // Garante que esta janela tenha um Map de componentes
    if (!componentsByWindow.has(windowId)) {
        componentsByWindow.set(windowId, new Map())
        allHiddenByWindow.set(windowId, false)
        visibilitySnapshotByWindow.set(windowId, new Map())
    }

    // Obtém os componentes DESTA janela
    const getComponents = () => componentsByWindow.get(windowId)!

    // Watch para salvar automaticamente (apenas desta janela)
    watch([() => componentsByWindow.get(windowId), () => allHiddenByWindow.get(windowId)], () => {
        saveConfig(windowId)
    }, { deep: true })
    /**
     * Registra um componente no gerenciador
     */
    const registerComponent = (component: ManagedComponent) => {
        const components = getComponents()
        if (!components.has(component.id)) {
            components.set(component.id, { ...component })
            loadConfig(windowId) // Carrega config após registrar
        }
    }

    /**
     * Remove um componente do gerenciador
     */
    const unregisterComponent = (id: string) => {
        const components = getComponents()
        components.delete(id)
    }

    /**
     * Alterna visibilidade de um componente
     * Quando fica visível: expande e traz para frente
     * IMPORTANTE: NÃO altera o windowId (ownership), apenas a visibilidade visual
     * Para adicionar/remover da janela, use addToWindow/removeFromWindow
     */
    const toggleVisibility = (id: string) => {
        const components = getComponents()
        const component = components.get(id)
        if (component) {
            const wasHidden = !component.visible
            component.visible = !component.visible

            // Força atualização de reatividade
            componentsTrigger.value++

            // Se estava escondido e agora está visível
            if (wasHidden && component.visible) {
                // 1. Expande o componente (remove estado colapsado)
                if (component.collapsibleId) {
                    const storageKey = `collapsible-${component.collapsibleId}`
                    localStorage.setItem(storageKey, JSON.stringify(true)) // true = expandido
                }

                // 2. Traz para frente (aumenta z-index)
                zIndexManager.bringToFront(id)

                // 3. Aplica o z-index ao elemento DOM
                requestAnimationFrame(() => {
                    const elements = document.querySelectorAll('[v-draggable]')
                    elements.forEach((el) => {
                        const htmlEl = el as HTMLElement
                        // Procura pelo elemento com o ID correto
                        if (htmlEl.textContent?.includes(component.name)) {
                            htmlEl.style.zIndex = String(zIndexManager.getZIndex(id))
                        }
                    })
                })
            }

            saveConfig(windowId)
        }
    }

    /**
     * Define visibilidade de um componente
     * Quando fica visível: expande e traz para frente
     * IMPORTANTE: Apenas controla visibilidade UI local!
     * Para adicionar/remover da janela, use addComponentToWindow/removeComponentFromWindow
     */
    const setVisibility = (id: string, visible: boolean) => {
        const components = getComponents()
        const component = components.get(id)
        if (component) {
            const wasHidden = !component.visible
            component.visible = visible

            // Força atualização de reatividade
            componentsTrigger.value++

            // Se estava escondido e agora está visível
            if (wasHidden && visible) {
                // 1. Expande o componente
                if (component.collapsibleId) {
                    const storageKey = `collapsible-${component.collapsibleId}`
                    localStorage.setItem(storageKey, JSON.stringify(true))
                }

                // 2. Traz para frente
                zIndexManager.bringToFront(id)
            }

            saveConfig(windowId)
        }
    }

    /**
     * Obtém visibilidade de um componente
     */
    const isVisible = (id: string): boolean => {
        // Acessa o trigger para garantir reatividade
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        componentsTrigger.value
        const components = getComponents()
        const component = components.get(id)
        return component?.visible ?? true
    }

    /**
     * Obtém componentes por categoria
     */
    const getComponentsByCategory = (category: ManagedComponent['category']) => {
        const components = getComponents()
        return Array.from(components.values()).filter(c => c.category === category)
    }

    /**
     * Obtém todos os componentes
     */
    const getAllComponents = () => {
        const components = getComponents()
        return Array.from(components.values())
    }

    /**
     * Alterna visibilidade de todos os componentes ATIVOS (que estão na janela)
     * Ao esconder: salva snapshot do estado atual
     * Ao mostrar: restaura o snapshot salvo
     * IMPORTANTE: NÃO altera o windowId (ownership), apenas a visibilidade visual
     * @param activeComponentIds - IDs dos componentes ativos (que estão na lista [ COMPONENTS ])
     */
    const toggleAllVisibility = (activeComponentIds?: string[]) => {
        const components = getComponents()
        const allHidden = allHiddenByWindow.get(windowId) || false
        const visibilitySnapshot = visibilitySnapshotByWindow.get(windowId) || new Map()

        // Se não forneceu IDs, usa todos os componentes (fallback)
        const targetIds = activeComponentIds || Array.from(components.keys())

        if (allHidden) {
            // Está escondido, vai mostrar -> restaura snapshot
            allHiddenByWindow.set(windowId, false)

            // Se existe snapshot, restaura o estado anterior
            if (visibilitySnapshot.size > 0) {
                targetIds.forEach((id) => {
                    const component = components.get(id)
                    const savedState = visibilitySnapshot.get(id)
                    if (component && savedState !== undefined) {
                        component.visible = savedState
                    }
                })
            } else {
                // Sem snapshot, mostra todos os ativos
                targetIds.forEach((id) => {
                    const component = components.get(id)
                    if (component) {
                        component.visible = true
                    }
                })
            }
        } else {
            // Está visível, vai esconder -> salva snapshot antes
            visibilitySnapshot.clear()
            targetIds.forEach((id) => {
                const component = components.get(id)
                if (component) {
                    visibilitySnapshot.set(id, component.visible)
                    component.visible = false
                }
            })

            // Marca como escondido
            allHiddenByWindow.set(windowId, true)
        }

        saveConfig(windowId)
    }

    /**
     * Mostra todos os componentes (ou apenas os ativos)
     * IMPORTANTE: NÃO altera o windowId (ownership), apenas a visibilidade visual
     * @param activeComponentIds - IDs dos componentes ativos (que estão na lista [ COMPONENTS ])
     */
    const showAll = (activeComponentIds?: string[]) => {
        const components = getComponents()
        allHiddenByWindow.set(windowId, false)
        const targetIds = activeComponentIds || Array.from(components.keys())

        targetIds.forEach((id) => {
            const component = components.get(id)
            if (component) {
                component.visible = true
            }
        })
        saveConfig(windowId)
    }

    /**
     * Esconde todos os componentes (ou apenas os ativos)
     * IMPORTANTE: NÃO altera o windowId (ownership), apenas a visibilidade visual
     * @param activeComponentIds - IDs dos componentes ativos (que estão na lista [ COMPONENTS ])
     */
    const hideAll = (activeComponentIds?: string[]) => {
        const components = getComponents()
        allHiddenByWindow.set(windowId, true)
        const targetIds = activeComponentIds || Array.from(components.keys())

        targetIds.forEach((id) => {
            const component = components.get(id)
            if (component) {
                component.visible = false
            }
        })
        saveConfig(windowId)
    }

    return {
        registerComponent,
        unregisterComponent,
        toggleVisibility,
        setVisibility,
        isVisible,
        toggleAllVisibility,
        allHidden: computed(() => allHiddenByWindow.get(windowId) || false),
        getComponentsByCategory,
        getAllComponents,
        showAll,
        hideAll,
        // Debug helper
        debugGetAll: () => {
            const components = getComponents()
            console.log(`[ComponentManager] All components for window ${windowId}:`, Array.from(components.entries()))
            return Array.from(components.entries())
        }
    }
}
