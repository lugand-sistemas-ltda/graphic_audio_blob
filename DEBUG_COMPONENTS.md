# 🖥️ Debug Components - Matrix Style

## 📋 Componentes Criados

### 1. **DebugTerminal.vue** - Terminal de Monitoramento

Terminal estilo Matrix que exibe variáveis do sistema em tempo real.

#### 📊 Variáveis Monitoradas:

- **sphere.position.x**: Posição X do mouse (0-100%)
- **sphere.position.y**: Posição Y do mouse (0-100%)
- **sphere.size**: Tamanho da esfera em pixels
- **sphere.reactivity**: Reatividade ao áudio (0-200%)
- **audio.playing**: Estado de reprodução (TRUE/FALSE)
- **audio.time**: Tempo atual / duração total
- **audio.volume**: Volume atual (0-100%)
- **beat.detected**: Indicador de beat detectado (■/□)
- **layers.active**: Camadas ativas (8/8)
- **fps**: Frames por segundo

#### 🎨 Features:

- ✅ Atualização em tempo real (60 FPS)
- ✅ Timestamp com hora atual
- ✅ Indicador de beat pulsante
- ✅ Status "ONLINE" piscando
- ✅ Efeito scanline Matrix
- ✅ Cores verde neon
- ✅ Scrollbar customizada

#### 📍 Posição:

- **Top**: 7rem (abaixo do título)
- **Left**: 2rem
- **Width**: 320px
- **Z-index**: 998

---

### 2. **FrequencyVisualizer.vue** - Visualizador de Frequências

Display de barras mostrando espectro de frequências em tempo real.

#### 📊 8 Bandas de Frequência:

1. **20Hz** - Sub-bass profundo
2. **60Hz** - Bass
3. **250Hz** - Médio-grave
4. **1kHz** - Médio
5. **4kHz** - Médio-agudo
6. **8kHz** - Agudo
7. **16kHz** - Super agudo
8. **22kHz** - Ultra agudo

#### 🎨 Cores Dinâmicas (baseadas na intensidade):

- **> 80%**: Verde brilhante `rgba(0, 255, 65, 0.8-1.0)`
- **50-80%**: Verde médio `rgba(0, 255, 0, 0.6-1.0)`
- **20-50%**: Verde escuro `rgba(0, 200, 0, 0.4-1.0)`
- **< 20%**: Verde muito escuro `rgba(0, 143, 17, 0.2-1.0)`

#### 📈 Informações Adicionais:

- **Peak**: Frequência com maior intensidade
- **Avg**: Nível médio de todas as frequências (%)

#### 🎨 Features:

- ✅ 8 barras verticais animadas
- ✅ Transição suave (0.05s ease-out)
- ✅ Efeito de brilho no topo das barras
- ✅ Cores responsivas à intensidade
- ✅ Labels de frequência
- ✅ Efeito scanline Matrix
- ✅ Bordas com glow verde

#### 📍 Posição:

- **Top**: 20rem (abaixo do terminal)
- **Left**: 2rem
- **Width**: 320px
- **Height**: ~250px
- **Z-index**: 998

---

## 🔧 Integração no App.vue

### Imports Adicionados:

```typescript
import DebugTerminal from "./components/DebugTerminal.vue";
import FrequencyVisualizer from "./components/FrequencyVisualizer.vue";
```

### Estados Reativos:

```typescript
const spherePosition = ref({ x: 50, y: 50 });
const currentVolume = ref(0.7);

const frequencyBands = computed(() => {
  const data = audio.getFrequencyData();
  return data?.frequencyBands || [0, 0, 0, 0, 0, 0, 0, 0];
});

const beatDetected = computed(() => {
  const data = audio.getFrequencyData();
  return data?.beat || false;
});
```

### Atualização em Tempo Real:

```typescript
const updateDebugData = () => {
  spherePosition.value = visualEffect.getSpherePosition();
  requestAnimationFrame(updateDebugData);
};
```

---

## 🎯 Modificações em useSpectralVisualEffect

### Novos Métodos Expostos:

```typescript
const getSpherePosition = () => ({ x: mouseX, y: mouseY });
const getSphereSize = () => baseSphereSize;
const getSphereReactivity = () => sphereReactivity;

return {
  // ... métodos existentes
  getSpherePosition,
  getSphereSize,
  getSphereReactivity,
};
```

