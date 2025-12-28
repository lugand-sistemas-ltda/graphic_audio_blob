# 🎨 Theme System Feature

## Visão Geral

Feature responsável pelo **sistema completo de temas** da aplicação, incluindo:

- Seleção e troca de temas
- Modos especiais de tema (RGB, Chameleon)
- Persistência de preferências
- Integração com sistema global de temas (`core/global/useGlobalTheme`)

## Estrutura

```
theme-system/
├── components/
│   └── ThemeSelector.vue          # Seletor visual de temas
├── composables/
│   ├── useTheme.ts                # Lógica de seleção de tema
│   └── special-modes/             # 🌟 Modos especiais de tema
│       ├── useRgbMode.ts          # 🌈 Rotação HSL (rainbow effect)
│       └── useChameleonMode.ts    # 🦎 Cores reativas ao áudio
└── index.ts                       # Public API
```

## Composables

### `useTheme()`

Gerencia a seleção e aplicação de temas estáticos.

**Uso:**

```typescript
import { useTheme } from "@/features/theme-system";

const { currentTheme, setTheme, availableThemes } = useTheme();
```

### `useRgbMode()`

Modo especial que **rotaciona continuamente o matiz HSL** criando efeito rainbow.

**Características:**

- ✅ Aplica-se **globalmente** em todo app
- ✅ Integrado com `useGlobalTheme` (core/global)
- ✅ Modifica variáveis CSS: `--theme-primary-rgb`, `--theme-primary`, etc.
- ✅ Velocidade, saturação e brilho configuráveis

**Uso:**

```typescript
import { useRgbMode } from "@/features/theme-system";

// Em App.vue (nível global)
useRgbMode(); // Auto-start/stop via watch do globalState
```

**Estado Global:**

```typescript
globalTheme.state.value.rgbMode = {
  enabled: boolean,
  speed: number, // 0-200 (multiplicador de velocidade)
  saturation: number, // 0-100
  brightness: number, // 0-100
};
```

### `useChameleonMode()`

Modo especial que cria **gradientes multicoloridos** com rotação orgânica.

**Características:**

- ✅ Aplica-se **globalmente** em todo app
- ✅ Integrado com `useGlobalTheme` (core/global)
- ✅ Cria 8 variáveis CSS para camadas: `--chameleon-layer-0` até `--chameleon-layer-7`
- ✅ Gradientes animados: `--chameleon-gradient-1/2/3`, `--chameleon-border-gradient`
- ✅ Sensibilidade configurável

**Uso:**

```typescript
import { useChameleonMode } from "@/features/theme-system";

// Em App.vue (nível global)
useChameleonMode(); // Auto-start/stop via watch do globalState
```

**Estado Global:**

```typescript
globalTheme.state.value.chameleonMode = {
  enabled: boolean,
  sensitivity: number, // 0-200 (multiplicador de velocidade de rotação)
};
```

## Integração com Sistema Global

Os modos especiais (RGB e Chameleon) são **coordenados globalmente** via `core/global/useGlobalTheme`:

```typescript
// core/global/useGlobalTheme.ts
export interface GlobalThemeState {
  currentTheme: string;
  rgbMode: {
    enabled: boolean;
    speed: number;
    saturation: number;
    brightness: number;
  };
  chameleonMode: {
    enabled: boolean;
    sensitivity: number;
  };
}
```

**Toggle Global:**

```typescript
import { useGlobalTheme } from "@/core/global";

const globalTheme = useGlobalTheme();

// Ativa RGB mode em todas as janelas
globalTheme.toggleRgbMode("window-id");

// Ativa Chameleon mode em todas as janelas
globalTheme.toggleChameleonMode("window-id");
```

## Aplicação Global vs Local

### ✅ Global (atual - correto)

- RGB/Chameleon modificam **variáveis CSS raiz** (`document.documentElement.style`)
- Afetam **todos os componentes** do app automaticamente
- Estado sincronizado via `useGlobalTheme` (BroadcastChannel)
- Watch em `App.vue` garante início/parada global

### ❌ Local (incorreto)

- ~~RGB/Chameleon como efeitos visuais isolados~~
- ~~Afetam apenas componentes específicos~~
- ~~Não sincronizam entre janelas~~

## CSS Variables Criadas

### RGB Mode

```css
--theme-primary-rgb: <r>, <g>, <b>  /* Cor principal em formato RGB */
--theme-primary: rgb(...)            /* Cor principal */
--theme-primary-bright: rgb(...)     /* Variante clara */
--theme-primary-dim: rgb(...)        /* Variante escura */
```

### Chameleon Mode

```css
/* Camadas (0-7) para efeitos visuais */
--chameleon-layer-0: <r>, <g>, <b>
--chameleon-layer-1: <r>, <g>, <b>
...
--chameleon-layer-7: <r>, <g>, <b>

/* Gradientes */
--chameleon-gradient-1: linear-gradient(...)
--chameleon-gradient-2: linear-gradient(...)
--chameleon-gradient-3: linear-gradient(...)
--chameleon-border-gradient: conic-gradient(...)

/* Cores sólidas */
--chameleon-color-1: rgb(...)
--chameleon-color-2: rgb(...)
--chameleon-color-3: rgb(...)
```

## Como Usar nos Componentes

### Aplicar RGB/Chameleon em Headers/Títulos

Se algum componente **não está pegando** os efeitos RGB/Chameleon, use as variáveis CSS:

```scss
.component-header {
  // Usa a variável que RGB/Chameleon modificam
  color: rgb(var(--theme-primary-rgb));

  // Ou para bordas
  border-color: rgb(var(--theme-primary-rgb));
}
```

### Verificar se variável está sendo usada

```scss
// ✅ CORRETO - Usa variável dinâmica
color: rgb(var(--theme-primary-rgb));

// ❌ INCORRETO - Cor estática, não muda com RGB/Chameleon
color: #00ff00;
```

## Troubleshooting

### Componente não recebe efeito RGB/Chameleon

**Problema:** Headers/títulos ficam com cor estática

**Solução:**

1. Verificar se componente usa `rgb(var(--theme-primary-rgb))`
2. Se usa cor hardcoded (ex: `#00ff00`), substituir por variável
3. Verificar se há `!important` sobrescrevendo

**Exemplo de fix:**

```scss
// Antes (não funciona)
.header-title {
  color: var(--theme-primary); // Valor inicial não muda
}

// Depois (funciona)
.header-title {
  color: rgb(var(--theme-primary-rgb)); // Valor dinâmico
}
```

## Histórico

- **v0.0.6** - Movidos `useRgbMode` e `useChameleonMode` de `visual-effects` para `theme-system`
- **v0.0.5** - RGB/Chameleon integrados com sistema global
- **v0.0.4** - Criação dos modos especiais

## Relação com outras Features

- **core/global/useGlobalTheme** - Orquestra estado global dos temas
- **visual-effects** - ~~Não mais responsável por RGB/Chameleon~~ ✅
- **window-management** - Sincroniza estado entre janelas via BroadcastChannel
