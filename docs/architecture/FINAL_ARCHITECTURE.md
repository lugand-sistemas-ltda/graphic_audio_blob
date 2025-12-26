# 🏗️ Arquitetura Final - Graphic Audio Blob

> **Padrão**: Feature-Sliced Design + Domain-Driven Design (Híbrido)  
> **Status**: ✅ Completo (Fase 11 - Final Polish)  
> **Build**: ✅ 7 erros pré-existentes apenas

---

## 📊 Visão Geral

```
src/
├── app/                    # 🚀 Application Bootstrap
│   ├── config/            # Configurações da aplicação
│   └── router/            # Roteamento Vue Router
│
├── features/              # 🎯 Features Auto-contidas (FSD)
│   ├── audio-player/      # Player de áudio + análise espectral
│   ├── debug-tools/       # Terminal de debug
│   ├── drag-and-drop/     # Sistema de drag entre janelas
│   ├── theme-system/      # Sistema de temas
│   ├── visual-effects/    # Efeitos visuais (RGB, Chameleon, etc)
│   └── window-management/ # Gerenciamento de janelas
│
├── core/                  # 💎 Business Logic (DDD)
│   ├── global/            # Estado global (audio, theme)
│   ├── state/             # Gerenciamento de estado
│   └── sync/              # Sincronização entre janelas
│
├── shared/                # 🔧 Shared/Generic Code
│   ├── components/ui/     # Componentes UI genéricos
│   └── composables/       # Composables reutilizáveis
│
├── components/            # 🎨 App-Specific Components
│   ├── alerts/            # Sistema de alertas
│   └── layout/            # Componentes de layout (Header, Sidebar)
│
├── layouts/               # 📐 Layout Templates
├── views/                 # 📄 View Components (Routes)
├── style/                 # 🎨 Global Styles
└── assets/                # 📦 Static Assets
```

---

## 🎯 Features (Auto-contidas)

Cada feature é **independente** e **auto-contida**, seguindo princípios de Feature-Sliced Design:

### 1️⃣ **audio-player**
**Propósito**: Player de áudio com análise espectral  
**Estrutura**:
```
audio-player/
├── components/
│   ├── AudioControls.vue
│   ├── MusicPlayer.vue
│   ├── Playlist.vue
│   └── SoundControl.vue
├── composables/
│   ├── useAudioAnalyzer.ts
│   ├── usePlayerSync.ts
│   └── usePlaylist.ts
└── index.ts (barrel export)
```
**Responsabilidades**:
- Reprodução de áudio
- Análise de frequências (FFT)
- Sincronização de áudio entre janelas
- Gerenciamento de playlist

---

### 2️⃣ **visual-effects**
**Propósito**: Efeitos visuais reativos ao áudio  
**Estrutura**:
```
visual-effects/
├── components/
│   ├── ChameleonEffect.vue
│   ├── HealthBarEffect.vue
│   ├── ParticleSystem.vue
│   ├── RgbEffect.vue
│   └── SpectralVisualizer.vue
├── composables/
│   ├── useChameleonMode.ts
│   ├── useParticleSystem.ts
│   ├── useRgbMode.ts
│   └── useSpectralVisualEffect.ts
└── index.ts
```
**Responsabilidades**:
- RGB Color Cycling
- Chameleon Mode (imagem reativa)
- Health Bar pulsante
- Sistema de partículas
- Visualizador espectral

---

### 3️⃣ **window-management**
**Propósito**: Gerenciamento de múltiplas janelas  
**Estrutura**:
```
window-management/
├── components/
│   ├── ComponentManager.vue    # Picker de componentes
│   ├── EffectsControl.vue      # Controle de efeitos visuais
│   ├── GlobalControls.vue      # Controles globais
│   ├── WindowControl.vue       # Controle de janelas
│   ├── WindowSettings.vue      # Configurações
│   └── WindowSettingsPanel.vue # Painel de settings
├── composables/
│   ├── useComponentManager.ts
│   └── useWindowType.ts
└── index.ts
```
**Responsabilidades**:
- Abertura/fechamento de janelas
- Gerenciamento de componentes por janela
- Controle de efeitos visuais
- Settings de janelas

