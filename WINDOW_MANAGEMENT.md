# 🪟 Window Management Architecture

> **Complete guide to MAIN/CHILD window system with Provider/Consumer pattern**

---

## Table of Contents

1. [Overview](#overview)
2. [Window Type Detection](#window-type-detection)
3. [Provider/Consumer Pattern](#providerconsumer-pattern)
4. [BroadcastChannel Communication](#broadcastchannel-communication)
5. [Window Lifecycle](#window-lifecycle)
6. [Code Examples](#code-examples)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The multi-window system is built on a **Provider/Consumer architecture** where:

- **MAIN Window**: Single audio source, creates `<audio>` element, broadcasts data
- **CHILD Windows**: Audio consumers, receive data via BroadcastChannel, NO `<audio>` element

### Why This Architecture?

**Problem Solved**: Multiple windows playing the same audio with delay/echo

**Solution**: Only MAIN window has physical audio playback, all other windows consume synchronized data at 60fps

---

## Window Type Detection

### 4-Layer Detection System

To ensure 100% accuracy, we use **4 independent checks** that all must agree:

```typescript
// src/App.vue
const detectIsMainWindow = (): boolean => {
  // Check 1: Vue Router query parameter
  const hasChildParamRouter = route.query.childWindow === "true";

  // Check 2: Manual hash parsing (fallback for race conditions)
  const hash = window.location.hash;
  const hashParams = new URLSearchParams(hash.split("?")[1] || "");
  const hasChildParamHash = hashParams.get("childWindow") === "true";

  // Check 3: Window opener check
  const hasOpener = !!window.opener;

  // Check 4: Route path check
  const isChildRoute =
    route.path.startsWith("/window") || route.path.startsWith("/visual");

  // ALL checks must agree
  const isMain =
    !hasChildParamRouter && !hasChildParamHash && !hasOpener && !isChildRoute;

  console.log("[App.vue] 🔍 Detecting isMainWindow DIRECTLY:", {
    path: route.path,
    hasChildParam: hasChildParamRouter || hasChildParamHash,
    isChildRoute,
    hasOpener,
    isMain,
  });

  return isMain;
};
```

### Why 4 Checks?

1. **Query Parameter** - Explicit marking by window manager
2. **Hash Parsing** - Handles Vue Router race conditions
3. **Window Opener** - Browser-native parent/child relationship
4. **Route Path** - Semantic distinction (`/` = main, `/window` = child)

### Why Direct Detection (No Inject)?

**Problem**: `inject('isMainWindow', true)` defaulted to `true` before `MainLayout` could `provide` the value

**Solution**: Direct detection in `App.vue` **before** any component mounts

---

## Provider/Consumer Pattern

### MAIN Window Responsibilities

```typescript
// App.vue (MAIN window)
if (isMainWindow.value) {
  console.log("[App.vue] 🎵 This is MAIN window - Registering as audio owner");

  const success = globalAudio.registerAudioOwner(windowId);
  if (success) {
    console.log("[App.vue] ✅ Successfully registered as audio owner");

    // MAIN creates physical <audio> element
    const audioElement = document.createElement("audio");
    audioElement.crossOrigin = "anonymous";
    document.body.appendChild(audioElement);

    // Setup analyzer, connect to BroadcastChannel
    audio.initAudio(playlist.currentTrack.value.file);
  }
}
```

**What MAIN Does**:

- ✅ Creates `<audio>` element
- ✅ Initializes AudioContext + AnalyserNode
- ✅ Performs FFT analysis (512 bins @ 60fps)
- ✅ Broadcasts `GLOBAL_AUDIO_DATA` message every frame
- ✅ Listens for control messages (play/pause/volume)

### CHILD Window Responsibilities

```typescript
// App.vue (CHILD window)
if (!isMainWindow.value) {
  console.log(
    "[App.vue] 👶 This is CHILD window - Will consume audio from MAIN"
  );

  // NO <audio> element created
  // Just listen for broadcast data
  broadcast.on("GLOBAL_AUDIO_DATA", (message) => {
    globalAudio.state.value.frequencyData = message.data.frequencyData;
    globalAudio.state.value.isPlaying = message.data.isPlaying;
    globalAudio.state.value.volume = message.data.volume;
  });
}
```

**What CHILD Does**:

- ✅ NO `<audio>` element
- ✅ Receives `GLOBAL_AUDIO_DATA` via BroadcastChannel
- ✅ Updates reactive state with received data
- ✅ Renders components using global audio state
- ✅ Can send control commands to MAIN

---

## BroadcastChannel Communication

### Message Types

```typescript
// src/core/sync/types.ts
interface SyncMessage {
  type:
    | "GLOBAL_AUDIO_DATA"
    | "GLOBAL_AUDIO_PLAY"
    | "GLOBAL_AUDIO_PAUSE"
    | "THEME_CHANGE";
  data: any;
  timestamp: number;
  senderId: string;
}
```

### Audio Data Message (60fps)

```typescript
// MAIN window sends this every frame
broadcast.send("GLOBAL_AUDIO_DATA", {
  frequencyData: {
    bass: 128,
    mid: 96,
    treble: 64,
    overall: 96,
    beat: false,
    frequencyBands: [120, 110, 95, 80, 70, 60, 50, 40],
    raw: Uint8Array[256],
  },
  isPlaying: true,
  volume: 0.8,
  currentTrackIndex: 2,
  currentTime: 45.3,
  duration: 180.5,
});
```

### Control Messages

```typescript
// CHILD window sends control commands
globalAudio.play(windowId); // → MAIN receives and executes
globalAudio.pause(windowId); // → MAIN receives and executes
globalAudio.setVolume(0.5, windowId); // → MAIN receives and executes
```

### BroadcastChannel Setup

```typescript
// src/core/sync/useBroadcastSync.ts
const channel = new BroadcastChannel("spectral-audio-sync");

const send = (type: string, data: any) => {
  const message: SyncMessage = {
    type,
    data,
    timestamp: Date.now(),
    senderId: windowId,
  };
  channel.postMessage(message);
};

const on = (type: string, callback: (message: SyncMessage) => void) => {
  channel.onmessage = (event) => {
    const message = event.data as SyncMessage;
    if (message.type === type && message.senderId !== windowId) {
      callback(message);
    }
  };
};
```

---

## Window Lifecycle

### Opening Child Windows

```typescript
// src/core/sync/useWindowManager.ts
const openGenericWindow = () => {
  const route = router.resolve({ path: "/window" }).href;
  const separator = route.includes("?") ? "&" : "?";
  const fullUrl = `${baseUrl}#${route}${separator}childWindow=true`;

  const newWindow = window.open(
    fullUrl,
    "_blank",
    "width=1200,height=800,left=100,top=100"
  );

  if (newWindow) {
    broadcast.send("WINDOW_OPENED", { windowId: generateId() });
  }
};
```

### Window Detection Logs

**MAIN Window** (route `/`):

```
[App.vue] 🔍 Detecting isMainWindow DIRECTLY: {
  path: "/",
  hasChildParam: false,
  isChildRoute: false,
  hasOpener: false,
  isMain: true
}
[App.vue] 🎵 This is MAIN window - Registering as audio owner
[App.vue] ✅ Successfully registered as audio owner
```

**CHILD Window** (route `/window?childWindow=true`):

```
[App.vue] 🔍 Detecting isMainWindow DIRECTLY: {
  path: "/window",
  hasChildParam: true,
  isChildRoute: true,
  hasOpener: true,
  isMain: false
}
[App.vue] 👶 This is CHILD window - Will consume audio from MAIN
```

### Window Closing Behavior

- **MAIN closes**: Child windows continue running independently (no audio data)
- **CHILD closes**: No impact on MAIN or other children
- **Future improvement**: Cascade close all children when MAIN closes

---

## Code Examples

### Example 1: Creating Audio-Reactive Component

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useGlobalAudio } from "@/core/global";

const globalAudio = useGlobalAudio();

// Works in both MAIN and CHILD windows!
const bassLevel = computed(() => globalAudio.state.value.frequencyData.bass);
const beatDetected = computed(() => globalAudio.state.value.frequencyData.beat);

// Reactive size based on audio
const size = computed(() => {
  const bass = bassLevel.value / 255; // Normalize 0-1
  return `${100 + bass * 200}px`; // 100px to 300px
});
</script>

<template>
  <div
    class="audio-reactive-box"
    :class="{ beat: beatDetected }"
    :style="{ width: size, height: size }"
  >
    Bass: {{ bassLevel.toFixed(0) }}
  </div>
</template>

<style scoped>
.audio-reactive-box {
  background: var(--theme-primary);
  transition: all 0.1s ease;
}

.audio-reactive-box.beat {
  box-shadow: 0 0 40px var(--theme-primary);
  transform: scale(1.1);
}
</style>
```

### Example 2: Sending Control Commands from CHILD

```vue
<script setup lang="ts">
import { useGlobalAudio } from "@/core/global";
import { useGlobalState } from "@/core/state";

const globalAudio = useGlobalAudio();
const { state } = useGlobalState();

const handlePlay = () => {
  // Works from any window - MAIN will execute
  globalAudio.play(state.windowId);
};

const handleVolumeChange = (event: Event) => {
  const volume = (event.target as HTMLInputElement).valueAsNumber / 100;
  globalAudio.setVolume(volume, state.windowId);
};
</script>

<template>
  <div class="controls">
    <button @click="handlePlay">
      {{ globalAudio.state.value.isPlaying ? "Pause" : "Play" }}
    </button>

    <input
      type="range"
      min="0"
      max="100"
      :value="globalAudio.state.value.volume * 100"
      @input="handleVolumeChange"
    />
  </div>
</template>
```

### Example 3: Theme Synchronization

```vue
<script setup lang="ts">
import { watch } from "vue";
import { useGlobalTheme } from "@/core/global";

const globalTheme = useGlobalTheme();

// Automatically applies to document in ALL windows
watch(
  () => globalTheme.state.value.currentTheme,
  (theme) => {
    if (theme === "matrix") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = theme;
    }
  },
  { immediate: true }
);

const changeTheme = (theme: string) => {
  // Broadcasts to all windows
  globalTheme.setTheme(theme);
};
</script>

<template>
  <div class="theme-selector">
    <button @click="changeTheme('matrix')">Matrix</button>
    <button @click="changeTheme('cyberpunk')">Cyberpunk</button>
    <button @click="changeTheme('neon')">Neon</button>
  </div>
</template>
```

---

## Troubleshooting

### Problem: Both windows show "isMain: true"

**Cause**: Detection logic race condition or missing query parameter

**Fix**: Verify `useWindowManager.ts` adds `?childWindow=true`:

```typescript
const fullUrl = `${baseUrl}#${route}${separator}childWindow=true`;
```

### Problem: Audio plays in multiple windows (echo/delay)

**Cause**: Multiple windows registered as audio owner

**Fix**: Check `useGlobalAudio.ts` protection:

```typescript
const registerAudioOwner = (windowId: string) => {
  if (state.value.audioOwner && state.value.audioOwner !== windowId) {
    console.warn("[GlobalAudio] ⚠️ Audio owner already exists, rejecting");
    return false;
  }
  state.value.audioOwner = windowId;
  return true;
};
```

### Problem: Child windows don't receive audio data

**Cause**: BroadcastChannel not connected or different channel name

**Fix**: Verify channel name matches in all windows:

```typescript
const channel = new BroadcastChannel("spectral-audio-sync"); // Must match!
```

### Problem: Components in child windows don't react to audio

**Cause**: Not using GlobalAudio, using local inject instead

**Fix**: Import and use GlobalAudio directly:

```typescript
// ❌ Wrong (old way)
const audio = inject<any>("audio");

// ✅ Correct (new way)
import { useGlobalAudio } from "@/core/global";
const globalAudio = useGlobalAudio();
```

---

## Best Practices

1. **Always use GlobalAudio** - Never create local AudioContext in components
2. **Check window type sparingly** - Most components don't need to know
3. **Trust the data** - GlobalAudio provides same data to all windows
4. **Send commands, not state** - Use `globalAudio.play()`, don't manipulate state directly
5. **Test with 2+ windows** - Always verify multi-window behavior

---

**See Also**:

- [AUDIO_ARCHITECTURE.md](./AUDIO_ARCHITECTURE.md) - Audio system details
- [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) - Component patterns
- [README.md](./README.md) - Complete project documentation
