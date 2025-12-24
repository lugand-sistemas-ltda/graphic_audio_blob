import { ref, onUnmounted } from 'vue'
import type {
    SyncMessage,
    SyncMessageType,
    MessageHandler,
    WindowRole,
    WindowInfo,
    SyncConfig
} from './types'

/**
 * Sistema de Sincronização Multi-Window usando BroadcastChannel API
 * 
 * Permite comunicação em tempo real entre múltiplas janelas/abas do mesmo app
 * sincronizando estado de áudio, controles, temas e componentes
 */

const DEFAULT_CONFIG: Required<SyncConfig> = {
    channelName: 'spectral-visualizer-sync',
    heartbeatInterval: 3000, // 3 segundos
    heartbeatTimeout: 10000, // 10 segundos
    enableLogging: false
}

// Estado global compartilhado entre todas as instâncias do composable
let broadcastChannel: BroadcastChannel | null = null
let heartbeatIntervalId: number | null = null

const connectedWindows = ref<Map<string, WindowInfo>>(new Map())
const currentWindowId = ref<string>(generateWindowId())
const currentRole = ref<WindowRole>('main')
const messageHandlers = new Map<SyncMessageType, Set<MessageHandler>>()
const config = ref<Required<SyncConfig>>(DEFAULT_CONFIG)

/**
 * Gera ID único para a janela atual
 */
