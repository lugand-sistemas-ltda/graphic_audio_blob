<template>
    <Transition name="fade">
        <div v-if="isLoading" class="loading-screen" :style="{ '--theme-hue': themeHue + 'deg' }">
            <div class="matrix-rain">
                <canvas ref="canvasRef"></canvas>
            </div>
            <div class="loading-content">
                <div class="loading-logo">
                    <div class="logo-text">SPECTRAL</div>
                    <div class="logo-subtitle">AUDIO VISUALIZER</div>
                </div>
                <div class="loading-bar">
                    <div class="loading-progress" :style="{ width: `${progress}%` }"></div>
                </div>
                <div class="loading-status">{{ statusText }}</div>

                <!-- Botão Enter (aparece quando progress === 100) -->
                <Transition name="pulse">
                    <button v-if="progress >= 100" class="enter-button" @click="enterSystem">
                        <span class="enter-icon">▶</span>
                        <span class="enter-text">ENTER SYSTEM</span>
                    </button>
                </Transition>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const isLoading = ref(true)
const progress = ref(0)
const statusText = ref('INITIALIZING SYSTEM...')
const canvasRef = ref<HTMLCanvasElement | null>(null)

let animationId: number | null = null
let progressInterval: number | null = null

// Obtém o hue atual do tema lendo as CSS variables
const getCurrentThemeHue = (): number => {
    try {
        // Lê diretamente do :root
        const rootStyles = getComputedStyle(document.documentElement)
        const rgbString = rootStyles.getPropertyValue('--theme-primary-rgb').trim()

        if (rgbString && rgbString !== '') {
            const values = rgbString.split(',').map((v: string) => Number.parseInt(v.trim()))
            const r = (values[0] ?? 0) / 255
            const g = (values[1] ?? 0) / 255
            const b = (values[2] ?? 0) / 255

            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            let h = 0

            if (max !== min) {
                const d = max - min
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0)
                        break
                    case g:
                        h = (b - r) / d + 2
                        break
                    case b:
                        h = (r - g) / d + 4
                        break
                }
                h /= 6
            }

            return Math.round(h * 360)
        }
    } catch (error) {
        console.error('[LoadingScreen] Error reading theme:', error)
    }

    // Default verde Matrix
    return 120
}

const themeHue = ref(getCurrentThemeHue())

// Watch para mudanças no tema
watch(themeHue, () => {
    // Canvas atualiza automaticamente usando themeHue.value no próximo frame
})

// Atualiza o hue lendo novamente do CSS
const updateThemeHue = () => {
    const newHue = getCurrentThemeHue()
    if (newHue !== themeHue.value) {
        themeHue.value = newHue
    }
}

// Matrix Rain Effect com cor do tema
const initMatrixRain = () => {
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const fontSize = 14
    const columns = canvas.width / fontSize
    const drops: number[] = []

    // Initialize drops
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -100)
    }

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ'

    const draw = () => {
        // Semi-transparent black to create trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Cor do tema (lê o hue reativo em tempo real)
        ctx.fillStyle = `hsl(${themeHue.value}, 100%, 50%)`
        ctx.font = `${fontSize}px monospace`

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)]
            if (!char) continue

            const dropY = drops[i]
            if (dropY === undefined) continue

            const x = i * fontSize
            const y = dropY * fontSize

            ctx.fillText(char, x, y)

            // Random reset
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0
            }

            drops[i] = dropY + 1
        }

        animationId = requestAnimationFrame(draw)
    }

    draw()
}

// Simulate loading progress
const simulateLoading = () => {
    const steps = [
        { progress: 20, text: 'LOADING AUDIO ENGINE...', delay: 300 },
        { progress: 40, text: 'INITIALIZING VISUAL EFFECTS...', delay: 400 },
        { progress: 60, text: 'CONFIGURING COMPONENTS...', delay: 300 },
        { progress: 80, text: 'ESTABLISHING CONNECTIONS...', delay: 400 },
        { progress: 100, text: 'SYSTEM READY - PRESS ENTER', delay: 0 }
    ]

    let currentStep = 0

    const nextStep = () => {
        if (currentStep >= steps.length) {
            return
        }

        const step = steps[currentStep]
        if (!step) return

        progress.value = step.progress
        statusText.value = step.text

        if (step.progress === 100) {
            console.log('[LoadingScreen] Progress reached 100%, button should appear now')
        }

        currentStep++
        if (currentStep < steps.length) {
            progressInterval = window.setTimeout(nextStep, step.delay)
        }
    }

    nextStep()
}

// Entra no sistema
const enterSystem = () => {
    console.log('[LoadingScreen] enterSystem called, setting isLoading to false')
    isLoading.value = false
    console.log('[LoadingScreen] isLoading is now:', isLoading.value)
}

