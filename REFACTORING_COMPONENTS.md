# 🎯 Refatoração: Sistema de Componentes por Janela

## 📋 Resumo das Mudanças

Implementamos um sistema de **gerenciamento central de componentes** onde cada janela pode ter seus **próprios componentes ativos independentemente**.

### Antes ❌

- Componentes eram globais (windowId único)
- Adicionar componente na Janela A removia da Janela B
- ComponentState tinha `windowId: string | null`
- Cada janela "roubava" o componente da outra

### Agora ✅

- **Componentes podem estar em MÚLTIPLAS janelas simultaneamente**
- Cada janela tem sua própria lista `activeComponents: ComponentId[]`
- Estado global agora é: `componentsByWindow: Record<WindowId, Record<ComponentId, ComponentState>>`
- Janela A pode ter `['orb-effect', 'debug-terminal']`
- Janela B pode ter `['orb-effect', 'frequency-visualizer']`
- **MESMO componente pode estar em ambas!**

---

## 🏗️ Arquitetura Nova

### 1. **GlobalState Structure**

```typescript
// ANTES
interface GlobalState {
  windows: Record<WindowId, WindowConfig>;
  components: Record<ComponentId, ComponentState>; // ❌ Global único
}

// AGORA
interface GlobalState {
  windows: Record<WindowId, WindowConfig>;
  componentsByWindow: Record<WindowId, Record<ComponentId, ComponentState>>; // ✅ Por janela!
}
```

### 2. **WindowConfig Enhanced**

```typescript
interface WindowConfig {
  id: WindowId;
  title: string;
  role: "main" | "secondary";
  effects: VisualEffect[];
  layout: WindowLayout;
  backgroundColor: string;
  createdAt: number;
  lastActive: number;
  activeComponents: ComponentId[]; // ✅ NOVO: Lista de componentes ativos
  allComponentsHidden: boolean; // ✅ NOVO: Flag para hide/show all
}
```

### 3. **ComponentState Simplificado**

```typescript
// ANTES
interface ComponentState {
  id: ComponentId;
  windowId: WindowId | null; // ❌ Ownership global
  transform: ComponentTransform;
  visible: boolean;
  collapsed: boolean;
  zIndex: number;
}

// AGORA
interface ComponentState {
  id: ComponentId;
  // ✅ Sem windowId! O ownership é definido pelo Map pai
  transform: ComponentTransform; // Posição relativa nesta janela
  visible: boolean; // Visível nesta janela?
  collapsed: boolean; // Colapsado nesta janela?
  zIndex: number; // Z-index nesta janela
}
```

---

## 🔧 Novas APIs

### ✅ **Adicionar Componente à Janela**

```typescript
addComponentToWindow(windowId: WindowId, componentId: ComponentId, state: ComponentState)

// Exemplo:
addComponentToWindow('main-123', 'orb-effect-control', {
    id: 'orb-effect-control',
    transform: { x: 100, y: 100 },
    visible: true,
    collapsed: false,
    zIndex: 1
})
```

### ✅ **Remover Componente da Janela**

```typescript
removeComponentFromWindow(windowId: WindowId, componentId: ComponentId)

// Exemplo:
removeComponentFromWindow('main-123', 'orb-effect-control')
```

### ✅ **Atualizar Componente em Janela**

```typescript
updateComponentInWindow(windowId: WindowId, componentId: ComponentId, updates: Partial<ComponentState>)

// Exemplo:
updateComponentInWindow('main-123', 'orb-effect-control', {
    transform: { x: 200, y: 300 },
    zIndex: 10
})
```

### ✅ **Toggle Visibilidade**

```typescript
toggleComponentVisibility(windowId: WindowId, componentId: ComponentId, visible: boolean)

// Exemplo:
toggleComponentVisibility('main-123', 'orb-effect-control', false)
```

### ✅ **Hide/Show All**

```typescript
hideAllComponents(windowId: WindowId, hidden: boolean)

// Exemplo:
hideAllComponents('main-123', true) // Esconde todos
hideAllComponents('main-123', false) // Mostra todos
```

---

## 🔄 Fluxo de Sincronização

### **1. Adicionar Componente**

```
User clicks "Add Component" in Sidebar
    ↓
ComponentManager.addComponent(id)
    ↓
1. addComponentToWindow(windowId, id, initialState)
   → Adiciona ao GlobalState.componentsByWindow[windowId][id]
   → Adiciona id em WindowConfig.activeComponents[]
   → BroadcastChannel sync para outras janelas
    ↓
2. componentManager.setVisibility(id, true)
   → Atualiza visibilidade UI local
   → Salva em localStorage por janela
    ↓
Component renderiza na tela desta janela
```

### **2. Remove Componente**

```
User clicks "Remove" button
    ↓
ComponentManager.removeComponent(id)
    ↓
1. removeComponentFromWindow(windowId, id)
   → Remove de GlobalState.componentsByWindow[windowId]
   → Remove id de WindowConfig.activeComponents[]
   → BroadcastChannel sync
    ↓
2. componentManager.setVisibility(id, false)
   → Atualiza UI local
   → Salva localStorage
    ↓
Component desmonta desta janela
(Outras janelas não são afetadas!)
```

### **3. Toggle Visibility (Hide/Show)**

