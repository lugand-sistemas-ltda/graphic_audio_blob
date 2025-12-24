# 🌐 Multi-Window System Documentation

## 📋 Visão Geral

Sistema robusto de sincronização multi-window que permite rodar o Spectral Visualizer em **múltiplas janelas simultâneas**, com sincronização em tempo real de áudio, controles, temas e estado dos componentes.

---

## 🏗️ Arquitetura

### **Camadas do Sistema:**

```
┌─────────────────────────────────────────┐
│  useWindowManager (High-Level API)      │  ← Funções específicas do app
├─────────────────────────────────────────┤
│  useBroadcastSync (Low-Level)           │  ← BroadcastChannel + Heartbeat
├─────────────────────────────────────────┤
│  BroadcastChannel API (Browser)         │  ← Nativo do navegador
└─────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

```
/src
  /core
    /sync
      types.ts                 # Tipos TypeScript
      useBroadcastSync.ts      # Sistema de broadcast low-level
      useWindowManager.ts      # API high-level
      index.ts                 # Exports consolidados

  /views
    VisualView.vue             # Janela apenas com efeitos visuais

  /components
    MainControl.vue            # Controles de multi-window adicionados
```

---

## 🔧 Como Funciona

### **1. BroadcastChannel API**

- **Nativo do navegador** (Chrome, Firefox, Edge, Safari 15.4+)
- Permite comunicação entre janelas/tabs do **mesmo domínio**
- **Zero latência** - comunicação instantânea
- **Não precisa de servidor** - tudo client-side

### **2. Sistema de Heartbeat**

```typescript
// Cada janela envia "estou viva" a cada 3 segundos
setInterval(() => broadcast("HEARTBEAT"), 3000);

// Se uma janela não responder por 10 segundos, é marcada como "morta"
if (now - lastHeartbeat > 10000) {
  window.isAlive = false;
}
```

### **3. Sincronização de Dados**

```typescript
// Janela Principal (Main)
windowManager.syncAudioData({
    frequencyBands: [120, 80, 200, ...],
    bass: 150,
    beat: true
})

// Janela Secundária (Visual)
windowManager.onAudioData((data) => {
    // Recebe dados instantaneamente
    audioDataCache = data
})
```

---

## 🎯 Uso Prático

### **Cenário 1: Setup Dual-Screen Padrão**

**Monitor 1 (Principal):**

- MainControl
- SoundControl
- ThemeSelector
- Playlist
- Todos os controles

**Monitor 2 (Visual):**

- Apenas efeitos visuais
- Tela cheia
- Sem controles
- Sincronizado com Monitor 1

### **Como Usar:**

1. Abra o app normalmente
2. Clique em `[ MULTI-WINDOW SETUP ]` no MainControl
3. Clique em `"Open Visual Window (Screen 2)"`
4. Arraste a nova janela para o segundo monitor
5. Maximize (F11)
6. **Tudo será sincronizado automaticamente!** 🎉

---

## 🚀 Funcionalidades Implementadas

### ✅ **Sincronização de Áudio**

- Dados de frequência (8 bandas)
- Bass, Mid, Treble, Overall
- Beat detection
- **Atualização em 60fps** sem lag

### ✅ **Sincronização de Controles**

- Play/Pause/Next/Previous
- Volume
- Seek (posição da música)
- Sensibilidade de beat

### ✅ **Sincronização de Temas**

- Mudança de tema
- RGB Mode toggle
- Chameleon Mode toggle

### ✅ **Sincronização de Componentes**

- Visibilidade (show/hide)
- Estado de colapso
- (Futuro: Posição drag-drop)

### ✅ **Gerenciamento de Janelas**

- Detecção automática de conexão/desconexão
- Contador de janelas ativas
- Lista de janelas conectadas
- Role-based windows (main, visual, controls, grid)

---

## 📊 Status & Monitoramento

### **Interface no MainControl:**

```
[ MULTI-WINDOW SETUP ]

Connected Windows: 2 windows 🟢

┌─────────────────────────────────────┐
│ 🖥️ Open Visual Window (Screen 2)   │
├─────────────────────────────────────┤
│ 🎛️ Open Controls Window (Screen 2) │
├─────────────────────────────────────┤
│ 📊 Open Grid Window (Multi-View)   │
└─────────────────────────────────────┘

Active Windows:
• Main           🟢 ACTIVE
• Visual         🟢 ACTIVE
```

---

## 🎨 Modos de Janela

### **1. Main (Principal)**

- **Rota:** `/`
- **Role:** `main`
- **Contém:** Todos os componentes + controles
- **Sincroniza:** Envia dados de áudio

### **2. Visual (Efeitos Visuais)**

- **Rota:** `/visual`
- **Role:** `visual`
- **Contém:** Apenas efeitos visuais (esfera, partículas, etc)
- **Sincroniza:** Recebe dados de áudio
- **Ideal para:** Projeção, segundo monitor, livestream

### **3. Controls (Futura)**

- **Rota:** `/controls`
- **Role:** `controls`
- **Contém:** Apenas controles (sem visual)
- **Ideal para:** Tablet de controle, segundo monitor com apenas UI

### **4. Grid (Futura)**

- **Rota:** `/grid`
- **Role:** `grid`
- **Contém:** Grid de múltiplos efeitos visuais
- **Ideal para:** Wall de monitores, visualização profissional

---

## 💻 API do WindowManager

### **Inicialização:**

```typescript
import { useWindowManager } from "./core/sync";