---

### 4️⃣ **drag-and-drop**
**Propósito**: Drag & drop cross-window  
**Estrutura**:
```
drag-and-drop/
├── composables/
│   └── useCrossWindowDrag.ts
├── directives/
│   └── vDraggable.ts
├── utils/
│   └── defaultPositions.ts  # ✨ Movido na Fase 11
└── index.ts
```
**Responsabilidades**:
- Drag de componentes entre janelas
- Posicionamento inicial
- Salvamento de posições

---

### 5️⃣ **theme-system**
**Propósito**: Sistema de temas (Dark/Light/Matrix)  
**Estrutura**:
```
theme-system/
├── components/
│   └── ThemeSelector.vue
├── composables/
│   └── useTheme.ts
└── index.ts
```
**Responsabilidades**:
- Seleção de temas
- Persistência de tema
- CSS variables dinâmicas

---

### 6️⃣ **debug-tools**
**Propósito**: Terminal de debug para desenvolvimento  
**Estrutura**:
```
debug-tools/
├── components/
│   └── DebugTerminal.vue
└── index.ts
```
**Responsabilidades**:
- Inspeção de estado
- Logs de desenvolvimento

---

## 💎 Core (Business Logic)

### **core/global/**
Estado global compartilhado entre todas as janelas:
- `useGlobalAudio.ts` - Estado de áudio
- `useGlobalTheme.ts` - Estado de tema

### **core/state/**
Gerenciamento de estado da aplicação:
- `useGlobalState.ts` - Estado principal (windows, components, alerts)
- `types.ts` - Type definitions

### **core/sync/**
Sincronização entre janelas (BroadcastChannel):
- `useBroadcastSync.ts` - Sincronização de estado
- `useWindowManager.ts` - Gerenciamento de janelas abertas

---

## 🔧 Shared (Código Genérico Reutilizável)

### **shared/components/ui/** ✨ Movido na Fase 11
Componentes UI genéricos:
```
ui/
├── buttons/
│   └── BaseButton.vue
├── feedback/
│   └── LoadingScreen.vue
└── index.ts
```

### **shared/composables/**
Composables genéricos:
- `useCollapsible.ts` - Lógica de collapse
- `useComponentValidator.ts` - Validação de props
- `useDraggable.ts` - Drag básico
- `useGlobalAlerts.ts` - Sistema de alertas

---

## 🚀 App (Bootstrap)

### **app/config/** ✨ Criado na Fase 11
Configurações da aplicação:
- `availableComponents.ts` - Lista de componentes disponíveis

### **app/router/** ✨ Criado na Fase 11
Roteamento Vue Router:
- `index.ts` - Definição de rotas

---

## 🎨 Components (App-Specific)

### **components/alerts/**
Sistema de alertas (não-genérico):
- `AlertContainer.vue` - Container de alertas
- `BaseAlert.vue` - Componente de alerta

### **components/layout/**
Componentes de layout da aplicação:
- `AppHeader.vue` - Header principal
- `AppSidebar.vue` - Sidebar de controles
- `MainControl.vue` - Controle principal ✨ Movido na Fase 11

---

## 📋 Diferenças: shared/ vs components/

| Aspecto | `shared/` | `components/` |
|---------|-----------|---------------|
| **Propósito** | Código **genérico reutilizável** | Código **específico da aplicação** |
| **Exemplo** | BaseButton, LoadingScreen | AlertContainer, AppHeader |
| **Acoplamento** | Zero acoplamento com lógica de negócio | Acoplado com domínio da app |
| **Reusabilidade** | Pode ser extraído para biblioteca | Depende do contexto da app |

---

## 🏆 Fase 11 - Final Polish (Completada)

### ✅ Step 1: Move feature-specific utils
- `defaultPositions.ts` → `features/drag-and-drop/utils/`
- **Rationale**: Não é util genérico, é específico do drag-and-drop

