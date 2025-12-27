<template>
    <AutoHideOverlay 
        position="bottom-center" 
        :hide-delay="4000"
        :initial-fixed="false"
        transition-name="overlay-slide"
        :z-index="10000"
    >
        <template #default="{ isFixed, toggleFixed }">
            <div class="mini-player">
                <!-- Pin button -->
                <button 
                    class="mini-player__pin" 
                    :class="{ 'is-fixed': isFixed }"
                    @click="handleToggleFixed(toggleFixed, isFixed)"
                    :title="isFixed ? 'Unpin player' : 'Pin player'"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M19 12l-7 7-7-7" v-if="!isFixed"/>
                        <circle cx="12" cy="12" r="3" v-if="isFixed"/>
                    </svg>
                </button>

                <div class="mini-player__divider"></div>

                <!-- Track info -->
                <div class="mini-player__info">
                    <div class="mini-player__info-header">
                        <Tooltip :text="currentTrackName">
                            <template #trigger>
                                <span class="mini-player__track-name">{{ currentTrackName }}</span>
                            </template>
                        </Tooltip>
                        <span class="mini-player__track-time">{{ formatTime(audioGlobal.state.value.currentTime) }} / {{ formatTime(audioGlobal.state.value.duration) }}</span>
                    </div>
                    <!-- Progress bar -->
                    <div class="mini-player__progress-container">
                        <ProgressBar
                            :value="audioGlobal.state.value.currentTime || 0"
                            :max="audioGlobal.state.value.duration || 100"
                            @seek="onSeek"
                        />
                    </div>
                </div>

                <div class="mini-player__divider"></div>

                <!-- Controls -->
                <div class="mini-player__controls">
                    <!-- Previous -->
                    <button 
                        class="mini-player__btn"
                        @click="previousTrack"
                        :disabled="audioGlobal.state.value.currentTrackIndex === 0"
                        title="Previous track"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                        </svg>
                    </button>

                    <!-- Play/Pause -->
                    <button 
                        class="mini-player__btn mini-player__btn--primary"
                        @click="togglePlay"
                        title="Play/Pause"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path v-if="!audioGlobal.state.value.isPlaying" d="M8 5v14l11-7z"/>
                            <path v-else d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                        </svg>
                    </button>

                    <!-- Next -->
                    <button 
                        class="mini-player__btn"
                        @click="nextTrack"
                        :disabled="audioGlobal.state.value.currentTrackIndex >= audioGlobal.state.value.tracks.length - 1"
                        title="Next track"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                        </svg>
                    </button>
                </div>

                <div class="mini-player__divider"></div>

                <!-- Volume -->
                <div class="mini-player__volume">
                    <button 
                        class="mini-player__btn mini-player__btn--icon"
                        @click="toggleMute"
                        title="Mute/Unmute"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path v-if="audioGlobal.state.value.volume > 0.5" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                            <path v-else-if="audioGlobal.state.value.volume > 0" d="M7 9v6h4l5 5V4l-5 5H7z"/>
                            <path v-else d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                    </button>
                    <input 
                        type="range" 
                        class="mini-player__volume-slider"
                        min="0" 
                        max="100"
                        :value="volumePercent"
                        @input="handleVolumeChange"
                        title="Volume"
                    />
                    <span class="mini-player__volume-value">{{ volumePercent }}%</span>
                </div>

                <div class="mini-player__divider"></div>

                <!-- Playlist button -->
                <ExpandableList
                    expand-direction="up"
                    :max-height="300"
                    trigger-text="PLAYLIST"
                    title="Show playlist"
                    :close-on-click-outside="true"
                >
                    <div class="mini-player__playlist">
                        <div 
                            v-for="(track, index) in audioGlobal.state.value.tracks"
                            :key="index"
                            class="mini-player__playlist-item"
                            :class="{ 'is-active': index === audioGlobal.state.value.currentTrackIndex }"
                            @click="selectTrack(index)"
                        >
                            <span class="mini-player__playlist-number">{{ String(index + 1).padStart(2, '0') }}</span>
                            <span class="mini-player__playlist-name">{{ track.name }}</span>
                            <span v-if="track.duration" class="mini-player__playlist-duration">
                                {{ formatTime(track.duration) }}
                            </span>
                        </div>
                    </div>
                </ExpandableList>
            </div>
        </template>
    </AutoHideOverlay>
