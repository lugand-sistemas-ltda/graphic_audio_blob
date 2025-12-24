import { ref, watch, reactive } from 'vue'
import { useZIndex } from './useZIndex'

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

// Flag para controle global de collapse
const allCollapsed = ref(false)

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

            // Restaura estado de collapse global
            if (config.allCollapsed !== undefined) {
                allCollapsed.value = config.allCollapsed
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
        allCollapsed: allCollapsed.value,
        allHidden: allHidden.value,
        visibilitySnapshot: snapshot
    }

    localStorage.setItem('component-manager-config', JSON.stringify(config))
}

// Watch para salvar automaticamente
watch([components, allCollapsed, allHidden, visibilitySnapshot], () => {
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
     */
    const setVisibility = (id: string, visible: boolean) => {
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

            saveConfig()
        }
    }

    /**
     * Obtém visibilidade de um componente
     */
    const isVisible = (id: string): boolean => {
        // Acessa o trigger para garantir reatividade
        componentsTrigger.value
        const component = components.get(id)
        return component?.visible ?? true
    }

    /**
     * Colapsa ou expande todos os componentes
     */
    const toggleAllCollapsed = () => {
        allCollapsed.value = !allCollapsed.value

        // Atualiza todos os componentes que têm collapsibleId
        components.forEach(component => {
            if (component.collapsibleId) {
                const storageKey = `collapsible-${component.collapsibleId}`
                localStorage.setItem(storageKey, JSON.stringify(!allCollapsed.value))
            }
        })

        // Força reload da página para aplicar mudanças
        window.location.reload()
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
     * Alterna visibilidade de todos os componentes
     * Ao esconder: salva snapshot do estado atual
     * Ao mostrar: restaura o snapshot salvo
     */
    const toggleAllVisibility = () => {
        if (!allHidden.value) {
            // Está visível, vai esconder -> salva snapshot antes
            visibilitySnapshot.clear()
            components.forEach((component, id) => {
                visibilitySnapshot.set(id, component.visible)
            })

            // Esconde todos
            allHidden.value = true
            components.forEach(component => {
                component.visible = false
            })
        } else {
            // Está escondido, vai mostrar -> restaura snapshot
            allHidden.value = false

            // Se existe snapshot, restaura o estado anterior
            if (visibilitySnapshot.size > 0) {
                components.forEach((component, id) => {
                    const savedState = visibilitySnapshot.get(id)
                    if (savedState !== undefined) {
                        component.visible = savedState
                    }
                })
            } else {
                // Sem snapshot, mostra todos
                components.forEach(component => {
                    component.visible = true
                })
            }
        }

        saveConfig()
    }

    /**
     * Mostra todos os componentes
     */
    const showAll = () => {
        allHidden.value = false
        components.forEach(component => {
            component.visible = true
        })
        saveConfig()
    }

    /**
     * Esconde todos os componentes
     */
    const hideAll = () => {
        allHidden.value = true
        components.forEach(component => {
            component.visible = false
        })
        saveConfig()
    }

    return {
        registerComponent,
        unregisterComponent,
        toggleVisibility,
        setVisibility,
        isVisible,
        toggleAllCollapsed,
        toggleAllVisibility,
        allCollapsed,
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
