# Multi-Window Control - Migração para Componente Draggable

**Data**: 2024-12-28  
**Tipo**: Refatoração Arquitetural  
**Impacto**: Médio - Migração de componente fixo do sidebar para draggable independente

---

## 🎯 Objetivo

Transformar o **WindowControl** (Multi-Window) do menu lateral (Control Panel) em um **componente draggable independente** chamado **MultiWindowControl**, seguindo o padrão estabelecido com VisualEffectsControl.

### Motivação

```
❌ ANTES: WindowControl fixo no sidebar
- Ocupava espaço permanente no Control Panel
- Não podia ser movido ou ocultado
- Sempre visível, mesmo quando não necessário

✅ AGORA: MultiWindowControl draggable
- Pode ser ativado/desativado pelo Component Manager
- Movível pela tela (drag and drop)
- Collapse/expand funcional
- Segue pattern de componentes SYSTEM
```

---

## 🏗️ Arquitetura

### Pattern Estabelecido: SYSTEM Components

**Família de componentes de sistema** (não são visual effects):

1. `ThemeSelector` (Theme Control) - Gerenciamento de temas
2. **`MultiWindowControl`** (Multi-Window Control) - Gerenciamento de janelas ✨ NOVO
3. `MatrixCharacter` - Efeito visual de caractere Matrix

**Características compartilhadas**:

- Categoria: `system`
- Draggable: ✅ Sim
- Collapse: ✅ Sim
- Visibility Reload: ✅ Sim
- Gerenciados pelo ComponentManager

---

## 📋 Mudanças Implementadas

### 1. Criado Novo Componente

**Arquivo**: `src/features/window-management/components/MultiWindowControl.vue`

**Estrutura**:

```vue
<template>
  <div
    class="multi-window-control"
    v-draggable="{ id: 'multi-window-control', handle: '.mw-header' }"
  >
    <div class="mw-header">
      <span class="mw-title">[ MULTI-WINDOW ]</span>
      <button class="collapse-toggle">{{ isExpanded ? "−" : "+" }}</button>
    </div>

    <div v-if="isExpanded" class="mw-content">
      <!-- Window Status -->
      <div class="window-status">
        <span>Connected Windows:</span>
        <span class="status-value">{{ windowCount }} windows</span>
      </div>

      <!-- New Window Button -->
      <button class="new-window-btn" @click="openNewWindow">
        ➕ Open New Window (Generic)
      </button>

      <!-- Connected Windows List -->
      <div class="connected-windows-list">
        <div v-for="window in connectedWindows" class="window-item">
          {{ window.title }} {{ window.isAlive ? "🟢" : "🔴" }}
        </div>
      </div>
    </div>
  </div>
</template>
```

**Script**:

```typescript
import { useCollapsible } from "../../../shared";
import { useVisibilityReload } from "../composables/useVisibilityReload";
import { useWindowManager } from "../../../core/sync";

// Singleton global - mesma instância em todas as janelas
const windowManager = useWindowManager();
const windowCount = windowManager.windowCount;
const connectedWindows = computed(() => windowManager.getAliveWindows());

// Draggable + Collapse + Visibility Reload
const { isExpanded, toggle, reloadState } = useCollapsible({
  id: "multi-window-control",
  initialState: true,
});

useVisibilityReload({
  selector: ".multi-window-control",
  onVisible: reloadState,
});
```

**Estilos**:

```scss
@use "../../../style/mixins" as *;

.multi-window-control {
  @include draggable-container; // Pattern comum
  z-index: var(--z-header);

  .mw-header {
    @include draggable-header;
  }

  .mw-content {
    @include draggable-content;
  }
}
```

---

### 2. Registrado no Sistema

**availableComponents.ts** - Adicionado na categoria SYSTEM:

```typescript
{
    id: 'multi-window-control',
    name: 'Multi-Window Control',
    category: 'system',              // ✅ Categoria correta
    collapsibleId: 'multi-window-control'
}
```

**window-management/index.ts** - Export adicionado:

```typescript
export { default as MultiWindowControl } from "./components/MultiWindowControl.vue";
```

**defaultPositions.ts** - Posição inicial definida:

```typescript
'multi-window-control': () => ({
    x: SPACING,
    y: SPACING + 350  // Abaixo do theme selector
}),
```

---

### 3. Integrado no HomeView

**Import**:

```typescript
import {
  VisualEffectsControl,
  MultiWindowControl,
} from "../features/window-management";
```

**Computed**:

```typescript
const showMultiWindowControl = computed(() => {
  const comp = globalWindowComponents.value.find(
    (c) => c.id === "multi-window-control"
  );
  return comp?.visible ?? false;
});
```

**Template**:

```vue
<!-- Multi-Window Control (SYSTEM - gerenciamento de janelas) -->
<MultiWindowControl v-if="showMultiWindowControl" />
```

**Watch** (debug):