onMounted(() => {
    initMatrixRain()
    simulateLoading()

    // Verifica periodicamente se o tema mudou (a cada 500ms)
    const themeCheckInterval = setInterval(() => {
        updateThemeHue()
    }, 500)

    // Handle resize
    const handleResize = () => {
        if (canvasRef.value) {
            canvasRef.value.width = window.innerWidth
            canvasRef.value.height = window.innerHeight
        }
    }
    window.addEventListener('resize', handleResize)

    onUnmounted(() => {
        if (animationId) cancelAnimationFrame(animationId)
        if (progressInterval) clearTimeout(progressInterval)
        clearInterval(themeCheckInterval)
        window.removeEventListener('resize', handleResize)
    })
})

defineExpose({
    isLoading
})
</script>

<style scoped lang="scss">
@use '../style/variables' as *;

.loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99999;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.matrix-rain {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.3;

    canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
}

.loading-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xl);
    padding: var(--spacing-xl);
}

.loading-logo {
    text-align: center;
    font-family: var(--font-family-mono);

    .logo-text {
        font-size: 3rem;
        font-weight: bold;
        color: var(--color-theme-primary);
        text-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 0.8),
            0 0 40px rgba(var(--theme-primary-rgb), 0.5);
        letter-spacing: 8px;
        animation: glitch 3s infinite;
    }

    .logo-subtitle {
        font-size: 1.2rem;
        color: var(--color-text-dim);
        letter-spacing: 4px;
        margin-top: var(--spacing-sm);
        opacity: 0.8;
    }
}

.loading-bar {
    width: 400px;
    max-width: 80vw;
    height: 4px;
    background: rgba(var(--theme-primary-rgb), 0.1);
    border: 1px solid rgba(var(--theme-primary-rgb), 0.3);
    border-radius: 2px;
    overflow: hidden;
    position: relative;

    .loading-progress {
        height: 100%;
        background: linear-gradient(90deg,
                transparent,
                var(--color-theme-primary),
                var(--color-theme-primary),
                transparent);
        box-shadow: var(--glow-md);
        transition: width var(--transition-base);
        animation: shimmer 1.5s infinite;
    }
}

.loading-status {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);
    color: var(--color-text-dim);
    letter-spacing: 2px;
    animation: pulse 2s infinite;
}

.enter-button {
    margin-top: var(--spacing-lg);
    padding: var(--spacing-lg) 2.5rem;
    background: linear-gradient(135deg,
            rgba(var(--theme-primary-rgb), 0.3),
            rgba(var(--theme-primary-rgb), 0.3));
    border: 2px solid rgba(var(--theme-primary-rgb), 0.8);
    border-radius: 8px;
    color: var(--color-theme-primary);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-md);
    font-weight: bold;
    letter-spacing: 3px;
    cursor: pointer;
    transition: all var(--transition-base);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: var(--glow-lg);
    animation: glow 2s infinite;

    &:hover {
        background: linear-gradient(135deg,
                rgba(var(--theme-primary-rgb), 0.5),
                rgba(var(--theme-primary-rgb), 0.5));
        border-color: var(--color-theme-primary);
        transform: translateY(-4px) scale(1.05);
        box-shadow: var(--glow-xl),
            0 10px 30px rgba(0, 0, 0, 0.5);
    }

    &:active {
        transform: translateY(-2px) scale(1.02);
    }

    .enter-icon {
        font-size: 1.3rem;
        animation: arrow-pulse 1.5s infinite;
    }
}

@keyframes glow {

    0%,
    100% {
        box-shadow: var(--glow-lg);
    }

    50% {
        box-shadow: var(--glow-xl);
    }
}

@keyframes arrow-pulse {

    0%,
    100% {
        transform: translateX(0);
        opacity: 1;
    }

    50% {
        transform: translateX(5px);
        opacity: 0.7;
    }
}

@keyframes glitch {

    0%,
    98%,
    100% {
        text-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 0.8),
            0 0 40px rgba(var(--theme-primary-rgb), 0.5);
    }

    99% {
        text-shadow: -5px 0 20px rgba(255, 0, 0, 0.5),
            5px 0 20px rgba(0, 0, 255, 0.5);
    }
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(400%);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity var(--transition-slow);
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

// Transição do botão Enter
.pulse-enter-active {
    animation: button-appear 0.6s ease-out;
}

@keyframes button-appear {
    0% {
        opacity: 0;
        transform: scale(0.8) translateY(20px);
    }

    60% {
        transform: scale(1.1) translateY(-5px);
    }

    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
</style>
