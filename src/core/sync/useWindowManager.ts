import { computed } from 'vue'
import { useBroadcastSync, broadcast, onMessage } from './useBroadcastSync'
import type {
    AudioSyncData,
    AudioControlData,
    PlaybackStateData,
    SphereConfigData,
    ThemeChangeData,
    ComponentStateData
} from './types'

/**
 * Window Manager - Gerenciamento de alto nível de janelas múltiplas
 * 
 * Fornece API simplificada para sincronizar dados específicos do app
 * como áudio, controles, temas, etc.
 */
export function useWindowManager(config?: { enableLogging?: boolean }) {
    const sync = useBroadcastSync(config)

    // Computed properties úteis
    const windowCount = computed(() => sync.getAliveWindows().length + 1) // +1 para janela atual
    const isMultiWindow = computed(() => windowCount.value > 1)
    const isMainWindow = computed(() => sync.currentRole.value === 'main')

    // ========================================
    // ÁUDIO SYNC
    // ========================================

    /**
     * Sincroniza dados de análise de áudio
     */
    function syncAudioData(data: AudioSyncData) {
        // Só sincroniza se houver outras janelas conectadas
        if (!isMultiWindow.value) return
        broadcast('AUDIO_DATA', data)
    }

    /**
     * Escuta dados de áudio de outras janelas
     */
    function onAudioData(handler: (data: AudioSyncData) => void) {
        return onMessage('AUDIO_DATA', handler)
    }

    // ========================================
    // CONTROLES DE ÁUDIO
    // ========================================

    /**
     * Sincroniza ações de controle de áudio
     */
    function syncAudioControl(control: AudioControlData) {
        broadcast('AUDIO_CONTROL', control)
    }

    /**
     * Escuta controles de áudio de outras janelas
     */
    function onAudioControl(handler: (control: AudioControlData) => void) {
        return onMessage('AUDIO_CONTROL', handler)
    }

    // ========================================
    // PLAYBACK STATE
    // ========================================

    /**
     * Sincroniza estado de playback
     */
    function syncPlaybackState(state: PlaybackStateData) {
        broadcast('PLAYBACK_STATE', state)
    }

    /**
     * Escuta mudanças de playback de outras janelas
     */
    function onPlaybackState(handler: (state: PlaybackStateData) => void) {
        return onMessage('PLAYBACK_STATE', handler)
    }

    // ========================================
    // TEMA
    // ========================================

    /**
     * Sincroniza mudança de tema
     */
    function syncThemeChange(theme: string) {
        broadcast('THEME_CHANGE', { theme })
    }

    /**
     * Escuta mudanças de tema de outras janelas
     */
    function onThemeChange(handler: (data: ThemeChangeData) => void) {
        return onMessage('THEME_CHANGE', handler)
    }

    /**
     * Sincroniza toggle do RGB Mode
     */
    function syncRgbModeToggle(active: boolean) {
        broadcast('RGB_MODE_TOGGLE', { active })
    }

    /**
     * Escuta toggle do RGB Mode de outras janelas
     */
    function onRgbModeToggle(handler: (data: { active: boolean }) => void) {
        return onMessage('RGB_MODE_TOGGLE', handler)
    }

    /**
     * Sincroniza toggle do Chameleon Mode
     */
    function syncChameleonModeToggle(active: boolean) {
        broadcast('CHAMELEON_MODE_TOGGLE', { active })
    }

    /**
     * Escuta toggle do Chameleon Mode de outras janelas
     */
    function onChameleonModeToggle(handler: (data: { active: boolean }) => void) {
        return onMessage('CHAMELEON_MODE_TOGGLE', handler)
    }

    // ========================================
    // CONFIGURAÇÃO DA ESFERA
    // ========================================

    /**
     * Sincroniza configuração da esfera (tamanho, reatividade)
     */
    function syncSphereConfig(config: SphereConfigData) {
        broadcast('SPHERE_CONFIG', config)
    }

    /**
     * Escuta mudanças de config da esfera de outras janelas
     */
    function onSphereConfig(handler: (config: SphereConfigData) => void) {
        return onMessage('SPHERE_CONFIG', handler)
    }

    // ========================================
    // COMPONENTES
    // ========================================

    /**
     * Sincroniza estado de componente (visível/oculto)
     */
    function syncComponentState(state: ComponentStateData) {
        broadcast('COMPONENT_STATE', state)
    }

    /**
     * Escuta mudanças de estado de componentes de outras janelas
     */
    function onComponentState(handler: (state: ComponentStateData) => void) {
        return onMessage('COMPONENT_STATE', handler)
    }

    // ========================================
    // BEAT DETECTION
    // ========================================

    /**
     * Sincroniza detecção de beat
     */
    function syncBeatDetected() {
        broadcast('BEAT_DETECTED', { timestamp: Date.now() })
    }

    /**
     * Escuta detecção de beat de outras janelas
     */
    function onBeatDetected(handler: (data: { timestamp: number }) => void) {
        return onMessage('BEAT_DETECTED', handler)
    }

    // ========================================
    // JANELA SECUNDÁRIA
    // ========================================

    /**
     * Abre nova janela em modo específico
     */
    function openWindow(
        route: string = '/visual',
        options: {
            width?: number
            height?: number
            title?: string
            features?: string
        } = {}
    ): Window | null {
        const {
            width = 1920,
            height = 1080,
            title = 'Spectral Visualizer',
            features = ''
        } = options

        const defaultFeatures = [
            `width=${width}`,
            `height=${height}`,
            'menubar=no',
            'toolbar=no',
            'location=no',
            'status=no'
        ].join(',')

        const finalFeatures = features || defaultFeatures

        try {
            const baseUrl = window.location.origin + window.location.pathname
            // ✅ CRITICAL: Adiciona query param para identificar como child window
            const separator = route.includes('?') ? '&' : '?'
            const fullUrl = `${baseUrl}#${route}${separator}childWindow=true`
            const newWindow = window.open(fullUrl, title, finalFeatures)

            if (newWindow) {
                newWindow.focus()
                console.log('[WindowManager] ✅ Child window opened:', fullUrl)
                return newWindow
            } else {
                console.error('[WindowManager] Failed to open window (popup blocked?)')
                return null
            }
        } catch (error) {
            console.error('[WindowManager] Error opening window:', error)
            return null
        }
    }

    /**
     * Abre janela genérica (vazia, configurável pelo usuário)
     */
    function openGenericWindow() {
        return openWindow('/window', {
            width: 1200,
            height: 800,
            title: `Window ${Date.now()}`
        })
    }

    /**
     * Abre janela visual (sem controles)
     * @deprecated Use openGenericWindow() instead
     */
    function openVisualWindow() {
        return openWindow('/visual', {
            title: 'Visual Effects - Screen 2'
        })
    }

    /**
     * Abre janela de controles apenas
     * @deprecated Use openGenericWindow() instead
     */
    function openControlsWindow() {
        return openWindow('/controls', {
            width: 800,
            height: 1080,
            title: 'Controls - Screen 2'
        })
    }

    /**
     * Abre janela em grid (múltiplos efeitos)
     * @deprecated Use openGenericWindow() instead
     */
    function openGridWindow() {
        return openWindow('/grid', {
            title: 'Grid View - Screen 2'
        })
    }

    return {
        // Estado
        ...sync,
        windowCount,
        isMultiWindow,
        isMainWindow,

        // Áudio
        syncAudioData,
        onAudioData,
        syncAudioControl,
        onAudioControl,
        syncPlaybackState,
        onPlaybackState,

        // Tema
        syncThemeChange,
        onThemeChange,
        syncRgbModeToggle,
        onRgbModeToggle,
        syncChameleonModeToggle,
        onChameleonModeToggle,

        // Esfera
        syncSphereConfig,
        onSphereConfig,

        // Componentes
        syncComponentState,
        onComponentState,

        // Beat
        syncBeatDetected,
        onBeatDetected,

        // Janelas
        openWindow,
        openGenericWindow,
        openVisualWindow,
        openControlsWindow,
        openGridWindow
    }
}
