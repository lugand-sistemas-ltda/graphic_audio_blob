<template>
    <div class="sound-control" v-draggable="{ id: 'sound-control', handle: '.sound-header' }">
        <div class="sound-header">
            <span class="sound-title">[ SOUND CONTROL ]</span>
            <button class="collapse-toggle" @click="toggleExpanded" :aria-label="isExpanded ? 'Collapse' : 'Expand'">
                {{ isExpanded ? '−' : '+' }}
            </button>
        </div>

        <div v-if="isExpanded" class="sound-content">
            <!-- Music Player -->
            <MusicPlayer :current-track="currentTrack" :current-track-index="currentTrackIndex" :is-playing="isPlaying"
                :current-time="currentTime" :duration="duration" :has-next="hasNext" :has-previous="hasPrevious"
                @toggle-play="$emit('togglePlay')" @next="$emit('next')" @previous="$emit('previous')"
                @seek="$emit('seek', $event)" @volume-change="$emit('volumeChange', $event)" />

            <!-- Playlist -->
            <Playlist :tracks="tracks" :current-track-index="currentTrackIndex"
                @select-track="$emit('selectTrack', $event)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import MusicPlayer from './MusicPlayer.vue'
import Playlist from './Playlist.vue'
import type { Track } from '../composables/usePlaylist'
import { useCollapsible } from '../composables/useCollapsible'
import { useVisibilityReload } from '../composables/useVisibilityReload'

const { isExpanded, toggle: toggleExpanded, reloadState } = useCollapsible({ id: 'sound-control', initialState: true })

// Detecta quando o componente fica visível e recarrega o estado
useVisibilityReload({
    selector: '.sound-control',
    onVisible: reloadState
})

interface Props {
    tracks: Track[]
    currentTrack: Track | null | undefined
    currentTrackIndex: number
    isPlaying: boolean
    currentTime: number
    duration: number
    hasNext: boolean
    hasPrevious: boolean
}

defineProps<Props>()

defineEmits<{
    togglePlay: []
    next: []
    previous: []
    selectTrack: [index: number]
    seek: [time: number]
    volumeChange: [volume: number]
}>()
</script>

<style scoped lang="scss">
@use '../style/base/variables' as *;
@use '../style/mixins' as *;

.sound-control {
    @include draggable-container;
    z-index: var(--z-header);

    .sound-header {
        @include draggable-header;

        .sound-title {
            @include draggable-title;
        }

        .collapse-toggle {
            @include draggable-collapse-toggle;
        }
    }

    .sound-content {
        @include draggable-content;
        gap: 0;
    }
}
</style>
