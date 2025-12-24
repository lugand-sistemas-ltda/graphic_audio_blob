# 🎵 Visualizador Espectral de Áudio - Sistema Avançado

## 🌟 Visão Geral

Sistema completamente redesenhado que transforma a visualização de áudio em um **espectro visual dinâmico** com camadas concêntricas reagindo a diferentes bandas de frequência.

## 🎯 Conceito Principal

### De Círculos Simples para Espectro Layered:

**ANTES:**

- 3 círculos fixos (bass, mid, treble)
- Cores estáticas com variação limitada
- Movimento básico seguindo o cursor

**DEPOIS:**

- 8 camadas espectrais concêntricas
- Cada camada reage a uma banda de frequência específica
- Cores dinâmicas baseadas em HSL (espectro arco-íris)
- Efeito 3D com parallax do mouse
- Distorção "wobble" baseada na intensidade
- Pulso de beat no body inteiro

## 📊 Arquitetura do Sistema

### 1. **Análise de Frequência Detalhada**

```typescript
interface AudioFrequencyData {
  bass: number; // Graves (0-255)
  mid: number; // Médios (0-255)
  treble: number; // Agudos (0-255)
  overall: number; // Volume geral (0-255)
  beat: boolean; // Detecta batida
  raw: Uint8Array; // Dados brutos FFT
  frequencyBands: number[]; // 8 bandas espectrais ⭐ NOVO
}
```

**Divisão do Espectro (20Hz - 22kHz):**

- Banda 0: Sub-bass (20-60Hz)
- Banda 1: Bass (60-250Hz)
- Banda 2: Low-mid (250-500Hz)
- Banda 3: Mid (500-2kHz)
- Banda 4: High-mid (2-4kHz)
- Banda 5: Presence (4-6kHz)
- Banda 6: Brilliance (6-10kHz)
- Banda 7: Air (10-22kHz)

### 2. **Sistema de Camadas Espectrais**

```typescript
interface SpectralLayer {
  frequency: number; // Valor atual da freq (interpolado)
  targetFrequency: number; // Valor alvo (do áudio)
  radius: number; // Raio base da camada
  color: { h; s; l }; // Cor HSL dinâmica
  wobble: number; // Distorção senoidal
}
```

**8 Camadas Concêntricas:**

- **Camada 0 (centro)**: Agudos extremos (air) - Vermelho/Rosa
- **Camada 1**: Brilho (brilliance) - Laranja
- **Camada 2**: Presença - Amarelo
- **Camada 3**: High-mid - Verde-amarelado
- **Camada 4**: Mid - Verde
- **Camada 5**: Low-mid - Ciano
- **Camada 6**: Bass - Azul
- **Camada 7 (externo)**: Sub-bass (graves profundos) - Roxo/Índigo

## 🎨 Mapeamento de Cores

### Sistema HSL Dinâmico:

```typescript
// Espectro invertido: Agudos = quente, Graves = frio
const baseHue = 360 - (layerIndex / totalLayers) * 280;

// Camada 0: 360° (vermelho)
// Camada 4: 220° (azul-ciano)
// Camada 7: 80° (verde-azulado)
```

### Intensidade Afeta Luminosidade:

```typescript
const intensity = frequency / 255;

const saturation = 70 + intensity * 30; // 70%-100%
const lightness = 30 + intensity * 30; // 30%-60%
```

**Resultado:**

- Som forte → cores vibrantes e brilhantes
- Som fraco → cores escuras e sutis
- Transições suaves via interpolação

## 🌊 Efeito Wobble (Distorção)

### Fórmula:

```typescript
wobble =
  Math.sin(time * 0.001 + layerIndex * 0.5) * 10 + (frequency / 255) * 30;

// Componente 1: Oscilação base (movimento orgânico)
// Componente 2: Reação à frequência (distorção pelo som)
```

**Comportamento:**

- Cada camada oscila em fase diferente
- Frequências altas = maior wobble
- Cria efeito de "líquido pulsante"

## 🎭 Efeito 3D com Mouse

### Parallax Dinâmico:

```typescript
mouse3DOffset = {
  x: (mouseX - 50) * 0.5, // ±25 unidades max
  y: (mouseY - 50) * 0.5,
};

// Interpolação suave
offset += (target - offset) * 0.1;
```

**Resultado:**

