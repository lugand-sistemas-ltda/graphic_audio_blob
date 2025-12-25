# 🎨 Arquitetura de Temas Global

## 📋 Visão Geral

Sistema de temas centralizado que sincroniza automaticamente entre todas as janelas, independente de qual janela tem o ThemeSelector aberto.

✅ **Tema único aplicado em todas as janelas**  
✅ **Mudança de tema reflete instantaneamente**  
✅ **RGB Mode e Chameleon Mode globais**  
✅ **Persistência em localStorage**

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     GLOBAL THEME STATE                      │
│                        (Singleton)                          │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │  state: {                                         │    │
│  │    currentTheme: 'matrix'                        │    │
│  │    rgbMode: {                                     │    │
│  │      enabled, speed, saturation, brightness      │    │
│  │    }                                              │    │
│  │    chameleonMode: {                              │    │
│  │      enabled, sensitivity, smoothing             │    │
│  │    }                                              │    │
│  │  }                                                │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│              BroadcastChannel Sync (instant)               │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   JANELA 1   │      │   JANELA 2   │      │   JANELA 3   │
├──────────────┤      ├──────────────┤      ├──────────────┤
│ App.vue      │      │ App.vue      │      │ App.vue      │
│ watch theme ─┼──────┼─ watch theme ┼──────┼─ watch theme │
│     │        │      │     │        │      │     │        │
│     ▼        │      │     ▼        │      │     ▼        │
│ Apply to DOM │      │ Apply to DOM │      │ Apply to DOM │
│              │      │              │      │              │
│ ThemeSelector│      │ (não aberto) │      │ (não aberto) │
│   ✅         │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
```

---

## 🔑 Implementação

### **1. App.vue - Inicialização Global**

```typescript
// App.vue
import { watch } from "vue";
import { useGlobalTheme } from "./core/global";

// Inicializa tema global (TODAS as janelas fazem isso)
const globalTheme = useGlobalTheme();

// Watch que aplica tema automaticamente
watch(
  () => globalTheme.state.value.currentTheme,
  (theme) => {
    console.log("[App.vue] 🎨 Applying theme globally:", theme);

    // Aplica tema no DOM
    if (theme === "matrix") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = theme;
    }
  },
  { immediate: true }
);
```

**✅ Resultado:** Todas as janelas aplicam o tema automaticamente, mesmo sem ThemeSelector aberto!

### **2. ThemeSelector.vue - Controle de Tema**

```vue
<script setup lang="ts">
import { inject } from "vue";
import { useGlobalTheme } from "@/core/global";
import { availableThemes } from "@/composables/useTheme";

const windowId = inject<string>("windowId", "unknown");
const globalTheme = useGlobalTheme();

// Muda tema (reflete em TODAS as janelas)
const changeTheme = (themeId: string) => {
  globalTheme.setTheme(themeId, windowId);
};

// Estado atual
const currentTheme = computed(() => globalTheme.state.value.currentTheme);
</script>

<template>
  <div class="theme-selector">
    <div
      v-for="theme in availableThemes"
      :key="theme.id"
      class="theme-option"
      :class="{ active: currentTheme === theme.id }"
      @click="changeTheme(theme.id)"
    >
      <div class="preview" :style="{ backgroundColor: theme.preview }"></div>
      <span>{{ theme.name }}</span>
    </div>
  </div>
</template>
```

### **3. useTheme.ts - Composable (Simplificado)**

```typescript
// composables/useTheme.ts
import { inject, computed } from "vue";
import { useGlobalTheme } from "../core/global";

export function useTheme() {
  const globalTheme = useGlobalTheme();
  const windowId = inject<string>("windowId", "unknown");

  const setTheme = (themeId: string) => {
    globalTheme.setTheme(themeId, windowId);
  };

  return {
    currentTheme: computed(() => globalTheme.state.value.currentTheme),
    availableThemes,
    setTheme,
  };
}
```

---

## 🎨 Temas Disponíveis

```typescript
export const availableThemes: Theme[] = [
  { id: "matrix", name: "Matrix Green", preview: "#00ff41" },
  { id: "cyberpunk", name: "Cyberpunk Purple", preview: "#ff41ff" },
  { id: "blade-runner", name: "Rustic Brown", preview: "#8b4513" },
  { id: "tron", name: "Tron Blue", preview: "#41ffff" },
  { id: "hacker-red", name: "Hacker Red", preview: "#ff4141" },
  { id: "synthwave", name: "Synthwave Pink", preview: "#ff5ca8" },
  { id: "terminal-amber", name: "Terminal Amber", preview: "#ffd700" },
  { id: "tutifuti", name: "Tutifuti", preview: "#c25a88" },
  { id: "deep-blue", name: "Deep Blue", preview: "#3b82f6" },
  { id: "monochrome", name: "Monochrome", preview: "#9ca3af" },
  { id: "ghost", name: "Ghost", preview: "#f3f4f6" },
  { id: "half-life", name: "Half-Life", preview: "#ff6600" },
];
```

---

## 🌈 RGB Mode

### **Ativação Global**

```typescript
// useRgbMode.ts
import { watch } from "vue";
import { useGlobalTheme } from "../core/global";

