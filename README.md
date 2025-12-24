# 🎵 Graphic Audio Blob (GAB)

> **Visualizador de áudio espectral em tempo real com sistema multi-window**  
> Versão: 0.0.1 | Branch: amyszko (develop) | Stack: Vue 3 + TypeScript + Vite

---

## 📖 Visão Geral

**Graphic Audio Blob** é uma aplicação web avançada para visualização de áudio em tempo real com arquitetura profissional. Construída com **Vue 3**, **TypeScript** e **Vite**, oferece análise FFT de áudio, efeitos visuais espectrais sincronizados, sistema multi-window para dual-screen, e arquitetura modular escalável.

### 🎯 Principais Funcionalidades

- � **Visualização espectral avançada** - 8 camadas concêntricas reagindo a bandas de frequência (20Hz-22kHz)
- 🪟 **Sistema multi-window** - Sincronização em tempo real via BroadcastChannel (zero latência)
- 🎵 **Player de música completo** - Playlist automática, seek, controles de volume
- � **Efeitos visuais 3D** - Orbe espectral com parallax de mouse, wobble effect, beat pulse
- �🎭 **Temas dinâmicos** - Matrix (padrão), RGB Mode, Chameleon Mode adaptativo
- 🎛️ **Sistema drag-and-drop** - Componentes arrastáveis com gerenciamento automático de z-index
- � **Debug tools profissionais** - Terminal de monitoramento e visualizador de frequências
- � **Arquitetura SCSS modular** - Design system completo com variáveis, mixins e animações

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js >= 18
- npm ou yarn

### Instalação e Execução