---

## 🎨 Estilos Matrix Compartilhados

### Scanline Effect:

```scss
&::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 255, 0, 0.03) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 255, 0, 0.03) 3px
  );
  pointer-events: none;
  z-index: 2;
}
```

### Container Base:

```scss
background: rgba(0, 0, 0, 0.95);
border: 1px solid var(--matrix-green-dim);
border-radius: 4px;
font-family: "Courier New", monospace;
box-shadow: 0 0 30px rgba(0, 255, 0, 0.2), inset 0 0 30px rgba(0, 255, 0, 0.05);
```

---

## 📊 Layout Visual

```
┌─────────────────────────────────────┐
│ SPECTRAL AUDIO VISUALIZER           │ <- Título (top: 2rem)
│ [ SYSTEM ACTIVE ]                   │
├─────────────────────────────────────┤
│                                     │
│ [ SYSTEM MONITOR ]                  │ <- DebugTerminal (top: 7rem)
│ sphere.position.x: 52.34%           │
│ sphere.position.y: 48.12%           │
│ sphere.size: 300px                  │
│ ...                                 │
├─────────────────────────────────────┤
│                                     │
│ [ FREQUENCY SPECTRUM ]              │ <- FrequencyVisualizer (top: 20rem)
│ ▓▓░░░░░░ ▓▓▓▓░░░░ ▓▓▓▓▓▓░░         │
│ 20Hz 60Hz 250Hz 1kHz ...            │
│ Peak: 1kHz | Avg: 45%               │
├─────────────────────────────────────┤
│                                     │
│ [  🟢 Character Rotating  ]         │ <- MatrixCharacter (bottom: 2rem)
│                                     │
└─────────────────────────────────────┘
```

---

## 🚀 Performance

### DebugTerminal:

- **FPS Calculation**: RequestAnimationFrame loop
- **Timestamp Update**: 1 segundo (setInterval)
- **Data Update**: 60 FPS via requestAnimationFrame no App.vue

### FrequencyVisualizer:

- **Bar Animation**: CSS transition (0.05s)
- **Data Update**: Reactive computed property
- **No JavaScript Animation**: Puro CSS para performance

### Otimizações:

- ✅ CSS transitions em vez de JavaScript
- ✅ RequestAnimationFrame para updates síncronos
- ✅ Computed properties para dados derivados
- ✅ Minimal DOM manipulation
- ✅ GPU-accelerated transforms

---

## 🎛️ Customizações Disponíveis

### Ajustar posição do DebugTerminal:

```scss
.debug-terminal {
  top: 7rem; // Distância do topo
  left: 2rem; // Distância da esquerda
}
```

### Ajustar posição do FrequencyVisualizer:

```scss
.frequency-visualizer {
  top: 20rem; // Distância do topo
  left: 2rem; // Distância da esquerda
}
```

### Ajustar número de casas decimais:

```vue
<!-- DebugTerminal.vue -->
{{ spherePosition.x.toFixed(2) }}% // 2 casas decimais
```

### Ajustar altura das barras:

```scss
.frequency-bar {
  height: 120px; // Altura máxima das barras
}
```

### Ajustar cores das barras:

```typescript
// FrequencyVisualizer.vue - função getBarColor()
if (intensity > 0.8) {
  return `rgba(0, 255, 65, ${0.8 + intensity * 0.2})`;
}
```

---

## ✨ Efeitos Especiais

### Terminal:

- 🟢 Status "ONLINE" piscando
- 🟢 Beat indicator pulsante (■)
- 🟢 Timestamp em tempo real
- 🟢 FPS counter
- 🟢 Valores em destaque (verde brilhante)

### Visualizador:

- 🟢 Barras com gradient de intensidade
- 🟢 Brilho no topo das barras
- 🟢 Peak frequency destacado
- 🟢 Average level calculado
- 🟢 Transições suaves

---

## 🐛 Debug Tips

### Ver dados brutos de frequência:

```javascript
console.log("Frequency Bands:", audio.getFrequencyData()?.frequencyBands);
```

### Ver posição do mouse:

```javascript
console.log("Sphere Position:", visualEffect.getSpherePosition());
```

### Ver FPS:

O FPS é calculado automaticamente e exibido no terminal.

---

**Criado com** 🟢⚫ **Tema Matrix** | **Atualização em Tempo Real** ⚡
