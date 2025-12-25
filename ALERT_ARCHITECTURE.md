# 🚨 ALERT SYSTEM ARCHITECTURE

## 📋 Visão Geral

A **família de componentes Alert** é um sistema modular e global para exibição de alertas, notificações e diálogos de confirmação em todas as janelas do aplicativo. Cada janela gerencia seus próprios alerts de forma independente, mantendo a consistência arquitetural do projeto.

---

## 🏗️ Estrutura de Arquitetura

### **Camadas do Sistema**

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  BaseAlert.vue - Componente visual genérico           │  │
│  │  • Tipos: warning, success, error, attention, default │  │
│  │  • Suporta: título, mensagem, ícone, múltiplos botões │  │
│  │  • Animações: fade, slide, shake                      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  AlertContainer.vue - Container de alerts             │  │
│  │  • Renderiza todos os alerts ativos da janela         │  │
│  │  • Gerencia ordem (LIFO - Last In, First Out)         │  │
│  │  • Teleport para body (modal overlay)                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  useGlobalAlerts.ts - Composable API                  │  │
│  │  • showAlert(config): AlertId                         │  │
│  │  • hideAlert(alertId): void                           │  │
│  │  • respondToAlert(alertId, buttonId): void            │  │
│  │  • Helpers: showSuccess, showError, showWarning, etc. │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        STATE LAYER                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  GlobalState.alertsByWindow                           │  │
│  │  Record<WindowId, Record<AlertId, AlertState>>        │  │
│  │  • windowId → alertId → AlertState                    │  │
│  │  • Sincronizado via BroadcastChannel                  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Ações: ALERT_SHOW, ALERT_HIDE, ALERT_RESPONDED       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Pastas

```
src/
├── components/
│   ├── alerts/                    # ⭐ Nova família de componentes
│   │   ├── BaseAlert.vue          # Componente visual genérico
│   │   └── AlertContainer.vue     # Container que renderiza alerts
│   ├── drag-drop/                 # Família drag-drop (existente)
│   ├── sidebar/                   # Família sidebar (existente)
│   └── [outros componentes]...
│
├── composables/
│   └── useGlobalAlerts.ts         # ⭐ API principal para trabalhar com alerts
│
├── core/
│   └── state/
│       ├── types.ts               # ⭐ Tipos: AlertType, AlertConfig, AlertButton, AlertState
│       ├── useGlobalState.ts      # ⭐ Handlers: ALERT_SHOW, ALERT_HIDE, ALERT_RESPONDED
│       └── index.ts               # ⭐ Exports atualizados
│
└── style/
    ├── _alerts.scss               # ⭐ Estilos específicos para alerts
    └── index.scss                 # Importa _alerts.scss
```

---

## 🎨 Tipos de Alert e Cores

Cada tipo de alert possui **cor característica** enquanto o restante do componente segue o tema ativo:

| Tipo        | Cor Característica | RGB               | Uso                                   |
| ----------- | ------------------ | ----------------- | ------------------------------------- |
| `warning`   | 🟠 Laranja         | 255, 152, 0       | Avisos, ações não recomendadas        |
| `success`   | 🟢 Verde           | 76, 175, 80       | Confirmações, operações bem-sucedidas |
| `error`     | 🔴 Vermelho        | 244, 67, 54       | Erros críticos, falhas                |
| `attention` | 🔵 Azul            | 33, 150, 243      | Informações importantes, confirmações |
| `default`   | 🎨 Tema Ativo      | var(--color-text) | Alertas genéricos                     |

**Característica Visual:**

- **Label do tipo** (ex: "WARNING", "SUCCESS") → Colorido com a cor característica
- **Restante do componente** → Segue o tema ativo (verde matrix, roxo cyberpunk, marrom rustic, etc.)

---

## 🔧 API de Uso

### **1. Uso Básico**

```typescript
import { useGlobalAlerts } from "@/composables/useGlobalAlerts";

const alerts = useGlobalAlerts(windowId);

// Mostrar alert simples
alerts.showAlert({
  type: "success",
  title: "Operação Concluída",
  message: "O arquivo foi salvo com sucesso!",
  icon: "✓",
});
```

### **2. Alert com Múltiplos Parágrafos**

```typescript
alerts.showAlert({
  type: "warning",
  title: "Atenção",
  message: [
    "Esta ação não pode ser desfeita.",
    "Todos os dados serão perdidos permanentemente.",
    "Tem certeza que deseja continuar?",
  ],
  icon: "⚠",
});
```

### **3. Alert de Confirmação (YES/NO)**

```typescript
alerts.showConfirm(
  "Deseja realmente fechar esta janela?",
  "Fechar Janela",
  () => {
    // Confirmado - YES
    window.close();
  },
  () => {
    // Cancelado - NO
    console.log("Ação cancelada");
  }
);
```

### **4. Botões Customizados**

```typescript
alerts.showAlert({
  type: "attention",
  title: "Escolha uma Ação",
  message: "O que você gostaria de fazer com este arquivo?",
  buttons: [
    {
      id: "save",
      label: "SALVAR",
      variant: "primary",
      action: () => saveFile(),
    },
    {
      id: "discard",
      label: "DESCARTAR",
      variant: "danger",
      action: () => discardChanges(),
    },
    {
      id: "cancel",
      label: "CANCELAR",
      variant: "secondary",
    },
  ],
  closable: false, // Força o usuário a escolher
});
```

### **5. Helpers Rápidos**

