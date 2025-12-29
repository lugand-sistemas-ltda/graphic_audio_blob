# 🎯 Window Title Fix - Solução Final

**Data:** 29/12/2025  
**Versão:** v0.0.7  
**Tipo:** Critical Bug Fix

## 🔍 Problema Identificado

Após implementar a unificação de IDs e o sistema de `announceConnection()`, os títulos das janelas **AINDA NÃO APARECIAM** no componente `MultiWindowControl`.

### Investigação Revelou Dois Problemas

#### **Problema 1: Timing de WINDOW_CONNECTED** ✅ RESOLVIDO

O `WINDOW_CONNECTED` era enviado automaticamente quando `useBroadcastSync()` inicializava, **ANTES** de `setWindowTitle()` ser chamado:

```typescript
// ❌ SEQUÊNCIA ANTERIOR (ERRADA)
1. useBroadcastSync() inicializa
2. broadcast('WINDOW_CONNECTED', {}) ← title = "Window" (padrão)
3. setWindowTitle('Spectral Audio Visualizer') ← tarde demais!
```

**Solução**: Criamos `announceConnection()` para ser chamado explicitamente APÓS configurar tudo.

#### **Problema 2: Janela Atual NÃO Estava na Lista** ❌ PROBLEMA PRINCIPAL

O `BroadcastChannel` **IGNORA mensagens da própria janela** (linha 57 do useBroadcastSync.ts):

```typescript
broadcastChannel.onmessage = (event: MessageEvent) => {
  const message = event.data as SyncMessage;

  // Ignora mensagens da própria janela
  if (message.windowId === currentWindowId.value) return; // ❌ PROBLEMA!

  handleSystemMessage(message);
};
```

**Consequência**: `connectedWindows` Map **NÃO INCLUÍA A JANELA ATUAL**, apenas as outras janelas conectadas!

```typescript
// Exemplo: Main Window aberta + 2 Generic Windows
connectedWindows = Map {
    'generic-window-1' → { title: 'Generic Window 1', ... },
    'generic-window-2' → { title: 'Generic Window 2', ... }
}
// ❌ Faltava: 'main' → { title: 'Spectral Audio Visualizer', ... }
```

**Resultado**: O `MultiWindowControl` na janela `main` tentava buscar o título de `main` em `connectedWindows`, mas não encontrava!

---

## ✅ Solução Implementada

### Mudança Principal: `getAliveWindows()` Inclui Janela Atual

Modificamos `getAliveWindows()` para **SEMPRE incluir a janela atual** no resultado:

```typescript
/**
 * Obtém apenas janelas ativas (respondendo a heartbeat)
 * INCLUI a janela atual no resultado
 */
export function getAliveWindows(): WindowInfo[] {
  const otherWindows = getConnectedWindows().filter((w) => w.isAlive);

  // ✅ Adiciona a janela atual à lista se o ID foi definido
  if (currentWindowId.value) {
    const currentWindow: WindowInfo = {
      id: currentWindowId.value,
      role: currentRole.value,
      title: currentTitle.value, // ✅ Título da janela atual!
      connectedAt: Date.now(),
      lastHeartbeat: Date.now(),
      isAlive: true,
    };

    // Adiciona a janela atual no início da lista
    return [currentWindow, ...otherWindows];
  }

  return otherWindows;
}
```

### Mudança Secundária: Ajuste do `windowCount`

Como `getAliveWindows()` agora inclui a janela atual, removemos o `+1` do cálculo:

```typescript
// ANTES
const windowCount = computed(() => sync.getAliveWindows().length + 1); // ❌ +1 desnecessário

// DEPOIS
const windowCount = computed(() => sync.getAliveWindows().length); // ✅ Já inclui janela atual
```

---

## 🎨 Fluxo Final Correto

### Janela Main (Principal)

```typescript
// App.vue - onMounted()
setWindowId('main')                           // Passo 1: Define ID
setWindowTitle('Spectral Audio Visualizer')   // Passo 2: Define título
announceConnection()                          // Passo 3: Anuncia para outras janelas

// BroadcastSync interno
currentWindowId.value = 'main'
currentTitle.value = 'Spectral Audio Visualizer'

// getAliveWindows() retorna
[
    { id: 'main', title: 'Spectral Audio Visualizer', ... },  // ✅ Janela atual
    { id: 'generic-window-1', title: 'Generic Window 1', ... }, // Outras janelas
    { id: 'generic-window-2', title: 'Generic Window 2', ... }
]

// MultiWindowControl na janela main
getWindowTitle('main')  // ✅ Encontra! Retorna "Spectral Audio Visualizer"
```

