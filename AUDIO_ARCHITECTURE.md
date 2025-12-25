# 🎵 Audio Architecture

> **Provider/Consumer pattern for multi-window audio synchronization**

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Key Concepts](#key-concepts)
4. [GlobalAudio API](#globalaudio-api)
5. [Audio Analyzer](#audio-analyzer)
6. [Frequency Analysis](#frequency-analysis)
7. [Data Flow](#data-flow)
8. [Code Examples](#code-examples)

---

## Overview

The audio system uses a **Provider/Consumer architecture** to ensure:

- ✅ **Single audio source** - Only MAIN window creates `<audio>` element
- ✅ **Zero echo/delay** - No duplicate playback across windows
- ✅ **60fps sync** - BroadcastChannel delivers frequency data in real-time
- ✅ **Scalability** - New components automatically consume global audio

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    GLOBAL AUDIO STATE                        │
│                        (Singleton)                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  state: {                                              │ │
│  │    audioOwner: "window-main-abc123"                    │ │
│  │    isPlaying: true                                     │ │
│  │    volume: 0.8                                         │ │
│  │    currentTime: 45.3                                   │ │
│  │    duration: 180.5                                     │ │
│  │    currentTrackIndex: 2                                │ │
│  │    frequencyData: {                                    │ │
│  │      bass: 128    // 0-255                             │ │
│  │      mid: 96      // 0-255                             │ │
│  │      treble: 64   // 0-255                             │ │
│  │      overall: 96  // 0-255                             │ │
│  │      beat: false                                       │ │
│  │      frequencyBands: [120,110,95,80,70,60,50,40]      │ │
│  │      raw: Uint8Array[256]                              │ │
│  │    }                                                   │ │
│  │  }                                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│         BroadcastChannel Sync (60fps, zero latency)         │
└──────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  MAIN WINDOW     │  │  CHILD WINDOW 1  │  │  CHILD WINDOW 2  │
│  (PROVIDER)      │  │  (CONSUMER)      │  │  (CONSUMER)      │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ <audio> ✅       │  │ <audio> ❌       │  │ <audio> ❌       │
│                  │  │                  │  │                  │
│ AudioContext     │  │                  │  │                  │
│ AnalyserNode     │  │                  │  │                  │
│ FFT 512 bins     │  │                  │  │                  │
│     │            │  │                  │  │                  │
│     ▼            │  │                  │  │                  │
│ Frequency ───────┼──┼──────────────────┼──┼─────────────────►│
│   Data @60fps    │  │                  │  │                  │
│     │            │  │        ▼         │  │        ▼         │
│     ▼            │  │   FrequencyViz   │  │   Spectral       │
│ Components       │  │   MusicPlayer    │  │   Effects        │
│ - MusicPlayer    │  │                  │  │   DebugTerminal  │
│ - FrequencyViz   │  │                  │  │                  │
│ - Spectral       │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Key Concepts

### 1. Audio Owner

**Definition**: The window that creates the physical `<audio>` element and performs FFT analysis

**How it works**:

```typescript
// App.vue - MAIN window
const isMainWindow = detectIsMainWindow(); // true

if (isMainWindow) {
  const success = globalAudio.registerAudioOwner(windowId);

  if (success) {
    // Create <audio> element
    const audioElement = document.createElement("audio");
    audioElement.crossOrigin = "anonymous";
    document.body.appendChild(audioElement);

    // Initialize analyzer
    audio = useAudioAnalyzer(audioElement);
    audio.initAudio(currentTrack.file);

    // Start broadcast loop @ 60fps
    startAudioSyncLoop();
  }
}
```

**Protection against duplicates**:

```typescript
// src/core/global/useGlobalAudio.ts
const registerAudioOwner = (windowId: string) => {
  if (state.value.audioOwner && state.value.audioOwner !== windowId) {
    console.warn("[GlobalAudio] ⚠️ Audio owner already exists, rejecting");
    return false;
  }

  state.value.audioOwner = windowId;
  broadcast("GLOBAL_AUDIO_OWNER", { windowId });
  return true;
};
```

### 2. Frequency Data Flow

```
MAIN Window (60 times per second):

  <audio>.play() → AudioBuffer
      ↓
  AnalyserNode.getByteFrequencyData()
      ↓
  Uint8Array[256] FFT bins
      ↓
  Process into 8 frequency bands
      ↓
  globalAudio.updateFrequencyData(data)
      ↓
  BroadcastChannel.postMessage('GLOBAL_AUDIO_DATA')
      ↓
  ALL WINDOWS receive data instantly
```

### 3. Consumer Pattern

```vue
<!-- Any component in any window -->
<script setup lang="ts">
import { computed } from "vue";
import { useGlobalAudio } from "@/core/global";

const globalAudio = useGlobalAudio();

// Reactive - updates 60x/second automatically
const bassLevel = computed(() => globalAudio.state.value.frequencyData.bass);
const beatDetected = computed(() => globalAudio.state.value.frequencyData.beat);
const isPlaying = computed(() => globalAudio.state.value.isPlaying);
</script>

<template>
  <div>Bass: {{ bassLevel }}</div>
</template>
```

---

## GlobalAudio API

### State (Reactive)

```typescript
interface GlobalAudioState {
  audioOwner: string | null; // Window ID of audio owner
  isPlaying: boolean; // Playback state
  currentTime: number; // Current position in seconds
  duration: number; // Total track duration
  volume: number; // 0.0 to 1.0
  currentTrackIndex: number; // Index in playlist
  frequencyData: AudioFrequencyData; // FFT analysis data
}

interface AudioFrequencyData {
  bass: number; // 0-255 (graves)
  mid: number; // 0-255 (médios)
  treble: number; // 0-255 (agudos)
  overall: number; // 0-255 (volume geral)
  beat: boolean; // Beat detectado
  frequencyBands: number[]; // [8 bands] 0-255 each
  raw: Uint8Array; // FFT raw data (256 bins)
}
```

### Methods

```typescript
// Registration
globalAudio.registerAudioOwner(windowId: string): boolean
globalAudio.hasAudioOwner: ComputedRef<boolean>

// Playback controls (works from any window)
globalAudio.play(windowId: string): void
globalAudio.pause(windowId: string): void
globalAudio.seek(time: number, windowId: string): void
globalAudio.setVolume(volume: number, windowId: string): void

// Track controls
globalAudio.nextTrack(windowId: string): void
globalAudio.previousTrack(windowId: string): void
globalAudio.selectTrack(index: number, windowId: string): void

// Data updates (MAIN window only)
globalAudio.updateFrequencyData(data: AudioFrequencyData): void
globalAudio.updatePlaybackState(state: Partial<GlobalAudioState>): void
```

---

## Audio Analyzer

### Setup (MAIN Window Only)

```typescript
// src/composables/useAudioAnalyzer.ts
export const useAudioAnalyzer = (audioElement: HTMLAudioElement) => {
  // Create AudioContext
  const audioContext = new AudioContext();

  // Create AnalyserNode
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512; // 256 frequency bins
  analyser.smoothingTimeConstant = 0.8;

  // Connect audio element to analyser
  const source = audioContext.createMediaElementSource(audioElement);
  source.connect(analyser);
  analyser.connect(audioContext.destination);

  // Data array for FFT results
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  return {
    analyser,
    dataArray,
    getFrequencyData: () => {
      analyser.getByteFrequencyData(dataArray);
      return processFrequencyData(dataArray);
    },
  };
};
```

### FFT Processing

```typescript
const processFrequencyData = (dataArray: Uint8Array): AudioFrequencyData => {
  // Bass: bins 0-5 (20-60Hz)
  const bass = average(dataArray.slice(0, 5));

  // Mid: bins 10-40 (250Hz-2kHz)
  const mid = average(dataArray.slice(10, 40));

  // Treble: bins 100-180 (6kHz-22kHz)
  const treble = average(dataArray.slice(100, 180));

  // Overall: average of all bins
  const overall = average(dataArray);

  // Beat detection
  const beat = overall > 200 && Date.now() - lastBeatTime > 300;
  if (beat) lastBeatTime = Date.now();

  // 8 frequency bands (logarithmic distribution)
  const frequencyBands = [
    average(dataArray.slice(0, 2)), // 20-60Hz (Sub-bass)
    average(dataArray.slice(2, 6)), // 60-250Hz (Bass)
    average(dataArray.slice(6, 12)), // 250-500Hz (Low-mid)
    average(dataArray.slice(12, 40)), // 500-2kHz (Mid)
    average(dataArray.slice(40, 80)), // 2-4kHz (High-mid)
    average(dataArray.slice(80, 120)), // 4-6kHz (Presence)
    average(dataArray.slice(120, 160)), // 6-10kHz (Brilliance)
    average(dataArray.slice(160, 256)), // 10-22kHz (Air)
  ];

  return {
    bass,
    mid,
    treble,
    overall,
    beat,
    frequencyBands,
    raw: new Uint8Array(dataArray),
  };
};
```

---

## Frequency Analysis

### 8-Band Frequency Spectrum

| Band | Frequency Range | Description    | Musical Content               |
| ---- | --------------- | -------------- | ----------------------------- |
| 0    | 20-60Hz         | **Sub-bass**   | Kick drum low end, sub-synths |
| 1    | 60-250Hz        | **Bass**       | Kick drum body, bass guitar   |
| 2    | 250-500Hz       | **Low-mid**    | Male vocals, guitar body      |
| 3    | 500-2kHz        | **Mid**        | Vocals, guitars, snare        |
| 4    | 2-4kHz          | **High-mid**   | Vocal clarity, snare snap     |
| 5    | 4-6kHz          | **Presence**   | Vocal presence, hi-hats       |
| 6    | 6-10kHz         | **Brilliance** | Cymbals, guitar shimmer       |
| 7    | 10-22kHz        | **Air**        | Brightness, room ambience     |

### Beat Detection

**Algorithm**:

```typescript
const detectBeat = (overall: number): boolean => {
  const threshold = 200; // Configurable sensitivity
  const cooldown = 300; // ms between beats

  if (overall > threshold && Date.now() - lastBeatTime > cooldown) {
    lastBeatTime = Date.now();
    return true;
  }

  return false;
};
```

**Why cooldown?**

- Prevents false positives from sustained loud sounds
- Ensures beats are detected as discrete events

---

## Data Flow

### MAIN Window (Provider)

```typescript
// App.vue - Audio sync loop
const syncAudioData = () => {
  // 1. Get frequency data from analyzer
  const frequencyData = audio.getFrequencyData();

  // 2. Update GlobalAudio state
  globalAudio.updateFrequencyData(frequencyData);

  // 3. Broadcast to all windows
  broadcast.send("GLOBAL_AUDIO_DATA", {
    frequencyData,
    isPlaying: audio.isPlaying.value,
    currentTime: audio.currentTime.value,
    volume: audio.volume.value,
  });

  // 4. Next frame
  requestAnimationFrame(syncAudioData);
};
```

### CHILD Windows (Consumers)

```typescript
// App.vue - Listen for audio data
broadcast.on("GLOBAL_AUDIO_DATA", (message) => {
  globalAudio.state.value.frequencyData = message.data.frequencyData;
  globalAudio.state.value.isPlaying = message.data.isPlaying;
  globalAudio.state.value.currentTime = message.data.currentTime;
  globalAudio.state.value.volume = message.data.volume;
});
```

---

## Code Examples

### Example 1: Bass-Reactive Size

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useGlobalAudio } from "@/core/global";

const globalAudio = useGlobalAudio();

const size = computed(() => {
  const bass = globalAudio.state.value.frequencyData.bass / 255;
  return `${100 + bass * 200}px`; // 100px to 300px
});
</script>

<template>
  <div class="bass-circle" :style="{ width: size, height: size }" />
</template>
```

### Example 2: Beat Pulse Effect

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useGlobalAudio } from "@/core/global";

const globalAudio = useGlobalAudio();

const beatClass = computed(() =>
  globalAudio.state.value.frequencyData.beat ? "beat-pulse" : ""
);
</script>

<template>
  <div class="container" :class="beatClass">Content pulses on beat</div>
</template>

<style scoped>
.beat-pulse {
  animation: pulse 0.3s ease-out;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
```

### Example 3: Frequency Bars Visualizer

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useGlobalAudio } from "@/core/global";

const globalAudio = useGlobalAudio();

const bands = computed(
  () => globalAudio.state.value.frequencyData.frequencyBands
);

const getBarHeight = (value: number) => `${(value / 255) * 100}%`;
</script>

<template>
  <div class="frequency-bars">
    <div
      v-for="(band, i) in bands"
      :key="i"
      class="bar"
      :style="{ height: getBarHeight(band) }"
    />
  </div>
</template>

<style scoped>
.frequency-bars {
  display: flex;
  gap: 4px;
  height: 200px;
  align-items: flex-end;
}

.bar {
  flex: 1;
  background: var(--theme-primary);
  transition: height 0.05s ease;
}
</style>
```

---

## Best Practices

1. **Always use GlobalAudio** - Never create local AudioContext
2. **Trust the provider** - Don't check if you're MAIN, just consume data
3. **Use computed** - Reactive data automatically triggers re-render
4. **Smooth transitions** - Use CSS transitions for visual changes
5. **Normalize values** - Divide by 255 to get 0-1 range for easier math

---

**See Also**:

- [WINDOW_MANAGEMENT.md](./WINDOW_MANAGEMENT.md) - Multi-window system
- [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) - Component patterns
- [README.md](./README.md) - Complete project documentation
