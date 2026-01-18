# Terminal Quick Reference

## 🚀 Getting Started

Press `'` (single quote) to open/close terminal.

Type `help` to see all commands, or `help <category>` for specific categories.

## 📚 Command Categories

### 🎵 Audio Commands

```bash
play [track]        # Play/resume audio
pause               # Pause playback
volume [0-100]      # Get/set volume
audio [info|freq]   # Show status or frequencies
playlist            # Show playlist
```

### ⚙️ System Commands

```bash
ps                  # Show running windows
top                 # System monitor
uptime              # Session uptime
whoami              # Current window info
env                 # Environment variables
```

### 🎨 Theme Commands

```bash
theme [name]        # Get/set theme (light, dark, cyberpunk)
rgb [on|off]        # Toggle RGB mode
chameleon [on|off]  # Toggle chameleon mode
```

### 🪟 Window Commands

```bash
open <type>         # Open new window (visual, audio, spectogram)
windows             # List all windows
focus <id|role>     # Focus window
close <id|role>     # Close window
go <route>          # Navigate in current window
```

### 📖 Basic Commands

```bash
help [category]     # Show help
clear               # Clear terminal (or Ctrl+L)
info                # Show ASCII art + info
exit                # Close terminal
```

## 🔧 Unix Utilities

### Pipes

Chain commands together:

```bash
playlist | grep "jazz"              # Search playlist
ps | grep visual                    # Find visual windows
env | grep THEME                    # Search environment
```

### Grep (Search)

```bash
playlist | grep "song"              # Search for "song"
ps | grep -i VISUAL                 # Case-insensitive
env | grep -v AUDIO                 # Invert match (exclude)
```

### Sort

```bash
windows | sort                      # Sort alphabetically
playlist | sort -r                  # Reverse sort
```

### Head/Tail

```bash
playlist | head 10                  # First 10 items
env | tail 5                        # Last 5 items
```

### Word Count

```bash
playlist | wc -l                    # Count lines
env | wc -w                         # Count words
ps | wc                             # Count all
```

## 💡 Examples

### Audio Control

```bash
# Set volume to 75%
volume 75

# Show real-time frequencies
audio freq

# Find jazz songs
playlist | grep "jazz" | sort -r
```

### System Monitoring

```bash
# Show all windows
ps

# Find visual window
ps | grep visual

# Show system status
top

# Check RGB mode
env | grep RGB
```

### Window Management

```bash
# Open visual effects window
open visual

# List all windows
windows

# Navigate to visual page
go /visual
```

### Theme Customization

```bash
# Change to cyberpunk theme
theme cyberpunk

# Enable RGB mode
rgb on

# Disable chameleon mode
chameleon off
```

### Power User Tricks

```bash
# Find specific window type
windows | grep -i audio | head 3

# Search environment for audio settings
env | grep -i audio | sort

# Complex playlist search
playlist | grep "rock" | sort -r | head 20

# Count visual windows
ps | grep visual | wc -l
```

## ⌨️ Shortcuts

| Shortcut    | Action                 |
| ----------- | ---------------------- |
| `'` (quote) | Toggle terminal        |
| `Ctrl+L`    | Clear terminal         |
| `Up/Down`   | Command history (TODO) |
| `Tab`       | Autocomplete (TODO)    |

## 🎯 Tips

1. **Use Tab Completion** (when implemented)
   - Start typing and press Tab
   - Shows available commands/flags

2. **Chain Commands**
   - Use pipes to combine commands
   - Example: `playlist | grep "jazz" | sort -r | head 10`

3. **Save Time with Aliases** (TODO)
   - Create shortcuts for common commands
   - Example: `ll` → `ps -a`

4. **Explore with Help**
   - `help` - All categories
   - `help audio` - Audio commands only
   - `help system` - System commands only

5. **Use Flags**
   - Most commands support flags
   - Example: `ps -a` (all windows)

## 🔍 Command Cheat Sheet

### Most Used Commands

```bash
help                # When stuck
clear               # Clean screen
volume 50           # Quick volume
audio freq          # See frequencies
top                 # System overview
ps                  # What's running?
theme cyberpunk     # Cool theme
open visual         # New window
```

### One-Liners

```bash
# Quick audio check
audio info

# Find window by name
windows | grep "visual"

# Check theme settings
env | grep "THEME\|RGB"

# System snapshot
top

# All environment
env | sort
```

## 🐛 Troubleshooting

### Command Not Found

```bash
help                # See all commands
help audio          # See audio commands
```

### No Output

- Check if command requires arguments
- Use `help <command>` for usage
- Try without pipes first

### Permission Errors

- Some browser security restrictions apply
- Cannot close other windows programmatically
- Cannot focus other windows programmatically

## 📖 Learn More

- Full documentation: `/docs/changelogs/TERMINAL_COMMANDS_IMPLEMENTATION.md`
- Command patterns: `/docs/guides/COMPONENT_PATTERNS.md`
- Terminal architecture: `/src/features/terminal/README.md`

---

**Quick Links:**

- `help` - All commands
- `help audio` - Audio commands
- `help system` - System commands
- `help theme` - Theme commands
- `help window` - Window commands
