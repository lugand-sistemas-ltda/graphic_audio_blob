# Normalized Controls Implementation

## Contexto

Implementação de **controles normalizados (0-1)** compartilhados entre todos os efeitos visuais, seguindo princípio DRY e garantindo comportamento consistente.

---

## Arquitetura

### Componentes Compartilhados

#### 1. `EffectSizeControl.vue`

**Localização**: `src/features/visual-effects/components/shared/`

Controle de tamanho/escala normalizado (0-1) usado por todos os efeitos.

```typescript
interface Props {
    modelValue: number     // 0-1 (normalizado)
    label?: string         // Padrão: 'Effect Size'
    controlId?: string     // ID único do input
    description?: string   // Descrição opcional
}

emits: 'update:modelValue': [value: number] // 0-1
```

**Conversão Interna (Manager)**:

- Gradient: `0-1` → `100-500px` (baseSphereSize)
- Particles: `0-1` → `100-500px` (spawnAreaSize)
- Waveform: `0-1` → escala específica futura

**Display**: Mostra valor como `0-100%` (multiplicado por 100)

---

#### 2. `EffectReactivityControl.vue`

**Localização**: `src/features/visual-effects/components/shared/`

Controle de sensibilidade ao áudio normalizado (0-1) usado por todos os efeitos.

```typescript
interface Props {
    modelValue: number     // 0-1 (normalizado)
    label?: string         // Padrão: 'Audio Reactivity'
    controlId?: string     // ID único do input
    description?: string   // Descrição opcional
}

emits: 'update:modelValue': [value: number] // 0-1
```

**Conversão Interna (Manager)**:

- Gradient: `0-1` → `0-200%` (audioReactivity)
- Particles: `0-1` → `0-200%` (audioReactivity)
- Waveform: `0-1` → sensibilidade específica futura

**Display**: Mostra valor como `0-100%` (multiplicado por 100)

---

### Manager (Visual Effects Manager)

**Localização**: `src/features/visual-effects/composables/useVisualEffectsManager.ts`

Responsável por **converter valores normalizados** para ranges específicos de cada efeito.

#### Controles Globais

```typescript
/**
 * Define tamanho para TODOS os efeitos ativos
 * @param effectSize - Valor normalizado 0-1
 */
setGlobalSize(effectSize: number): void

/**
 * Define sensibilidade para TODOS os efeitos ativos
 * @param effectSensitivity - Valor normalizado 0-1
 */
setGlobalReactivity(effectSensitivity: number): void
```

#### Controles Específicos

```typescript
// Gradient
gradientControls: {
    setSize(effectSize: number): void           // 0-1 → 100-500px
    setReactivity(effectSensitivity: number): void  // 0-1 → 0-200%
    setMouseFollow(enabled: boolean): void
    setAutoCenter(enabled: boolean): void
}

// Particles
particlesControls: {
    setParticleCount(count: number): void       // 50-300 (específico)
    setSpawnSize(effectSize: number): void      // 0-1 → 100-500px
    setReactivity(effectSensitivity: number): void  // 0-1 → 0-200%
    setMouseFollow(enabled: boolean): void
    setAutoCenter(enabled: boolean): void
}
```

---

### Conversão de Valores

**Fórmula Tamanho (Size)**:

```typescript
const normalized = Math.max(0, Math.min(1, effectSize));
const sizeInPx = 100 + normalized * 400; // 100-500px

// Exemplos:
// 0.0  → 100px (mínimo)
// 0.25 → 200px
// 0.5  → 300px (padrão)
// 0.75 → 400px
// 1.0  → 500px (máximo)
```

**Fórmula Sensibilidade (Reactivity)**:

```typescript
const normalized = Math.max(0, Math.min(1, effectSensitivity));
const reactivityPercent = normalized * 200; // 0-200%

// Exemplos:
// 0.0  → 0%   (sem reatividade)
// 0.25 → 50%
// 0.5  → 100% (padrão - reatividade normal)
// 0.75 → 150%
// 1.0  → 200% (máxima reatividade)
```