</template>

<script setup lang="ts">
import { computed, watch, inject } from 'vue'
import { AutoHideOverlay, ExpandableList, Tooltip, ProgressBar } from '../../shared'
import { useGlobalAudio } from '../../core/global'

/**
 * Mini Player - Controle compacto de áudio fixo no topo
 * 
 * Utiliza AutoHideOverlay (reutilizável) para comportamento auto-hide
 * Controla áudio via useGlobalAudio (estado compartilhado)
 */

const audioGlobal = useGlobalAudio()
const windowId = inject<string>('windowId', 'main-window')

// Debug - verificar se o componente está montando
console.log('[MiniPlayer] Component mounted', {
    windowId,
    hasAudio: !!audioGlobal,
    state: audioGlobal.state.value
})

// ========================================
// ESTADO LOCAL
// ========================================

const FIXED_STORAGE_KEY = 'mini-player-fixed'

// ========================================
// COMPUTED
// ========================================

const currentTrackName = computed(() => {
    const track = audioGlobal.currentTrack.value
    return track ? track.name : 'No track'
})

const volumePercent = computed(() => Math.round(audioGlobal.state.value.volume * 100))

// ========================================
// MÉTODOS
// ========================================

/**
 * Formata tempo em mm:ss
 */
function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Toggle play/pause
 */
function togglePlay() {
    if (audioGlobal.state.value.isPlaying) {
        audioGlobal.pause(windowId)
    } else {
        audioGlobal.play(windowId)
    }
}

/**
 * Próxima música
 */
function nextTrack() {
    audioGlobal.nextTrack(windowId)
}

/**
 * Música anterior
 */
function previousTrack() {
    audioGlobal.previousTrack(windowId)
}

/**
 * Seek na música (pular para posição)
 */
/**
 * Seek na música (pular para posição)
 */
function onSeek(time: number) {
    audioGlobal.seek(time, windowId)
}

/**
 * Toggle mute
 */
function toggleMute() {
    audioGlobal.setVolume(audioGlobal.state.value.volume > 0 ? 0 : 0.7, windowId)
}

/**
 * Ajusta volume
 */
function handleVolumeChange(event: Event) {
    const target = event.target as HTMLInputElement
    audioGlobal.setVolume(Number.parseInt(target.value) / 100, windowId)
}

/**
 * Seleciona track da playlist
 */
function selectTrack(index: number) {
    audioGlobal.selectTrack(index, windowId)
}

/**
 * Toggle fixed e persiste
 */
function handleToggleFixed(toggleFn: () => void, currentFixed: boolean) {
    toggleFn()
    localStorage.setItem(FIXED_STORAGE_KEY, (!currentFixed).toString())
}

// ========================================
// WATCHERS
// ========================================

// Log para debug (remover depois)
watch(() => audioGlobal.state.value.isPlaying, (playing) => {
    console.log('[MiniPlayer] Playing:', playing)
})
</script>

<style scoped lang="scss">
@use '../../style/base/variables' as *;
@use '../../style/overlays' as *;

.mini-player {
    @include overlay-compact;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    min-width: 600px;
    max-width: 800px;
    position: relative; // Para o ::before funcionar
    margin-bottom: 2rem; // Afasta do fundo da tela
    
    // Cores do tema (igual ao AudioControls/lower-menu)
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(15px);
    border: 1px solid var(--color-border);
    box-shadow:
        0 0 30px rgba(var(--theme-primary-rgb), 0.2),
        inset 0 0 30px rgba(var(--theme-primary-rgb), 0.05);
    
    // Efeito de scanline
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(0deg,
                rgba(var(--theme-primary-rgb), 0.03) 0px,
                transparent 1px,
                transparent 2px,
                rgba(var(--theme-primary-rgb), 0.03) 3px);
        pointer-events: none;
        border-radius: 4px;
        z-index: 0; // Atrás do conteúdo
    }
}

