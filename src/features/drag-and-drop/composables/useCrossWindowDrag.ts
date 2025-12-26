import { ref, onMounted, onUnmounted } from 'vue'
import { useGlobalState, startDrag, updateDragPosition, endDrag, moveComponent } from '../../../core/state'
import type { WindowId, ComponentId, ComponentTransform } from '../../../core/state/types'

/**
 * Cross-Window Drag & Drop System
 * 
 * Permite arrastar componentes entre diferentes janelas do navegador
 */

interface DragOptions {
    componentId: ComponentId
    windowId: WindowId
    handle?: string // Seletor CSS do handle (ex: '.header')
    onDragStart?: () => void
    onDragEnd?: () => void
}

export function useCrossWindowDrag(options: DragOptions) {
    const { componentId, windowId, handle, onDragStart, onDragEnd } = options
    const { state } = useGlobalState()

    const isDragging = ref(false)
    const dragStartPos = ref({ x: 0, y: 0 })
    const elementStartPos = ref({ x: 0, y: 0 })

    let element: HTMLElement | null = null
    let handleElement: HTMLElement | null = null

    /**
     * Início do drag
     */
    const handleMouseDown = (e: MouseEvent) => {
        // Verifica se clicou no handle correto
        if (handle && !(e.target as HTMLElement).closest(handle)) {
            return
        }

        isDragging.value = true
        dragStartPos.value = { x: e.clientX, y: e.clientY }

        // Pega posição atual do componente
        const component = state.components[componentId]
        if (component) {
            elementStartPos.value = {
                x: component.transform.x,
                y: component.transform.y
            }
        }

        // Notifica início do drag
        startDrag(componentId, windowId)
        onDragStart?.()

        // Previne seleção de texto
        e.preventDefault()

        // Adiciona listeners globais
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        // Listener para detectar quando mouse sai da janela
        window.addEventListener('mouseleave', handleMouseLeave)
    }

    /**
     * Durante o drag
     */
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.value) return

        const deltaX = e.clientX - dragStartPos.value.x
        const deltaY = e.clientY - dragStartPos.value.y

        const newTransform: ComponentTransform = {
            x: elementStartPos.value.x + deltaX,
            y: elementStartPos.value.y + deltaY
        }

        // Atualiza posição local imediatamente (visual feedback)
        if (element) {
            element.style.transform = `translate(${newTransform.x}px, ${newTransform.y}px)`
        }

        // Broadcast posição do mouse para outras janelas
        updateDragPosition({ x: e.clientX, y: e.clientY })
    }

    /**
     * Mouse saiu da janela durante drag
     */
    const handleMouseLeave = (e: MouseEvent) => {
        if (!isDragging.value) return

        // Componente está sendo arrastado para fora
        // Outras janelas devem mostrar placeholder

        console.log('[CrossWindowDrag] Component leaving window:', componentId)
    }

    /**
     * Fim do drag
     */
    const handleMouseUp = (e: MouseEvent) => {
        if (!isDragging.value) return

        const deltaX = e.clientX - dragStartPos.value.x
        const deltaY = e.clientY - dragStartPos.value.y

        const newTransform: ComponentTransform = {
            x: elementStartPos.value.x + deltaX,
            y: elementStartPos.value.y + deltaY
        }

        // Determina em qual janela o drop aconteceu
        // Se drop foi na mesma janela, mantém ownership
        // Se foi fora, o sistema de broadcast vai detectar

        const finalWindowId = windowId // Por enquanto, sempre mesma janela

        // Finaliza drag
        endDrag(componentId, finalWindowId, newTransform)
        moveComponent(componentId, finalWindowId, newTransform)

        onDragEnd?.()

        // Cleanup
        isDragging.value = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('mouseleave', handleMouseLeave)
    }

    /**
     * Monta listeners
     */
    onMounted(() => {
        element = document.querySelector(`[data-component-id="${componentId}"]`)

        if (handle) {
            handleElement = element?.querySelector(handle) as HTMLElement
        } else {
            handleElement = element
        }

        if (handleElement) {
            handleElement.addEventListener('mousedown', handleMouseDown)
            handleElement.style.cursor = 'grab'
        }
    })

    /**
     * Cleanup
     */
    onUnmounted(() => {
        if (handleElement) {
            handleElement.removeEventListener('mousedown', handleMouseDown)
        }
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('mouseleave', handleMouseLeave)
    })

    return {
        isDragging
    }
}

/**
 * Hook para janela receber drops de outras janelas
 */
export function useCrossWindowDropZone(windowId: WindowId) {
    const { state } = useGlobalState()

    const isDropTarget = ref(false)
    const draggedComponentId = ref<ComponentId | null>(null)

    /**
     * Detecta quando componente de outra janela está sendo arrastado
     */
    const checkForIncomingDrag = () => {
        const { draggedComponent } = state

        if (
            draggedComponent.id &&
            draggedComponent.sourceWindowId !== windowId &&
            draggedComponent.mousePosition
        ) {
            // Componente de outra janela está sendo arrastado
            isDropTarget.value = true
            draggedComponentId.value = draggedComponent.id
        } else {
            isDropTarget.value = false
            draggedComponentId.value = null
        }
    }

    /**
     * Recebe drop de componente
     */
    const handleDrop = (e: DragEvent) => {
        if (!draggedComponentId.value) return

        // Calcula posição do drop nesta janela
        const transform: ComponentTransform = {
            x: e.clientX - 100, // Offset para centralizar
            y: e.clientY - 50
        }

        // Move componente para esta janela
        moveComponent(draggedComponentId.value, windowId, transform)

        isDropTarget.value = false
        draggedComponentId.value = null
    }

    // Monitora estado de drag global
    onMounted(() => {
        const interval = setInterval(checkForIncomingDrag, 100)

        onUnmounted(() => {
            clearInterval(interval)
        })
    })

    return {
        isDropTarget,
        draggedComponentId,
        handleDrop
    }
}