```typescript
// Success
alerts.showSuccess("Arquivo salvo!", "Sucesso");

// Error
alerts.showError("Falha ao conectar ao servidor.", "Erro de Conexão");

// Warning
alerts.showWarning("Seu espaço de armazenamento está quase cheio.", "Aviso");

// Attention
alerts.showAttention("Nova atualização disponível!", "Atenção");
```

---

## 🎯 Características Especiais

### **1. Independência por Janela**

- Cada janela gerencia seus próprios alerts
- Alerts em uma janela não afetam outras janelas
- Estado isolado via `alertsByWindow[windowId]`

### **2. Sistema de Cores Híbrido**

- **Cor do tipo** (WARNING, SUCCESS, etc.) → Cor fixa característica
- **Restante do UI** (título, mensagem, botões) → Segue tema ativo
- Bordas e sombras adaptam-se ao tipo de alert

### **3. Flexibilidade Total**

- **Mensagens:** String simples ou array de parágrafos
- **Botões:** 1 a N botões com labels e ações customizadas
- **Ícones:** Emoji ou qualquer caractere
- **Título:** Opcional
- **Fechável:** Pode ser desabilitado (força interação)

### **4. Animações**

- **Fade In/Out:** Entrada e saída suaves
- **Slide In:** Componente desce do topo
- **Shake:** Quando usuário clica fora sem poder fechar
- **Icon Pulse:** Ícone pulsa ao aparecer

### **5. Responsividade**

- Desktop: 400px-600px largura
- Mobile: 90vw largura, botões empilhados verticalmente

---

## 🔄 Sincronização Global

O sistema de alerts utiliza o **GlobalState** e **BroadcastChannel** para sincronização:

```typescript
// Ações sincronizadas entre janelas
type AlertActions =
  | { type: "ALERT_SHOW"; payload: { windowId; alert } }
  | { type: "ALERT_HIDE"; payload: { windowId; alertId } }
  | { type: "ALERT_RESPONDED"; payload: { windowId; alertId; buttonId } };
```

**Comportamento:**

1. Usuário dispara alert → `showAlert()` → `ALERT_SHOW` broadcast
2. Todas as janelas recebem → Apenas a janela correspondente renderiza
3. Usuário responde → `respondToAlert()` → `ALERT_RESPONDED` + `ALERT_HIDE`
4. Estado limpo automaticamente após interação

---

## 🧪 Exemplo Real: AppHeader.vue

```typescript
// Confirmação antes de fechar janela secundária
const handleClose = () => {
  if (!canClose.value) return;

  alerts.showConfirm(
    "Are you sure you want to close this window? All unsaved changes will be lost.",
    "Close Window",
    () => window.close(), // YES
    () => console.log("Close cancelled") // NO
  );
};
```

---

## 🎭 Variantes de Botões

```typescript
interface AlertButton {
  id: string; // Identificador único
  label: string; // Texto do botão
  variant?: "primary" | "secondary" | "danger";
  action?: () => void | Promise<void>; // Ação ao clicar
}
```

- **primary:** Destaque principal (cor do tema)
- **secondary:** Botão neutro (cinza)
- **danger:** Ação destrutiva (vermelho)

---

## 📊 Estado Interno

```typescript
interface AlertState {
  id: AlertId;
  type: AlertType;
  title?: string;
  message: string | string[];
  icon?: string;
  buttons?: AlertButton[];
  closable?: boolean;
  onClose?: () => void;
  createdAt: number;
  windowId: WindowId;
  visible: boolean;
  responded: boolean;
}
```

---

## 🚀 Próximos Passos (Futuro)

1. **Toast Notifications:** Alerts não-modais para notificações rápidas
2. **Posicionamento Customizado:** Top, bottom, left, right, center
3. **Auto-dismiss:** Alerts que desaparecem automaticamente após N segundos
4. **Som:** Alertas sonoros opcionais
5. **Temas de Alert:** Variações visuais além dos tipos padrão
6. **Pilha de Alerts:** Múltiplos alerts simultâneos (atualmente sobrepostos)

---

## ✅ Checklist de Implementação

- [x] Tipos TypeScript (`AlertType`, `AlertConfig`, `AlertButton`, `AlertState`)
- [x] GlobalState atualizado (`alertsByWindow`)
- [x] Ações (`ALERT_SHOW`, `ALERT_HIDE`, `ALERT_RESPONDED`)
- [x] Composable `useGlobalAlerts.ts`
- [x] Componente `BaseAlert.vue`
- [x] Componente `AlertContainer.vue`
- [x] Estilos `_alerts.scss`
- [x] Integração no `HomeView.vue`
- [x] Exemplo prático no `AppHeader.vue`
- [x] Documentação completa
- [x] Servidor de desenvolvimento rodando e testado

---

## 📝 Notas de Arquitetura

**Por que uma nova família de componentes?**

1. **Modularidade:** Alerts são funcionalmente distintos de drag-drop, sidebar, etc.
2. **Escalabilidade:** Facilita adicionar novos tipos de feedback visual no futuro
3. **Manutenibilidade:** Código isolado em pasta dedicada
4. **Consistência:** Segue o padrão já estabelecido (`components/drag-drop/`, `components/sidebar/`)

**Por que GlobalState?**

- Sincronização automática entre janelas
- Single source of truth
- Histórico de alerts persistível
- Debugging facilitado

**Por que não usar bibliotecas externas?**

- Controle total sobre UI/UX
- Zero dependências extras
- Perfeita integração com tema matrix/cyberpunk
- Otimizado para arquitetura multi-janela do projeto

---

**Criado em:** 2025-12-25  
**Versão:** 1.0.0  
**Branch:** amyszko  
**Status:** ✅ Implementado e Funcional
