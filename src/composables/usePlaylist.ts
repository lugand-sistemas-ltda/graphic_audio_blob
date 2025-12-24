import { ref, computed } from 'vue'

export interface Track {
    id: string
    title: string
    file: string
}

// Carrega automaticamente todos os arquivos .mp3 da pasta music
const musicFiles = import.meta.glob<string>('/src/assets/music/*.mp3', {
    eager: true,
    query: '?url',
    import: 'default'
})

// Converte os arquivos para o formato Track
const loadTracks = (): Track[] => {
    const trackList: Track[] = []

    Object.entries(musicFiles).forEach(([path, url], index) => {
        // Extrai o nome do arquivo sem extensão
        const fileName = path.split('/').pop()?.replace('.mp3', '') || 'Unknown'

        trackList.push({
            id: String(index + 1),
            title: fileName,
            file: url
        })
    })

    // Ordena alfabeticamente pelo título
    return trackList.sort((a, b) => a.title.localeCompare(b.title))
}

export const usePlaylist = () => {
    const tracks = ref<Track[]>(loadTracks())

    const currentTrackIndex = ref(0)

    const currentTrack = computed(() => tracks.value[currentTrackIndex.value])

    const hasNext = computed(() => currentTrackIndex.value < tracks.value.length - 1)

    const hasPrevious = computed(() => currentTrackIndex.value > 0)

    const nextTrack = () => {
        if (hasNext.value) {
            currentTrackIndex.value++
            return currentTrack.value
        }
        return null
    }

    const previousTrack = () => {
        if (hasPrevious.value) {
            currentTrackIndex.value--
            return currentTrack.value
        }
        return null
    }

    const selectTrack = (index: number) => {
        if (index >= 0 && index < tracks.value.length) {
            currentTrackIndex.value = index
            return currentTrack.value
        }
        return null
    }

    return {
        tracks,
        currentTrack,
        currentTrackIndex,
        hasNext,
        hasPrevious,
        nextTrack,
        previousTrack,
        selectTrack
    }
}