```typescript
watch([..., showMultiWindowControl], (values) => {
    console.log('[HomeView] 🎨 Visibility computeds updated:', {
        // ...
        multiWindow: values[7]
    })
})
```

---

### 4. Removido do AppSidebar

**ANTES**:

```vue
<template>
  <aside class="app-sidebar">
    <GlobalControls />
    <ComponentManager :window-id="windowId" />
    <WindowControl />
    <!-- ❌ Removido -->
  </aside>
</template>

<script>
import { GlobalControls, ComponentManager, WindowControl } from "...";
</script>
```

**DEPOIS**:

```vue
<template>
  <aside class="app-sidebar">
    <GlobalControls />
    <ComponentManager :window-id="windowId" />
    <!-- WindowControl removido -->
  </aside>
</template>

<script>
import { GlobalControls, ComponentManager } from "...";
</script>
```

---

### 5. Arquivo Antigo Deletado

```bash
rm src/features/window-management/components/WindowControl.vue
```

**Export removido do index.ts**:

```typescript
// ❌ REMOVIDO
export { default as WindowControl } from "./components/WindowControl.vue";
```

---

## 🔄 Comparação: Antes vs Depois

### Componente Antigo (WindowControl)

| Aspecto           | Status               |
| ----------------- | -------------------- |
| **Localização**   | AppSidebar (fixo)    |
| **Draggable**     | ❌ Não               |
| **Collapse**      | ❌ Não               |
| **Visibilidade**  | Sempre visível       |
| **Gerenciamento** | Hardcoded no sidebar |
| **Categoria**     | N/A                  |
| **Status**        | 🗑️ Deletado          |

### Componente Novo (MultiWindowControl)

| Aspecto           | Status                           |
| ----------------- | -------------------------------- |
| **Localização**   | HomeView (draggable)             |
| **Draggable**     | ✅ Sim (handle: .mw-header)      |
| **Collapse**      | ✅ Sim (useCollapsible)          |
| **Visibilidade**  | Controlada pelo ComponentManager |
| **Gerenciamento** | Via availableComponents.ts       |
| **Categoria**     | `system`                         |
| **Status**        | ✅ Ativo                         |

---

## 🎨 Funcionalidades Preservadas

Todas as funcionalidades do componente antigo foram **100% preservadas**:

1. ✅ **Window Count Display**

   - Mostra número de janelas conectadas
   - Destaque visual quando > 1 janela

2. ✅ **Open New Window Button**

   - Abre nova janela genérica
   - Alert quando popup bloqueado

3. ✅ **Connected Windows List**

   - Lista todas as janelas ativas
   - Status visual (🟢 alive / 🔴 dead)
   - Título formatado de cada janela

4. ✅ **WindowManager Integration**
   - Usa singleton `useWindowManager()`
   - Reactive `windowCount`
   - Computed `connectedWindows`

---

## 🧪 Testes de Validação

### ✅ Cenários Testados

1. **Ativação/Desativação**

   - ComponentManager mostra "Multi-Window Control"
   - Categoria: SYSTEM
   - Toggle visibility funciona

2. **Draggable**

   - Pode ser arrastado pelo handle `.mw-header`
   - Posição salva no localStorage
   - Restaura posição ao recarregar

3. **Collapse/Expand**

   - Botão `−` / `+` funciona
   - Estado salvo no localStorage
   - Restaura estado ao recarregar

4. **Funcionalidade Multi-Window**

   - Abre nova janela via `openGenericWindow()`
   - Lista atualiza automaticamente
   - Window count sincronizado via BroadcastChannel

5. **Visibility Reload**
   - Recarrega estado quando fica visível
   - Funciona com tab switching
   - Integrado com useVisibilityReload

---

## 📊 Estrutura do Control Panel

### ANTES (3 componentes fixos)

```
┌─────────────────────┐
│   CONTROL PANEL     │
├─────────────────────┤
│ [ GLOBAL CONTROLS ] │  ← Fixo
├─────────────────────┤
│ [ COMPONENT MGR ]   │  ← Fixo
├─────────────────────┤
│ [ MULTI-WINDOW ]    │  ← Fixo ❌ Removido
└─────────────────────┘
```

### DEPOIS (2 componentes fixos + draggables)

```
┌─────────────────────┐
│   CONTROL PANEL     │
├─────────────────────┤
│ [ GLOBAL CONTROLS ] │  ← Fixo
├─────────────────────┤
│ [ COMPONENT MGR ]   │  ← Fixo (gerencia draggables)
└─────────────────────┘

Draggables disponíveis via Component Manager:
- Visual Effects Control (visual)
- Orb Effect Control (visual)
- Particles Effect Control (visual)
- Frequency Spectrum (visual)
- Sound Control (audio)
- System Monitor (debug)
- Theme Control (system)
- Multi-Window Control (system) ✨ NOVO
- Matrix Character (system)
```

---

## 🎯 Princípios Arquiteturais Seguidos

