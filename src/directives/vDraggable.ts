import type { Directive, DirectiveBinding } from 'vue'
import { getInitialPosition } from '../utils/defaultPositions'
import { useZIndex } from '../features/window-management'

interface DraggableBindingValue {
    /** ID único para persistir posição */
    id?: string
    /** Seletor do handle (ex: '.header') */
    handle?: string
    /** Posição inicial */
    initialPosition?: { x: number; y: number }
    /** Limitar à viewport */
    constrainToViewport?: boolean
}

// Instância compartilhada do z-index manager
const zIndexManager = useZIndex()

interface DraggableElement extends HTMLElement {
    __draggable?: {
        isDragging: boolean
        startPos: { x: number; y: number }
        elementStartPos: { x: number; y: number }
        currentPos: { x: number; y: number }
        onMouseMove: (e: MouseEvent) => void
        onMouseUp: (e: MouseEvent) => void
        onMouseDown: (e: MouseEvent) => void
        onClick: () => void
    }
}

const loadPosition = (id: string): { x: number; y: number } | null => {
    const saved = localStorage.getItem(`draggable-${id}`)
    if (saved) {
        try {
            return JSON.parse(saved)
        } catch {
            return null
        }
    }
    return null
}

const savePosition = (id: string, position: { x: number; y: number }) => {
    localStorage.setItem(`draggable-${id}`, JSON.stringify(position))
}

const constrainPosition = (
    element: HTMLElement,
    x: number,
    y: number,
    constrain: boolean
): { x: number; y: number } => {
    if (!constrain) return { x, y }

    const rect = element.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const minVisible = 50
    const maxX = viewportWidth - minVisible
    const maxY = viewportHeight - minVisible
    const minX = -rect.width + minVisible
    const minY = 0

    return {
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y))
    }
}

const applyPosition = (element: HTMLElement, x: number, y: number) => {
    element.style.top = '0'
    element.style.left = '0'
    element.style.transform = `translate(${x}px, ${y}px)`
}

export const vDraggable: Directive<DraggableElement, DraggableBindingValue> = {
    mounted(el, binding: DirectiveBinding<DraggableBindingValue>) {
        const options = binding.value || {}
        const {
            id,
            handle,
            initialPosition,
            constrainToViewport = true
        } = options

        // Carrega posição salva ou usa inicial (ou padrão baseado no ID)
        const savedPos = id ? loadPosition(id) : null
        const defaultPos = id ? getInitialPosition(id) : { x: 0, y: 0 }
        const startingPos = savedPos || initialPosition || defaultPos

        // Debug log
        console.log(`[vDraggable] Mounting ${id}:`, {
            savedPos,
            defaultPos,
            startingPos
        })

        // Garante que o elemento seja posicionável
        const computedPosition = getComputedStyle(el).position
        if (computedPosition === 'static' || computedPosition === 'relative' || computedPosition === 'absolute') {
            el.style.position = 'fixed'
        }

        // Inicializa z-index usando o sistema de camadas
        if (id) {
            el.style.zIndex = String(zIndexManager.getZIndex(id))
        }

        // Aplica posição inicial
        applyPosition(el, startingPos.x, startingPos.y)

        // Handler de click no componente (traz para frente mesmo sem arrastar)
        const onClick = () => {
            if (id) {
                zIndexManager.bringToFront(id)
                el.style.zIndex = String(zIndexManager.getZIndex(id))
            }
        }

        // Estado do drag
        const state = {
            isDragging: false,
            startPos: { x: 0, y: 0 },
            elementStartPos: { x: 0, y: 0 },
            currentPos: { ...startingPos },
            onMouseMove: (e: MouseEvent) => {
                if (!state.isDragging) return

                const deltaX = e.clientX - state.startPos.x
                const deltaY = e.clientY - state.startPos.y

                const newX = state.elementStartPos.x + deltaX
                const newY = state.elementStartPos.y + deltaY

                const constrained = constrainPosition(el, newX, newY, constrainToViewport)
                state.currentPos = constrained

                applyPosition(el, constrained.x, constrained.y)
            },
            onMouseUp: () => {
                if (!state.isDragging) return

                state.isDragging = false
                document.body.style.cursor = ''
                document.body.style.userSelect = ''
                el.style.cursor = ''

                if (id) {
                    savePosition(id, state.currentPos)
                }
            },
            onMouseDown: (e: MouseEvent) => {
                // Verifica se clicou no handle correto
                if (handle) {
                    const target = e.target as HTMLElement
                    const handleElement = target.closest(handle)
                    if (!handleElement || !el.contains(handleElement)) return
                }

                e.preventDefault()

                // Traz componente para frente ao clicar
                if (id) {
                    zIndexManager.bringToFront(id)
                    el.style.zIndex = String(zIndexManager.getZIndex(id))
                }

                state.isDragging = true
                state.startPos = { x: e.clientX, y: e.clientY }
                state.elementStartPos = { ...state.currentPos }

                document.body.style.cursor = 'grabbing'
                document.body.style.userSelect = 'none'
                el.style.cursor = 'grabbing'
            },
            onClick
        }

        // Adiciona event listeners
        el.addEventListener('mousedown', state.onMouseDown)
        el.addEventListener('click', state.onClick) // Traz para frente ao clicar
        document.addEventListener('mousemove', state.onMouseMove)
        document.addEventListener('mouseup', state.onMouseUp)

        // Adiciona cursor grab no handle
        if (handle) {
            const handleElement = el.querySelector(handle) as HTMLElement
            if (handleElement) {
                handleElement.style.cursor = 'grab'
            }
        } else {
            el.style.cursor = 'grab'
        }

        // Armazena referência para cleanup
        el.__draggable = state
    },

    unmounted(el) {
        const state = el.__draggable
        if (state) {
            el.removeEventListener('mousedown', state.onMouseDown)
            el.removeEventListener('click', state.onClick)
            document.removeEventListener('mousemove', state.onMouseMove)
            document.removeEventListener('mouseup', state.onMouseUp)
            delete el.__draggable
        }
    }
}
