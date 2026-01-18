# Terminal System - Global Architecture

## 📋 Overview

Sistema de terminal integrado com **arquitetura global**, seguindo os mesmos padrões do `useGlobalAudio` e `useGlobalTheme`. O terminal é sincronizado entre todas as janelas e possui um sistema modular de comandos.

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
src/features/terminal/
├── index.ts                    # Entry point
├── types.ts                    # Tipos compartilhados
├── commands/
│   ├── index.ts               # Exporta comandos e registry
│   ├── registry.ts            # Sistema de registro de comandos
│   └── basic.ts               # Comandos básicos (help, clear, info, exit)
└── composables/
    └── useGlobalTerminal.ts   # Composable global (singleton)
```

## ✨ Features Implementadas

### 1. Sistema Global (Singleton)

- ✅ Estado compartilhado entre todas as janelas
- ✅ Sincronização via BroadcastChannel
- ✅ Inicialização automática
- ✅ Histórico de comandos persistente

### 2. UI/UX

- ✅ Toggle com tecla `'` (abre E fecha)
- ✅ Fechar com `Escape`
- ✅ Modo Fullscreen (botão no header)
- ✅ Z-index 9999 (acima do sidebar)
- ✅ Auto-focus no input ao abrir
- ✅ Auto-scroll ao adicionar output
- ✅ Cursor piscante
- ✅ Navegação de histórico (↑/↓)

### 3. Sistema de Comandos Modular

- ✅ Registry centralizado
- ✅ Suporte a aliases
- ✅ Execução assíncrona
- ✅ Context API para comandos
- ✅ Tipos fortemente tipados

## 🎯 Comandos Disponíveis

### help (aliases: ?, h)

```bash
spectral@visualizer:~$ help
Available commands:

  help (?, h) - Show available commands
  clear (cls) - Clear terminal screen
  info - Show application information
  exit (quit, q) - Close terminal
```

### clear (alias: cls)

```bash
spectral@visualizer:~$ clear
# Limpa todo o terminal
```

### info

```bash
spectral@visualizer:~$ info
Spectral Audio Visualizer v0.1.0
Multi-window audio visualization application

Features:
  • Real-time audio analysis
  • Multi-window synchronization
  • Dynamic theme system
  • Visual effects (orb, particles, gradients)
  • Integrated terminal
```

### exit (aliases: quit, q)

```bash
spectral@visualizer:~$ exit
# Fecha o terminal
```

## 🔧 API do Sistema

### useGlobalTerminal()

```typescript
const terminal = useGlobalTerminal();

// Estado (readonly)
terminal.state.value.isExpanded; // Terminal aberto?
terminal.state.value.isFullscreen; // Modo fullscreen?
terminal.state.value.outputLines; // Linhas de output
terminal.state.value.commandHistory; // Histórico de comandos

// Actions
terminal.toggleTerminal(); // Abre/fecha
terminal.openTerminal(); // Força abrir
terminal.closeTerminal(); // Força fechar
terminal.toggleFullscreen(); // Toggle fullscreen
terminal.clearTerminal(); // Limpa output
terminal.addOutput(line); // Adiciona linha
terminal.executeCommand(cmd); // Executa comando
terminal.getHistory(); // Retorna histórico
```

### Command Context API

```typescript
interface TerminalContext {
  clearTerminal: () => void;
  closeTerminal: () => void;
  addOutput: (line: TerminalLine) => void;
  getHistory: () => string[];
}
```

## 📦 Como Criar Novos Comandos

### Exemplo: Comando Theme

```typescript
// src/features/terminal/commands/theme.ts
import type { TerminalCommand } from "../types";
import { useGlobalTheme } from "../../../core/global";

export const themeCommand: TerminalCommand = {
  name: "theme",
  description: "Change application theme",
  aliases: ["t"],
  usage: "theme <name>",
  execute: async (args, context) => {
    if (args.length === 0) {
      return {
        type: "error",
        text: "Usage: theme <name>\nAvailable: light, dark, cyberpunk",
      };
    }

    const themeName = args[0];
    const { setTheme } = useGlobalTheme();

    try {
      setTheme(themeName);
      return {
        type: "success",
        text: `Theme changed to: ${themeName}`,
      };
    } catch (error) {
      return {
        type: "error",
        text: `Invalid theme: ${themeName}`,
      };
    }
  },
};
```

### Registrar o Comando

```typescript
// src/features/terminal/commands/index.ts
import { registerCommand } from "./registry";
import { themeCommand } from "./theme";

export function registerAdvancedCommands() {
  registerCommand(themeCommand);
}
```

### Usar no Composable

```typescript
// src/features/terminal/composables/useGlobalTerminal.ts
import { registerAdvancedCommands } from "../commands";

function initialize() {
  if (initialized) return;

  registerBasicCommands();
  registerAdvancedCommands(); // ✅ Adicionar aqui

  setupSyncHandlers();
  initialized = true;
}
```

## 🌐 Sincronização Multi-Window

### Eventos Sincronizados

| Evento                | Descrição                               |
| --------------------- | --------------------------------------- |
| `TERMINAL_TOGGLE`     | Abre/fecha terminal em todas as janelas |
| `TERMINAL_FULLSCREEN` | Ativa/desativa fullscreen               |
| `TERMINAL_CLEAR`      | Limpa output em todas as janelas        |
| `TERMINAL_OUTPUT`     | Adiciona linha de output                |
| `TERMINAL_COMMAND`    | Executa comando e sincroniza resultado  |