.mini-player__pin {
    @include overlay-pin-button;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    color: var(--color-accent);
    border-color: var(--color-border);
    
    &:hover {
        color: var(--theme-primary);
        border-color: var(--theme-primary);
        box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.3);
    }
    
    &.is-fixed {
        color: var(--theme-primary);
        background: rgba(var(--theme-primary-rgb), 0.1);
        box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.4);
    }
}

.mini-player__divider {
    @extend .overlay-divider;
    background: var(--color-border);
}

.mini-player__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 250px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
}

.mini-player__info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-sm);
}

.mini-player__track-name {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-accent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.5);
    flex: 1;
}

.mini-player__track-time {
    font-size: 0.7rem;
    color: var(--color-accent); // Mudou de var(--color-text-secondary) para cor do tema
    font-family: var(--font-mono);
    opacity: 0.8;
    flex-shrink: 0;
}

.mini-player__progress-container {
    width: 100%;
}

.mini-player__controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    position: relative;
    z-index: 1;
}

.mini-player__btn {
    background: rgba(var(--theme-primary-rgb), 0.05);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s var(--ease-smooth);
    color: var(--color-accent);
    position: relative;
    z-index: 1;

    svg {
        position: relative;
        z-index: 1;
    }

    &:hover:not(:disabled) {
        background: rgba(var(--theme-primary-rgb), 0.15);
        color: var(--theme-primary);
        border-color: var(--theme-primary);
        box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.3);
    }

    &:disabled {
        opacity: 0.2;
        cursor: not-allowed;
    }

    &--primary {
        background: rgba(var(--theme-primary-rgb), 0.2);
        color: var(--theme-primary);
        border-color: var(--theme-primary);
        box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.2);

        &:hover:not(:disabled) {
            background: rgba(var(--theme-primary-rgb), 0.3);
            box-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 0.4);
        }
    }

    &--icon {
        border: none;
        width: auto;
        padding: var(--spacing-xs);
        background: transparent;
    }
}

.mini-player__volume {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    position: relative;
    z-index: 1;
}

.mini-player__volume-slider {
    width: 80px;
    height: 4px;
    border-radius: 2px;
    background: rgba(var(--theme-primary-rgb), 0.2);
    outline: none;
    appearance: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--theme-primary);
        cursor: pointer;
        transition: all 0.2s var(--ease-smooth);
        box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.5);

        &:hover {
            transform: scale(1.2);
            box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.8);
        }
    }

    &::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--theme-primary);
        cursor: pointer;
        border: none;
        transition: all 0.2s var(--ease-smooth);
        box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.5);

        &:hover {
            transform: scale(1.2);
            box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.8);
        }
    }
}

.mini-player__volume-value {
    font-size: 0.7rem;
    color: var(--color-accent);
    font-family: var(--font-mono);
    min-width: 35px;
    text-align: right;
    opacity: 0.7;
}

// Playlist
.mini-player__playlist {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 300px;
}

.mini-player__playlist-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s var(--ease-smooth);
    background: rgba(var(--theme-primary-rgb), 0.02);
    border: 1px solid transparent;

    &:hover {
        background: rgba(var(--theme-primary-rgb), 0.1);
        border-color: var(--theme-primary);
        box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.2);
    }

    &.is-active {
        background: rgba(var(--theme-primary-rgb), 0.2);
        border-color: var(--theme-primary);
        box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.3);
        
        .mini-player__playlist-name {
            color: var(--theme-primary);
            font-weight: 600;
        }
    }
}

.mini-player__playlist-number {
    font-size: 0.7rem;
    color: var(--color-accent);
    font-family: var(--font-mono);
    opacity: 0.5;
    flex-shrink: 0;
}

.mini-player__playlist-name {
    font-size: 0.8rem;
    color: var(--color-accent);
    font-family: 'Courier New', monospace;
    letter-spacing: 0.5px;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.mini-player__playlist-duration {
    font-size: 0.7rem;
    color: var(--color-accent);
    font-family: var(--font-mono);
    opacity: 0.5;
    flex-shrink: 0;
}
</style>
