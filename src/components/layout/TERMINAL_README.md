# Integrated Terminal

## 📋 Visão Geral

Terminal integrado à interface principal, posicionado horizontalmente no topo da aplicação (logo abaixo do header), com visual inspirado em terminais Linux e suporte completo ao sistema de temas da aplicação.

## ✨ Características

### Visual

- **Posicionamento**: Horizontal no topo, abaixo do `AppHeader`
- **Animação**: Slide vertical (desce de cima para baixo)
- **Estilo**: Fundo escuro com blur + opacidade, borda temática
- **Z-index**: Por cima de todos os outros componentes (z-modal: 1000)
- **Tema**: Totalmente integrado ao sistema de temas (cores primárias dinâmicas)

### Comportamento

- **Atalho de Teclado**:
  - Abrir: tecla `'` (apóstrofo)
  - Fechar: tecla `Escape` ou `'` novamente
- **Auto-focus**: Input recebe foco automaticamente ao abrir
- **Auto-scroll**: Conteúdo rola automaticamente para última linha
- **Histórico**: Navegação com ↑/↓ pelo histórico de comandos

### Funcionalidades

- **Prompt customizado**: `spectral@visualizer:~$`
- **Tipos de output**: command, success, error, warning, info
- **Comandos básicos**: help, clear, info
- **Cursor piscante**: Efeito visual de terminal real

## 🎨 Estrutura Visual

```
┌────────────────────────────────────────┐
│ ▶ TERMINAL               [⎚]    [✕]   │  ← Header do Terminal
├────────────────────────────────────────┤
│ spectral@visualizer:~$ help            │  ← Comando
│ Available commands:                     │  ← Output
│   help - Show this help                │
│   clear - Clear terminal               │
│                                         │
│ spectral@visualizer:~$ ▋               │  ← Input Line + Cursor
└────────────────────────────────────────┘
```

## 🔧 Arquitetura

### Componente

- **Arquivo**: `src/components/layout/IntegratedTerminal.vue`
- **Tipo**: Global Layout Component
- **Parent**: `MainLayout.vue`

### Estado

```typescript
interface TerminalLine {
  type: "command" | "success" | "error" | "warning" | "info" | "separator";
  text: string;
}

const isExpanded = ref(false); // Visibilidade do terminal
const currentInput = ref(""); // Input atual
const outputLines = ref<TerminalLine[]>; // Histórico de saída
const commandHistory = ref<string[]>; // Histórico de comandos
const historyIndex = ref(-1); // Posição no histórico
const showCursor = ref(true); // Estado do cursor piscante
```

### Métodos Principais

- `toggleTerminal()`: Abre/fecha o terminal
- `executeCommand()`: Processa comando digitado
- `processCommand()`: Lógica de execução (extensível)
- `navigateHistory()`: Navega pelo histórico com ↑/↓
- `clearTerminal()`: Limpa toda a saída
- `autocomplete()`: Placeholder para autocomplete (Tab)

## 🎯 Comandos Disponíveis (Etapa 1)

### help

Exibe lista de comandos disponíveis

```
spectral@visualizer:~$ help
Available commands:
  help - Show this help
  clear - Clear terminal
  info - Show app info
```

### clear

Limpa o terminal completamente

```
spectral@visualizer:~$ clear
(terminal limpo)
```

### info

Mostra informações da aplicação

```
spectral@visualizer:~$ info
Spectral Audio Visualizer v0.1.0
Multi-window audio visualization app
```

## 🚀 Próximos Passos (Etapa 2)

### Comandos a Implementar

- [ ] `theme <name>` - Trocar tema
- [ ] `volume <0-100>` - Ajustar volume
- [ ] `window open <type>` - Abrir nova janela
- [ ] `window list` - Listar janelas conectadas
- [ ] `effect <name>` - Ativar/desativar efeitos
- [ ] `debug on/off` - Toggle debug mode
- [ ] `export config` - Exportar configuração atual

### Melhorias

- [ ] Autocomplete inteligente (Tab)
- [ ] Sugestões de comandos
- [ ] Syntax highlighting
- [ ] Histórico persistente (localStorage)
- [ ] Múltiplas sessões/tabs
- [ ] Logs em tempo real
- [ ] Integração com debug tools

## 📦 Integração

### MainLayout.vue

```vue
<template>
  <div class="main-layout">
    <AppHeader :window-id="windowId" />

    <!-- Terminal Global -->
    <IntegratedTerminal />

    <AppSidebar :window-id="windowId" />
    <MiniPlayer />

    <main class="content-area">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import IntegratedTerminal from "../components/layout/IntegratedTerminal.vue";
// ...
</script>
```

## 🎨 Variáveis CSS Utilizadas

### Do Sistema de Temas

- `--header-height`: Altura do header (posicionamento)
- `--theme-primary-rgb`: Cor primária do tema (bordas, highlights)
- `--color-theme-primary`: Cor primária sólida
- `--color-text`: Cor do texto principal
- `--color-text-dim`: Cor do texto secundário
- `--spacing-xs/sm/md`: Espaçamentos padrão
- `--z-modal`: Z-index para modais

### Cores Específicas

- **Success**: `#4ade80` (verde)
- **Error**: `#f87171` (vermelho)
- **Warning**: `#fbbf24` (amarelo)
- **Info**: `#60a5fa` (azul)
- **Background**: `rgba(0, 0, 0, 0.85)` + blur

## 🔍 Atalhos de Teclado

| Tecla    | Ação                          |
| -------- | ----------------------------- |
| `'`      | Abre o terminal               |
| `Escape` | Fecha o terminal              |
| `↑`      | Comando anterior no histórico |
| `↓`      | Próximo comando no histórico  |
| `Enter`  | Executa comando               |
| `Tab`    | Autocomplete (placeholder)    |
| `Ctrl+L` | Limpa terminal (via botão)    |

## 📱 Responsividade

### Mobile (≤768px)

- Altura reduzida: `300px` → `400px`
- Font-size: `12px` → `14px`
- Padding reduzido no header e content

### Desktop (>768px)

- Altura padrão: `400px`
- Font-size: `14px`
- Padding completo

## 🐛 Debug

O terminal possui logging embutido para autocomplete e comandos não reconhecidos. Para habilitar logs:

```typescript
// IntegratedTerminal.vue
const DEBUG = true; // Adicionar flag

if (DEBUG) console.log("[Terminal]", message);
```

## 💡 Padrão de Extensão

Para adicionar novos comandos:

```typescript
const processCommand = (command: string): { type: string; text: string } => {
  // Parse comando
  const [cmd, ...args] = command.split(" ");

  switch (cmd) {
    case "seu-comando":
      return {
        type: "success",
        text: "Resposta do comando",
      };

    default:
      return {
        type: "error",
        text: `Command not found: ${command}`,
      };
  }
};
```

## 🎯 Status

**Etapa 1**: ✅ COMPLETO

- [x] Estrutura visual
- [x] Animação de abertura/fechamento
- [x] Atalho de teclado
- [x] Sistema de prompt
- [x] Histórico de comandos
- [x] Comandos básicos (help, clear, info)
- [x] Integração com MainLayout
- [x] Responsividade

**Etapa 2**: ⏳ PLANEJADO

- [ ] Comandos avançados
- [ ] Integração com features globais
- [ ] Autocomplete funcional
- [ ] Persistência de histórico