```bash
# Clonar o repositório
git clone https://github.com/lugand-sistemas-ltda/graphic_audio_blob.git
cd graphic_audio_blob

# Instalar dependências
npm install

# Executar em modo desenvolvimento (hot-reload)
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

### Adicionar Músicas

Coloque arquivos `.mp3` em `/src/assets/music/` - serão carregados automaticamente pela playlist.

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Diretórios

```
src/
├── 📱 App.vue                    # Orquestrador central (provide/inject)
├── 🔧 main.ts                    # Bootstrap (Pinia, Router, Diretivas)
│
├── 🧩 components/                # Componentes Vue (19 componentes)
│   ├── MusicPlayer.vue           # Player completo (track info, controls, volume)
│   ├── Playlist.vue              # Lista de músicas expansível
│   ├── AudioControls.vue         # Controles de áudio (deprecated)
│   ├── FrequencyVisualizer.vue   # 8 barras de frequência em tempo real
│   ├── DebugTerminal.vue         # Terminal de monitoramento Matrix
│   ├── OrbEffectControl.vue      # Controles da esfera (size, reactivity)
│   ├── ThemeSelector.vue         # Seletor de temas dinâmicos
│   ├── MatrixCharacter.vue       # Personagem 3D girando (moeda)
│   ├── MainControl.vue           # Container pai dos controles
│   ├── VisualControls.vue        # Controles de efeitos visuais
│   ├── SoundControl.vue          # Controles de som
│   └── sidebar/                  # Componentes da sidebar
│       ├── ComponentManager.vue  # Gerenciador de visibilidade
│       ├── WindowControl.vue     # Controle multi-window
│       └── ...
│
├── 🎮 composables/               # Composition API (13 composables)
│   ├── useAudioAnalyzer.ts      # 🎵 Core: FFT 512, beat detection, 8 bandas
│   ├── useSpectralVisualEffect.ts # � Efeito espectral (8 camadas concêntricas)
│   ├── usePlaylist.ts           # 📀 Auto-load de /assets/music/*.mp3
│   ├── useComponentManager.ts   # 🧩 Visibilidade + collapse (localStorage)
│   ├── useDraggable.ts          # 🖱️ Drag-and-drop + z-index automático
│   ├── useWindowManager.ts      # � Multi-window (integrado via core/sync)
│   ├── useTheme.ts              # 🎨 Sistema de temas
│   ├── useRgbMode.ts            # 🌈 Rotação HSL contínua
│   └── useChameleonMode.ts      # 🦎 Cores adaptativas ao áudio
│
├── 🔌 core/                      # Sistemas fundamentais
│   ├── state/                    # Estado global compartilhado
│   │   ├── types.ts              # WindowConfig, ComponentState, StateAction
│   │   ├── useGlobalState.ts     # Hook de estado centralizado
│   │   └── index.ts
│   ├── sync/                     # Sistema multi-window (BroadcastChannel)
│   │   ├── types.ts              # SyncMessage, AudioSyncData, WindowRole
│   │   ├── useBroadcastSync.ts   # Low-level: broadcast + heartbeat
│   │   ├── useWindowManager.ts   # High-level: API de sincronização
│   │   └── index.ts
│   └── drag/
│       └── useCrossWindowDrag.ts # Drag entre janelas (experimental)
│
├── 🎨 style/                     # SCSS modular (Design System)
│   ├── index.scss                # 📦 Orquestrador (imports na ordem)
│   ├── _themes.scss              # 🎨 Paletas (Matrix, Cyberpunk, etc)
│   ├── _variables.scss           # 📏 Design tokens (spacing, typography)
│   ├── _mixins.scss              # 🔧 matrix-panel, matrix-text, etc
│   ├── _animations.scss          # 💫 Keyframes (blink, pulse, glitch)
│   ├── _base.scss                # 📝 Estilos HTML base
│   ├── _custom.scss              # 🎯 Componentes do projeto
│   └── _chameleon.scss           # 🦎 Modo cameleon
│
├── 🗂️ views/                     # Rotas Vue Router
│   ├── HomeView.vue              # / - Dashboard principal
│   ├── VisualView.vue            # /visual - Tela cheia para 2º monitor
│   └── GenericWindow.vue         # /window - Janela customizável
│
├── 🛣️ router/index.ts            # Hash mode, 3 rotas
├── 🏪 store/index.ts             # Pinia (placeholder - pouco usado)
├── 🎯 utils/defaultPositions.ts  # Posições iniciais de componentes
└── 🎬 directives/vDraggable.ts   # Diretiva v-draggable global
```

---

## 🧩 Sistemas Principais

### 1️⃣ **Sistema de Áudio - `useAudioAnalyzer.ts`**

**Análise em tempo real usando Web Audio API:**

```typescript
interface AudioFrequencyData {
  bass: number; // Graves (0-255)
  mid: number; // Médios (0-255)
  treble: number; // Agudos (0-255)
  overall: number; // Volume geral (0-255)
  beat: boolean; // Beat detectado
  raw: Uint8Array; // Dados FFT brutos
  frequencyBands: number[]; // 8 bandas espectrais ⭐
}
```

**Especificações técnicas:**

- **FFT Size**: 512 bins de frequência
- **Smoothing**: 0.8 (suavização temporal)
- **Taxa de atualização**: 60 FPS (requestAnimationFrame)
- **Beat detection**: Threshold adaptativo (aumentos súbitos de volume > 200)
- **Cooldown de beat**: 300ms (evita falsos positivos)

**8 Bandas de Frequência (divisão logarítmica):**

```
Banda 0: 20-60Hz    (Sub-bass)
Banda 1: 60-250Hz   (Bass)
Banda 2: 250-500Hz  (Low-mid)
Banda 3: 500-2kHz   (Mid)
Banda 4: 2-4kHz     (High-mid)
Banda 5: 4-6kHz     (Presence)
Banda 6: 6-10kHz    (Brilliance)
Banda 7: 10-22kHz   (Air)
```

**Controles disponíveis:**

```typescript
audio.play()                    // Iniciar reprodução
audio.pause()                   // Pausar
audio.seek(time: number)        // Pular para posição
audio.setVolume(volume: number) // Ajustar volume (0-1)
audio.setBeatSensitivity(s)     // Threshold de beat (50-300)
```

---

### 2️⃣ **Sistema de Visualização Espectral - `useSpectralVisualEffect.ts`**

**8 camadas concêntricas reagindo ao espectro de áudio:**

```typescript
interface SpectralLayer {
  frequency: number; // Valor atual (interpolado)
  targetFrequency: number; // Valor alvo (do áudio)
  radius: number; // Raio base da camada
  color: { h; s; l }; // Cor HSL dinâmica
  wobble: number; // Distorção senoidal
}
```

**Sistema de cores HSL dinâmico:**

```typescript
// Mapeamento: Agudos (vermelho) → Graves (azul/roxo)
baseHue = 360 - (layerIndex / 8) * 280;

