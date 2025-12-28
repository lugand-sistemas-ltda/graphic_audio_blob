/**
 * @fileoverview Helpers compartilhados para efeitos visuais
 * Lógica reutilizável entre diferentes tipos de efeitos
 */

import type { EffectThemeConfig } from '../types'

// 🎯 ESTADO COMPARTILHADO GLOBALMENTE (singleton)
// APENAS A POSIÇÃO RAW DO MOUSE É COMPARTILHADA
let sharedMouseX = 50 // Posição X em % (0-100) - RAW position
let sharedMouseY = 50 // Posição Y em % (0-100) - RAW position
let sharedIsMouseInsideWindow = true

// Contador de instâncias ativas (para gerenciar event listeners)
let activeInstances = 0

/**
 * Composable para gerenciar posição do mouse e auto-center
 * Cada instância tem seus PRÓPRIOS flags (mouseFollow/autoCenter)
 * mas COMPARTILHA a posição raw do mouse para sincronização
 */
export const useMousePosition = () => {
    // 🎯 FLAGS LOCAIS - CADA EFEITO TEM OS SEUS PRÓPRIOS
    let mouseFollowEnabled = true
    let autoCenterEnabled = true
    let mouse3DOffset = { x: 0, y: 0 } // Offset 3D local de cada efeito

    /**
     * Atualiza posição do mouse baseado nos controles ativos LOCAIS
     */
    const updateMousePosition = () => {
        let targetX: number
        let targetY: number

        // Mouse follow desabilitado = sempre no centro
        if (!mouseFollowEnabled) {
            targetX = 0
            targetY = 0
        }
        // Auto-center ativo + mouse fora = volta ao centro gradualmente
        else if (autoCenterEnabled && !sharedIsMouseInsideWindow) {
            targetX = 0
            targetY = 0
        }
        // Comportamento normal - segue o mouse (usa posição RAW compartilhada)
        else {
            targetX = (sharedMouseX - 50) * 0.5
            targetY = (sharedMouseY - 50) * 0.5
        }

        // Interpolação suave do offset 3D LOCAL
        mouse3DOffset.x += (targetX - mouse3DOffset.x) * 0.1
        mouse3DOffset.y += (targetY - mouse3DOffset.y) * 0.1
    }

    // 🎯 Event handlers compartilhados (atualizam posição RAW global)
    const handleMouseMove = (e: MouseEvent) => {
        sharedMouseX = (e.clientX / window.innerWidth) * 100
        sharedMouseY = (e.clientY / window.innerHeight) * 100
        sharedIsMouseInsideWindow = true
    }

    const handleMouseEnter = () => {
        sharedIsMouseInsideWindow = true
    }

    const handleMouseLeave = () => {
        sharedIsMouseInsideWindow = false
    }

    // 🎯 Controles LOCAIS (não afetam outros efeitos)
    const setMouseFollow = (enabled: boolean) => {
        mouseFollowEnabled = enabled
        if (!enabled) {
            mouse3DOffset = { x: 0, y: 0 }
        }
    }

    const setAutoCenter = (enabled: boolean) => {
        autoCenterEnabled = enabled
    }

    /**
     * Inicia event listeners de mouse (compartilhados)
     * Usa contador para evitar múltiplos event listeners
     */
    const start = () => {
        activeInstances++

        // Só adiciona listeners na primeira instância
        if (activeInstances === 1) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseenter', handleMouseEnter)
            document.addEventListener('mouseleave', handleMouseLeave)
            console.log('[useMousePosition] 🎯 Event listeners iniciados')
        }
    }

    /**
     * Remove event listeners de mouse quando todas instâncias pararem
     */
    const stop = () => {
        activeInstances--

        // Só remove listeners quando não há mais instâncias ativas
        if (activeInstances === 0) {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseenter', handleMouseEnter)
            document.removeEventListener('mouseleave', handleMouseLeave)
            console.log('[useMousePosition] 🛑 Event listeners removidos')
        }
    }

    return {
        // 🎯 Posição RAW compartilhada (global)
        get mouseX() { return sharedMouseX },
        get mouseY() { return sharedMouseY },
        get isMouseInsideWindow() { return sharedIsMouseInsideWindow },

        // 🎯 Estado local de cada efeito
        get mouse3DOffset() { return mouse3DOffset },
        get mouseFollowEnabled() { return mouseFollowEnabled },
        get autoCenterEnabled() { return autoCenterEnabled },

        // Métodos
        updateMousePosition,
        handleMouseMove,
        handleMouseEnter,
        handleMouseLeave,
        setMouseFollow,
        setAutoCenter,
        start,
        stop
    }
}

/**
 * Composable para gerenciar tema/cores dos efeitos
 * Detecta mudanças no tema e converte RGB para HSL
 */
export const useEffectTheme = () => {
    let currentTheme: EffectThemeConfig = {
        hue: 120,
        saturation: 85,
        rgb: { r: 0, g: 255, b: 0 }
    }

    let themeObserver: MutationObserver | null = null
    let rgbPollingInterval: number | null = null
    let lastRgbValue = ''

    /**
     * Atualiza o hue e saturação baseados na cor do tema atual
     */
    const updateTheme = () => {
        const root = document.documentElement
        const rgb = getComputedStyle(root).getPropertyValue('--theme-primary-rgb').trim()

        if (rgb) {
            const values = rgb.split(',').map(v => Number.parseInt(v.trim()))
            const r = (values[0] ?? 0) / 255
            const g = (values[1] ?? 0) / 255
            const b = (values[2] ?? 0) / 255

            currentTheme.rgb = {
                r: values[0] ?? 0,
                g: values[1] ?? 0,
                b: values[2] ?? 0
            }

            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            let h = 0
            let s = 0

            const l = (max + min) / 2
            if (max !== min) {
                const d = max - min
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
                    case g: h = ((b - r) / d + 2) / 6; break
                    case b: h = ((r - g) / d + 4) / 6; break
                }
            }

            currentTheme.hue = Math.round(h * 360)
            currentTheme.saturation = Math.round(s * 100)
        }
    }

    /**
     * Inicia observação de mudanças no tema
     */
    const startThemeObserver = () => {
        updateTheme()

        // Observa mudanças no atributo data-theme
        themeObserver = new MutationObserver(() => {
            updateTheme()
        })

        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        })

        // Polling para detectar mudanças nas variáveis CSS (modo RGB)
        rgbPollingInterval = globalThis.setInterval(() => {
            const root = document.documentElement
            const currentRgb = getComputedStyle(root).getPropertyValue('--theme-primary-rgb').trim()

            if (currentRgb !== lastRgbValue) {
                lastRgbValue = currentRgb
                updateTheme()
            }
        }, 16) // ~60fps
    }

    /**
     * Para observação do tema
     */
    const stopThemeObserver = () => {
        themeObserver?.disconnect()
        if (rgbPollingInterval !== null) {
            clearInterval(rgbPollingInterval)
            rgbPollingInterval = null
        }
    }

    return {
        get theme() { return currentTheme },
        updateTheme,
        startThemeObserver,
        stopThemeObserver
    }
}
