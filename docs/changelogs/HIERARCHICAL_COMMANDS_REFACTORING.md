# 🎯 Terminal Commands Refactoring - Hierarchical Structure

## ✅ O Que Foi Implementado

Refatoramos toda a estrutura de comandos para usar **namespaces hierárquicos**, seguindo as melhores práticas de ferramentas modernas (Docker, Git, kubectl).

## 📋 Nova Arquitetura

### Antes (Flat Commands)

```bash
play
pause
volume 75
ps
top
theme
rgb on
```

### Depois (Hierarchical Namespaces)

```bash
audio play
audio pause
audio volume 75
sys processes
sys monitor
theme set cyberpunk
theme rgb on
```

## 🏗️ Estrutura de Namespaces

### 🎵 **AUDIO** - Audio Player Control

```bash
audio play [track]          # Play/resume
audio pause                 # Pause
audio stop                  # Stop
audio volume [0-100]        # Volume control
audio status                # Player status
audio freq                  # Frequency analysis
audio playlist              # Show playlist
audio next                  # Next track
audio prev                  # Previous track
```

### ✨ **EFFECT** - Visual Effects Control

```bash
effect list                    # List all effects
effect enable <name>           # Enable effect
effect disable <name>          # Disable effect
effect toggle <name>           # Toggle effect
effect status [name]           # Show status
effect config <name> <k> <v>   # Configure
```

### 🪟 **WINDOW** - Window Management

```bash
window open <type>      # Open new window
window list             # List all windows
window focus <id>       # Focus window
window close <id>       # Close window
window current          # Current window info
window go <route>       # Navigate
```

### 🎨 **THEME** - Theme and Appearance

```bash
theme set <name>            # Set theme
theme list                  # List themes
theme current               # Current theme
theme rgb <on|off>          # RGB mode
theme chameleon <on|off>    # Chameleon mode
```

### ⚙️ **SYS** - System Information

```bash
sys info          # System information
sys monitor       # System monitor
sys uptime        # Session uptime
sys env           # Environment variables
sys processes     # Running processes
```

## 🎯 Benefícios

1. **Organização Clara** - Comandos agrupados por funcionalidade
2. **Autocomplete Inteligente** - Fácil descoberta
3. **Consistência** - Padrão previsível
4. **Sem Conflitos** - Namespaces evitam ambiguidade
5. **Help Contextual** - `help audio`, `help effect`, etc.

## 📁 Estrutura de Arquivos

```
commands/
├── namespaces/
│   ├── audio.namespace.ts   # 🎵 Audio commands
│   ├── effect.namespace.ts  # ✨ Effect commands
│   ├── window.namespace.ts  # 🪟 Window commands
│   ├── theme.namespace.ts   # 🎨 Theme commands
│   └── sys.namespace.ts     # ⚙️ System commands
├── basic.ts
├── registry.ts
└── index.ts
```

## 🎮 Exemplos de Uso

```bash
# Audio
audio volume 75
audio freq
audio playlist | grep jazz

# Effects
effect list
effect enable particles
effect config gradient intensity 90

# Windows
window open visual
window list | grep audio

# Theme
theme set cyberpunk
theme rgb on

# System
sys monitor
sys env | grep THEME
```

**Status**: ✅ Implementação completa
