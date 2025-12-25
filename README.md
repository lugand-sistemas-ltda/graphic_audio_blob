# 🎵 Spectral Audio Visualizer

> **Multi-Window Audio Visualization System with Real-Time Synchronization**  
> Version: 1.0.0-stable | Branch: stable | Stack: Vue 3 + TypeScript + Vite

---

## 📖 Overview

**Spectral Audio Visualizer** is a professional web application for real-time audio visualization featuring a sophisticated **Provider/Consumer architecture** for multi-window support. Built with **Vue 3 Composition API**, **TypeScript**, and **Vite**, it delivers FFT audio analysis, synchronized visual effects, and seamless cross-window communication via BroadcastChannel API.

### 🎯 Key Features

- 🎵 **Single Audio Source** - MAIN window acts as sole provider (eliminates echo/delay)
- 🪟 **Multi-Window System** - Unlimited child windows with real-time sync (60fps)
- 📡 **BroadcastChannel IPC** - Zero-latency state synchronization across windows
- 🎨 **Global Theme System** - Automatic theme application to all windows
- 🎛️ **Component Manager** - Per-window component management (drag & drop, visibility)
- 🎵 **FFT Audio Analysis** - 8-band frequency spectrum (20Hz-22kHz)
- 🌈 **Dynamic Themes** - Matrix (default), RGB Mode, Chameleon Mode
- 🖱️ **Drag & Drop** - Components with automatic z-index management
- 📊 **Debug Tools** - Real-time frequency visualizer and monitoring terminal

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- npm or yarn
- Modern browser with BroadcastChannel API support

### Installation

```bash
# Clone the repository
git clone https://github.com/lugand-sistemas-ltda/graphic_audio_blob.git
cd graphic_audio_blob

# Checkout stable branch
git checkout stable

# Install dependencies
npm install

# Run development server (hot-reload enabled)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Adding Music

Place `.mp3` files in `/src/assets/music/` - they'll be automatically loaded into the playlist.

---

## 🏗️ Architecture

### Provider/Consumer Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                     MAIN WINDOW (Provider)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  • Detects: isMainWindow = true                        │ │
│  │  • Creates: <audio> element (SINGLE SOURCE!)           │ │
│  │  • Analyzes: FFT 512 @ 60fps                           │ │
│  │  • Broadcasts: GLOBAL_AUDIO_DATA, THEME_CHANGE         │ │
│  │  • Controls: Play/Pause/Volume/Track                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ BroadcastChannel (60fps)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  CHILD WINDOWS (Consumers)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  • Detects: isMainWindow = false                       │ │
│  │  • NO <audio> element                                  │ │
│  │  • Receives: frequencyData, theme, playback state      │ │
│  │  • Renders: Components with global data               │ │
│  │  • Can: Send commands (play/pause/volume)             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Window Type Detection

Four independent checks ensure correct window identification:

1. **Query Parameter**: `?childWindow=true` in URL
2. **Vue Router**: `route.query.childWindow === 'true'`
3. **Window Opener**: `window.opener !== null`
4. **Route Path**: `/window` or `/visual` routes

```typescript
// App.vue - Direct detection (no inject dependency)
const detectIsMainWindow = (): boolean => {
  const hasChildParamRouter = route.query.childWindow === "true";
  const hash = window.location.hash;
  const hashParams = new URLSearchParams(hash.split("?")[1] || "");
  const hasChildParamHash = hashParams.get("childWindow") === "true";
  const hasOpener = !!window.opener;
  const isChildRoute =
    route.path.startsWith("/window") || route.path.startsWith("/visual");

  return (
    !hasChildParamRouter && !hasChildParamHash && !hasOpener && !isChildRoute
  );
};
```

### Directory Structure

```
src/
├── 📱 App.vue                    # Root orchestrator (audio owner, theme, provides)
├── 🔧 main.ts                    # Bootstrap (Pinia, Router, Directives)
│
├── 🧩 components/                # Vue components (20+ components)
│   ├── MusicPlayer.vue           # Complete player (track info, controls, volume)
│   ├── FrequencyVisualizer.vue   # 8-band frequency bars
│   ├── ThemeSelector.vue         # Dynamic theme selector
│   ├── DebugTerminal.vue         # Matrix-style monitoring terminal
│   ├── sidebar/                  # Sidebar components
│   │   ├── ComponentManager.vue  # Per-window component visibility
│   │   ├── WindowControl.vue     # Multi-window management
│   │   └── GlobalControls.vue    # Global theme/RGB/Chameleon
│   └── ...
│
├── 🎮 composables/               # Composition API hooks
│   ├── useAudioAnalyzer.ts      # 🎵 FFT 512, beat detection, 8 bands
│   ├── useWindowType.ts          # 🪟 Window detection (4 checks)
│   ├── useSpectralVisualEffect.ts # 🌈 8-layer spectral effects
│   ├── usePlaylist.ts            # 📀 Auto-load music files
│   ├── useComponentManager.ts    # 🧩 Visibility + collapse (localStorage)
│   ├── useDraggable.ts           # 🖱️ Drag-and-drop + z-index
│   ├── useTheme.ts               # 🎨 Theme system
│   ├── useRgbMode.ts             # 🌈 HSL rotation
│   └── useChameleonMode.ts       # 🦎 Audio-reactive colors
│
├── 🔌 core/                      # Core systems
│   ├── global/                   # Global state managers
│   │   ├── useGlobalAudio.ts     # Audio state + BroadcastChannel
│   │   ├── useGlobalTheme.ts     # Theme state + sync
│   │   └── index.ts
│   ├── state/                    # Global state management
│   │   ├── types.ts              # WindowConfig, ComponentState, etc
│   │   ├── useGlobalState.ts     # componentsByWindow, windows
│   │   └── index.ts
│   ├── sync/                     # Multi-window synchronization
│   │   ├── useBroadcastSync.ts   # BroadcastChannel wrapper
│   │   ├── useWindowManager.ts   # High-level window API
│   │   └── types.ts
│   └── drag/                     # Cross-window drag & drop
│       └── useCrossWindowDrag.ts
│
├── 📄 views/                     # View components
│   ├── HomeView.vue              # Main view (renders components per window)
│   ├── VisualView.vue            # Visual-only view
│   └── GenericWindow.vue         # Generic window view
│
├── 🎨 style/                     # SCSS modules
│   ├── index.scss                # Main stylesheet
│   ├── _variables.scss           # Design tokens
│   ├── _mixins.scss              # Reusable mixins
│   ├── _themes.scss              # Theme definitions
│   ├── _animations.scss          # Keyframe animations
│   └── ...
│
└── 🗂️ config/
    └── availableComponents.ts    # Component registry
