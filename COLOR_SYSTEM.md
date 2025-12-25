# 🎨 Sistema de Cores - Guia de Uso

## 📋 Visão Geral

Este documento descreve o **sistema de cores centralizado** do projeto, garantindo consistência visual e manutenibilidade. Todas as cores são gerenciadas através de **variáveis CSS** em dois níveis:

1. **Paleta Semântica Estática** (`_variables.scss`) - Cores fixas para status/feedback
2. **Cores Dinâmicas de Tema** (`_themes.scss`) - Cores que mudam conforme o tema ativo

---

## 🎯 Regra de Ouro

> ⚠️ **NUNCA use cores hardcoded (ex: `#f44336`)!**
>
> ✅ **SEMPRE use variáveis CSS** (ex: `var(--color-error)`)

Isso garante:

- ✅ Controle centralizado sobre todas as cores
- ✅ Mudanças globais com uma única edição
- ✅ Consistência visual em todo o app
- ✅ Manutenção simplificada

---

## 📦 Estrutura do Sistema

### 1️⃣ Paleta Semântica Estática

**Arquivo:** `src/style/_variables.scss`

Cores **fixas** que representam estados/feedbacks e não mudam com o tema.

#### Status Colors (Estados de Interface)

```scss
// ✅ SUCCESS (Verde)
--color-success: #4caf50;
--color-success-light: #66bb6a;
--color-success-dark: #388e3c;
--color-success-rgb: 76, 175, 80;

// ❌ ERROR (Vermelho)
--color-error: #f44336;
--color-error-light: #ff6659;
--color-error-dark: #d32f2f;
--color-error-rgb: 244, 67, 54;

// ⚠️ WARNING (Laranja)
--color-warning: #ff9800;
--color-warning-light: #ffa726;
--color-warning-dark: #f57c00;
--color-warning-rgb: 255, 152, 0;

// ℹ️ INFO (Azul)
--color-info: #2196f3;
--color-info-light: #42a5f5;
--color-info-dark: #1976d2;
--color-info-rgb: 33, 150, 243;
```

#### Neutral Colors (Escala de Cinzas)

```scss
--color-white: #ffffff;
--color-white-rgb: 255, 255, 255;

--color-black: #000000;
--color-black-rgb: 0, 0, 0;

--color-gray-100: #f5f5f5; // Mais claro
--color-gray-200: #e0e0e0;
--color-gray-300: #bdbdbd;
--color-gray-400: #9e9e9e;
--color-gray-500: #757575; // Médio
--color-gray-600: #616161;
--color-gray-700: #424242;
--color-gray-800: #303030;
--color-gray-900: #1a1a1a; // Mais escuro
```

---

### 2️⃣ Cores Dinâmicas de Tema

**Arquivo:** `src/style/_themes.scss`

Cores que **mudam conforme o tema ativo** (Matrix, Cyberpunk, Blade Runner, etc).

```scss
// Cores principais do tema
--theme-primary: #00ff00; // Muda por tema
--theme-primary-bright: #00ff41; // Variação clara
--theme-primary-dim: #008f11; // Variação escura
--theme-primary-dark: #003300; // Muito escura
--theme-primary-rgb: 0, 255, 0; // Para rgba()

// Backgrounds do tema
--theme-bg-primary: #000000;
--theme-bg-secondary: #001a00;

// Mapeamentos semânticos
--color-text: var(--theme-primary-bright);
--color-bg: var(--theme-bg-primary);
--color-border: var(--theme-primary-dim);
--color-accent: var(--theme-primary);
```

---

## 🧭 Quando Usar Cada Tipo

### Use **Paleta Semântica** (`--color-*`) quando:

- ✅ Indicar status de operação (sucesso, erro, aviso)
- ✅ Alertas e notificações
- ✅ Validação de formulários
- ✅ Feedback visual ao usuário
- ✅ Estados de botões de ação (danger, success)
- ✅ Indicadores de estado (status-indicator)

**Exemplos:**

```scss
// ✅ CORRETO
.btn-danger {
  border-color: var(--color-error);
}

.success-message {
  color: var(--color-success);
}

.validation-error {
  background: rgba(var(--color-error-rgb), 0.1);
}
```

### Use **Cores de Tema** (`--theme-*`) quando:

- ✅ Elementos visuais que devem seguir o tema
- ✅ Bordas, backgrounds, textos padrão
- ✅ Efeitos de brilho/glow temáticos
- ✅ Botões primários/secundários
- ✅ Decorações visuais que mudam com tema

**Exemplos:**

```scss
// ✅ CORRETO
.sidebar {
  border-color: var(--theme-primary-dim);
}

.title {
  color: var(--color-text); // Mapeado para theme
}

.glow-effect {
  box-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 0.5);
}
```

---

## 📖 Exemplos Práticos

### ❌ ERRADO (Hardcoded)

```scss
.alert-error {
  background: rgba(244, 67, 54, 0.15); // ❌ NÃO FAÇA ISSO
  border-color: #f44336; // ❌ NÃO FAÇA ISSO
  color: #ff6659; // ❌ NÃO FAÇA ISSO
}

.button-success {
  background: #4caf50; // ❌ NÃO FAÇA ISSO
}
```

### ✅ CORRETO (Variáveis CSS)

```scss
.alert-error {
  background: rgba(var(--color-error-rgb), 0.15); // ✅ Usa paleta
  border-color: var(--color-error); // ✅ Usa paleta
  color: var(--color-error-light); // ✅ Usa paleta
}

.button-success {
  background: var(--color-success); // ✅ Usa paleta

  &:hover {
    background: var(--color-success-light); // ✅ Variação
  }
}
```

---

## 🎨 Uso com RGB (para transparência)

Quando precisar usar `rgba()`, use as variáveis `-rgb`:

```scss
// ✅ CORRETO
.translucent-error {
  background: rgba(var(--color-error-rgb), 0.3);
}

.translucent-theme {
  background: rgba(var(--theme-primary-rgb), 0.2);
}

// ❌ ERRADO
.translucent-error {
  background: rgba(244, 67, 54, 0.3); // ❌ Hardcoded
}
```

---

## 🔧 Hierarquia de Variações

Cada cor semântica tem 3 variações:

```scss
--color-success         // Base (uso geral)
--color-success-light   // Clara (hover, destaque)
--color-success-dark    // Escura (active, pressed)
--color-success-rgb     // RGB (transparência)
```

**Quando usar cada variação:**

- **Base** (`--color-success`): Uso padrão (borders, ícones)
- **Light** (`--color-success-light`): Estados hover, texto claro
- **Dark** (`--color-success-dark`): Estados active/pressed, texto escuro
- **RGB** (`--color-success-rgb`): Backgrounds translúcidos

---

## 📂 Arquivos Relacionados

### Arquivos de Estilo

- `src/style/_variables.scss` - Paleta semântica estática
- `src/style/_themes.scss` - Cores dinâmicas de tema
- `src/style/_utilities.scss` - Classes utilitárias (usa ambos sistemas)
- `src/style/_alerts.scss` - Sistema de alertas (referencia paleta)
- `src/style/_custom.scss` - Estilos customizados (usa paleta)

### Componentes Refatorados

- `src/components/alerts/BaseAlert.vue` - Usa paleta para tipos de alert
- `src/components/ui/buttons/BaseButton.vue` - Usa paleta para variantes

---

## 🚀 Benefícios do Sistema

### 1. Manutenibilidade

```scss
// Mudança centralizada - atualiza em TODO o app
:root {
  --color-error: #ff1744; // ← Mudou de #f44336 para #ff1744
}
// Todas as 50+ referências são atualizadas automaticamente! ✅
```

### 2. Consistência Visual

```scss
// Todos os erros usam a mesma cor
.btn-danger {
  color: var(--color-error);
}
.alert-error {
  border-color: var(--color-error);
}
.validation-error {
  background: rgba(var(--color-error-rgb), 0.1);
}
// ✅ Consistente em todo o app
```

### 3. Facilidade de Debug

```scss
// Teste rapidamente outra cor no DevTools
:root {
  --color-success: #ff00ff; // ← Teste visual instantâneo
}
```

### 4. Suporte a Temas

```scss
// Sistema de cores funciona com QUALQUER tema
[data-theme="matrix"] {
  --theme-primary: #00ff00;
}
[data-theme="cyberpunk"] {
  --theme-primary: #ff00ff;
}
// Paleta semântica permanece consistente! ✅
```

---

## 🛠️ Como Adicionar Novas Cores