---

## Componentes de Efeito

### OrbEffectControl.vue

**Antes**:

```vue
<!-- Controles antigos não normalizados -->
<VisualControls
  @sphere-size-change="$emit('sphereSizeChange', $event)"
  @sphere-reactivity-change="$emit('sphereReactivityChange', $event)"
/>
```

**Depois**:

```vue
<!-- Controles normalizados compartilhados -->
<EffectSizeControl
  v-model="effectSize"
  label="Effect Size"
  control-id="orb-effect-size"
  description="Tamanho do efeito visual (esfera)"
  @update:model-value="handleEffectSizeChange"
/>

<EffectReactivityControl
  v-model="effectSensitivity"
  label="Audio Reactivity"
  control-id="orb-effect-reactivity"
  description="Sensibilidade à intensidade do áudio"
  @update:model-value="handleEffectSensitivityChange"
/>
```

**Valores Padrão**:

```typescript
const effectSize = ref(0.5); // 50% = ~300px
const effectSensitivity = ref(0.5); // 50% = ~100% reactivity
```

**Emits**:

```typescript
emit("effectSizeChange", normalizedValue); // 0-1
emit("effectSensitivityChange", normalizedValue); // 0-1
```

---

### ParticlesEffectControl.vue

**Antes**:

```vue
<!-- Controles específicos duplicados -->
<div class="control-group">
    <label>Spawn Area Size</label>
    <input type="range" min="100" max="500" v-model="spawnSize" />
</div>

<div class="control-group">
    <label>Audio Reactivity</label>
    <input type="range" min="0" max="200" v-model="reactivity" />
</div>
```

**Depois**:

```vue
<!-- Controles normalizados compartilhados -->
<EffectSizeControl
  v-model="effectSize"
  label="Effect Size"
  control-id="particles-effect-size"
  description="Tamanho da área de spawn das partículas"
  @update:model-value="handleEffectSizeChange"
/>

<EffectReactivityControl
  v-model="effectSensitivity"
  label="Audio Reactivity"
  control-id="particles-effect-reactivity"
  description="Sensibilidade à intensidade do áudio"
  @update:model-value="handleEffectSensitivityChange"
/>
```

**Valores Padrão**:

```typescript
const effectSize = ref(0.5); // 50% = ~300px
const effectSensitivity = ref(0.5); // 50% = ~100% reactivity
```

**Emits**:

```typescript
emit("effectSizeChange", normalizedValue); // 0-1
emit("effectSensitivityChange", normalizedValue); // 0-1
emit("particleCountChange", count); // 50-300 (específico)
```

---

## HomeView Handlers

**Antes**:

```typescript
const handleSphereSize = (size: number) => {
  visualEffectsManager.gradient.setSize(size); // size em px
};

const handleSpawnSizeChange = (size: number) => {
  visualEffectsManager.particles.setSpawnSize(size); // size em px
};
```

**Depois**:

```typescript
// Gradient
const handleEffectSizeChange = (normalizedSize: number) => {
  visualEffectsManager.gradient.setSize(normalizedSize); // 0-1
};

const handleEffectSensitivityChange = (normalizedSensitivity: number) => {
  visualEffectsManager.gradient.setReactivity(normalizedSensitivity); // 0-1
};

// Particles
const handleParticlesEffectSizeChange = (normalizedSize: number) => {
  visualEffectsManager.particles.setSpawnSize(normalizedSize); // 0-1
};

const handleParticlesEffectSensitivityChange = (
  normalizedSensitivity: number
) => {
  visualEffectsManager.particles.setReactivity(normalizedSensitivity); // 0-1
};
```

---

## Benefícios

### 1. **Consistência**

- Todos os efeitos usam mesma escala (0-1)
- Comportamento previsível e uniforme
- Fácil comparação entre efeitos

### 2. **Escalabilidade**

- Adicionar novo efeito = reusar controles existentes
- Apenas ajustar conversão no manager
- Zero duplicação de código UI

### 3. **Manutenibilidade**

