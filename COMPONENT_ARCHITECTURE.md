# 🧩 Component Architecture

> **Guide to component management with GlobalState and per-window configuration**

---

## Table of Contents

1. [Overview](#overview)
2. [GlobalState Structure](#globalstate-structure)
3. [Component Registration](#component-registration)
4. [Per-Window Components](#per-window-components)
5. [Component Lifecycle](#component-lifecycle)
6. [Code Examples](#code-examples)

---

## Overview

The component system allows **per-window component management**, enabling:

- ✅ Same component in multiple windows simultaneously
- ✅ Independent visibility/position per window
- ✅ Drag & drop with position persistence
- ✅ Collapsible panels with state persistence
- ✅ Category-based organization (visual, audio, debug, system)

---

## GlobalState Structure

```typescript
// src/core/state/types.ts
interface GlobalState {
  windowId: string;
  windows: Record<string, WindowConfig>;
  componentsByWindow: Record<string, Record<string, ComponentState>>;
  audioOwner: string | null;
}

interface WindowConfig {
  id: string;
  type: "main" | "visual" | "generic";
  createdAt: number;
}

interface ComponentState {
  id: string;
  name: string;
  visible: boolean;
  position?: { x: number; y: number };
  zIndex?: number;
  collapsed?: boolean;
}
```

### Key: `componentsByWindow`

```typescript
{
  "window-main-abc123": {
    "frequency-visualizer": {
      id: "frequency-visualizer",
      name: "Frequency Visualizer",
      visible: true,
      position: { x: 100, y: 200 },
      zIndex: 15
    },
    "music-player": {
      id: "music-player",
      name: "Music Player",
      visible: true,
      position: { x: 50, y: 50 },
      zIndex: 10
    }
  },
  "window-child-xyz789": {
    "frequency-visualizer": {
      id: "frequency-visualizer",
      name: "Frequency Visualizer",
      visible: true,
      position: { x: 300, y: 400 },
      zIndex: 12
    }
  }
}
```

**Note**: Same component ID (`frequency-visualizer`) appears in multiple windows with different positions!

---

## Component Registration

### Available Components Registry

```typescript
// src/config/availableComponents.ts
export interface ComponentDefinition {
  id: string;
  name: string;
  category: "visual" | "audio" | "debug" | "system";
  component: Component;
  defaultVisible?: boolean;
}

export const availableComponents: ComponentDefinition[] = [
  {
    id: "music-player",
    name: "Music Player",
    category: "audio",
    component: MusicPlayer,
    defaultVisible: true,
  },
  {
    id: "frequency-visualizer",
    name: "Frequency Visualizer",
    category: "debug",
    component: FrequencyVisualizer,
    defaultVisible: false,
  },
  // ... more components
];
```

### Adding Component to Window

```typescript
// src/core/state/useGlobalState.ts
export const addComponentToWindow = (windowId: string, componentId: string) => {
  if (!state.componentsByWindow[windowId]) {
    state.componentsByWindow[windowId] = {};
  }

  if (!state.componentsByWindow[windowId][componentId]) {
    const componentDef = availableComponents.find((c) => c.id === componentId);

    state.componentsByWindow[windowId][componentId] = {
      id: componentId,
      name: componentDef?.name || componentId,
      visible: componentDef?.defaultVisible !== false,
      position: getDefaultPosition(componentId),
      zIndex: 10,
    };
  }
};
```

### Removing Component from Window

```typescript
export const removeComponentFromWindow = (
  windowId: string,
  componentId: string
) => {
  if (state.componentsByWindow[windowId]) {
    delete state.componentsByWindow[windowId][componentId];
  }
};
```

---

## Per-Window Components

### Component Manager UI

```vue
<!-- src/components/sidebar/ComponentManager.vue -->
<script setup lang="ts">
import {
  useGlobalState,
  addComponentToWindow,
  removeComponentFromWindow,
} from "@/core/state";
import { availableComponents } from "@/config/availableComponents";

const { state } = useGlobalState();

const isComponentActive = (componentId: string) => {
  return !!state.componentsByWindow[state.windowId]?.[componentId]?.visible;
};

const toggleComponent = (componentId: string) => {
  const currentlyActive = isComponentActive(componentId);

  if (currentlyActive) {
    removeComponentFromWindow(state.windowId, componentId);
  } else {
    addComponentToWindow(state.windowId, componentId);
  }
};
</script>

<template>
  <div class="component-manager">
    <h3>Components</h3>

    <div
      v-for="component in availableComponents"
      :key="component.id"
      class="component-item"
    >
      <input
        type="checkbox"
        :checked="isComponentActive(component.id)"
        @change="toggleComponent(component.id)"
      />
      <label>{{ component.name }}</label>
      <span class="category">{{ component.category }}</span>
    </div>
  </div>
</template>
```

### Rendering Components Dynamically

```vue
<!-- src/views/HomeView.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useGlobalState, getWindowComponents } from "@/core/state";
import { availableComponents } from "@/config/availableComponents";

const { state } = useGlobalState();

const activeComponents = computed(() => {
  const windowComponents = getWindowComponents(state.windowId);

  return availableComponents
    .filter((comp) => {
      const compState = windowComponents[comp.id];
      return compState && compState.visible;
    })
    .map((comp) => ({
      ...comp,
      state: windowComponents[comp.id],
    }));
});
</script>

<template>
  <div class="home-view">
    <component
      v-for="comp in activeComponents"
      :key="comp.id"
      :is="comp.component"
      :style="{
        position: 'absolute',
        left: `${comp.state.position?.x || 0}px`,
        top: `${comp.state.position?.y || 0}px`,
        zIndex: comp.state.zIndex || 10,
      }"
    />
  </div>
</template>
```

---

## Component Lifecycle

### 1. Component Mounts

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useGlobalState, addComponentToWindow } from "@/core/state";
import { useComponentManager } from "@/composables/useComponentManager";

const { state } = useGlobalState();
const componentManager = useComponentManager();

const componentId = "my-component";

onMounted(() => {
  // Register in GlobalState
  addComponentToWindow(state.windowId, componentId);

  // Register in ComponentManager (for visibility control)
  componentManager.register(componentId, "My Component", "visual");
});

onUnmounted(() => {
  // Cleanup if needed
  componentManager.unregister(componentId);
});
</script>
```

### 2. Position Updates (Drag)

```typescript
// src/composables/useDraggable.ts
const updatePosition = (componentId: string, x: number, y: number) => {
  const { state } = useGlobalState();

  if (state.componentsByWindow[state.windowId]?.[componentId]) {
    state.componentsByWindow[state.windowId][componentId].position = { x, y };

    // Persist to localStorage
    localStorage.setItem(
      `component-position-${componentId}`,
      JSON.stringify({ x, y })
    );
  }
};
```

### 3. Z-Index Management

```typescript
// src/composables/useZIndex.ts
export const bringToFront = (componentId: string) => {
  const { state } = useGlobalState();

  if (state.componentsByWindow[state.windowId]?.[componentId]) {
    const currentMax = Math.max(
      ...Object.values(state.componentsByWindow[state.windowId]).map(
        (c) => c.zIndex || 0
      )
    );

    state.componentsByWindow[state.windowId][componentId].zIndex =
      currentMax + 1;
  }
};
```

### 4. Visibility Toggle

```typescript
// src/composables/useComponentManager.ts
const toggle = (componentId: string) => {
  const { state } = useGlobalState();

  if (state.componentsByWindow[state.windowId]?.[componentId]) {
    const current =
      state.componentsByWindow[state.windowId][componentId].visible;
    state.componentsByWindow[state.windowId][componentId].visible = !current;
  }
};
```

---

## Code Examples

### Example 1: Creating Draggable Component

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useDraggable } from "@/composables/useDraggable";
import { useZIndex } from "@/composables/useZIndex";

const componentId = "my-draggable-component";
const containerRef = ref<HTMLElement>();

const { startDrag } = useDraggable(componentId, containerRef);
const { bringToFront } = useZIndex();

const handleMouseDown = (event: MouseEvent) => {
  bringToFront(componentId);
  startDrag(event);
};

onMounted(() => {
  // Component registration happens in parent (HomeView)
});
</script>

<template>
  <div
    ref="containerRef"
    class="draggable-component"
    @mousedown="handleMouseDown"
  >
    <div class="drag-handle">Drag me</div>
    <div class="content">Component content here</div>
  </div>
</template>

<style scoped>
.draggable-component {
  position: absolute;
  cursor: move;
}

.drag-handle {
  background: var(--theme-primary);
  padding: 8px;
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
```

### Example 2: Collapsible Component

```vue
<script setup lang="ts">
import { useCollapsible } from "@/composables/useCollapsible";

const componentId = "my-collapsible-component";
const { isCollapsed, toggle } = useCollapsible(componentId);
</script>

<template>
  <div class="collapsible-component">
    <div class="header" @click="toggle">
      <h3>My Component</h3>
      <button>{{ isCollapsed ? "▼" : "▲" }}</button>
    </div>

    <div v-if="!isCollapsed" class="content">
      Component content visible when expanded
    </div>
  </div>
</template>
```

### Example 3: Component with Audio Reactivity

```vue
<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useGlobalAudio } from "@/core/global";
import { useGlobalState, addComponentToWindow } from "@/core/state";

const globalAudio = useGlobalAudio();
const { state } = useGlobalState();

const componentId = "audio-reactive-circle";

const size = computed(() => {
  const bass = globalAudio.state.value.frequencyData.bass / 255;
  return 100 + bass * 200; // 100px to 300px
});

onMounted(() => {
  addComponentToWindow(state.windowId, componentId);
});
</script>

<template>
  <div
    v-draggable
    class="audio-reactive-circle"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
  />
</template>

<style scoped>
.audio-reactive-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--theme-primary), transparent);
  transition: all 0.1s ease;
}
</style>
```

---

## Best Practices

1. **Use GlobalState for shared state** - Don't create local component registries
2. **Register on mount** - Always register components when they mount
3. **Cleanup on unmount** - Remove event listeners and clear refs
4. **Persist important state** - Use localStorage for positions, collapsed state
5. **Category organization** - Group related components by category
6. **Default positions** - Define sensible defaults in `defaultPositions.ts`
7. **Z-index management** - Use `useZIndex` composable, don't hardcode values

---

**See Also**:

- [WINDOW_MANAGEMENT.md](./WINDOW_MANAGEMENT.md) - Multi-window system
- [AUDIO_ARCHITECTURE.md](./AUDIO_ARCHITECTURE.md) - Audio integration
- [README.md](./README.md) - Complete project documentation
