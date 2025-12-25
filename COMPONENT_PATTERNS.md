# Component Patterns & Style Guide

## 📚 Guia de Padrões de Componentes

Este documento define os padrões arquiteturais, convenções de código e melhores práticas para desenvolvimento de componentes no **Graphic Audio Blob**.

> 🎨 **Importante:** Para gerenciamento de cores, consulte [COLOR_SYSTEM.md](./COLOR_SYSTEM.md)

---

## 🏗️ Arquitetura de Componentes

### Hierarquia de Componentes

```
src/components/
├── ui/                          # 🧩 MICRO-COMPONENTES (Reutilizáveis)
│   ├── buttons/                 # Botões genéricos
│   │   └── BaseButton.vue       # Sistema de botões compostos
│   ├── cards/                   # Cards reutilizáveis
│   ├── containers/              # Wrappers e layouts
│   └── typography/              # Textos e headings
│
├── alerts/                      # 🎯 FAMÍLIA DE COMPONENTES (Alert System)
│   ├── AlertContainer.vue       # Manager de alerts
│   └── BaseAlert.vue            # Componente de alert
│
├── sidebar/                     # 🎯 FAMÍLIA DE COMPONENTES (Sidebar)
│   ├── ComponentManager.vue
│   ├── WindowControl.vue
│   └── ...
│
└── [ComponenteCompleto].vue     # Componentes standalone
```

### Classificação de Componentes

#### 🧩 Micro-Componentes (`/ui`)

- **Propósito:** Elementos básicos reutilizáveis
- **Características:**
  - Genéricos e agnósticos de contexto
  - Alta composição via props
  - Sem lógica de negócio
  - Estilização via utilities + scoped styles
- **Exemplos:** BaseButton, BaseCard, BaseInput

#### 🎯 Famílias de Componentes

- **Propósito:** Conjunto coeso de componentes relacionados
- **Características:**
  - Compartilham estado/lógica via composables
  - Integração com GlobalState
  - Podem usar micro-componentes
- **Exemplos:** Alerts, Sidebar, Drag-Drop

#### 📦 Componentes Completos

- **Propósito:** Features standalone
- **Características:**
  - Autocontidos
  - Podem usar micro-componentes
  - Lógica específica encapsulada
- **Exemplos:** MusicPlayer, ThemeSelector

---

## 🎨 Sistema de Estilos

### Utilities Classes (Composição)

Sistema de classes helper para compor estilos rapidamente:

```scss
// _utilities.scss
.btn                // Base button
.btn-primary        // Variant
.btn-shadow         // Effect
.btn-glow           // Effect
.btn-corners        // Decorative
.btn-lg             // Size
```

### Exemplos de Uso

```vue
<!-- Composição de classes -->
<BaseButton variant="primary" shadow glow corners>
  Click Me
</BaseButton>

<!-- Gera: -->
<button class="btn btn-primary btn-shadow btn-glow btn-corners">
  Click Me
</button>
```

### Utilities Disponíveis

#### Buttons

```scss
.btn                    // Base (sempre usar)
.btn-primary           // Azul tema
.btn-secondary         // Cinza
.btn-danger            // Vermelho
.btn-success           // Verde
.btn-warning           // Laranja
.btn-ghost             // Transparente

.btn-sm / .btn-lg      // Tamanhos
.btn-icon-only         // Apenas ícone

.btn-shadow            // Sombra
.btn-glow              // Glow ao hover
.btn-corners           // Cantos decorativos
```

#### Cards

```scss
.card                  // Base card
.card-hover            // Hover effect
.card-compact          // Menos padding
.card-spacious         // Mais padding
```

#### Shadows

```scss
.shadow-sm / md / lg / xl
.shadow-glow           // Glow tema
.shadow-glow-sm        // Glow suave
```

#### Borders

```scss
.border-soft           // 4px radius (padrão)
.border-soft-sm        // 3px radius
.border-soft-xs        // 2px radius
.border-theme          // Borda cor tema
.border-theme-glow     // Borda + glow
```

#### Spacing

```scss
.p-sm / md / lg / xl   // Padding
.m-sm / md / lg / xl   // Margin
```

#### Flex

```scss
.flex                  // display: flex
.flex-center           // Center both axes
.flex-between          // Space between
.flex-column           // Column direction
.gap-sm / md / lg      // Gap entre items
```

#### Interactive

```scss
.hover-lift            // translateY(-2px)
.hover-scale           // scale(1.05)
.hover-glow            // Glow effect
```

---

## 🧩 Criando Micro-Componentes

### Template BaseButton

```vue
<template>
  <button :class="buttonClasses" :disabled="disabled" @click="handleClick">
    <span v-if="icon" class="btn-icon">{{ icon }}</span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useComponentValidator } from "@/composables/useComponentValidator";

interface Props {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  shadow?: boolean;
  glow?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

// Validação
const { isValid } = useComponentValidator("BaseButton", props);

// Classes compostas
const buttonClasses = computed(() => {
  const classes = ["btn", `btn-${props.variant}`];
  if (props.size !== "md") classes.push(`btn-${props.size}`);
  if (props.shadow) classes.push("btn-shadow");
  if (props.glow) classes.push("btn-glow");
  return classes;
});

const handleClick = (e: MouseEvent) => {
  if (!isValid.value || props.disabled) return;
  emit("click", e);
};
</script>

<style scoped lang="scss">
// Apenas customizações específicas
// Base styles vêm de _utilities.scss
</style>
```

---

## 🔍 Sistema de Validação

### useComponentValidator

Valida props e dispara alertas quando há erros:

```typescript
const { isValid, validationErrors } = useComponentValidator(
  "ComponentName",
  props,
  {
    propName: {
      required: true,
      type: "string",
      oneOf: ["option1", "option2"],
      custom: (value) => value.length > 3,
    },
  },
  {
    showAlertOnError: false, // Padrão: false
    logErrors: true, // Padrão: true
  }
);
```

### Validação Automática

```typescript
// Built-in validations para props comuns
variant: oneOf(['primary', 'secondary', 'danger', ...])
size: oneOf(['sm', 'md', 'lg'])
type: oneOf(['button', 'submit', 'reset'])
```

---

## 📝 Convenções de Código

### Nomenclatura

#### Componentes

- **Micro-componentes:** `Base[Elemento].vue` (ex: BaseButton, BaseCard)
- **Famílias:** `[Família]/[Componente].vue` (ex: alerts/BaseAlert.vue)
- **Standalone:** `[Nome].vue` (ex: MusicPlayer.vue)

#### Props

- **camelCase:** `iconPosition`, `customClass`
- **Booleanos:** prefixo `is/has/show` → `isActive`, `hasIcon`, `showLabel`
- **Handlers:** prefixo `on` → `onClick`, `onClose`

#### Events

- **kebab-case** no template: `@click`, `@update:modelValue`
- **camelCase** na definição: `emit('click')`, `emit('updateValue')`

### Props Defaults

```typescript
withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  disabled: false,
  shadow: false,
});
```

### Exports

```typescript
// src/components/ui/index.ts
export { default as BaseButton } from "./buttons/BaseButton.vue";
export { default as BaseCard } from "./cards/BaseCard.vue";

// Uso:
import { BaseButton, BaseCard } from "@/components/ui";
```

---

## 🎯 Padrões de Uso

### Composição de Classes

✅ **BOM:**

```vue
<BaseButton variant="primary" shadow glow>Save</BaseButton>
```

❌ **RUIM:**

```vue
<button class="btn btn-primary custom-shadow custom-glow">Save</button>
```

### Customização

✅ **BOM:**

```vue
<BaseButton custom-class="my-custom-btn">Click</BaseButton>

<style scoped>
.my-custom-btn {
  /* Apenas overrides específicos */
  min-width: 200px;
}
</style>
```

❌ **RUIM:**

```vue
<BaseButton style="background: red; padding: 20px;">Click</BaseButton>
```

### Reutilização

✅ **BOM:**

```vue
<!-- Criar wrapper se precisar de lógica repetida -->
<template>
  <BaseButton v-bind="$attrs" @click="handleSave">
    <slot></slot>
  </BaseButton>
</template>
```

❌ **RUIM:**

```vue
<!-- Copiar/colar código de BaseButton -->
<button class="btn">...</button>
```

---

## 🔄 Retrocompatibilidade

### Migração Gradual

```vue
<!-- Antigo (ainda funciona) -->
<button class="control-btn play-btn" @click="play">
  ▶
</button>

<!-- Novo (preferido) -->
<BaseButton variant="primary" icon="▶" @click="play" />
```

### Fallback Automático

Se `BaseButton` falhar:

1. Logs no console (dev mode)
2. Alert opcional ao usuário
3. Componente não renderiza (evita quebra)

---

## 📊 Checklist de Qualidade

### Novo Micro-Componente

- [ ] Props tipadas com TypeScript
- [ ] Defaults definidos
- [ ] Validação via `useComponentValidator`
- [ ] Usa utilities classes (não duplica estilos)
- [ ] Exportado em `/ui/index.ts`
- [ ] Slots documentados
- [ ] Events emitidos tipados
- [ ] Acessibilidade (aria-labels, title)

### Refatoração de Componente

- [ ] Substituir botões por `BaseButton`
- [ ] Remover estilos duplicados
- [ ] Usar utilities classes
- [ ] Manter funcionalidade existente
- [ ] Testar renderização
- [ ] Verificar HMR

---

## 🚀 Exemplos Práticos

### Botão Simples

```vue
<BaseButton variant="primary" @click="save">
  Save Changes
</BaseButton>
```

### Botão com Ícone

```vue
<BaseButton variant="danger" icon="🗑️" icon-position="left" @click="delete">
  Delete
</BaseButton>
```

### Botão Icon-Only

```vue
<BaseButton variant="ghost" icon="✏️" icon-only @click="edit" />
```

### Botão Loading

```vue
<BaseButton variant="success" :loading="isSaving" @click="save">
  Save
</BaseButton>
```

### Botão Customizado

```vue
<BaseButton
  variant="primary"
  size="lg"
  shadow
  glow
  corners
  custom-class="my-special-btn"
  @click="action"
>
  Special Action
</BaseButton>
```

---

## 🛠️ Troubleshooting

### Estilos não aplicados

- Verificar se importou `_utilities.scss` no `index.scss`
- Verificar ordem de imports (utilities depois de variables)
- Usar `!important` se necessário em customizações

### Validação falha silenciosamente

- Verificar `logErrors: true` nas options
- Abrir console do navegador
- Setar `showAlertOnError: true` temporariamente

### Componente não renderiza

- Verificar console para erros de validação
- Verificar props obrigatórias
- Verificar imports (BaseButton, utilities)

---

## 📚 Referências

- **Utilities:** `src/style/_utilities.scss`
- **Borders:** `src/style/_borders.scss`
- **Validator:** `src/composables/useComponentValidator.ts`
- **UI Components:** `src/components/ui/`
- **Alert Architecture:** `ALERT_ARCHITECTURE.md`

---

**Última atualização:** v0.0.4 - Sistema de Micro-Componentes
