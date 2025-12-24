import { ref, watch } from 'vue'

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

const STORAGE_KEY = 'audio-visualizer-theme'

// Estado reativo do tema atual
const currentTheme = ref<string>('matrix')

// Carrega tema do localStorage na inicialização
const loadThemeFromStorage = (): string => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved && availableThemes.some(t => t.id === saved)) {
            return saved
        }
    } catch (error) {
        console.warn('Failed to load theme from localStorage:', error)
    }
    return 'matrix'
}

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

// Salva tema no localStorage
const saveThemeToStorage = (themeId: string) => {
    try {
        localStorage.setItem(STORAGE_KEY, themeId)
    } catch (error) {
        console.warn('Failed to save theme to localStorage:', error)
    }
}

export function useTheme() {
    // Inicializa tema na primeira chamada
    if (currentTheme.value === 'matrix' && globalThis.window !== undefined) {
        const savedTheme = loadThemeFromStorage()
        currentTheme.value = savedTheme
        applyTheme(savedTheme)
    }

    // Watch para aplicar tema quando mudar
    watch(currentTheme, (newTheme) => {
        applyTheme(newTheme)
        saveThemeToStorage(newTheme)
    })

    // Função para trocar tema
    const setTheme = (themeId: string) => {
        if (availableThemes.some(t => t.id === themeId)) {
            currentTheme.value = themeId
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