- Mouse no centro → gradiente centralizado
- Mouse nos cantos → gradiente deslocado (efeito 3D)
- Movimento suave e fluido (easing)
- Profundidade visual aumentada

## 🔥 Reação ao Beat

### Pulso Global:

```typescript
if (beat) {
  document.body.style.transform = "scale(1.02)";
  setTimeout(() => {
    document.body.style.transform = "scale(1)";
  }, 100);
}
```

**Efeito:**

- Toda a tela pulsa no beat
- Ampliação de 2% por 100ms
- Reforça impacto visual dos graves

## 📐 Cálculo de Renderização

### Raio de Cada Camada:

```typescript
// Base radius (proporcional à tela)
const baseRadius =
  maxScreenSize * sizePercentage * 0.6 * ((index + 1) / layerCount);

// Expansão dinâmica
const expansionFactor = 1 + intensity * 0.3 * reactivityFactor;

// Raio final
const finalRadius = baseRadius * expansionFactor + wobble;
```

### Gradiente Radial:

```typescript
radial-gradient(
    circle at [posX]% [posY]%,
    [layer0-start] 0%,
    [layer0-end] 8%,
    [layer1-start] 8%,
    [layer1-end] 20%,
    ...
    [layer7-end] 85%,
    #0a0a0a 100%
)
```

## 🎛️ Controles do Usuário

### Tamanho da Esfera (20%-100%):

```typescript
// Controla escala base de todas as camadas
baseSphereSize → afeta baseRadius
```

### Reatividade ao Áudio (0%-200%):

```typescript
// Controla intensidade da expansão
0%   → sem reação (estático)
100% → reação padrão (30% expansão max)
200% → reação extrema (60% expansão max)
```

## 🚀 Performance

### Otimizações:

1. **Interpolação Suave:**

   ```typescript
   layer.frequency += (target - current) * 0.15;
   ```

   - Evita mudanças bruscas
   - Reduz jitter visual

2. **RequestAnimationFrame:**

   - Sincronizado com refresh da tela (60fps)
   - Renderização eficiente

3. **CSS Direto:**

   - Aplica gradiente direto no `body.style.background`
   - Sem DOM intermediário
   - Hardware accelerated

4. **Type Guards:**
   - Verificações de undefined
   - Código seguro em TypeScript

## 🎵 Exemplos de Comportamento

### Música Eletrônica (Bass Heavy):

- Camadas externas (roxo/azul) pulsam forte
- Camadas internas (vermelho/amarelo) subtis
- Wobble pronunciado nos graves
- Visual energético e vibrante

### Música Acústica (Balanced):

- Todas as camadas ativas
- Cores equilibradas
- Wobble moderado
- Visual harmonioso

### Jazz/Instrumental (High-freq):

- Camadas internas dominantes
- Vermelhos e laranjas brilhantes
- Wobble suave e elegante
- Visual sofisticado

## 📊 Diferenças vs Sistema Anterior

| Aspecto      | Sistema Antigo  | Sistema Novo       |
| ------------ | --------------- | ------------------ |
| Camadas      | 3 fixas         | 8 espectrais       |
| Cores        | Aleatórias      | Mapeadas por freq  |
| Movimento    | Cursor simples  | Parallax 3D        |
| Reatividade  | Volume geral    | 8 bandas freq      |
| Distorção    | Nenhuma         | Wobble senoidal    |
| Beat         | Círculos pulsam | Tela inteira pulsa |
| Rendering    | CSS variables   | Direct style       |
| Interpolação | Básica          | Suave multi-layer  |

## 🎯 Resultado Visual

### Descrição do Efeito:

Imagine um espectrógrafo circular vivo onde:

- O centro representa os agudos (vermelho quente)
- A periferia representa os graves (azul frio)
- Cada anel pulsa com sua frequência
- As cores mudam com a intensidade
- O conjunto "respira" e "dança" com a música
- O mouse adiciona profundidade 3D
- Beats fazem tudo pulsar junto

### Sensação:

🌈 Arco-íris líquido pulsante
🎵 Sincronizado perfeitamente com a música
🌊 Movimento orgânico e fluido
💫 Hipnótico e imersivo
🎨 Artisticamente equilibrado

---

**Um verdadeiro visualizador de áudio profissional! 🎸✨**

Cada camada conta uma história diferente da música.