### Fluxo de Sincronização

```
Janela A: terminal.executeCommand('help')
    ↓
Local: Executa comando + adiciona output
    ↓
Broadcast: TERMINAL_COMMAND { command, response }
    ↓
Janela B/C: Recebe e adiciona comando + output
```

## 🎨 Customização Visual

### Z-Index

```scss
.integrated-terminal {
  z-index: 9999; // Acima do sidebar (100)
}
```

### Fullscreen

```scss
.integrated-terminal.is-fullscreen {
  top: 0;
  height: 100vh;
  border-bottom: none;
}
```

### Badge "FULLSCREEN"

```vue
<span v-if="terminal.state.value.isFullscreen" class="terminal-badge">
    FULLSCREEN
</span>
```

## 📱 Atalhos de Teclado

| Tecla    | Ação                          |
| -------- | ----------------------------- |
| `'`      | Abre/fecha terminal (toggle)  |
| `Escape` | Fecha terminal                |
| `↑`      | Comando anterior no histórico |
| `↓`      | Próximo comando no histórico  |
| `Enter`  | Executa comando               |
| `Tab`    | Autocomplete (placeholder)    |

## 🔍 Tipos de Output

```typescript
type TerminalLineType =
  | "command" // Comando digitado (branco)
  | "success" // Sucesso (verde #4ade80)
  | "error" // Erro (vermelho #f87171)
  | "warning" // Aviso (amarelo #fbbf24)
  | "info" // Info (azul #60a5fa)
  | "separator"; // Linha vazia
```

## 🚀 Próximos Passos

### Comandos a Implementar

- [ ] `theme <name>` - Trocar tema
- [ ] `volume <0-100>` - Ajustar volume
- [ ] `window open <type>` - Abrir nova janela
- [ ] `window list` - Listar janelas conectadas
- [ ] `window close <id>` - Fechar janela específica
- [ ] `effect <name> on/off` - Toggle efeitos visuais
- [ ] `effect list` - Listar efeitos disponíveis
- [ ] `audio play/pause` - Controlar playback
- [ ] `audio next/prev` - Navegar tracks
- [ ] `debug on/off` - Toggle debug mode
- [ ] `export config` - Exportar configuração
- [ ] `import config <json>` - Importar configuração
- [ ] `status` - Status geral da aplicação

### Melhorias

- [ ] Autocomplete inteligente (Tab)
- [ ] Sugestões de comandos (fuzzy search)
- [ ] Syntax highlighting (cores por tipo de arg)
- [ ] Histórico persistente (localStorage)
- [ ] Múltiplas sessões/tabs
- [ ] Logs em tempo real (tail -f style)
- [ ] Pipe/redirecionamento de output
- [ ] Script support (.sh files)
- [ ] Help detalhado por comando (`help theme`)
- [ ] Aliases customizáveis pelo usuário

## 📊 Comparação com Outros Sistemas

### Similar ao useGlobalAudio

```typescript
// ✅ Singleton state
const terminal = useGlobalTerminal()
const audio = useGlobalAudio()

// ✅ Broadcast sync
terminal.executeCommand() → broadcast('TERMINAL_COMMAND')
audio.play() → broadcast('GLOBAL_AUDIO_PLAY')

// ✅ Inicialização automática
initialize() // Chamado automaticamente
```

### Similar ao useGlobalTheme

```typescript
// ✅ Estado reativo
terminal.state.value.isExpanded
theme.currentTheme.value

// ✅ Actions globais
terminal.toggleTerminal()
theme.toggleTheme()

// ✅ Sync handlers
onMessage('TERMINAL_TOGGLE', ...)
onMessage('GLOBAL_THEME_CHANGE', ...)
```

## 🎯 Design Patterns Utilizados

1. **Singleton Pattern**: Um único estado compartilhado
2. **Command Pattern**: Comandos modulares e extensíveis
3. **Observer Pattern**: Sync handlers para multi-window
4. **Registry Pattern**: Sistema de registro de comandos
5. **Context API**: Contexto passado para comandos

## ✅ Checklist de Implementação

- [x] Tipos básicos (types.ts)
- [x] Command registry system
- [x] Comandos básicos (help, clear, info, exit)
- [x] Composable global (useGlobalTerminal)
- [x] Sincronização multi-window
- [x] Componente UI (IntegratedTerminal.vue)
- [x] Integração com MainLayout
- [x] Atalho de teclado `'`
- [x] Modo fullscreen
- [x] Z-index correto (acima do sidebar)
- [x] Auto-focus e auto-scroll
- [x] Histórico de comandos
- [ ] Comandos avançados
- [ ] Autocomplete
- [ ] Persistência de histórico

## 🐛 Debug

Para debug, verifique os logs do BroadcastSync:

```typescript
// No console do navegador
[BroadcastSync] Broadcasted: TERMINAL_COMMAND {...}
[Terminal] Command executed: help
[Terminal] Output added: { type: 'success', text: '...' }
```

---

**Status**: ✅ Arquitetura Global Completa | ⏳ Comandos Avançados Pendentes