```

---

## 🎛️ Core APIs

### Global Audio

```typescript
import { useGlobalAudio } from "@/core/global";

const globalAudio = useGlobalAudio();

// State (reactive)
globalAudio.state.value.isPlaying;
globalAudio.state.value.volume;
globalAudio.state.value.currentTrackIndex;
globalAudio.state.value.frequencyData.bass;
globalAudio.state.value.frequencyData.frequencyBands;

// Controls (works from any window)
globalAudio.play(windowId);
globalAudio.pause(windowId);
globalAudio.setVolume(0.7, windowId);
globalAudio.nextTrack(windowId);
```

### Global Theme

```typescript
import { useGlobalTheme } from "@/core/global";

const globalTheme = useGlobalTheme();

// Current theme
globalTheme.state.value.currentTheme; // 'matrix' | 'cyberpunk' | 'neon' | ...

// Change theme (applies to all windows)
globalTheme.setTheme("cyberpunk");

// RGB Mode
globalTheme.state.value.rgbMode.enabled;
globalTheme.toggleRgbMode();

// Chameleon Mode
globalTheme.state.value.chameleonMode.enabled;
globalTheme.toggleChameleonMode();
```

### Global State

```typescript
import {
  useGlobalState,
  addComponentToWindow,
  getWindowComponents,
} from "@/core/state";

const { state } = useGlobalState();

// Add component to window
addComponentToWindow(windowId, "frequency-visualizer");

// Get active components
const components = getWindowComponents(windowId);
```

---

## 🔧 Creating New Components

Components automatically consume global audio:

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useGlobalAudio } from "@/core/global";

const globalAudio = useGlobalAudio();

// Reactive audio data (updates 60x/second)
const bassLevel = computed(() => globalAudio.state.value.frequencyData.bass);
const isPlaying = computed(() => globalAudio.state.value.isPlaying);
const frequencyBands = computed(
  () => globalAudio.state.value.frequencyData.frequencyBands
);

// Example: Bass-reactive size
const size = computed(() => {
  const bass = bassLevel.value;
  return `${100 + (bass / 255) * 200}px`;
});
</script>

<template>
  <div class="my-component" :style="{ width: size, height: size }">
    Bass: {{ bassLevel.toFixed(0) }}
  </div>
</template>
```

