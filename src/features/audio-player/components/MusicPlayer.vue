<template>
    <div class="music-player">
        <!-- Track Info -->
        <div class="track-info">
            <h3 class="track-title">{{ currentTrack?.title || 'Selecione uma música' }}</h3>
            <div class="time-display">
                <span>{{ formatTime(currentTime) }}</span>
                <span>{{ formatTime(duration) }}</span>
            </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-container" @click="handleProgressClick">
            <div class="progress-bar">
                <div class="progress-filled" :style="{ width: progressPercent + '%' }"></div>
                <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
            </div>
        </div>

        <!-- Controls -->
        <div class="controls">
            <button @click="$emit('previous')" :disabled="!hasPrevious" class="control-btn">
                ⏮️
            </button>

            <button @click="$emit('togglePlay')" class="control-btn play-btn">
                {{ isPlaying ? '⏸️' : '▶️' }}
            </button>

            <button @click="$emit('next')" :disabled="!hasNext" class="control-btn">
                ⏭️
            </button>
        </div>

        <!-- Audio Controls -->
        <div class="audio-controls-section">
            <div class="control-group">
                <label for="volume-control">Volume</label>
                <div class="control-with-value">
                    <input id="volume-control" type="range" min="0" max="100" v-model="volume" />
                    <span class="value-display">{{ volume }}%</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useGlobalAudio } from '../../../core/global'

interface Props {
    currentTrack: { title: string; file: string } | null | undefined
    currentTrackIndex: number
    isPlaying: boolean
    currentTime: number
    duration: number
    hasNext: boolean
    hasPrevious: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    togglePlay: []
    next: []
    previous: []
    seek: [time: number]
    volumeChange: [volume: number]
}>()

const audioGlobal = useGlobalAudio()
const windowId = inject<string>('windowId', 'main-window')

const volume = computed({
    get: () => Math.round(audioGlobal.state.value.volume * 100),
    set: (v: number) => {
        audioGlobal.setVolume(v / 100, windowId)
        emit('volumeChange', v / 100)
    }
})

const progressPercent = computed(() => {
    if (props.duration === 0) return 0
    return (props.currentTime / props.duration) * 100
})

const formatTime = (seconds: number): string => {
    if (!Number.isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleProgressClick = (e: MouseEvent) => {
    const progressBar = e.currentTarget as HTMLElement
    const rect = progressBar.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const time = percent * props.duration
    emit('seek', time)
}

// volume changes handled by computed setter which updates global audio
</script>

<style scoped lang="scss">
.music-player {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-lg);
    padding-top: var(--spacing-md);
}

.track-info {
    margin-bottom: 1rem;

    .track-title {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text);
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.5);
    }

    .time-display {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--color-text-dim);
    }
}

.progress-container {
    margin-bottom: 1rem;
    cursor: pointer;
    padding: 0.5rem 0;
}

.progress-bar {
    position: relative;
    width: 100%;
    height: 4px;
    background: rgba(var(--theme-primary-rgb), 0.1);
    border-radius: 2px;
    overflow: visible;
    box-shadow: 0 0 5px rgba(var(--theme-primary-rgb), 0.2);
}

.progress-filled {
    position: absolute;
    height: 100%;
    background: var(--color-accent);
    border-radius: 2px;
    transition: width 0.1s linear;
    box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.6);
}

.progress-thumb {
    position: absolute;
    top: 50%;
    width: 12px;
    height: 12px;
    background: var(--color-text);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 8px rgba(var(--theme-primary-rgb), 0.8);
    transition: left 0.1s linear;
    border: 1px solid var(--color-accent);
}

.controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.control-btn {
    background: rgba(var(--theme-primary-rgb), 0.05);
    border: 1px solid var(--color-border);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--color-accent);
    box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.1);

    &:hover:not(:disabled) {
        background: rgba(var(--theme-primary-rgb), 0.15);
        border-color: var(--color-accent);
        transform: scale(1.1);
        box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.4);
    }

    &:active:not(:disabled) {
        transform: scale(0.95);
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    &.play-btn {
        width: 50px;
        height: 50px;
        font-size: 1.2rem;
        background: rgba(var(--theme-primary-rgb), 0.1);
        border-color: var(--color-text);
        box-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 0.3);
    }
}

.audio-controls-section {
    padding-top: 1rem;
    border-top: 1px solid rgba(var(--theme-primary-rgb), 0.2);

    .control-group {
        margin-bottom: 1rem;

        &:last-child {
            margin-bottom: 0;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
            color: var(--color-accent);
            text-shadow: 0 0 5px rgba(var(--theme-primary-rgb), 0.3);
        }

        .control-with-value {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        input[type='range'] {
            flex: 1;
            -webkit-appearance: none;
            appearance: none;
            height: 6px;
            border-radius: 3px;
            background: rgba(var(--theme-primary-rgb), 0.1);
            outline: none;
            box-shadow: 0 0 5px rgba(var(--theme-primary-rgb), 0.2);

            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: var(--color-text);
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.6);
                border: 1px solid var(--color-accent);

                &:hover {
                    transform: scale(1.2);
                    box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.8);
                }
            }

            &::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: var(--color-text);
                cursor: pointer;
                border: 1px solid var(--color-accent);
                transition: all 0.2s ease;
                box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.6);

                &:hover {
                    transform: scale(1.2);
                    box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.8);
                }
            }
        }

        .value-display {
            min-width: 50px;
            text-align: right;
            font-size: 0.85rem;
            color: var(--color-text);
            font-weight: 500;
            text-shadow: 0 0 5px rgba(var(--theme-primary-rgb), 0.3);
        }
    }
}
</style>