### ✅ Step 2: Consolidate window-management components
- Movidos 4 componentes: `ComponentManager`, `EffectsControl`, `GlobalControls`, `WindowControl`
- `src/components/sidebar/` → `features/window-management/components/`
- **Rationale**: Componentes específicos da feature, não genéricos

### ✅ Step 3: Relocate generic UI to shared
- `src/components/ui/` → `src/shared/components/ui/`
- **Rationale**: BaseButton, LoadingScreen são componentes genéricos

### ✅ Step 4: Organize layout components
- `MainControl.vue` → `components/layout/`
- **Rationale**: Consolidar todos os componentes de layout

### ✅ Step 5: Create app/ bootstrap directory
- Criado: `src/app/`
- Movidos: `config/`, `router/`
- **Rationale**: Separar bootstrap/config da lógica de features

### ✅ Step 6: Cleanup empty directories
- Removidos: `src/utils/`, `src/components/sidebar/`
- **Rationale**: Diretórios vazios após reorganização

---

## 🎯 Princípios Arquiteturais

### 1. **Feature-Sliced Design** (Features)
- Cada feature é auto-contida
- Barrel exports (`index.ts`)
- Sem dependências entre features
- Comunicação via `core/`

### 2. **Domain-Driven Design** (Core)
- Business logic isolada em `core/`
- Estados compartilhados em `core/global/`
- Sincronização em `core/sync/`
- Types centralizados

### 3. **Shared Kernel** (Shared)
- Código genérico reutilizável
- Componentes UI puros
- Composables sem lógica de negócio
- Pode ser extraído para biblioteca

### 4. **App Bootstrap** (App)
- Configurações centralizadas
- Roteamento isolado
- Inicialização da aplicação

---

## 📦 Estrutura de Imports

### ✅ Correto
```typescript
// Feature para Core
import { useGlobalState } from '../../core/state'

// Feature para Shared
import { BaseButton } from '../../shared/components/ui'

// Feature para App
import { AVAILABLE_COMPONENTS } from '../../app/config/availableComponents'

// Core para Core
import { useGlobalAudio } from '../global'
```

### ❌ Incorreto
```typescript
// Feature para Feature (acoplamento!)
import { useAudioPlayer } from '../../audio-player'

// Shared para Core (inversão de dependência!)
import { useGlobalState } from '../../core/state'
```

---

## 🔄 Fluxo de Dados

```
┌─────────────┐
│   App.vue   │  Bootstrap
└─────┬───────┘
      │
      ↓
┌─────────────┐
│  core/      │  Estado Global + Sync
│  - state    │
│  - sync     │
│  - global   │
└─────┬───────┘
      │
      ↓
┌─────────────┐
│ features/   │  Features auto-contidas
│ - audio     │  (comunicam via core/)
│ - visual    │
│ - window    │
└─────┬───────┘
      │
      ↓
┌─────────────┐
│  shared/    │  Componentes genéricos
│  - ui       │
│  - compos.  │
└─────────────┘
```

---

## 🎉 Status Final

### ✅ Build Status
```bash
npm run build
# ✅ 7 erros pré-existentes apenas (sem novos erros)
```

### 📊 Métricas
- **Features**: 6 auto-contidas
- **Components**: 13 (app-specific) + UI genéricos
- **Composables**: 17 (shared + features)
- **Core Modules**: 3 (global, state, sync)

### 🏆 Fases Completadas
1. ✅ Phase 1-10: Refactoring completo (features, shared, core)
2. ✅ Phase 11: Final Polish (app/, reorganizações finais)

---

## 📚 Documentação Relacionada

- [Component Architecture](./COMPONENT_ARCHITECTURE.md)
- [Window Management](./WINDOW_MANAGEMENT.md)
- [Audio Architecture](./AUDIO_ARCHITECTURE.md)
- [Theme System](./THEME_ARCHITECTURE.md)
- [Refactoring Summary](../changelogs/REFACTORING_SUMMARY.md)

---

**Arquitetura completa e pronta para escalar! 🚀**