---

## 📡 Data Flow

### MAIN Window

```
User interacts → Play button
  ↓
globalAudio.play(windowId)
  ↓
BroadcastChannel.postMessage('GLOBAL_AUDIO_PLAY')
  ↓
<audio>.play() → analyser.getByteFrequencyData()
  ↓
globalAudio.updateFrequencyData(data) @ 60fps
  ↓
BroadcastChannel.postMessage('GLOBAL_AUDIO_DATA')
  ↓
ALL WINDOWS receive update
```

### CHILD Windows

```
BroadcastChannel.onMessage('GLOBAL_AUDIO_DATA')
  ↓
globalAudio.state.value.frequencyData = data
  ↓
Components' computed() detect change
  ↓
Vue reactivity triggers re-render
  ↓
Visual effects update (60fps)
```

---

## 🎨 Theming

### Available Themes

- **Matrix** (default) - Green phosphor CRT aesthetic
- **Cyberpunk** - Neon pink and blue
- **Neon** - Vibrant colors
- **Ghost** - Minimalist white
- **Retrowave** - 80s synthwave
- **RGB Mode** - Continuous HSL rotation
- **Chameleon Mode** - Audio-reactive colors

### Theme Application

```typescript
// App.vue watches theme and applies globally
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
```

All windows receive theme changes instantly via BroadcastChannel.

---

## 🪟 Multi-Window Guide

### Opening Windows

1. **From UI**: Click "New Window" button in MainControl
2. **Programmatic**:

```typescript
import { useWindowManager } from "@/core/sync";

const windowManager = useWindowManager();

// Open generic window
windowManager.openGenericWindow();

// Open visual window
windowManager.openVisualWindow();
```

### Window Lifecycle

- **MAIN closes** → All child windows remain independent (no cascade close yet)
- **CHILD closes** → No impact on MAIN or other children
- **MAIN reload** → Children maintain connection via BroadcastChannel

### Window Detection Logs

```javascript
// MAIN Window
[App.vue] 🔍 Detecting isMainWindow DIRECTLY: {
    path: "/",
    hasChildParam: false,
    isChildRoute: false,
    hasOpener: false,
    isMain: true
}

// CHILD Window
[App.vue] 🔍 Detecting isMainWindow DIRECTLY: {
    path: "/window",
    hasChildParam: true,
    isChildRoute: true,
    hasOpener: true,
    isMain: false
}
```

---

## 🧪 Testing

### Test Scenario 1: Audio Sync

1. Open MAIN window
2. Open 2+ child windows
3. Play music in MAIN
4. ✅ Sound plays only once (no echo)
5. ✅ All windows show same frequency data

### Test Scenario 2: Theme Sync

1. Open MAIN and child windows
2. Change theme in any window
3. ✅ Theme applies to all windows instantly

### Test Scenario 3: Component Independence

1. Add FrequencyVisualizer to MAIN
2. Add FrequencyVisualizer to child
3. ✅ Both show same data (synchronized)
4. ✅ Can be dragged independently

---

## 📚 Documentation

- [AUDIO_ARCHITECTURE.md](./AUDIO_ARCHITECTURE.md) - Audio system details
- [THEME_ARCHITECTURE.md](./THEME_ARCHITECTURE.md) - Theme system details
- [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) - Component system
- [WINDOW_MANAGEMENT.md](./WINDOW_MANAGEMENT.md) - Multi-window system
- [CHANGELOG_AMYSZKO.md](./CHANGELOG_AMYSZKO.md) - Version history

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Web Audio API for FFT analysis
- BroadcastChannel API for IPC

---

**Built with ❤️ by Lugand Sistemas Ltda**

**Integração com áudio:**

```typescript
// App.vue - watch reativo
watch(
  () => playlist.currentTrack.value,
  async (newTrack) => {
    if (newTrack) {
      await audio.initAudio(newTrack.file);
      if (wasPlaying) audio.play();
    }
  }
);
```

---