// Intensidade afeta saturação e luminosidade
saturation = 70 + (frequency / 255) * 30; // 70%-100%
lightness = 30 + (frequency / 255) * 30; // 30%-60%
```

**Efeitos visuais:**

- ✨ **Parallax 3D**: Mouse controla offset do gradiente (profundidade)
- 🌊 **Wobble effect**: Distorção senoidal + reação ao áudio
- 💥 **Beat pulse**: Body inteiro pulsa (scale 1.02) no beat
- 🎨 **Cores adaptativas**: HSL baseado em intensidade de frequência
- 📐 **Responsivo**: Tamanho baseado em % da diagonal da viewport

**Cálculo de tamanho responsivo:**

```typescript
// Diagonal da tela = tamanho máximo
maxScreenSize = √(width² + height²) / 2

// Slider controla 20%-100% do tamanho máximo
baseSize = maxScreenSize * (sphereSize/500) * 0.6

// Volume adiciona variação suave (até +30%)
finalSize = baseSize + (baseSize * 0.3 * volumeRatio)
```

---

### 3️⃣ **Sistema Multi-Window - `useWindowManager.ts`**

**Sincronização em tempo real via BroadcastChannel API (nativo do browser):**

**Arquitetura em camadas:**

```
┌─────────────────────────────────┐
│ useWindowManager (High-Level)   │ ← API específica do app
├─────────────────────────────────┤
│ useBroadcastSync (Low-Level)    │ ← BroadcastChannel + Heartbeat
├─────────────────────────────────┤
│ BroadcastChannel API (Browser)  │ ← Nativo (zero latência)
└─────────────────────────────────┘
```

**Features implementadas:**

- ✅ **Heartbeat system**: Janelas enviam "estou viva" a cada 3s
- ✅ **Auto-detecção**: Janelas inativas detectadas após 10s sem heartbeat
- ✅ **Sincronização de áudio**: 8 bandas de frequência + beat (60 FPS)
- ✅ **Sincronização de controles**: Play/pause/volume/track/seek
- ✅ **Sincronização de temas**: Mudanças de tema propagadas
- ✅ **Window roles**: main, visual, controls, grid

**Uso típico (setup dual-screen):**

```typescript
// Monitor 1 (Principal) - Rota: /
- MainControl, MusicPlayer, Playlist
- ThemeSelector, DebugTerminal
- Todos os controles

// Monitor 2 (Visual) - Rota: /visual
- Apenas efeitos visuais fullscreen
- Recebe dados de áudio via sync
- Sem controles (projeção/livestream)
```

**API:**

```typescript
const wm = useWindowManager({ enableLogging: false });

wm.windowCount; // Número de janelas
wm.isMultiWindow; // Mais de 1 janela?
wm.openVisualWindow(); // Abre /visual
wm.syncAudioData(data); // Envia áudio para outras janelas
wm.onAudioData((data) => {}); // Recebe áudio de outras janelas
```

**Limitações:**

- ⚠️ Mesmo domínio apenas (segurança do browser)
- ⚠️ Popup blocker (usuário precisa permitir)
- ⚠️ Browser support: Chrome, Firefox, Edge, Safari 15.4+

---

### 4️⃣ **Sistema de Componentes - `useComponentManager.ts`**

**Gerenciamento centralizado de visibilidade e estado:**

```typescript
interface ManagedComponent {
  id: string;
  name: string;
  category: "visual" | "audio" | "debug" | "system";
  visible: boolean;
  collapsibleId?: string; // ID do useCollapsible
}
```

**Funcionalidades:**

```typescript
// Registro (automático ao montar componente)
componentManager.register(id, name, category);

