# 🎵 Audio Reactive Visual Effects

Sistema de visualização de áudio com efeitos visuais reativos implementado em Vue 3 + TypeScript.

## 📋 Estrutura do Projeto

```
src/
├── composables/
│   ├── useAudioAnalyzer.ts          # Análise de frequência de áudio
│   ├── useAudioVisualEffect.ts      # Efeitos visuais reativos ao áudio
│   └── useBackgroundEffect.ts       # Efeito de background original (mouse)
├── components/
│   └── AudioControls.vue            # Controles de áudio (play, volume, etc)
├── assets/
│   └── music/
│       └── Toad Tango.mp3          # Arquivo de áudio
└── style/
    └── index.scss                   # Estilos globais com animações
```

## 🎨 Funcionalidades

### 1. **Análise de Áudio (useAudioAnalyzer)**

- ✅ Análise de frequências em tempo real usando Web Audio API
- ✅ Separação em 3 faixas: Graves, Médios e Agudos
- ✅ Beat detection (detecção de batidas)
- ✅ Controle de volume e sensibilidade

### 2. **Efeitos Visuais (useAudioVisualEffect)**

- ✅ **3 Círculos reativos** - Cada um reage a uma faixa de frequência diferente:
  - **Círculo 1 (Graves)**: Vermelho/Rosa - Reage aos bass/graves
  - **Círculo 2 (Médios)**: Verde/Ciano - Reage aos médios
  - **Círculo 3 (Agudos)**: Amarelo - Reage aos agudos
- ✅ **Gradiente dinâmico**: Cores mudam baseadas nas frequências
- ✅ **Pulso de batida**: Efeito visual quando detecta beat
- ✅ **Tamanho reativo**: Círculos crescem/diminuem com o volume
- ✅ **Controle por mouse**: Ainda funciona paralelamente ao áudio

### 3. **Sistema de Cores**

- Cores derivadas de uma cor base
- Variações suaves (-50 a +50 por canal RGB)
- Interpolação suave entre transições
- Mapeamento de frequências para RGB:
  - Graves → Red
  - Médios → Green
  - Agudos → Blue

## 🎮 Controles

### Interface de Controles (AudioControls.vue)

- **Play/Pause**: Inicia/pausa a música
- **Volume**: Controla o volume do áudio (0-100%)
- **Beat Sensitivity**: Ajusta sensibilidade de detecção de batidas (50-300)

## 🔧 Tecnologias Utilizadas

- **Vue 3** (Composition API)
- **TypeScript**
- **SCSS**
- **Web Audio API**
  - `AudioContext`
  - `AnalyserNode`
  - `getByteFrequencyData()`

## 📊 Como Funciona

### Fluxo de Dados:

```
Arquivo MP3
    ↓
AudioContext (Web Audio API)
    ↓
AnalyserNode (FFT Analysis)
    ↓
Uint8Array (Frequências 0-255)
    ↓
Processamento (Bass/Mid/Treble)
    ↓
CSS Variables (--circle-1-size, --random-color-X)
    ↓
Animações CSS + RequestAnimationFrame
    ↓
Efeitos Visuais Reativos
```

### Beat Detection:

```typescript
// Detecta aumento súbito de volume
const volumeIncrease = currentVolume - lastVolume
if (volumeIncrease > threshold && timeSinceLastBeat > 300ms) {
    beat = true // Dispara efeito de pulso
}
```

## 🎯 Customização

### Ajustar Tamanhos dos Círculos:

```typescript
// Em useAudioVisualEffect.ts
circles[0].size = 300 + (data.bass / 255) * 1200; // Min: 300px, Max: 1500px
```

### Ajustar Variação de Cores:

```typescript
// Em useAudioVisualEffect.ts
const variation = range(-50, 50); // Altere para ±80 para mais variação
```

### Ajustar Delay de Transição:

```typescript
const colorUpdateDelay = 500; // ms entre mudanças de cor
```

## 🚀 Melhorias Futuras Possíveis

- [ ] Upload de arquivos de áudio customizados
- [ ] Visualizador de espectro (barras de frequência)
- [ ] Presets de efeitos visuais
- [ ] Sincronização com BPM
- [ ] Modo "party" com mais efeitos
- [ ] Gravação de sessões
- [ ] Compartilhamento social

## 📝 Notas Técnicas

- FFT Size: 512 (maior resolução de frequência)
- Smoothing: 0.8 (suavização temporal)
- Frequências analisadas: ~256 bins
- Taxa de atualização: 60 FPS (requestAnimationFrame)
- Beat cooldown: 300ms (evita falsos positivos)

## 🎵 Arquivo de Áudio

O projeto usa "Toad Tango.mp3" como exemplo. Para usar sua própria música:

1. Coloque o arquivo em `src/assets/music/`
2. Importe no `App.vue`: `import audioFile from './assets/music/SeuArquivo.mp3'`

---

**Desenvolvido com Vue 3 + TypeScript + Web Audio API** 🎸