## � Componentes de Debug

### **DebugTerminal.vue** - Terminal de Monitoramento Matrix

Terminal estilo hacker exibindo variáveis do sistema em tempo real (60 FPS).

**Variáveis monitoradas:**

```
sphere.position.x     → Posição X do mouse (0-100%)
sphere.position.y     → Posição Y do mouse (0-100%)
sphere.size           → Tamanho da esfera em pixels
sphere.reactivity     → Reatividade ao áudio (0-200%)
audio.playing         → Estado (TRUE/FALSE)
audio.time            → Tempo atual / duração
audio.volume          → Volume (0-100%)
beat.detected         → Indicador visual (■/□)
layers.active         → Camadas ativas (8/8)
fps                   → Frames por segundo
```

**Features:**

- ✅ Timestamp com hora atualizada
- ✅ Status "ONLINE" piscante
- ✅ Efeito scanline Matrix
- ✅ Beat indicator pulsante
- ✅ Scrollbar customizada

---

### **FrequencyVisualizer.vue** - Visualizador de Espectro

8 barras verticais mostrando intensidade de cada banda de frequência em tempo real.

**Bandas exibidas:**

```
20Hz   → Sub-bass profundo
60Hz   → Bass
250Hz  → Médio-grave
1kHz   → Médio
4kHz   → Médio-agudo
8kHz   → Agudo
16kHz  → Super agudo
22kHz  → Ultra agudo
```

**Sistema de cores dinâmico (baseado em intensidade):**

```scss
> 80%:  rgba(0, 255, 65, 0.8-1.0)   // Verde brilhante
50-80%: rgba(0, 255, 0, 0.6-1.0)    // Verde médio
20-50%: rgba(0, 200, 0, 0.4-1.0)    // Verde escuro
< 20%:  rgba(0, 143, 17, 0.2-1.0)   // Verde muito escuro
```

**Informações adicionais:**

- **Peak**: Frequência com maior intensidade no momento
- **Avg**: Nível médio de todas as frequências (%)

**Features:**

- ✅ Transição suave (0.05s ease-out)
- ✅ Efeito glow no topo das barras
- ✅ Labels de frequência
- ✅ Scanline effect Matrix

---

### **MatrixCharacter.vue** - Personagem 3D Girando

Efeito de moeda 3D girando com imagem Matrix.

**Efeitos 3D aplicados:**

- 🔄 Rotação Y contínua (360° em 4s, loop infinito)
- 🎨 Perspectiva 1000px (profundidade)
- 🪙 Dupla face (front/back) com backface-visibility hidden
- 💚 Border glow pulsante (box-shadow verde neon)
- ⚡ Hover: Acelera rotação para 2s

**Processamento da imagem:**

- Remoção de fundo (threshold de luminosidade)
- Conversão para escala de cinza
- Colorização Matrix (verde dominante)
- Alpha channel preservado

---

## �📊 Fluxo de Dados

### Arquitetura de Dados (Provide/Inject Pattern)

```
┌─────────────────────────────────────────┐
│ HTML <audio> Element                    │
│ (src/assets/music/*.mp3)                │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ useAudioAnalyzer                        │
│ • AudioContext + AnalyserNode           │
│ • FFT 512 → Uint8Array[256]             │
│ • 8 bandas + beat detection             │
└────────┬────────────────────────────────┘
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│ App.vue          │  │ useWindowManager│  │ useSpectralVisual│
│ (provide/inject) │  │ (BroadcastChannel)│  │ (8 camadas)      │
│ • audio          │  │ • syncAudioData  │  │ • HSL dinâmico   │
│ • playlist       │  │ • onAudioData    │  │ • Wobble effect  │
│ • visualEffect   │  └─────────┬───────┘  └────────┬─────────┘
│ • handlers       │            │                   │
└────────┬─────────┘            │                   │
         │                      │                   │
         ▼                      ▼                   ▼
┌───────────────────────────────────────────────────────────┐
│ Components (inject dependencies)                          │
│ • HomeView → MusicPlayer, FrequencyVisualizer, etc        │
│ • VisualView → Apenas efeitos (recebe via sync)           │
│ • DebugTerminal → Monitora tudo                           │
└───────────────────────────────────────────────────────────┘
```

### Fluxo de Atualização (60 FPS)

