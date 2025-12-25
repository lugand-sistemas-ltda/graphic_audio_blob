# 📚 Documentação - Spectral Audio Visualizer

Bem-vindo à documentação técnica completa do projeto!

---

## 🏗️ Arquitetura do Sistema

Documentos que descrevem a arquitetura técnica e padrões de design:

### Core Systems
- [**AUDIO_ARCHITECTURE.md**](./architecture/AUDIO_ARCHITECTURE.md)
  - Sistema de áudio Provider/Consumer
  - FFT analysis e sincronização multi-window
  - BroadcastChannel API

- [**WINDOW_MANAGEMENT.md**](./architecture/WINDOW_MANAGEMENT.md)
  - Arquitetura multi-window
  - Window roles (main, secondary)
  - State synchronization

- [**COMPONENT_ARCHITECTURE.md**](./architecture/COMPONENT_ARCHITECTURE.md)
  - Estrutura de componentes
  - Component Manager system
  - Lifecycle e eventos

- [**ALERT_ARCHITECTURE.md**](./architecture/ALERT_ARCHITECTURE.md)
  - Sistema de alertas globais
  - BaseAlert component
  - Alert types e customização

- [**THEME_ARCHITECTURE.md**](./architecture/THEME_ARCHITECTURE.md)
  - Sistema de temas dinâmicos
  - Theme switching
  - CSS variables strategy

- [**COLOR_SYSTEM.md**](./architecture/COLOR_SYSTEM.md) 🎨
  - Sistema de cores centralizado
  - Paleta semântica vs cores de tema
  - Guia de uso e best practices

---

## 📖 Guias de Desenvolvimento

Documentos para desenvolvedores que trabalham no projeto:

- [**COMPONENT_PATTERNS.md**](./guides/COMPONENT_PATTERNS.md)
  - Padrões de componentes (micro-components, features)
  - Convenções de código
  - Validação de props
  - Utilities SCSS

---

## 📝 Changelogs

Histórico de mudanças e refatorações:

- [**CHANGELOG_AMYSZKO.md**](./changelogs/CHANGELOG_AMYSZKO.md)
  - Histórico completo de versões
  - Features implementadas por versão
  - Bug fixes e melhorias

- [**CHANGELOG_COLOR_SYSTEM.md**](./changelogs/CHANGELOG_COLOR_SYSTEM.md)
  - v0.0.5 - Sistema de cores centralizado
  - Refatoração de variáveis CSS
  - Eliminação de cores hardcoded

- [**REFACTORING_SUMMARY.md**](./changelogs/REFACTORING_SUMMARY.md)
  - v0.0.4 - Micro-components e utilities
  - Criação de BaseButton
  - Sistema de validação

---

## 🗂️ Estrutura da Documentação

```
docs/
├── architecture/          # Arquitetura técnica
│   ├── AUDIO_ARCHITECTURE.md
│   ├── WINDOW_MANAGEMENT.md
│   ├── COMPONENT_ARCHITECTURE.md
│   ├── ALERT_ARCHITECTURE.md
│   ├── THEME_ARCHITECTURE.md
│   └── COLOR_SYSTEM.md
│
├── guides/               # Guias para desenvolvedores
│   └── COMPONENT_PATTERNS.md
│
├── changelogs/           # Histórico de mudanças
│   ├── CHANGELOG_AMYSZKO.md
│   ├── CHANGELOG_COLOR_SYSTEM.md
│   └── REFACTORING_SUMMARY.md
│
└── README.md            # Este arquivo (índice)
```

---

## 🚀 Quick Links

### Para Novos Desenvolvedores
1. Leia [../README.md](../README.md) (overview do projeto)
2. Entenda [COMPONENT_ARCHITECTURE.md](./architecture/COMPONENT_ARCHITECTURE.md)
3. Siga [COMPONENT_PATTERNS.md](./guides/COMPONENT_PATTERNS.md)
4. Consulte [COLOR_SYSTEM.md](./architecture/COLOR_SYSTEM.md) ao trabalhar com estilos

### Para Debugging
1. [AUDIO_ARCHITECTURE.md](./architecture/AUDIO_ARCHITECTURE.md) - Problemas de áudio
2. [WINDOW_MANAGEMENT.md](./architecture/WINDOW_MANAGEMENT.md) - Sincronização entre janelas
3. [ALERT_ARCHITECTURE.md](./architecture/ALERT_ARCHITECTURE.md) - Sistema de notificações

### Para Refatoração
1. [COMPONENT_PATTERNS.md](./guides/COMPONENT_PATTERNS.md) - Padrões a seguir
2. [COLOR_SYSTEM.md](./architecture/COLOR_SYSTEM.md) - Gestão de cores
3. [CHANGELOG_*.md](./changelogs/) - Histórico de refatorações

---

## 📌 Convenções

### Atualização de Docs
- ✅ **SEMPRE** atualize a documentação ao fazer mudanças arquiteturais
- ✅ Adicione exemplos de código quando aplicável
- ✅ Mantenha diagramas atualizados
- ✅ Documente decisões técnicas importantes

### Nomenclatura
- **Architecture docs**: Descrevem **COMO** o sistema funciona
- **Guides**: Descrevem **COMO USAR** o sistema
- **Changelogs**: Descrevem **O QUE MUDOU**

---

## 🤝 Contribuindo

Ao adicionar nova documentação:

1. **Architecture** - Novos sistemas ou mudanças arquiteturais significativas
2. **Guides** - Tutoriais, best practices, how-tos
3. **Changelogs** - Registre mudanças com impacto (versões, refactorings)

Mantenha o [README.md principal](../README.md) atualizado com links para novos docs!

---

**Versão da Documentação:** 1.0.0  
**Última Atualização:** Dezembro 2024  
**Projeto:** Spectral Audio Visualizer v1.0.0-stable