### Janela Genérica (Secundária)

```typescript
// GenericWindow.vue - onMounted()
setWindowId('generic-window-1')               // Passo 1: Define ID
setWindowTitle('Generic Window 1')            // Passo 2: Define título
announceConnection()                          // Passo 3: Anuncia para outras janelas

// BroadcastSync interno
currentWindowId.value = 'generic-window-1'
currentTitle.value = 'Generic Window 1'

// getAliveWindows() retorna
[
    { id: 'generic-window-1', title: 'Generic Window 1', ... },  // ✅ Janela atual
    { id: 'main', title: 'Spectral Audio Visualizer', ... },     // Outras janelas
    { id: 'generic-window-2', title: 'Generic Window 2', ... }
]

// MultiWindowControl na janela generic-window-1
getWindowTitle('generic-window-1')  // ✅ Encontra! Retorna "Generic Window 1"
```

---

## 📊 Resultado Visual

### MultiWindowControl em Main Window

```
┌─────────────────────────────────┐
│  [ MULTI-WINDOW ]          [−]  │
├─────────────────────────────────┤
│ Connected Windows: 3 windows    │
│                                 │
│ [➕ Open New Window (Generic)]  │
│                                 │
│ Active Windows:                 │
│ ┌─────────────────────────────┐ │
│ │ Spectral Audio Visualizer 🟢│ │ ✅ Título correto!
│ │ Generic Window 1          🟢│ │
│ │ Generic Window 2          🟢│ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### MultiWindowControl em Generic Window 1

```
┌─────────────────────────────────┐
│  [ MULTI-WINDOW ]          [−]  │
├─────────────────────────────────┤
│ Connected Windows: 3 windows    │
│                                 │
│ [➕ Open New Window (Generic)]  │
│                                 │
│ Active Windows:                 │
│ ┌─────────────────────────────┐ │
│ │ Generic Window 1          🟢│ │ ✅ Título correto!
│ │ Spectral Audio Visualizer 🟢│ │
│ │ Generic Window 2          🟢│ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 🔧 Arquivos Modificados

### 1. **core/sync/useBroadcastSync.ts**

**Mudança Principal**:

```typescript
// Função getAliveWindows() modificada para incluir janela atual
export function getAliveWindows(): WindowInfo[] {
  const otherWindows = getConnectedWindows().filter((w) => w.isAlive);

  if (currentWindowId.value) {
    const currentWindow: WindowInfo = {
      id: currentWindowId.value,
      role: currentRole.value,
      title: currentTitle.value, // ✅ INCLUI TÍTULO ATUAL
      connectedAt: Date.now(),
      lastHeartbeat: Date.now(),
      isAlive: true,
    };
    return [currentWindow, ...otherWindows];
  }

  return otherWindows;
}
```

**Limpeza de Debug Logs**:

- Removidos `console.log()` temporários de debug
- Mantidos apenas `log()` (condicional via config)

### 2. **core/sync/useWindowManager.ts**

**Mudança**:

```typescript
// ANTES
const windowCount = computed(() => sync.getAliveWindows().length + 1);

// DEPOIS
const windowCount = computed(() => sync.getAliveWindows().length);
```

### 3. **features/window-management/components/MultiWindowControl.vue**

**Limpeza**:

- Removidos `console.log()` de debug em `getWindowTitle()`
- Código final limpo e funcional

---

## 🧪 Validação

### Cenários Testados

#### Cenário 1: Janela Única

```
Main Window:
- MultiWindowControl mostra: "Spectral Audio Visualizer" ✅
- windowCount = 1 ✅
```

#### Cenário 2: Main + 1 Generic

```
Main Window:
- MultiWindowControl mostra:
  1. "Spectral Audio Visualizer" ✅
  2. "Generic Window 1" ✅
- windowCount = 2 ✅

Generic Window 1:
- MultiWindowControl mostra:
  1. "Generic Window 1" ✅
  2. "Spectral Audio Visualizer" ✅
- windowCount = 2 ✅
```