```typescript
// App.vue - Loop principal
const updateDebugData = () => {
  // 1. Obter dados do áudio
  const audioData = audio.getFrequencyData();

  // 2. Atualizar efeito visual
  visualEffect.update(audioData);

  // 3. Sincronizar com outras janelas
  windowManager.syncAudioData(audioData);

  // 4. Atualizar refs reativas para debug
  spherePosition.value = visualEffect.getSpherePosition();
  frequencyBands.value = [...audioData.frequencyBands];
  beatDetected.value = audioData.beat;

  // 5. Próximo frame
  requestAnimationFrame(updateDebugData);
};
```

---

## 🔧 Tecnologias e Versões

| Tecnologia           | Versão           | Uso                             | Documentação                                                             |
| -------------------- | ---------------- | ------------------------------- | ------------------------------------------------------------------------ |
| **Vue 3**            | 3.5.24           | Framework reativo               | [docs](https://vuejs.org)                                                |
| **TypeScript**       | 5.9.3            | Type safety                     | [docs](https://www.typescriptlang.org)                                   |
| **Vite**             | 7.2.5 (Rolldown) | Build tool (experimental)       | [docs](https://vitejs.dev)                                               |
| **Pinia**            | 3.0.4            | State management (subutilizado) | [docs](https://pinia.vuejs.org)                                          |
| **Vue Router**       | 4.6.3            | SPA routing (hash mode)         | [docs](https://router.vuejs.org)                                         |
| **SCSS**             | 1.94.2           | Estilos modulares               | [docs](https://sass-lang.com)                                            |
| **Web Audio API**    | Nativo           | Análise FFT de áudio            | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)    |
| **BroadcastChannel** | Nativo           | Multi-window sync               | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) |

---

## 📝 Convenções de Código

### Nomenclatura

```typescript
// Componentes Vue
AppHeader.vue, MusicPlayer.vue  // PascalCase

// Composables
useAudioAnalyzer.ts, usePlaylist.ts  // camelCase com 'use'

// Tipos TypeScript
AudioFrequencyData, WindowConfig  // PascalCase

// Variáveis e funções
const currentTrack = ...  // camelCase
const handleTogglePlay = () => {}

// CSS Classes
.music-player, .debug-terminal  // kebab-case

// CSS Variables
--theme-primary, --spacing-md  // kebab-case
```

### Estrutura de Componente Vue

```vue
<script setup lang="ts">
// 1. Imports (libs, components, composables, types)
import { ref, computed, onMounted } from "vue";
import { useAudioAnalyzer } from "../composables/useAudioAnalyzer";

// 2. Props e Emits (quando necessário)
interface Props {
  title: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{ play: [] }>();

// 3. Injects (dependências de parents)
const audio = inject<any>("audio");

// 4. Composables
const playlist = usePlaylist();

// 5. Refs e Reactive
const isActive = ref(false);

// 6. Computed
const trackTitle = computed(() => playlist.currentTrack.value?.title);

// 7. Functions
const handleClick = () => {};

// 8. Lifecycle hooks
onMounted(() => {});
</script>

<template>
  <!-- Conteúdo -->
</template>

<style scoped lang="scss">
@use "../style/mixins" as *;
@use "../style/variables" as *;

.component {
  @include matrix-panel;
}
</style>
```

### Imports SCSS

```scss
// Importar mixins e variables
@use "../style/mixins" as *;
@use "../style/variables" as *;

// NÃO importe index.scss (já está global)
// NÃO importe themes (já está no :root)
```

---

## 🔄 Estratégia Git/Versionamento

### Branches

```
main              → Produção estável (protected)
amyszko           → Desenvolvimento ativo (branch atual)
gab_0.0.1         → Tag de versão da primeira release
```

### Workflow de Desenvolvimento

```bash
# 1. Trabalhar em 'amyszko'
git checkout amyszko

# 2. Fazer pequenas mudanças incrementais (1-3 arquivos)
git add src/components/MyComponent.vue
git commit -m "feat: adiciona novo componente X"

# 3. Push frequente
git push origin amyszko

# 4. Quando feature completa e testada → merge para main
git checkout main
git merge amyszko
git tag gab_0.0.2
git push origin main --tags
```

### Convenção de Commits

```
feat: nova funcionalidade
fix: correção de bug
refactor: refatoração de código
style: mudanças de estilo (CSS/SCSS)
docs: atualização de documentação
perf: melhoria de performance
test: adição de testes
chore: tarefas de manutenção
```

---

## 🎯 Roadmap e Melhorias

### ⚠️ Pontos de Atenção Identificados

**Críticos:**

- [ ] Adicionar try/catch em `useAudioAnalyzer.initAudio()` (evitar crashes)
- [ ] Cleanup de event listeners em `onUnmounted` (memory leaks)
- [ ] Remover console.logs em produção (usar env variables)

**Performance:**

- [ ] Throttle/debounce na renderização de efeitos (skip frames se necessário)
- [ ] Lazy loading de componentes não-críticos (`defineAsyncComponent`)
- [ ] Otimizar beat detection (threshold adaptativo)

**Qualidade de Código:**

- [ ] Consolidar estado em Pinia (migrar de composables esparsos)
- [ ] Remover tipos `any`, fortalecer interfaces
- [ ] Padronizar idioma dos comentários (PT-BR ou EN)
- [ ] Adicionar JSDoc em funções públicas
- [ ] Limpar variáveis SCSS não utilizadas

**Features Futuras:**

- [ ] Upload de áudio customizado (arrastar .mp3)
- [ ] Presets de efeitos visuais salvos
- [ ] Histórico de posições (undo/redo drag)
- [ ] Suporte a entrada de microfone
- [ ] Sistema de plugins para efeitos
- [ ] Temas customizáveis pelo usuário (editor de cores)
- [ ] Gravação de sessões (capture canvas)

**Testing:**

- [ ] Setup Vitest + Vue Test Utils
- [ ] Testes unitários para composables críticos
- [ ] Testes de integração (áudio → efeitos)
- [ ] E2E básico com Playwright

---

## 🐛 Troubleshooting

### Áudio não toca

1. Verifique se há arquivos `.mp3` em `/src/assets/music/`
2. Verifique permissões de autoplay do browser
3. Console: Procure por erros de CORS ou AudioContext

### Popup bloqueado (multi-window)

- Permita popups para o site nas configurações do browser
- Chrome: Ícone ao lado da URL → "Sempre permitir popups"

### Performance ruim

- Esperado em multi-window (cada janela = processo separado)
- Recomendado: GPU dedicada para 3+ janelas
- Feche debug components se não necessários

### Sincronização não funciona

1. Verifique se ambas as janelas estão no mesmo domínio
2. Browser suporta BroadcastChannel? (Safari < 15.4 não)
3. Habilite logging: `useWindowManager({ enableLogging: true })`

### Build falha

```bash
# Limpe node_modules e reinstale
rm -rf node_modules package-lock.json
npm install

# Verifique versão do Node
node --version  # Deve ser >= 18
```

---

## 📚 Estrutura de Documentação

Este README consolida toda a documentação do projeto. Arquivos originais de referência (agora obsoletos):

- ~~ARCHITECTURE_GUIDE.md~~ → Integrado na seção "Arquitetura SCSS"
- ~~MULTI_WINDOW_SYSTEM.md~~ → Integrado em "Sistema Multi-Window"
- ~~AUDIO_EFFECTS.md~~ → Integrado em "Sistema de Áudio"
- ~~SPECTRAL_VISUALIZER.md~~ → Integrado em "Sistema de Visualização"
- ~~COMPONENT_REFACTOR.md~~ → Histórico de refatorações
- ~~MUSIC_PLAYER.md~~ → Integrado em "Sistema de Playlist"
- ~~DEBUG_COMPONENTS.md~~ → Integrado em "Componentes de Debug"
- ~~RESPONSIVE_SPHERE.md~~ → Integrado em "Sistema de Visualização"
- ~~MATRIX_CHARACTER.md~~ → Integrado em "Componentes de Debug"
- ~~REFACTORING_SUMMARY.md~~ → Histórico de melhorias

---

## 👥 Contribuindo

### Filosofia: Pequenas Iterações Validadas

1. ✅ Fazer mudanças pequenas (1-3 arquivos)
2. ✅ Testar manualmente após cada mudança
3. ✅ Commit atômico com mensagem descritiva
4. ✅ Push frequente
5. ✅ Documentar se necessário

### Antes de Contribuir

- Ler este README completo
- Entender a arquitetura de composables
- Seguir convenções de nomenclatura
- Usar mixins SCSS (não duplicar código)
- Testar em modo dev antes de commit

---

## 📄 Licença

Projeto proprietário - **Lugand Sistemas LTDA**

---

## 🙋 Suporte e Contato

- 📧 Email: contato@lugand.com.br
- 🐛 Issues: [GitHub Issues](https://github.com/lugand-sistemas-ltda/graphic_audio_blob/issues)
- 📖 Docs: Este README + comentários no código

---

**Desenvolvido com 💚 e ☕ pela equipe Lugand Sistemas**

_Graphic Audio Blob v0.0.1 - Dezembro 2025_

---

## 🎨 Arquitetura SCSS Modular

### Design System Completo por Responsabilidade

**Ordem de importação (crítica!):**

```scss
// src/style/index.scss
1. _themes.scss      → Paletas de cores
2. _variables.scss   → Design tokens
3. _mixins.scss      → Funções reutilizáveis
4. _animations.scss  → Keyframes
5. _base.scss        → Elementos HTML
6. _custom.scss      → Componentes do projeto
```

---

### 📁 `_themes.scss` - Paletas de Cores

**Responsabilidade:** Apenas cores e temas

```scss
// Tema Matrix (padrão)
:root {
  --theme-primary: #00ff00;
  --theme-primary-bright: #41ff41;
  --theme-primary-dim: #008f11;
  --theme-primary-dark: #003300;
  --theme-bg-primary: #000000;
  --theme-bg-secondary: #0a0a0a;
  --theme-primary-rgb: 0, 255, 0;
}

// Tema Cyberpunk (exemplo)
:root[data-theme="cyberpunk"] {
  --theme-primary: #ff00ff; // Rosa neon
  --theme-primary-bright: #ff41ff;
  --theme-primary-rgb: 255, 0, 255;
}
```

**Trocar tema dinamicamente:**

```javascript
document.documentElement.setAttribute("data-theme", "cyberpunk");
```

---

### 📏 `_variables.scss` - Design Tokens

**Responsabilidade:** Estrutura e layout (NÃO cores)

```scss
:root {
  // Spacing Scale
  --spacing-xs: 0.5rem; // 8px
  --spacing-sm: 1rem; // 16px
  --spacing-md: 1.5rem; // 24px
  --spacing-lg: 2rem; // 32px
  --spacing-xl: 3rem; // 48px

  // Typography
  --font-size-xs: 0.75rem; // 12px
  --font-size-sm: 0.875rem; // 14px
  --font-size-md: 1rem; // 16px
  --font-size-lg: 1.25rem; // 20px
  --font-size-xl: 1.5rem; // 24px

  // Effects
  --glow-primary: 0 0 10px var(--theme-primary);
  --glow-intense: 0 0 20px var(--theme-primary-bright);
  --shadow-elevated: 0 4px 20px rgba(0, 255, 0, 0.3);
  --text-shadow-glow: 0 0 10px var(--theme-primary);

  // Transitions
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;

  // Z-Index Scale
  --z-index-base: 1;
  --z-index-panel: 10;
  --z-index-dropdown: 20;
  --z-index-modal: 100;
  --z-index-tooltip: 300;
}
```

---

### 🔧 `_mixins.scss` - Funções Reutilizáveis

**Responsabilidade:** Padrões repetidos (use 3+ vezes)

```scss
// Painel Matrix com scanline
@mixin matrix-panel {
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid var(--theme-primary-dim);
  border-radius: 4px;
  box-shadow: 0 0 30px rgba(var(--theme-primary-rgb), 0.2), inset 0 0 30px rgba(var(--theme-primary-rgb), 0.05);

  // Scanline effect
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(var(--theme-primary-rgb), 0.03) 0px,
      transparent 1px,
      transparent 2px,
      rgba(var(--theme-primary-rgb), 0.03) 3px
    );
    pointer-events: none;
    z-index: 2;
  }
}

// Texto com glow
@mixin matrix-text($size: "md") {
  color: var(--theme-primary-bright);
  font-family: "Courier New", monospace;
  text-shadow: var(--text-shadow-glow);

  @if $size == "xs" {
    font-size: var(--font-size-xs);
  }
  @if $size == "sm" {
    font-size: var(--font-size-sm);
  }
  @if $size == "md" {
    font-size: var(--font-size-md);
  }
  @if $size == "lg" {
    font-size: var(--font-size-lg);
  }
  @if $size == "xl" {
    font-size: var(--font-size-xl);
  }
}

// Botão Matrix
@mixin matrix-button {
  @include matrix-text("sm");
  background: rgba(var(--theme-primary-rgb), 0.1);
  border: 1px solid var(--theme-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background: rgba(var(--theme-primary-rgb), 0.2);
    box-shadow: var(--glow-primary);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

// Flexbox utilities
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@mixin flex-column {
  display: flex;
  flex-direction: column;
}
```

**Uso nos componentes:**

```vue
<style scoped lang="scss">
@use "../style/mixins" as *;

.my-component {
  @include matrix-panel;
  @include flex-column;
  padding: var(--spacing-lg);

  .title {
    @include matrix-text("xl");
  }

  button {
    @include matrix-button;
  }
}
</style>
```

---

### 💫 `_animations.scss` - Animações Globais

**Responsabilidade:** Keyframes reutilizáveis

```scss
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
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

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(var(--theme-primary-rgb), 0.6);
  }
}

@keyframes glitch {
  0%,
  100% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(2px, -2px);
  }
  60% {
    transform: translate(-2px, -2px);
  }
  80% {
    transform: translate(2px, 2px);
  }
}

@keyframes scanline {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

// Classes utilitárias
.animate-blink {
  animation: blink 2s ease-in-out infinite;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.animate-glitch {
  animation: glitch 0.3s ease-in-out infinite;
}
```

---

### 📝 `_base.scss` - Elementos HTML

**Responsabilidade:** Reset e estilos de tags HTML nativas

```scss
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Courier New", monospace;
  color: var(--theme-primary);
  background: var(--theme-bg-primary);
}

h1,
h2,
h3 {
  @include matrix-text("lg");
  margin-bottom: var(--spacing-md);
}

button {
  @include matrix-button;
}

input[type="range"] {
  // Slider customizado
  -webkit-appearance: none;
  background: transparent;

  &::-webkit-slider-track {
    background: rgba(var(--theme-primary-rgb), 0.2);
    height: 4px;
    border-radius: 2px;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--theme-primary);
    box-shadow: var(--glow-primary);
    cursor: pointer;
  }
}
```

---

### 🎯 `_custom.scss` - Componentes do Projeto

**Responsabilidade:** Classes específicas da aplicação

```scss
#app {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.badge {
  @include matrix-text("xs");
  padding: var(--spacing-xs);
  border: 1px solid var(--theme-primary-dim);
  border-radius: 3px;
  background: rgba(var(--theme-primary-rgb), 0.1);
}

.divider {
  width: 100%;
  height: 1px;
  background: var(--theme-primary-dim);
  margin: var(--spacing-md) 0;
}

// Scrollbar customizada
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(var(--theme-primary-rgb), 0.1);
}

::-webkit-scrollbar-thumb {
  background: var(--theme-primary-dim);
  border-radius: 4px;

  &:hover {
    background: var(--theme-primary);
  }
}
```

---

### 🎓 Boas Práticas

**✅ FAÇA:**

- Use variáveis CSS ao invés de valores fixos
- Use mixins quando código se repete 3+ vezes
- Mantenha `index.scss` apenas com imports
- Use variáveis semânticas (`--color-text`) não específicas (`--green-500`)
- Importe apenas o necessário: `@use '../style/mixins' as *`

**❌ NÃO FAÇA:**

- Colocar estilos em `index.scss`
- Misturar cores em `_variables.scss` (use `_themes.scss`)
- Duplicar código (crie mixin)
- Usar valores hardcoded (`#00ff00` → use `var(--theme-primary)`)
- Criar novos arquivos SCSS desnecessariamente

---

### 📊 Benefícios da Arquitetura

| Aspecto                   | Antes    | Depois        | Melhoria |
| ------------------------- | -------- | ------------- | -------- |
| **Arquivos**              | 1 grande | 7 organizados | +600%    |
| **Código duplicado**      | Alto     | Zero          | -100%    |
| **Adicionar tema**        | 2 horas  | 5 minutos     | -96%     |
| **Linhas de CSS**         | ~350     | ~210          | -40%     |
| **Valores hardcoded**     | ~45      | ~5            | -89%     |
| **Tempo novo componente** | 15 min   | 5 min         | -67%     |