### 1. Avalie se é necessário

- ❓ Já existe uma variável que serve?
- ❓ Pode usar uma variação de cor existente?
- ❓ É realmente uma cor semântica ou é específica do tema?

### 2. Se for cor semântica (status/feedback):

Adicione em `_variables.scss`:

```scss
:root {
  // Nova cor semântica
  --color-info-alt: #3f51b5;
  --color-info-alt-light: #5c6bc0;
  --color-info-alt-dark: #303f9f;
  --color-info-alt-rgb: 63, 81, 181;
}
```

### 3. Se for cor de tema:

Adicione em `_themes.scss` para **cada tema**:

```scss
[data-theme="matrix"] {
  --theme-accent-secondary: #00aa00;
}

[data-theme="cyberpunk"] {
  --theme-accent-secondary: #aa00aa;
}
```

---

## ✅ Checklist de Validação

Antes de dar commit, verifique:

- [ ] Nenhuma cor hardcoded no código novo (`#xxxxxx`)
- [ ] Todas as cores usam `var(--color-*)` ou `var(--theme-*)`
- [ ] Transparências usam `-rgb` variants
- [ ] Escolha correta: paleta semântica vs tema
- [ ] Documentação atualizada se adicionou cores novas
- [ ] Build compila sem erros de SCSS
- [ ] Visual testado em pelo menos 2 temas diferentes

---

## 📚 Referência Rápida

### Status Colors (Fixas)

```scss
var(--color-success)  // Verde - operação bem-sucedida
var(--color-error)    // Vermelho - erro/perigo
var(--color-warning)  // Laranja - aviso/cautela
var(--color-info)     // Azul - informação/atenção
```

### Theme Colors (Dinâmicas)

```scss
var(--theme-primary)        // Cor principal do tema ativo
var(--theme-primary-bright) // Variação clara
var(--theme-primary-dim)    // Variação escura
var(--color-text)           // Texto padrão (mapeado)
var(--color-bg)             // Background padrão (mapeado)
```

### Neutral Colors (Fixas)

```scss
var(--color-white)    // Branco puro
var(--color-black)    // Preto puro
var(--color-gray-500) // Cinza médio (100-900 disponíveis)
```

---

## 🎓 Guia de Decisão

```
┌─────────────────────────────────────┐
│ Preciso definir uma cor             │
└─────────────┬───────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ É status/feedback?  │
    │ (erro, sucesso...)  │
    └────┬────────┬────────┘
         │        │
      SIM│        │NÃO
         │        │
         ▼        ▼
   ┌─────────┐  ┌──────────────┐
   │ Paleta  │  │ Muda c/ tema?│
   │ Semân-  │  └─┬────────┬──┘
   │ tica    │    │        │
   └─────────┘  SIM│       │NÃO
         │        │        │
         ▼        ▼        ▼
    --color-*  --theme-* --color-gray-*
```

**Exemplo prático:**

- Botão de deletar → `--color-error` (status de perigo)
- Borda da sidebar → `--theme-primary-dim` (visual temático)
- Texto desabilitado → `--color-gray-500` (neutro)

---

## 🔗 Recursos Adicionais

- [COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md) - Padrões de componentes
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Histórico de refatorações
- [THEME_ARCHITECTURE.md](./THEME_ARCHITECTURE.md) - Sistema de temas

---

## 📝 Changelog

### v0.0.5 (atual)

- ✅ Criado sistema de paleta semântica em `_variables.scss`
- ✅ Adicionadas cores de status (success, error, warning, info)
- ✅ Adicionadas cores neutras (white, black, gray-100 até gray-900)
- ✅ Refatorado `_utilities.scss` para usar variáveis
- ✅ Refatorado `BaseAlert.vue` para usar paleta
- ✅ Refatorado `_alerts.scss` para referenciar paleta
- ✅ Refatorado `_custom.scss` para usar variáveis
- ✅ Eliminadas todas as cores hardcoded do projeto
- ✅ Criado este guia de documentação

---

**Dúvidas?** Consulte este documento antes de adicionar cores!

**Contribuindo?** Siga estas diretrizes rigorosamente!

---

> 💡 **Dica:** Use a busca do VSCode (`Ctrl+Shift+F`) com regex `#[0-9a-fA-F]{6}` para encontrar cores hardcoded que possam ter escapado!
