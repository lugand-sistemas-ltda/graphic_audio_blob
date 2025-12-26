import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface DraggableOptions {
    /** ID único para persistir posição no localStorage */
    id?: string
    /** Posição inicial (caso não tenha no localStorage) */
    initialPosition?: { x: number; y: number }
    /** Handle CSS selector (ex: '.header' para arrastar apenas pelo header) */
    handle?: string
    /** Limita o arrasto dentro da viewport */
    constrainToViewport?: boolean
    /** Callback quando o componente é arrastado */
    onDrag?: (position: { x: number; y: number }) => void
    /** Callback quando o arrasto termina */
    onDragEnd?: (position: { x: number; y: number }) => void
}

interface DraggableState {
    isDragging: Ref<boolean>
    position: Ref<{ x: number; y: number }>
    startDrag: (event: MouseEvent) => void
    resetPosition: () => void
}

export function useDraggable(
    elementRef: Ref<HTMLElement | null>,
    options: DraggableOptions = {}
): DraggableState {
    const {
        id,
        initialPosition = { x: 0, y: 0 },
        handle,
        constrainToViewport = true,
        onDrag,
        onDragEnd
    } = options

    const isDragging = ref(false)
    const position = ref({ ...initialPosition })

    // Estado interno do drag
    let dragStartPos = { x: 0, y: 0 }
    let elementStartPos = { x: 0, y: 0 }

    // Carrega posição salva do localStorage
    const loadPosition = () => {
        if (!id) return

        const savedPosition = localStorage.getItem(`draggable-${id}`)
        if (savedPosition) {
            try {
                const parsed = JSON.parse(savedPosition)
                position.value = parsed
            } catch (error) {
                console.warn(`Failed to parse saved position for ${id}:`, error)
            }
        }
    }

    // Salva posição no localStorage
    const savePosition = () => {
        if (!id) return

        localStorage.setItem(`draggable-${id}`, JSON.stringify(position.value))
    }

    // Aplica constraints da viewport
    const constrainPosition = (x: number, y: number): { x: number; y: number } => {
        if (!constrainToViewport || !elementRef.value) {
            return { x, y }
        }

        const element = elementRef.value
        const rect = element.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        // Limita para que pelo menos 50px do componente fique visível
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

    // Handler de movimento do mouse
    const handleMouseMove = (event: MouseEvent) => {
        if (!isDragging.value) return

        const deltaX = event.clientX - dragStartPos.x
        const deltaY = event.clientY - dragStartPos.y

        const newX = elementStartPos.x + deltaX
        const newY = elementStartPos.y + deltaY

        const constrained = constrainPosition(newX, newY)
        position.value = constrained

        onDrag?.(position.value)
    }

    // Handler de soltar o mouse
    const handleMouseUp = () => {
        if (!isDragging.value) return

        isDragging.value = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''

        savePosition()
        onDragEnd?.(position.value)
    }

    // Inicia o arrasto
    const startDrag = (event: MouseEvent) => {
        // Verifica se clicou no handle correto
        if (handle) {
            const target = event.target as HTMLElement
            const handleElement = target.closest(handle)
            if (!handleElement) return
        }

        // Previne seleção de texto durante drag
        event.preventDefault()

        isDragging.value = true
        dragStartPos = { x: event.clientX, y: event.clientY }
        elementStartPos = { ...position.value }

        document.body.style.cursor = 'grabbing'
        document.body.style.userSelect = 'none'
    }

    // Reseta para posição inicial
    const resetPosition = () => {
        position.value = { ...initialPosition }
        savePosition()
    }

    // Setup dos event listeners
    onMounted(() => {
        loadPosition()

        if (elementRef.value) {
            elementRef.value.addEventListener('mousedown', startDrag)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    })

    onUnmounted(() => {
        if (elementRef.value) {
            elementRef.value.removeEventListener('mousedown', startDrag)
        }

        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    })

    return {
        isDragging,
        position,
        startDrag,
        resetPosition
    }
}