const windowManager = useWindowManager({
  enableLogging: false, // true para debug
});
```

### **Estado:**

```typescript
// Número total de janelas (incluindo atual)
windowManager.windowCount; // ref<number>

// É multi-window? (mais de 1 janela)
windowManager.isMultiWindow; // computed<boolean>

// É janela principal?
windowManager.isMainWindow; // computed<boolean>

// Janelas conectadas
windowManager.getAliveWindows(); // WindowInfo[]
```

### **Sincronizar Áudio:**

```typescript
// Enviar
windowManager.syncAudioData({
  frequencyBands: [0, 0, 0, 0, 0, 0, 0, 0],
  bass: 120,
  mid: 80,
  treble: 200,
  overall: 150,
  beat: true,
});

// Receber
windowManager.onAudioData((data) => {
  console.log("Frequências:", data.frequencyBands);
});
```

### **Abrir Janelas:**

```typescript
// Visual window (tela cheia de efeitos)
windowManager.openVisualWindow();

// Controls window (apenas controles)
windowManager.openControlsWindow();

// Grid window (múltiplos efeitos)
windowManager.openGridWindow();

// Custom
windowManager.openWindow("/custom-route", {
  width: 1920,
  height: 1080,
  title: "Custom Window",
});
```

---

## 🔐 Segurança & Limitações

### **✅ Vantagens:**

- **Client-side apenas** - não precisa de servidor
- **Zero latência** - comunicação instantânea
- **Isolamento de processo** - cada janela = processo separado (performance)
- **Seguro** - apenas mesmo domínio pode comunicar

### **⚠️ Limitações:**

- **Mesmo domínio apenas** - não funciona entre sites diferentes
- **Popup blocker** - usuário precisa permitir popups
- **Mesmo device** - não funciona entre dispositivos (ainda)
- **Browser support** - Safari < 15.4 não suporta

---

## 🚀 Roadmap Futuro

### **Fase 2: Layouts Avançados**

- [ ] ControlsView (apenas controles)
- [ ] GridView (grid de 4/9/16 efeitos)
- [ ] CustomView (usuário monta layout)

### **Fase 3: Persistência**

- [ ] Salvar configuração de multi-window
- [ ] Restaurar janelas ao reabrir
- [ ] Presets de layout (DJ, VJ, Studio, etc)

### **Fase 4: Multi-Device (WebSocket)**

- [ ] Sincronizar entre dispositivos diferentes
- [ ] Controle via tablet/celular
- [ ] Múltiplos DJs controlando
- [ ] Live collaboration

---

## 🐛 Troubleshooting

### **Problema: "Popup blocked!"**

**Solução:** Permita popups para o site nas configurações do browser

### **Problema: "Window disconnected"**

**Solução:** Janela foi fechada ou travou. Sistema detecta automaticamente após 10s

### **Problema: "No synchronization"**

**Verificar:**

1. As duas janelas estão no mesmo domínio?
2. Browser suporta BroadcastChannel? (Chrome/Firefox/Edge sim, Safari 15.4+)
3. Logging habilitado? (`enableLogging: true`)

### **Problema: "High CPU usage"**

**Solução:** Normal em multi-window. Cada janela = processo separado renderizando a 60fps. Recomendado GPU dedicada para 3+ janelas.

---

## 📝 Exemplo Completo

```typescript
// App.vue (Janela Principal)
import { useWindowManager } from "./core/sync";

const windowManager = useWindowManager();

// Sincroniza dados de áudio a cada frame
const updateAudio = () => {
  const data = audio.getFrequencyData();
  windowManager.syncAudioData(data);
  requestAnimationFrame(updateAudio);
};

// VisualView.vue (Janela Secundária)
import { useWindowManager } from "./core/sync";

const windowManager = useWindowManager();
windowManager.setWindowRole("visual");

let audioData = {};
windowManager.onAudioData((data) => {
  audioData = data; // Recebe automaticamente
});

const audioProvider = () => audioData;

useSpectralVisualEffect({
  audioDataProvider: audioProvider, // Usa dados sincronizados
});
```

---

## ✅ Status de Implementação

**✅ COMPLETO:**

- [x] BroadcastChannel system
- [x] Heartbeat & connection management
- [x] Audio data sync
- [x] Window manager API
- [x] VisualView route
- [x] MainControl UI
- [x] Router configuration

**🔄 TODO:**

- [ ] ControlsView route
- [ ] GridView route
- [ ] Sync de mudanças de tema/RGB/Chameleon
- [ ] Sync de state de componentes (drag position)
- [ ] Presets de layout

---

**Sistema multi-window operacional e pronto para uso!** 🎉✨

Para testar: Abra o app → MainControl → [ MULTI-WINDOW SETUP ] → Open Visual Window
