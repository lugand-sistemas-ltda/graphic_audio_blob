import { ref, computed } from 'vue'
import { broadcast, onMessage } from '../sync/useBroadcastSync'

/**
 * Global Theme State Manager
 * 
 * Gerencia estado de tema compartilhado entre todas as janelas
 * Singleton - uma única instância compartilhada globalmente
 */

// ========================================
// TIPOS
// ========================================

export interface RgbModeConfig {
    enabled: boolean
    speed: number
    saturation: number
    brightness: number
}

export interface ChameleonModeConfig {
    enabled: boolean
    sensitivity: number
    smoothing: number
}

export interface GlobalThemeState {
    currentTheme: string
    rgbMode: RgbModeConfig
    chameleonMode: ChameleonModeConfig
}

// ========================================
// ESTADO GLOBAL (Singleton)
// ========================================

let globalState: ReturnType<typeof createGlobalThemeState> | null = null

const STORAGE_KEY = 'global-theme-state'

/**
 * Cria o estado global de tema (chamado apenas uma vez)
 */
function createGlobalThemeState() {
    // Estado reativo
    const state = ref<GlobalThemeState>({
        currentTheme: 'default',
        rgbMode: {
            enabled: false,
            speed: 1,
            saturation: 100,
            brightness: 100
        },
        chameleonMode: {
            enabled: false,
            sensitivity: 1,
            smoothing: 0.1
        }
    })

    // ========================================
    // PERSISTÊNCIA
    // ========================================

    /**
     * Persiste estado em localStorage
     */
    const persist = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
        } catch (error) {
            console.error('[GlobalTheme] Failed to persist:', error)
        }
    }

    /**
     * Carrega estado do localStorage
     */
    const load = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved)
                Object.assign(state.value, parsed)
            }
        } catch (error) {
            console.error('[GlobalTheme] Failed to load:', error)
        }
    }

    // ========================================
    // MÉTODOS DE CONTROLE
    // ========================================

    /**
     * Define tema atual
     */
    const setTheme = (theme: string, windowId: string) => {
        state.value.currentTheme = theme
        broadcast('GLOBAL_THEME_CHANGE', { theme, windowId })
        persist()
    }

    /**
     * Toggle RGB mode
     */
    const toggleRgbMode = (windowId: string) => {
        state.value.rgbMode.enabled = !state.value.rgbMode.enabled
        broadcast('GLOBAL_RGB_TOGGLE', {
            enabled: state.value.rgbMode.enabled,
            windowId
        })
        persist()
    }

    /**
     * Configura RGB mode
     */
    const setRgbConfig = (config: Partial<RgbModeConfig>, windowId: string) => {
        Object.assign(state.value.rgbMode, config)
        broadcast('GLOBAL_RGB_CONFIG', { config, windowId })
        persist()
    }

    /**
     * Toggle Chameleon mode
     */
    const toggleChameleonMode = (windowId: string) => {
        state.value.chameleonMode.enabled = !state.value.chameleonMode.enabled
        broadcast('GLOBAL_CHAMELEON_TOGGLE', {
            enabled: state.value.chameleonMode.enabled,
            windowId
        })
        persist()
    }

    /**
     * Configura Chameleon mode
     */
    const setChameleonConfig = (config: Partial<ChameleonModeConfig>, windowId: string) => {
        Object.assign(state.value.chameleonMode, config)
        broadcast('GLOBAL_CHAMELEON_CONFIG', { config, windowId })
        persist()
    }

    // ========================================
    // SYNC LISTENERS
    // ========================================

    onMessage('GLOBAL_THEME_CHANGE', ({ theme }: { theme: string }) => {
        state.value.currentTheme = theme
    })

    onMessage('GLOBAL_RGB_TOGGLE', ({ enabled }: { enabled: boolean }) => {
        state.value.rgbMode.enabled = enabled
    })

    onMessage('GLOBAL_RGB_CONFIG', ({ config }: { config: Partial<RgbModeConfig> }) => {
        Object.assign(state.value.rgbMode, config)
    })

    onMessage('GLOBAL_CHAMELEON_TOGGLE', ({ enabled }: { enabled: boolean }) => {
        state.value.chameleonMode.enabled = enabled
    })

    onMessage('GLOBAL_CHAMELEON_CONFIG', ({ config }: { config: Partial<ChameleonModeConfig> }) => {
        Object.assign(state.value.chameleonMode, config)
    })

    // ========================================
    // COMPUTED
    // ========================================

    const isRgbModeEnabled = computed(() => state.value.rgbMode.enabled)
    const isChameleonModeEnabled = computed(() => state.value.chameleonMode.enabled)

    // ========================================
    // INICIALIZAÇÃO
    // ========================================

    // Carrega estado persistido
    load()

    return {
        // Estado
        state,

        // Theme
        setTheme,

        // RGB Mode
        toggleRgbMode,
        setRgbConfig,
        isRgbModeEnabled,

        // Chameleon Mode
        toggleChameleonMode,
        setChameleonConfig,
        isChameleonModeEnabled
    }
}

// ========================================
// EXPORT PRINCIPAL
// ========================================

/**
 * Hook para acessar estado global de tema
 * Singleton - retorna sempre a mesma instância
 */
export function useGlobalTheme() {
    globalState ??= createGlobalThemeState()
    return globalState
}
