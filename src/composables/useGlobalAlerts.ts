import { computed } from 'vue'
import { useGlobalState, dispatch } from '../core/state'
import type {
    WindowId,
    AlertId,
    AlertConfig,
    AlertButton,
    AlertState
} from '../core/state/types'

/**
 * Composable para gerenciar Alerts globalmente
 * 
 * Permite mostrar, esconder e responder a alerts em qualquer janela
 * Cada janela tem sua própria fila de alerts
 */

export function useGlobalAlerts(windowId: WindowId) {
    const { state } = useGlobalState()

    /**
     * Alerts ativos nesta janela
     */
    const activeAlerts = computed(() => {
        const windowAlerts = state.alertsByWindow[windowId] || {}
        return Object.values(windowAlerts).filter(alert => alert.visible)
    })

    /**
     * Gera ID único para alert
     */
    function generateAlertId(): AlertId {
        return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    /**
     * Mostra um alert na janela
     */
    function showAlert(config: Omit<AlertConfig, 'id' | 'createdAt'>): AlertId {
        const alertId = generateAlertId()

        // Botões padrão se não fornecido
        const buttons: AlertButton[] = config.buttons || [
            {
                id: 'ok',
                label: 'OK',
                variant: 'primary'
            }
        ]

        const alert: AlertState = {
            id: alertId,
            type: config.type,
            title: config.title,
            message: config.message,
            icon: config.icon,
            buttons,
            closable: config.closable ?? true,
            onClose: config.onClose,
            createdAt: Date.now(),
            windowId,
            visible: true,
            responded: false
        }

        dispatch({
            type: 'ALERT_SHOW',
            payload: { windowId, alert }
        })

        return alertId
    }

    /**
     * Esconde um alert (remove da tela)
     */
    function hideAlert(alertId: AlertId) {
        const alert = state.alertsByWindow[windowId]?.[alertId]
        if (alert?.onClose) {
            alert.onClose()
        }

        dispatch({
            type: 'ALERT_HIDE',
            payload: { windowId, alertId }
        })
    }

    /**
     * Responde a um alert (quando usuário clica em botão)
     */
    function respondToAlert(alertId: AlertId, buttonId: string) {
        const alert = state.alertsByWindow[windowId]?.[alertId]
        if (!alert) return

        // Marca como respondido
        dispatch({
            type: 'ALERT_RESPONDED',
            payload: { windowId, alertId, buttonId }
        })

        // Executa ação do botão
        const button = alert.buttons?.find(b => b.id === buttonId)
        if (button?.action) {
            Promise.resolve(button.action()).catch(error => {
                console.error('[useGlobalAlerts] Error executing button action:', error)
            })
        }

        // Remove alert após resposta
        setTimeout(() => {
            hideAlert(alertId)
        }, 300) // Delay para animação
    }

    /**
     * Helpers para tipos específicos de alert
     */
    function showSuccess(message: string | string[], title?: string): AlertId {
        return showAlert({
            type: 'success',
            title: title || 'Success',
            message,
            icon: '✓'
        })
    }

    function showError(message: string | string[], title?: string): AlertId {
        return showAlert({
            type: 'error',
            title: title || 'Error',
            message,
            icon: '✕'
        })
    }

    function showWarning(message: string | string[], title?: string): AlertId {
        return showAlert({
            type: 'warning',
            title: title || 'Warning',
            message,
            icon: '⚠'
        })
    }

    function showAttention(message: string | string[], title?: string): AlertId {
        return showAlert({
            type: 'attention',
            title: title || 'Attention',
            message,
            icon: 'ℹ'
        })
    }

    /**
     * Mostra um alert de confirmação (YES/NO)
     */
    function showConfirm(
        message: string | string[],
        title?: string,
        onConfirm?: () => void | Promise<void>,
        onCancel?: () => void | Promise<void>
    ): AlertId {
        return showAlert({
            type: 'attention',
            title: title || 'Confirm',
            message,
            icon: '?',
            buttons: [
                {
                    id: 'yes',
                    label: 'YES',
                    variant: 'primary',
                    action: onConfirm
                },
                {
                    id: 'no',
                    label: 'NO',
                    variant: 'secondary',
                    action: onCancel
                }
            ]
        })
    }

    return {
        // Estado
        activeAlerts,

        // Ações principais
        showAlert,
        hideAlert,
        respondToAlert,

        // Helpers
        showSuccess,
        showError,
        showWarning,
        showAttention,
        showConfirm
    }
}
