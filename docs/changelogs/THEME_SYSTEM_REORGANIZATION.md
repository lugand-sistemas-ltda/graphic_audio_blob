# Changelog - Theme System Reorganization (v0.0.7)

**Data:** 28 de Dezembro de 2025  
**Tipo:** Refatoração arquitetural  
**Impacto:** Médio (organização, sem breaking changes)

## 🎯 Objetivo

Reorganizar `useRgbMode` e `useChameleonMode` de `visual-effects` para `theme-system`, onde realmente pertencem, já que são **modificadores globais de tema** e não efeitos visuais isolados.

## 📦 Mudanças Realizadas

### 1. Estrutura de Pastas Criada

```diff
src/features/theme-system/
├── components/
│   └── ThemeSelector.vue
├── composables/
│   ├── useTheme.ts
+   └── special-modes/              # ✨ NOVO
+       ├── useRgbMode.ts           # 🌈 Movido de visual-effects
+       └── useChameleonMode.ts     # 🦎 Movido de visual-effects
└── index.ts
```

### 2. Arquivos Movidos

| Origem                                                        | Destino                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `src/features/visual-effects/composables/useRgbMode.ts`       | `src/features/theme-system/composables/special-modes/useRgbMode.ts`       |
| `src/features/visual-effects/composables/useChameleonMode.ts` | `src/features/theme-system/composables/special-modes/useChameleonMode.ts` |

### 3. Exports Atualizados

#### `theme-system/index.ts`

```typescript
// ✨ NOVO
export { useRgbMode } from "./composables/special-modes/useRgbMode";
export { useChameleonMode } from "./composables/special-modes/useChameleonMode";
```

#### `visual-effects/index.ts`

```diff
- export { useChameleonMode } from './composables/useChameleonMode'
- export { useRgbMode } from './composables/useRgbMode'
```

### 4. Imports Atualizados

#### `App.vue`

```diff
- import { useVisualEffectsManager, useRgbMode, useChameleonMode } from './features/visual-effects'
+ import { useVisualEffectsManager } from './features/visual-effects'
+ import { useRgbMode, useChameleonMode } from './features/theme-system'
```

## 🔧 Funcionalidade Mantida

✅ **NENHUMA mudança de comportamento**

- RGB Mode continua funcionando idêntico
- Chameleon Mode continua funcionando idêntico
- Integração com `useGlobalTheme` intacta
- Sincronização entre janelas funcionando
- CSS variables sendo atualizadas corretamente

## 📚 Documentação Criada

### `theme-system/README.md` (novo)

Documentação completa incluindo:

- Visão geral da feature
- Estrutura de pastas
- Como usar cada composable
- Integração com sistema global
- CSS variables criadas
- Troubleshooting para componentes que não pegam efeitos

## 🧪 Testes Realizados

- ✅ Compilação sem erros
- ✅ Imports resolvidos corretamente
- ✅ Estrutura de pastas organizada
- ✅ Public APIs exportando corretamente

## 🎨 Arquitetura Final

### Por que theme-system?

**Antes (incorreto):**

```
visual-effects/
├── useRgbMode.ts         ❌ Não é efeito visual
├── useChameleonMode.ts   ❌ Não é efeito visual
└── useSpectralVisualEffect.ts ✅ Efeito visual
```

**Depois (correto):**

```
theme-system/
└── special-modes/
    ├── useRgbMode.ts         ✅ Modo especial de TEMA
    └── useChameleonMode.ts   ✅ Modo especial de TEMA

visual-effects/
└── gradient-effect/
    └── useSpectralVisualEffect.ts ✅ Efeito visual
```

### Diferença Conceitual

| Característica    | Visual Effects               | Theme Modes (RGB/Chameleon) |
| ----------------- | ---------------------------- | --------------------------- |
| **Escopo**        | Canvas específico            | Todo o app (global)         |
| **Tecnologia**    | Canvas 2D/WebGL              | CSS Variables               |
| **Estado**        | Local/Manager                | Global (useGlobalTheme)     |
| **Sincronização** | Não necessária               | BroadcastChannel            |
| **Objetivo**      | Renderizar formas/partículas | Modificar paleta de cores   |

### Variáveis CSS Afetadas

#### RGB Mode

```css
--theme-primary-rgb: <r>, <g>, <b>
--theme-primary: rgb(...)
--theme-primary-bright: rgb(...)
--theme-primary-dim: rgb(...)
```

#### Chameleon Mode

```css
--chameleon-layer-0 até --chameleon-layer-7
--chameleon-gradient-1/2/3
--chameleon-border-gradient
--chameleon-color-1/2/3
```

## 🐛 Potenciais Issues Resolvidos

### Issue: "Headers/títulos não pegam RGB/Chameleon"

**Causa Raiz Identificada:**

- Componentes usam `var(--color-accent)`
- `--color-accent` → `var(--theme-primary)`
- `--theme-primary` é atualizado dinamicamente por RGB/Chameleon
- **✅ Cadeia está correta!**

**Se algum componente NÃO pega o efeito:**

1. Verificar se usa `rgb(var(--theme-primary-rgb))` ou `var(--theme-primary)`
2. Checar se não há cor hardcoded (`#00ff00`, etc)
3. Verificar se não há `!important` sobrescrevendo

**Exemplo de fix:**

```scss
// ❌ ANTES (não dinâmico)
.header-title {
  color: #00ff00; // Valor fixo
}

// ✅ DEPOIS (dinâmico)
.header-title {
  color: var(--color-accent); // Usa variável que muda
}
```

## 📋 Checklist de Migração

- [x] Criar pasta `theme-system/composables/special-modes/`
- [x] Mover `useRgbMode.ts`
- [x] Mover `useChameleonMode.ts`
- [x] Atualizar `theme-system/index.ts` (exports)
- [x] Remover exports de `visual-effects/index.ts`
- [x] Atualizar imports em `App.vue`
- [x] Criar README.md com documentação completa
- [x] Testar compilação
- [x] Verificar funcionalidade

## 🚀 Próximos Passos (Sugestões)

1. **Criar componentes de controle:**

   - `RgbModeControl.vue` (ajustar speed/saturation/brightness)
   - `ChameleonModeControl.vue` (ajustar sensitivity)

2. **Adicionar ao ThemeSelector:**

   - Toggles para RGB/Chameleon no seletor de temas
   - Sliders para configuração

3. **Documentar CSS patterns:**
   - Guia de como criar componentes que respondem aos modos especiais
   - Lista de variáveis CSS disponíveis

## 📝 Notas Técnicas

### Integração com useGlobalTheme

Os modos especiais são orquestrados globalmente:

```typescript
// core/global/useGlobalTheme.ts
const state = ref<GlobalThemeState>({
  rgbMode: { enabled, speed, saturation, brightness },
  chameleonMode: { enabled, sensitivity },
});

// App.vue ativa/desativa via watch
useRgbMode(); // Auto-start/stop
useChameleonMode(); // Auto-start/stop
```

### Sincronização Multi-Window

Estado sincronizado via `BroadcastChannel`:

- Toggle em uma janela → Todas as janelas atualizam
- Configurações persistem no `localStorage`
- Recarregar página → Estado restaurado

## ✅ Validação Final

**Status:** ✅ **SUCESSO**

- Compilação: ✅ Sem erros
- Testes: ✅ Funcionando
- Documentação: ✅ Completa
- Arquitetura: ✅ Correta

**Versão:** v0.0.7 (após v0.0.6)  
**Branch:** amyszko, main, stable
