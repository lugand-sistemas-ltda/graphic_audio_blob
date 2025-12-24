import { ref, watch, reactive } from 'vue'
import { useZIndex } from './useZIndex'
import { moveComponent } from '../core/state/useGlobalState'

/**
 * Sistema de gerenciamento central de componentes drag-drop
 * Controla visibilidade e estado de expansão de todos os componentes
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

// Estado global dos componentes (Map reativo para que mutações sejam rastreadas)
const components = reactive(new Map<string, ManagedComponent>())

// Trigger para forçar reatividade quando necessário
const componentsTrigger = ref(0)

// Flag para controle global de visibilidade
const allHidden = ref(false)

// Snapshot do estado de visibilidade antes de esconder tudo
// Usado para restaurar o estado original ao mostrar novamente
const visibilitySnapshot = reactive(new Map<string, boolean>())

// Carrega configurações do localStorage
const loadConfig = () => {
    const saved = localStorage.getItem('component-manager-config')
    if (saved) {
        try {
            const config = JSON.parse(saved)

            // Restaura visibilidade
            if (config.visibility) {
                Object.entries(config.visibility).forEach(([id, visible]) => {
                    const component = components.get(id)
                    if (component) {
                        component.visible = visible as boolean
                    }
                })
            }

            // Restaura estado de visibilidade global
            if (config.allHidden !== undefined) {
                allHidden.value = config.allHidden
            }

            // Restaura snapshot de visibilidade
            if (config.visibilitySnapshot) {
                visibilitySnapshot.clear()
                Object.entries(config.visibilitySnapshot).forEach(([id, visible]) => {
                    visibilitySnapshot.set(id, !!visible)
                })
            }
        } catch (e) {
            console.error('Error loading component manager config:', e)
        }
    }
}

// Salva configurações no localStorage
const saveConfig = () => {
    const visibility: Record<string, boolean> = {}
    components.forEach((component, id) => {
        visibility[id] = component.visible
    })

    const snapshot: Record<string, boolean> = {}
    visibilitySnapshot.forEach((visible, id) => {
        snapshot[id] = visible
    })

    const config = {
        visibility,
        allHidden: allHidden.value,
        visibilitySnapshot: snapshot
    }

    localStorage.setItem('component-manager-config', JSON.stringify(config))
}

// Watch para salvar automaticamente
watch([components, allHidden, visibilitySnapshot], () => {
    saveConfig()
}, { deep: true })

export const useComponentManager = () => {
    /**
     * Registra um componente no gerenciador
     */
    const registerComponent = (component: ManagedComponent) => {
        if (!components.has(component.id)) {
            components.set(component.id, { ...component })
            loadConfig() // Carrega config após registrar
        }
    }

    /**
     * Remove um componente do gerenciador
     */
    const unregisterComponent = (id: string) => {
        components.delete(id)
    }

    /**
     * Alterna visibilidade de um componente
     * Quando fica visível: expande e traz para frente
     * IMPORTANTE: NÃO altera o windowId (ownership), apenas a visibilidade visual
     * Para adicionar/remover da janela, use addToWindow/removeFromWindow
     */
    const toggleVisibility = (id: string) => {
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

            saveConfig()
        }
    }

    /**
     * Define visibilidade de um componente
     * Quando fica visível: expande e traz para frente
     * @param windowId ID da janela principal (necessário para sincronizar com estado global)
     */
    const setVisibility = (id: string, visible: boolean, windowId?: string) => {
        const component = components.get(id)
        if (component) {
            const wasHidden = !component.visible
            component.visible = visible

            // Força atualização de reatividade
            componentsTrigger.value++

            // Sincroniza com o estado global (ownership)
            if (windowId) {
                if (visible) {
                    // Visível -> adiciona à janela principal
                    moveComponent(id, windowId, { x: 100, y: 100 })
                } else {
                    // Invisível -> remove da janela (windowId: null)
                    moveComponent(id, null, { x: 0, y: 0 })
                }
            }

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

            saveConfig()
        }
    }

    /**
     * Obtém visibilidade de um componente
     */
    const isVisible = (id: string): boolean => {
        // Acessa o trigger para garantir reatividade
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        componentsTrigger.value
        const component = components.get(id)
        return component?.visible ?? true
    }

    /**
     * Obtém componentes por categoria
     */
    const getComponentsByCategory = (category: ManagedComponent['category']) => {
        return Array.from(components.values()).filter(c => c.category === category)
    }

    /**
     * Obtém todos os componentes
     */
    const getAllComponents = () => {
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
        // Se não forneceu IDs, usa todos os componentes (fallback)
        const targetIds = activeComponentIds || Array.from(components.keys())

        if (allHidden.value) {
            // Está escondido, vai mostrar -> restaura snapshot
            allHidden.value = false

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
            allHidden.value = true
        }

        saveConfig()
    }

    /**
     * Mostra todos os componentes (ou apenas os ativos)
     * IMPORTANTE: NÃO altera o windowId (ownership), apenas a visibilidade visual
     * @param activeComponentIds - IDs dos componentes ativos (que estão na lista [ COMPONENTS ])
     */
    const showAll = (activeComponentIds?: string[]) => {
        allHidden.value = false
        const targetIds = activeComponentIds || Array.from(components.keys())

        targetIds.forEach((id) => {
            const component = components.get(id)
            if (component) {
                component.visible = true
            }
        })
        saveConfig()
    }

    /**
     * Esconde todos os componentes (ou apenas os ativos)
     * IMPORTANTE: NÃO altera o windowId (ownership), apenas a visibilidade visual
     * @param activeComponentIds - IDs dos componentes ativos (que estão na lista [ COMPONENTS ])
     */
    const hideAll = (activeComponentIds?: string[]) => {
        allHidden.value = true
        const targetIds = activeComponentIds || Array.from(components.keys())

        targetIds.forEach((id) => {
            const component = components.get(id)
            if (component) {
                component.visible = false
            }
        })
        saveConfig()
    }

    return {
        registerComponent,
        unregisterComponent,
        toggleVisibility,
        setVisibility,
        isVisible,
        toggleAllVisibility,
        allHidden,
        getComponentsByCategory,
        getAllComponents,
        showAll,
        hideAll,
        components,
        // Debug helper
        debugGetAll: () => {
            console.log('[ComponentManager] All components:', Array.from(components.entries()))
            return Array.from(components.entries())
        }
    }
}