```
User clicks visibility toggle
    ↓
ComponentManager.toggleVisibility(id)
    ↓
1. componentManager.toggleVisibility(id)
   → Alterna estado visual UI
    ↓
2. toggleComponentVisibility(windowId, id, newState)
   → Atualiza GlobalState.componentsByWindow[windowId][id].visible
   → BroadcastChannel sync
    ↓
Component hide/show animação
(Componente continua na lista activeComponents!)
```

---

## 📁 Arquivos Modificados

### **Core State**

- ✅ `src/core/state/types.ts` - Novos tipos
- ✅ `src/core/state/useGlobalState.ts` - Lógica refatorada
- ✅ `src/core/state/index.ts` - Export novas APIs

### **Components**

- ✅ `src/components/sidebar/ComponentManager.vue` - Usa novas APIs
- ✅ `src/App.vue` - Registra janela com activeComponents

### **Composables**

- ⚠️ `src/composables/useComponentManager.ts` - Mantido (gerencia UI local)

---

## 🧪 Como Testar

### **Teste 1: Componentes Independentes por Janela**

1. Abra a aplicação: http://localhost:5173
2. Sidebar → Add Component → Adicione "Orb Effect Control"
3. Abra nova janela (clique "Open New Window")
4. Na nova janela, Sidebar → Add Component → Adicione "Orb Effect Control" também
5. ✅ **Resultado Esperado:** Ambas as janelas têm o componente ativo separadamente

### **Teste 2: Listas Independentes**

1. Janela Main: Adicione "Orb Effect", "Debug Terminal"
2. Janela 2: Adicione "Frequency Visualizer", "Music Player"
3. ✅ **Resultado Esperado:**
   - Main mostra 2 componentes ativos
   - Janela 2 mostra 2 componentes diferentes
   - Lista de "Available Components" é diferente em cada janela

### **Teste 3: Hide/Show All (Por Janela)**

1. Janela Main: Adicione 3 componentes
2. Janela 2: Adicione 2 componentes
3. Janela Main → Sidebar → "Hide All"
4. ✅ **Resultado Esperado:**
   - Componentes da Main ficam invisíveis
   - Componentes da Janela 2 continuam visíveis

### **Teste 4: Persistência (localStorage)**

1. Janela Main: Adicione "Orb Effect" + "Debug"
2. Reload F5
3. ✅ **Resultado Esperado:** Componentes restauram na mesma janela

---

## ⚡ Problemas Resolvidos

### ✅ **Problema 1: Componentes Compartilhados**

**Antes:** Adicionar em Janela A removia da Janela B
**Agora:** Cada janela tem lista independente

### ✅ **Problema 2: Lista Vazia**

**Antes:** `componentManager.getAllComponents()` retornava vazio para novas janelas
**Agora:** `AVAILABLE_COMPONENTS` constante + `getWindowComponents(windowId)` filtra por janela

### ✅ **Problema 3: Hide/Show All Global**

**Antes:** Afetava todas as janelas
**Agora:** `hideAllComponents(windowId, hidden)` afeta apenas a janela alvo

---

## 🚀 Próximos Passos

### **Fase 1: Validação** ✅ (Atual)

- [x] Refatorar GlobalState para componentsByWindow
- [x] Atualizar WindowConfig com activeComponents
- [x] Criar novas APIs (add/remove/update)
- [x] Atualizar ComponentManager.vue
- [x] Testar multi-window

### **Fase 2: Sincronização de Renderização** 🔄

- [ ] Atualizar HomeView/GenericWindow para ler de `getWindowComponents(windowId)`
- [ ] Garantir que componentes renderizam apenas se estão em `activeComponents[]`
- [ ] Implementar watch nos componentes para reagir a mudanças no GlobalState

### **Fase 3: Drag & Drop Cross-Window** 📦

- [ ] Atualizar drag system para usar novas APIs
- [ ] Permitir arrastar componente de Janela A → Janela B
- [ ] Mover entre janelas = `removeFromWindow(A) + addToWindow(B)`

### **Fase 4: Cleanup Legacy** 🧹

- [ ] Remover funções deprecated (moveComponent, updateComponent, toggleComponent)
- [ ] Documentar API pública
- [ ] Adicionar testes unitários

---

## 📚 Conceitos-Chave

### **Separação de Responsabilidades**

```
ComponentManager (composable)
├─ Gerencia visibilidade UI (visible, collapsed)
├─ Controla z-index local
├─ Persiste em localStorage por janela
└─ Não sabe sobre outras janelas

GlobalState (core/state)
├─ Gerencia ownership (quais componentes em cada janela)
├─ Persiste activeComponents[] em localStorage
├─ Sincroniza via BroadcastChannel
└─ Fonte única da verdade para cross-window
```

### **Fluxo de Dados**

```
User Action (UI)
    ↓
ComponentManager (local state)
    ↓
GlobalState (shared state)
    ↓
BroadcastChannel (sync)
    ↓
Other Windows (reactive updates)
```

---

## 🎓 Aprendizados

1. **Estado Local vs Global:** Nem tudo precisa ser global - visibilidade UI é local, ownership é global
2. **Map Aninhado:** `Record<WindowId, Record<ComponentId, State>>` permite isolamento perfeito
3. **Sincronização Seletiva:** BroadcastChannel + localStorage = sync poderoso
4. **TypeScript Strictness:** Novos tipos evitaram bugs de ownership

---

**Status:** ✅ Implementado e testado
**Versão:** 1.0.0
**Data:** 24/12/2024