function generateWindowId(): string {
    return `window_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Log condicional baseado na configuração
 */
function log(...args: any[]) {
    if (config.value.enableLogging) {
        console.log('[MultiWindow]', ...args)
    }
}

/**
 * Inicializa o BroadcastChannel
 */
function initializeBroadcastChannel() {
    if (broadcastChannel) return

    try {
        broadcastChannel = new BroadcastChannel(config.value.channelName)

        broadcastChannel.onmessage = (event: MessageEvent) => {
            const message = event.data as SyncMessage

            // Ignora mensagens da própria janela
            if (message.windowId === currentWindowId.value) return

            log('Received message:', message.type, message.data)

            // Processa mensagens especiais do sistema
            handleSystemMessage(message)

            // Notifica handlers registrados
            const handlers = messageHandlers.get(message.type)
            if (handlers) {
                handlers.forEach(handler => {
                    try {
                        handler(message.data, message)
                    } catch (error) {
                        console.error(`Error in handler for ${message.type}:`, error)
                    }
                })
            }
        }

        broadcastChannel.onmessageerror = (error) => {
            console.error('[MultiWindow] Message error:', error)
        }

        log('BroadcastChannel initialized:', config.value.channelName)
    } catch (error) {
        console.error('[MultiWindow] Failed to create BroadcastChannel:', error)
    }
}

/**
 * Processa mensagens do sistema (heartbeat, conexão, etc)
 */
function handleSystemMessage(message: SyncMessage) {
    const { type, windowId, role, timestamp } = message

    switch (type) {
        case 'WINDOW_CONNECTED':
            connectedWindows.value.set(windowId, {
                id: windowId,
                role: role || 'custom',
                connectedAt: timestamp,
                lastHeartbeat: timestamp,
                isAlive: true
            })
            log(`Window connected: ${windowId} (${role})`)
            break

        case 'WINDOW_DISCONNECTED':
            connectedWindows.value.delete(windowId)
            log(`Window disconnected: ${windowId}`)
            break

        case 'HEARTBEAT':
            const window = connectedWindows.value.get(windowId)
            if (window) {
                window.lastHeartbeat = timestamp
                window.isAlive = true
                connectedWindows.value.set(windowId, window)
            } else {
                // Nova janela detectada via heartbeat
                connectedWindows.value.set(windowId, {
                    id: windowId,
                    role: role || 'custom',
                    connectedAt: timestamp,
                    lastHeartbeat: timestamp,
                    isAlive: true
                })
            }
            break

        case 'WINDOW_ROLE_CHANGE':
            const existingWindow = connectedWindows.value.get(windowId)
            if (existingWindow) {
                existingWindow.role = message.data.role
                connectedWindows.value.set(windowId, existingWindow)
                log(`Window role changed: ${windowId} -> ${message.data.role}`)
            }
            break
    }
}

/**
 * Inicia sistema de heartbeat
 */
function startHeartbeat() {
    if (heartbeatIntervalId) return

    heartbeatIntervalId = window.setInterval(() => {
        // Envia heartbeat
        broadcast('HEARTBEAT', {})

        // Verifica janelas que pararam de responder
        const now = Date.now()
        connectedWindows.value.forEach((window, id) => {
            if (now - window.lastHeartbeat > config.value.heartbeatTimeout) {
                window.isAlive = false
                log(`Window timeout: ${id}`)
                // Remove após 2x o timeout
                if (now - window.lastHeartbeat > config.value.heartbeatTimeout * 2) {
                    connectedWindows.value.delete(id)
                    log(`Window removed: ${id}`)
                }
            }
        })
    }, config.value.heartbeatInterval)

    log('Heartbeat started')
}

/**
 * Para sistema de heartbeat
 */
function stopHeartbeat() {
    if (heartbeatIntervalId) {
        clearInterval(heartbeatIntervalId)
        heartbeatIntervalId = null
        log('Heartbeat stopped')
    }
}

/**
 * Envia mensagem para todas as outras janelas
 */
export function broadcast<T = any>(type: SyncMessageType, data: T) {
    if (!broadcastChannel) {
        // Não loga warning para evitar spam - broadcast será inicializado quando necessário
        return
    }

    const message: SyncMessage<T> = {
        type,
        data,
        timestamp: Date.now(),
        windowId: currentWindowId.value,
        role: currentRole.value
    }

    try {
        broadcastChannel.postMessage(message)
        log('Broadcasted:', type, data)
    } catch (error) {
        console.error('[MultiWindow] Failed to broadcast:', error)
    }
}

/**
 * Registra handler para tipo específico de mensagem
 */
export function onMessage<T = any>(type: SyncMessageType, handler: MessageHandler<T>) {
    if (!messageHandlers.has(type)) {
        messageHandlers.set(type, new Set())
    }
    messageHandlers.get(type)!.add(handler as MessageHandler)

    log(`Handler registered for: ${type}`)

    // Retorna função para remover handler
    return () => {
        const handlers = messageHandlers.get(type)
        if (handlers) {
            handlers.delete(handler as MessageHandler)
            if (handlers.size === 0) {
                messageHandlers.delete(type)
            }
        }
    }
}

/**
 * Remove todos os handlers de um tipo
 */
export function offMessage(type: SyncMessageType) {
    messageHandlers.delete(type)
    log(`All handlers removed for: ${type}`)
}

/**
 * Define o role da janela atual
 */
export function setWindowRole(role: WindowRole) {
    const oldRole = currentRole.value
    currentRole.value = role
    broadcast('WINDOW_ROLE_CHANGE', { role })
    log(`Window role changed: ${oldRole} -> ${role}`)
}

/**
 * Obtém informações sobre janelas conectadas
 */
export function getConnectedWindows(): WindowInfo[] {
    return Array.from(connectedWindows.value.values())
}

/**
 * Obtém apenas janelas ativas (respondendo a heartbeat)
 */
export function getAliveWindows(): WindowInfo[] {
    return getConnectedWindows().filter(w => w.isAlive)
}

/**
 * Obtém janelas por role específico
 */
export function getWindowsByRole(role: WindowRole): WindowInfo[] {
    return getConnectedWindows().filter(w => w.role === role)
}

/**
 * Verifica se há outras janelas conectadas
 */
export function hasOtherWindows(): boolean {
    return getAliveWindows().length > 0
}

/**
 * Composable principal do sistema multi-window
 */
export function useBroadcastSync(customConfig?: Partial<SyncConfig>) {
    // Aplica configuração customizada
    if (customConfig) {
        config.value = { ...DEFAULT_CONFIG, ...customConfig }
    }

    // Inicializa apenas uma vez
    if (!broadcastChannel) {
        initializeBroadcastChannel()
        startHeartbeat()

        // Anuncia conexão da janela
        broadcast('WINDOW_CONNECTED', {})
    }

    // Cleanup ao desmontar
    onUnmounted(() => {
        // Anuncia desconexão
        broadcast('WINDOW_DISCONNECTED', {})

        // Para heartbeat se for a última instância
        stopHeartbeat()

        // Fecha channel se for a última instância
        if (broadcastChannel) {
            broadcastChannel.close()
            broadcastChannel = null
            log('BroadcastChannel closed')
        }
    })

    return {
        // Estado
        connectedWindows,
        currentWindowId,
        currentRole,

        // Funções
        broadcast,
        onMessage,
        offMessage,
        setWindowRole,
        getConnectedWindows,
        getAliveWindows,
        getWindowsByRole,
        hasOtherWindows
    }
}