### 1. Singleton Pattern (WindowManager)

```typescript
// ✅ Mesma instância em todos os componentes
const windowManager = useWindowManager();

// Reactive e sincronizado via BroadcastChannel
windowManager.windowCount; // ComputedRef<number>
windowManager.getAliveWindows(); // Computed<Window[]>
```

### 2. Composition API

```typescript
// ✅ Composables reutilizáveis
useCollapsible({ id: '...', initialState: true })
useVisibilityReload({ selector: '...', onVisible: ... })
```

### 3. Consistent Naming

```typescript
// ✅ Pattern de nomes
- Classe CSS: .multi-window-control
- Draggable ID: multi-window-control
- Collapsible ID: multi-window-control
- Component ID: multi-window-control
- Variável: showMultiWindowControl
```

### 4. SCSS Mixins

```scss
// ✅ Reuso de estilos via mixins
@include draggable-container;
@include draggable-header;
@include draggable-content;
@include draggable-title;
@include draggable-collapse-toggle;
```

### 5. Feature-Based Structure

```
window-management/
├── components/
│   ├── MultiWindowControl.vue    ✨ NOVO
│   ├── VisualEffectsControl.vue
│   ├── ComponentManager.vue
│   ├── GlobalControls.vue
│   └── ...
├── composables/
│   ├── useVisibilityReload.ts
│   └── ...
└── index.ts
```

---

## 🔍 Verificação de Dependências

### ❌ Componente Antigo NÃO É USADO em:

- ✅ HomeView.vue - Usa MultiWindowControl
- ✅ VisualView.vue - Não usa window control
- ✅ GenericWindow.vue - Não usa window control
- ✅ AppSidebar.vue - Removido

### ✅ Novo Componente USA (sem dependências diretas do antigo):

```typescript
// Dependencies verificadas - INDEPENDENTES
import { useCollapsible } from "../../../shared";
import { useVisibilityReload } from "../composables/useVisibilityReload";
import { useWindowManager } from "../../../core/sync";
```

**Conclusão**: ✅ Componentes são independentes. Antigo pode ser removido com segurança.

---

## 📝 Checklist de Migração

- [x] Criar novo componente `MultiWindowControl.vue`
- [x] Adicionar draggable, collapse, visibility reload
- [x] Preservar todas as funcionalidades originais
- [x] Adicionar em `availableComponents.ts` (categoria: system)
- [x] Export em `window-management/index.ts`
- [x] Definir posição inicial em `defaultPositions.ts`
- [x] Import em `HomeView.vue`
- [x] Computed `showMultiWindowControl` em `HomeView.vue`
- [x] Template `<MultiWindowControl v-if="..." />` em `HomeView.vue`
- [x] Adicionar no watch de debug
- [x] Remover `<WindowControl />` do `AppSidebar.vue`
- [x] Remover import do `AppSidebar.vue`
- [x] Remover export do `window-management/index.ts`
- [x] Deletar arquivo `WindowControl.vue`
- [x] Testar ativação/desativação
- [x] Testar drag and drop
- [x] Testar collapse/expand
- [x] Testar funcionalidade multi-window
- [x] Verificar compilação (zero erros)

---

## ✅ Resultado Final

### Control Panel (Sidebar)

```
✅ Mais limpo e focado
✅ Apenas 2 componentes fixos essenciais:
   - Global Controls (master controls)
   - Component Manager (gerencia draggables)
```

### Draggable Components

```
✅ Multi-Window Control agora é draggable
✅ Categoria SYSTEM (junto com Theme Control)
✅ Totalmente gerenciável via Component Manager
✅ Segue pattern arquitetural estabelecido
```

### Código

```
✅ Zero erros de compilação
✅ Zero dependências quebradas
✅ 100% funcionalidade preservada
✅ Arquitetura consistente e escalável
```

---

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras Possíveis

1. **Adicionar estatísticas de sync**

   - Broadcast channel status
   - Mensagens enviadas/recebidas
   - Latência de sync

2. **Actions adicionais**

   - Fechar janela específica (via ID)
   - Focar em janela específica
   - Renomear janela

3. **Visual enhancements**
   - Preview thumbnail de cada janela
   - Drag para reordenar
   - Indicador de janela ativa

---

## 📚 Referências

**Componentes similares (mesmo pattern)**:

- `VisualEffectsControl.vue` - Visual effects draggable
- `ThemeSelector.vue` - Theme control (SYSTEM)
- `DebugTerminal.vue` - System monitor (DEBUG)

**Documentação relacionada**:

- `docs/architecture/WINDOW_MANAGEMENT.md`
- `docs/architecture/COMPONENT_ARCHITECTURE.md`
- `docs/guides/COMPONENT_PATTERNS.md`

---

**Status**: ✅ Migração completa e testada  
**Branch**: `amyszko` (refactor branch)  
**Sem impactos negativos encontrados** 🎉
