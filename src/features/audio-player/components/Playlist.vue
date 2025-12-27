<template>
    <div class="playlist-container">
        <button @click="showPlaylist = !showPlaylist" class="playlist-toggle">
            {{ showPlaylist ? '▼ Ocultar Playlist' : '▲ Mostrar Playlist' }}
        </button>

        <div class="playlist" v-if="showPlaylist">
            <div v-for="(track, index) in tracks" :key="track.id" @click="$emit('selectTrack', index)"
                class="playlist-item" :class="{ active: index === currentTrackIndex }">
                <span class="track-number">{{ index + 1 }}</span>
                <span class="track-name">{{ track.title }}</span>
                <span v-if="index === currentTrackIndex" class="playing-indicator">♪</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Track } from '../composables/usePlaylist'

interface Props {
    tracks: Track[]
    currentTrackIndex: number
}

defineProps<Props>()

defineEmits<{
    selectTrack: [index: number]
}>()

const showPlaylist = ref(false)
</script>

<style scoped lang="scss">
@use '../../../style/mixins' as *;

.playlist-container {
    margin-top: 1rem;
}

.playlist-toggle {
    width: 100%;
    padding: 0.75rem;
    background: rgba(var(--theme-primary-rgb), 0.05);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-accent);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-family: 'Courier New', monospace;
    text-shadow: 0 0 5px rgba(var(--theme-primary-rgb), 0.3);
    box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.1);

    &:hover {
        background: rgba(var(--theme-primary-rgb), 0.1);
        border-color: var(--color-accent);
        transform: translateY(-2px);
        box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.3);
    }
}

.playlist {
    margin-top: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 4px;
    padding: 0.5rem;
    border: 1px solid rgba(var(--theme-primary-rgb), 0.2);
    box-shadow: inset 0 0 20px rgba(var(--theme-primary-rgb), 0.05);
    @include custom-scrollbar(8px, 0.05, 0.3, 0.5);
}

.playlist-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
    font-family: 'Courier New', monospace;
    border: 1px solid transparent;

    &:hover {
        background: rgba(var(--theme-primary-rgb), 0.1);
        border-color: rgba(var(--theme-primary-rgb), 0.2);
        box-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.2);
    }

    &.active {
        background: rgba(var(--theme-primary-rgb), 0.15);
        border: 1px solid var(--color-border);
        box-shadow: 0 0 15px rgba(var(--theme-primary-rgb), 0.3);
    }

    .track-number {
        font-size: 0.85rem;
        color: var(--color-text-dim);
        min-width: 1.5rem;
        text-shadow: 0 0 5px rgba(var(--theme-primary-rgb), 0.3);
    }

    .track-name {
        flex: 1;
        font-size: 0.9rem;
        color: var(--color-accent);
        text-shadow: 0 0 5px rgba(var(--theme-primary-rgb), 0.3);
    }

    .playing-indicator {
        font-size: 1rem;
        color: var(--color-text);
        animation: pulse 1.5s ease-in-out infinite;
        text-shadow: 0 0 10px rgba(var(--theme-primary-rgb), 0.6);
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
</style>