- Mudança visual afeta todos os controles de uma vez
- Lógica de conversão centralizada
- Tipos TypeScript garantem segurança

### 4. **Flexibilidade**

- Manager pode aplicar transformações complexas
- Cada efeito pode ter range interno diferente
- Interface externa permanece simples (0-1)

---

## Compatibilidade Futura

### Waveform Effect (exemplo)

Quando implementado, bastará:

```typescript
// Manager adiciona conversão específica
const waveformControls = {
  setSize: (effectSize: number) => {
    const normalized = Math.max(0, Math.min(1, effectSize));
    const waveHeight = 50 + normalized * 200; // 50-250px

    const waveform = getEffect("waveform");
    if (waveform?.setWaveHeight) waveform.setWaveHeight(waveHeight);
  },

  setReactivity: (effectSensitivity: number) => {
    const normalized = Math.max(0, Math.min(1, effectSensitivity));
    const sensitivity = normalized * 3; // 0-3x multiplier

    const waveform = getEffect("waveform");
    if (waveform?.setSensitivity) waveform.setSensitivity(sensitivity);
  },
};
```

Componente `WaveformEffectControl.vue` usa **exatamente** os mesmos controles:

```vue
<EffectSizeControl v-model="effectSize" label="Wave Height" />
<EffectReactivityControl v-model="effectSensitivity" label="Audio Reactivity" />
```

---

## Arquivos Modificados

### Novos Arquivos

- `src/features/visual-effects/components/shared/EffectSizeControl.vue` (117 linhas)
- `src/features/visual-effects/components/shared/EffectReactivityControl.vue` (117 linhas)
- `docs/changelogs/NORMALIZED_CONTROLS.md` (este arquivo)

### Arquivos Atualizados

- `src/features/visual-effects/composables/useVisualEffectsManager.ts`

  - Controles globais agora aceitam valores 0-1
  - Controles específicos convertem 0-1 → range interno
  - Documentação atualizada com conversões

- `src/features/visual-effects/components/OrbEffectControl.vue`

  - Substituiu `VisualControls` por `EffectSizeControl` + `EffectReactivityControl`
  - Valores internos mudaram para 0-1
  - Emits atualizados: `effectSizeChange`, `effectSensitivityChange`

- `src/features/visual-effects/components/ParticlesEffectControl.vue`

  - Removeu controles inline duplicados
  - Adicionou `EffectSizeControl` + `EffectReactivityControl`
  - Valores internos mudaram para 0-1
  - Emits atualizados: `effectSizeChange`, `effectSensitivityChange`

- `src/views/HomeView.vue`
  - Handlers renomeados para refletir normalização
  - Template atualizado com novos eventos
  - Comentários adicionados indicando valores normalizados

### Arquivos Depreciados

- ~~`src/features/visual-effects/components/VisualControls.vue`~~ (pode ser removido futuramente)

---

## Próximos Passos

### Verificar Dependência Particles-Gradient

**Issue**: Particles ainda requer Gradient ativo para funcionar
**Status**: Código estruturalmente independente mas problema runtime persiste

**Hipóteses**:

1. Manager watch pode estar inicializando efeitos em ordem errada
2. Timing de audioDataProvider pode ter dependência
3. Canvas z-index ou posicionamento pode conflitar
4. Alguma mutação DOM compartilhada

**Próximas ações**:

1. Adicionar logging detalhado na inicialização do manager
2. Testar iniciar apenas particles (sem gradient)
3. Verificar ordem de chamadas no watch
4. Investigar audioDataProvider callbacks

---

## Build

**Status**: ✅ **Success**

```bash
✓ built in 6.04s
dist/assets/index-DWctP-8H.js  223.25 kB │ gzip: 75.94 kB
```

**Avisos**: Dynamic import warnings (esperado, não são erros)

- useSpectralVisualEffect dinâmico + estático
- useParticlesEffect dinâmico + estático

---

## Data

**Implementado**: 2024-01-XX  
**Autor**: Visual Effects Team  
**Versão**: 1.0.0