// Controle individual
componentManager.toggle(id); // Alterna visibilidade
componentManager.show(id); // Mostrar
componentManager.hide(id); // Esconder
componentManager.collapse(id); // Colapsar
componentManager.expand(id); // Expandir

// Controle global
componentManager.showAll(); // Mostrar todos
componentManager.hideAll(); // Esconder todos
componentManager.collapseAll(); // Colapsar todos
componentManager.expandAll(); // Expandir todos

// Estado
componentManager.isVisible(id); // Retorna boolean
componentManager.listComponents(); // Lista todos registrados
```

**Persistência:**

- ✅ Estado salvo em `localStorage` automaticamente
- ✅ Restaurado ao recarregar página
- ✅ Snapshot de visibilidade para restore após `hideAll()`

---

### 5️⃣ **Sistema de Drag-and-Drop - `useDraggable.ts` + `vDraggable`**

**Diretiva global para componentes arrastáveis:**

```vue
<template>
  <div v-draggable class="my-component">Arraste-me!</div>
</template>
```

**Features:**

- ✅ **Z-index automático**: Componente clicado vem para frente
- ✅ **Posições persistidas**: Salvamento em localStorage
- ✅ **Smooth dragging**: Transform CSS (GPU accelerated)
- ✅ **Boundary detection**: Não sai da tela
- ✅ **Cross-window**: Experimental (drag entre janelas)

**Integração com `useZIndex`:**

```typescript
const zIndexManager = useZIndex()

// Z-index scale
--z-index-base: 1
--z-index-panel: 10
--z-index-modal: 100
--z-index-dropdown: 200
--z-index-tooltip: 300

// Ao clicar em componente
zIndexManager.bringToFront(componentId)  // +1 no z-index
```

---

### 6️⃣ **Sistema de Temas**

**3 sistemas de temas simultâneos:**

#### A) **Temas Estáticos** (`_themes.scss`)

```scss
:root {
  --theme-primary: #00ff00; // Matrix green (padrão)
  --theme-primary-bright: #41ff41;
  --theme-primary-dim: #008f11;
}

:root[data-theme="cyberpunk"] {
  --theme-primary: #ff00ff; // Rosa neon
}
```

**Trocar tema:**

```javascript
document.documentElement.setAttribute("data-theme", "cyberpunk");
```

#### B) **RGB Mode** (`useRgbMode.ts`)

- Rotação contínua de HSL (0°-360°)
- Atualização a cada 50ms
- Efeito arco-íris suave

#### C) **Chameleon Mode** (`useChameleonMode.ts`)

- Cores baseadas em frequências de áudio
- Bass → Red, Mid → Green, Treble → Blue
- Transições suaves interpoladas

---

### 7️⃣ **Sistema de Playlist - `usePlaylist.ts`**

**Auto-carregamento de músicas:**

```typescript
// Vite glob import automático
const musicFiles = import.meta.glob("/src/assets/music/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
});

// Converte para Track[]
interface Track {
  id: string;
  title: string; // Nome do arquivo sem .mp3
  file: string; // URL do arquivo
}
```

**API:**

```typescript
const playlist = usePlaylist();

playlist.tracks; // ref<Track[]>
playlist.currentTrack; // computed<Track>
playlist.currentTrackIndex; // ref<number>
playlist.hasNext; // computed<boolean>
playlist.hasPrevious; // computed<boolean>

playlist.nextTrack(); // Avançar
playlist.previousTrack(); // Voltar
playlist.selectTrack(index); // Selecionar específica
```

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