#### Cenário 3: Main + 3 Generics

```
Main Window:
- MultiWindowControl mostra:
  1. "Spectral Audio Visualizer" ✅
  2. "Generic Window 1" ✅
  3. "Generic Window 2" ✅
  4. "Generic Window 3" ✅
- windowCount = 4 ✅
- Scroll aparece (max 4 visíveis) ✅
```

---

## 💡 Insights Arquiteturais

### Por Que `connectedWindows` Não Incluía a Janela Atual?

É um **design pattern intencional** do `BroadcastChannel` API:

1. **Broadcast** = comunicação **entre** janelas
2. Janela não precisa se enviar mensagens (já tem estado local)
3. `connectedWindows` representa **outras janelas remotas**

### Por Que a Solução é Elegante?

Em vez de:

- ❌ Adicionar janela atual no `connectedWindows` Map (poluiria lógica de broadcast)
- ❌ Criar variável separada (duplicação de estado)
- ❌ Modificar componente para buscar em dois lugares

Fizemos:

- ✅ `getAliveWindows()` compõe resultado final (janela atual + outras)
- ✅ Lógica isolada em uma função
- ✅ Componentes não precisam saber da distinção
- ✅ API limpa e previsível

### Benefícios da Abordagem

1. **Single Responsibility**: `connectedWindows` = janelas remotas, `getAliveWindows()` = todas as janelas
2. **Composability**: Fácil adicionar filtros/ordenação
3. **Testability**: Podemos testar janela isolada ou multi-window
4. **Performance**: Janela atual sempre no início (O(1) lookup)

---

## 🚀 Funcionalidades Futuras Viáveis

Com títulos funcionando corretamente, agora podemos:

### 1. **Ordenação de Janelas**

```typescript
const sortedWindows = computed(() => {
  return connectedWindows.value.sort((a, b) => {
    // Ordena por título alfabeticamente
    return a.title.localeCompare(b.title);
  });
});
```

### 2. **Busca de Janelas**

```typescript
const filterWindows = (searchTerm: string) => {
  return connectedWindows.value.filter((w) =>
    w.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
```

### 3. **Ícones por Tipo de Janela**

```typescript
const getWindowIcon = (window: WindowInfo): string => {
  if (window.title.includes("Spectral")) return "🎵";
  if (window.title.includes("Generic")) return "🪟";
  return "📄";
};
```

### 4. **Focus/Activate Window**

```typescript
const focusWindow = (windowId: string) => {
  broadcast("FOCUS_REQUEST", { windowId });
  // Outras janelas escutam e focam se for seu ID
};
```

---

## 📝 Lições Aprendidas

### 1. **Debug Sistemático**

- Logs temporários revelaram que janela atual não estava na lista
- Console.log estratégico > adivinhar o problema

### 2. **Entender a API**

- `BroadcastChannel` ignora mensagens próprias (by design)
- Não lutar contra a API, adaptar a solução

### 3. **Composição > Duplicação**

- `getAliveWindows()` compõe resultado sem duplicar estado
- Função pura, fácil de testar e manter

### 4. **Ordem de Inicialização**

- `announceConnection()` explícito > automático
- Controle fino do timing de sincronização

### 5. **Single Source of Truth**

- `currentWindowId`, `currentRole`, `currentTitle` são fonte da verdade
- `getAliveWindows()` deriva estado, não duplica

---

## ✅ Conclusão

A solução final **eliminou lógica desnecessária** (não precisamos sincronizar janela atual via broadcast) e **adicionou lógica necessária** (`getAliveWindows()` inclui janela atual).

**Resultado**: Títulos funcionando perfeitamente em todas as janelas! 🎉

**Status**: ✅ **BUG CRÍTICO RESOLVIDO DEFINITIVAMENTE**

---

## 📚 Referências

- **Architecture**: `docs/architecture/WINDOW_MANAGEMENT.md`
- **ID Unification**: `docs/changelogs/WINDOW_ID_UNIFICATION.md`
- **Component Patterns**: `docs/guides/COMPONENT_PATTERNS.md`

---

## 👥 Créditos

**Desenvolvedor**: Lugand Sistemas  
**Assistente**: GitHub Copilot  
**Debug**: Análise sistemática do fluxo de dados