export function useRgbMode() {
  const globalTheme = useGlobalTheme();

  watch(
    () => globalTheme.state.value.rgbMode.enabled,
    (enabled) => {
      if (enabled) {
        document.body.classList.add("rgb-mode");
        startRgbAnimation();
      } else {
        document.body.classList.remove("rgb-mode");
        stopRgbAnimation();
      }
    },
    { immediate: true }
  );

  // ... código de animação
}
```

### **Controles**

```typescript
const globalTheme = useGlobalTheme();

// Toggle RGB Mode
globalTheme.setRgbMode(true, windowId);

// Ajusta parâmetros
globalTheme.setRgbSpeed(2.0, windowId);
globalTheme.setRgbSaturation(80, windowId);
globalTheme.setRgbBrightness(120, windowId);
```

---

## 🦎 Chameleon Mode

### **Ativação Global**

```typescript
// useChameleonMode.ts
import { watch } from "vue";
import { useGlobalAudio, useGlobalTheme } from "../core/global";

export function useChameleonMode() {
  const globalAudio = useGlobalAudio();
  const globalTheme = useGlobalTheme();

  watch(
    () => globalTheme.state.value.chameleonMode.enabled,
    (enabled) => {
      if (enabled) {
        startChameleonEffect();
      } else {
        stopChameleonEffect();
      }
    },
    { immediate: true }
  );

  // Reage à música
  watch(
    () => globalAudio.state.value.frequencyData,
    (data) => {
      if (globalTheme.state.value.chameleonMode.enabled) {
        const hue = ((data.bass + data.treble) / 2) * 3.6; // 0-360
        document.documentElement.style.setProperty(
          "--chameleon-hue",
          hue.toString()
        );
      }
    }
  );
}
```

### **Controles**

```typescript
const globalTheme = useGlobalTheme();

// Toggle Chameleon Mode
globalTheme.setChameleonMode(true, windowId);

// Ajusta parâmetros
globalTheme.setChameleonSensitivity(1.5, windowId);
globalTheme.setChameleonSmoothing(0.2, windowId);
```

---

## 🔧 API Completa

### **useGlobalTheme()**

```typescript
const globalTheme = useGlobalTheme();

// Estado reativo
globalTheme.state.value.currentTheme; // string
globalTheme.state.value.rgbMode.enabled; // boolean
globalTheme.state.value.rgbMode.speed; // number
globalTheme.state.value.rgbMode.saturation; // number (0-100)
globalTheme.state.value.rgbMode.brightness; // number (0-200)
globalTheme.state.value.chameleonMode.enabled; // boolean
globalTheme.state.value.chameleonMode.sensitivity; // number
globalTheme.state.value.chameleonMode.smoothing; // number (0-1)

// Controles de tema
globalTheme.setTheme(themeId, windowId);

// Controles RGB Mode
globalTheme.setRgbMode(enabled, windowId);
globalTheme.setRgbSpeed(speed, windowId);
globalTheme.setRgbSaturation(saturation, windowId);
globalTheme.setRgbBrightness(brightness, windowId);

// Controles Chameleon Mode
globalTheme.setChameleonMode(enabled, windowId);
globalTheme.setChameleonSensitivity(sensitivity, windowId);
globalTheme.setChameleonSmoothing(smoothing, windowId);
```

---

## ✅ Checklist para Novos Temas

1. ✅ Adicione tema em `availableThemes` array
2. ✅ Crie arquivo SCSS em `src/style/_themes.scss`
3. ✅ Defina variáveis CSS:
   ```scss
   [data-theme="meu-tema"] {
     --theme-primary-rgb: 100, 200, 255;
     --theme-secondary-rgb: 255, 100, 200;
     --theme-accent-rgb: 200, 255, 100;
     // ... outras variáveis
   }
   ```
4. ✅ Teste em múltiplas janelas
5. ✅ Verifique persistência (localStorage)

---

## 🐛 Troubleshooting

### **Problema: Tema não aplica em janela secundária**

**Causa:** Watch não foi configurado no App.vue  
**Solução:** Verificar se o watch está presente:

```typescript
// App.vue deve ter:
watch(
  () => globalTheme.state.value.currentTheme,
  (theme) => {
    // Aplicar tema no DOM
  },
  { immediate: true }
);
```

### **Problema: Tema muda mas ThemeSelector não atualiza**

**Causa:** ThemeSelector não está usando computed do globalTheme  
**Solução:**

```typescript
// ❌ Errado
const currentTheme = ref("matrix");

// ✅ Correto
const currentTheme = computed(() => globalTheme.state.value.currentTheme);
```

### **Problema: RGB Mode não sincroniza**

**Causa:** useRgbMode() não foi chamado no App.vue  
**Solução:**

```typescript
// App.vue
import { useRgbMode } from "./composables/useRgbMode";

// Inicializa globalmente
useRgbMode();
useChameleonMode();
```

---

**Versão:** 1.0.0  
**Última Atualização:** 24/12/2024  
**Autor:** Sistema de Desenvolvimento Lugand
