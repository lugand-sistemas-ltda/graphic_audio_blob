/**
 * @fileoverview Helpers compartilhados para efeitos visuais
 * Lógica reutilizável entre diferentes tipos de efeitos
 */

import type { EffectThemeConfig } from '../types'

/**
 * Composable para gerenciar posição do mouse e auto-center
 * Lógica compartilhada entre todos os efeitos visuais
 */
export const useMousePosition = () => {
    let mouseX = 50 // Posição X em % (0-100)
    let mouseY = 50 // Posição Y em % (0-100)
    let mouse3DOffset = { x: 0, y: 0 } // Offset para efeito 3D
    let isMouseInsideWindow = true
    let mouseFollowEnabled = true
    let autoCenterEnabled = true

    /**
     * Atualiza posição do mouse baseado nos controles ativos
     */
    const updateMousePosition = () => {
        let targetX: number
        let targetY: number

        // Mouse follow desabilitado = sempre no centro
        if (!mouseFollowEnabled) {
            targetX = 0
            targetY = 0
            mouseX = 50
            mouseY = 50
        }
        // Auto-center ativo + mouse fora = volta ao centro gradualmente
        else if (autoCenterEnabled && !isMouseInsideWindow) {
            targetX = 0
            targetY = 0
            // Transição suave para o centro (2% por frame)
            mouseX += (50 - mouseX) * 0.02
            mouseY += (50 - mouseY) * 0.02
        }
        // Comportamento normal - segue o mouse
        else {
            targetX = (mouseX - 50) * 0.5
            targetY = (mouseY - 50) * 0.5
        }

        // Interpolação suave do offset 3D
        mouse3DOffset.x += (targetX - mouse3DOffset.x) * 0.1
        mouse3DOffset.y += (targetY - mouse3DOffset.y) * 0.1
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (mouseFollowEnabled) {
            mouseX = (e.clientX / window.innerWidth) * 100
            mouseY = (e.clientY / window.innerHeight) * 100
            isMouseInsideWindow = true
        }
    }

    const handleMouseEnter = () => {
        isMouseInsideWindow = true
    }

    const handleMouseLeave = () => {
        isMouseInsideWindow = false
    }

    const setMouseFollow = (enabled: boolean) => {
        mouseFollowEnabled = enabled
        if (!enabled) {
            mouseX = 50
            mouseY = 50
            mouse3DOffset = { x: 0, y: 0 }
        }
    }

    const setAutoCenter = (enabled: boolean) => {
        autoCenterEnabled = enabled
    }

    return {
        // Estado
        get mouseX() { return mouseX },
        get mouseY() { return mouseY },
        get mouse3DOffset() { return mouse3DOffset },
        get mouseFollowEnabled() { return mouseFollowEnabled },
        get autoCenterEnabled() { return autoCenterEnabled },

        // Métodos
        updateMousePosition,
        handleMouseMove,
        handleMouseEnter,
        handleMouseLeave,
        setMouseFollow,
        setAutoCenter
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
