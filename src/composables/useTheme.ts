import { watch, inject, computed } from 'vue'
import { useGlobalTheme } from '../core/global'

export interface Theme {
    id: string
    name: string
    description: string
    preview: string // cor principal para preview
}

export const availableThemes: Theme[] = [
    {
        id: 'matrix',
        name: 'Matrix Green',
        description: 'Classic Matrix style',
        preview: '#00ff41'
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk Purple',
        description: 'Neon purple cyberpunk',
        preview: '#ff41ff'
    },
    {
        id: 'blade-runner',
        name: 'Rustic Brown',
        description: 'Warm earthy tones',
        preview: '#8b4513'
    },
    {
        id: 'tron',
        name: 'Tron Blue',
        description: 'Electric cyan grid',
        preview: '#41ffff'
    },
    {
        id: 'hacker-red',
        name: 'Hacker Red',
        description: 'Danger zone red',
        preview: '#ff4141'
    },
    {
        id: 'synthwave',
        name: 'Synthwave Pink',
        description: 'Retro 80s vibe',
        preview: '#ff5ca8'
    },
    {
        id: 'terminal-amber',
        name: 'Terminal Amber',
        description: 'Classic amber terminal',
        preview: '#ffd700'
    },
    {
        id: 'tutifuti',
        name: 'Tutifuti',
        description: 'Sweet pink vibes',
        preview: '#c25a88'
    },
    {
        id: 'deep-blue',
        name: 'Deep Blue',
        description: 'Ocean depths',
        preview: '#3b82f6'
    },
    {
        id: 'monochrome',
        name: 'Monochrome',
        description: 'Elegant grayscale',
        preview: '#9ca3af'
    },
    {
        id: 'ghost',
        name: 'Ghost',
        description: 'Pure white spirit',
        preview: '#f3f4f6'
    },
    {
        id: 'half-life',
        name: 'Half-Life',
        description: 'Lambda orange',
        preview: '#ff6600'
    }
]

// Aplica o tema no DOM
const applyTheme = (themeId: string) => {
    if (themeId === 'matrix') {
        // Remove o atributo para usar o tema padrão
        delete document.documentElement.dataset.theme
    } else {
        // Aplica o tema customizado
        document.documentElement.dataset.theme = themeId
    }
}

export function useTheme() {
    // Acessa o gerenciador global de tema
    const globalTheme = useGlobalTheme()
    const windowId = inject<string>('windowId', 'unknown')

    // Computed para o tema atual (do estado global)
    const currentTheme = computed(() => globalTheme.state.value.currentTheme)

    // Watch para aplicar tema quando mudar no estado global
    watch(currentTheme, (newTheme) => {
        applyTheme(newTheme)
    }, { immediate: true })

    // Função para trocar tema
    const setTheme = (themeId: string) => {
        if (availableThemes.some(t => t.id === themeId)) {
            globalTheme.setTheme(themeId, windowId)
            applyTheme(themeId) // Aplica imediatamente nesta janela
        } else {
            console.warn(`Theme "${themeId}" not found`)
        }
    }

    // Função para obter informações do tema atual
    const getCurrentThemeInfo = (): Theme | undefined => {
        return availableThemes.find(t => t.id === currentTheme.value)
    }

    // Função para próximo tema (circular)
    const nextTheme = () => {
        const currentIndex = availableThemes.findIndex(t => t.id === currentTheme.value)
        const nextIndex = (currentIndex + 1) % availableThemes.length
        const nextThemeItem = availableThemes[nextIndex]
        if (nextThemeItem) {
            setTheme(nextThemeItem.id)
        }
    }

    // Função para tema anterior (circular)
    const previousTheme = () => {
        const currentIndex = availableThemes.findIndex(t => t.id === currentTheme.value)
        const previousIndex = (currentIndex - 1 + availableThemes.length) % availableThemes.length
        const previousThemeItem = availableThemes[previousIndex]
        if (previousThemeItem) {
            setTheme(previousThemeItem.id)
        }
    }

    return {
        currentTheme,
        availableThemes,
        setTheme,
        getCurrentThemeInfo,
        nextTheme,
        previousTheme
    }
}
