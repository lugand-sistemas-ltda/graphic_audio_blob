# Reorganização e Debugging: Visual Effects Manager

**Data**: 2024-01-XX  
**Objetivo**: Remover arquivos legados + adicionar logging para diagnosticar dependência particles-gradient

---

## Problema Identificado

### VisualControls.vue (LEGADO)

**Localização**: `src/features/visual-effects/components/VisualControls.vue`

**Issue**:

- Nome genérico mas funcionalidade específica (apenas Orb)
- Substituído por controles normalizados (`EffectSizeControl` + `EffectReactivityControl`)
- Ainda exportado no `index.ts` mas não usado em nenhum componente
- Mantinha responsabilidades que agora pertencem ao **Manager**

**Status**: ❌ **REMOVIDO**

---

## Ações Realizadas

### 1. Remoção de Arquivo Legado

```bash
rm src/features/visual-effects/components/VisualControls.vue
```

**Justificativa**:

- Não usado por nenhum componente (apenas exportado)
- Funcionalidade absorvida pelos controles normalizados compartilhados
- Mantinha valores não normalizados (100-500px, 0-200%)
- Duplicação de responsabilidades

### 2. Atualização do Index

**Arquivo**: `src/features/visual-effects/index.ts`

**Antes**:

```typescript
export { default as VisualControls } from "./components/VisualControls.vue";
```

**Depois**:

```typescript
// Shared Controls (normalized 0-1 parameters)
export { default as EffectSizeControl } from "./components/shared/EffectSizeControl.vue";
export { default as EffectReactivityControl } from "./components/shared/EffectReactivityControl.vue";
```

**Resultado**: Exports agora refletem arquitetura atual

---

## Logging Detalhado para Debugging

### Objetivo

Identificar **por que particles só funciona quando gradient está ativo**, apesar de:

- ✅ Código estruturalmente independente
- ✅ Cada efeito tem seu próprio canvas (z-index -1)
- ✅ Cada efeito tem loop de animação RAF independente
- ✅ Manager gerencia lifecycle de forma isolada

### Hipóteses

1. **Timing de Inicialização**: Manager pode estar inicializando em ordem específica
2. **AudioDataProvider**: Callbacks podem ter dependência de timing
3. **Canvas/DOM**: Conflito de z-index ou posicionamento
4. **Shared State**: Alguma mutação compartilhada não identificada

---

## Implementação de Logging

### 1. Visual Effects Manager (useVisualEffectsManager.ts)

#### Watch Centralizado

```typescript
watch(
  () => state.windows[windowId]?.effects || [],
  (newEffects, oldEffects = []) => {
    console.log("[VisualEffectsManager] 🔄 Watch triggered!");
    console.log("[VisualEffectsManager] 📊 Comparação de efeitos:", {
      oldEffects,
      newEffects,
      windowId,
    });

    const addedEffects = newEffects.filter((e) => !oldEffects.includes(e));
    if (addedEffects.length > 0) {
      console.log(
        `[VisualEffectsManager] ➕ Efeitos adicionados:`,
        addedEffects
      );
      addedEffects.forEach((effect) => initEffect(effect));
    }

    const removedEffects = oldEffects.filter((e) => !newEffects.includes(e));
    if (removedEffects.length > 0) {
      console.log(
        `[VisualEffectsManager] ➖ Efeitos removidos:`,
        removedEffects
      );
      removedEffects.forEach((effect) => stopEffect(effect));
    }

    if (addedEffects.length === 0 && removedEffects.length === 0) {
      console.log("[VisualEffectsManager] 🔵 Nenhuma mudança detectada");
    }
  },
  { immediate: true }
);
```

**Informações Capturadas**:

- Trigger do watch
- Arrays de efeitos (antigo vs novo)
- WindowId atual
- Efeitos adicionados/removidos
- Casos sem mudança

#### initEffect()

```typescript
const initEffect = (effectType: VisualEffect) => {
  console.log(`[VisualEffectsManager] 🎬 Iniciando efeito: ${effectType}`);
  console.log(`[VisualEffectsManager] 📊 Estado atual dos efeitos:`, {
    gradient: effects.get("gradient")?.isActive,
    particles: effects.get("particles")?.isActive,
    waveform: effects.get("waveform")?.isActive,
  });

  // ... switch logic

  console.log(`[VisualEffectsManager] ✅ Efeito ${effectType} inicializado`);
};
```

**Informações Capturadas**:

- Qual efeito está sendo inicializado
- Estado de todos os efeitos ANTES da inicialização
- Confirmação de inicialização completa

#### stopEffect()

```typescript
const stopEffect = (effectType: VisualEffect) => {
  console.log(`[VisualEffectsManager] 🛑 Parando efeito: ${effectType}`);

  const effect = effects.get(effectType);
  if (effect && effect.instance) {
    effect.instance.stopEffect();
    effect.instance = null;
    effect.isActive = false;
    console.log(
      `[VisualEffectsManager] ✅ Efeito ${effectType} parado e removido`
    );
  } else {
    console.warn(
      `[VisualEffectsManager] ⚠️ Tentativa de parar efeito ${effectType} que não existe`
    );
  }

  console.log(`[VisualEffectsManager] 📊 Estado após parar:`, {
    gradient: effects.get("gradient")?.isActive,
    particles: effects.get("particles")?.isActive,
    waveform: effects.get("waveform")?.isActive,
  });
};
```

**Informações Capturadas**:

- Qual efeito está sendo parado
- Se a instância existe
- Estado de todos os efeitos APÓS parar

---

### 2. Particles Effect (useParticlesEffect.ts)

#### startEffect()

```typescript
const startEffect = () => {
  if (isEffectActive) {
    console.warn(
      "[ParticlesEffect] ⚠️ Tentativa de iniciar efeito já ativo - ignorando"
    );
    return;
  }

  console.log("[ParticlesEffect] 🎬 Iniciando efeito de partículas...");
  console.log("[ParticlesEffect] 📊 Configuração:", {
    particleCount,
    baseSize,
    reactivity,
    enableMouseControl,
    audioDataProvider: !!audioDataProvider,
  });

  isEffectActive = true;

  // ... setup logic

  console.log(
    "[ParticlesEffect] ✅ Efeito iniciado, começando loop de animação..."
  );
  animate();
};
```

**Informações Capturadas**:

- Tentativas de dupla inicialização
- Configuração completa (count, size, reactivity, mouse, audio)
- Confirmação de início do loop RAF

#### stopEffect()

```typescript
const stopEffect = () => {
  if (!isEffectActive) {
    console.warn(
      "[ParticlesEffect] ⚠️ Tentativa de parar efeito já inativo - ignorando"
    );
    return;
  }

  console.log("[ParticlesEffect] 🛑 Parando efeito de partículas...");
  isEffectActive = false;

  // ... cleanup logic

  console.log("[ParticlesEffect] ✅ Efeito parado completamente");
};
```

**Informações Capturadas**:

- Tentativas de parar efeito já inativo
- Confirmação de cleanup completo

---

## Fluxo de Debugging Esperado

### Cenário 1: Iniciar apenas Particles (SEM gradient)

**Console esperado**:

```
[VisualEffectsManager] 🔄 Watch triggered!
[VisualEffectsManager] 📊 Comparação de efeitos: { oldEffects: [], newEffects: ['particles'], windowId: 'main-xxx' }
[VisualEffectsManager] ➕ Efeitos adicionados: ['particles']
[VisualEffectsManager] 🎬 Iniciando efeito: particles
[VisualEffectsManager] 📊 Estado atual: { gradient: false, particles: false, waveform: false }
[ParticlesEffect] 🎬 Iniciando efeito de partículas...
[ParticlesEffect] 📊 Configuração: { particleCount: 150, baseSize: 300, ... }
[ParticlesEffect] ✅ Efeito iniciado, começando loop de animação...
[VisualEffectsManager] ✅ Efeito particles inicializado
```

**Se funcionar**: ✅ Problema resolvido!  
**Se NÃO funcionar**: Investigar logs para identificar:

- audioDataProvider está disponível?
- Canvas foi criado corretamente?
- Loop RAF está sendo chamado?

### Cenário 2: Iniciar Gradient, depois Particles

**Console esperado**:

```
// First: gradient
[VisualEffectsManager] ➕ Efeitos adicionados: ['gradient']
[VisualEffectsManager] 🎬 Iniciando efeito: gradient
[VisualEffectsManager] 📊 Estado atual: { gradient: false, particles: false, waveform: false }
[VisualEffectsManager] ✅ Efeito gradient inicializado

// Then: particles
[VisualEffectsManager] ➕ Efeitos adicionados: ['particles']
[VisualEffectsManager] 🎬 Iniciando efeito: particles
[VisualEffectsManager] 📊 Estado atual: { gradient: TRUE, particles: false, waveform: false }
[ParticlesEffect] 🎬 Iniciando efeito de partículas...
[ParticlesEffect] ✅ Efeito iniciado, começando loop de animação...
```

**Análise**: Se funcionar neste cenário mas não no Cenário 1:

- Gradient está alterando algo no DOM/state que particles precisa
- AudioDataProvider pode estar sendo inicializado apenas quando gradient inicia
- Timing de callbacks do áudio pode estar vinculado ao gradient

---

## Próximos Passos

### 1. Testar com Logging

```bash
npm run dev
```

### 2. Cenários de Teste

#### A. Apenas Particles

1. Abrir app
2. Ativar **APENAS** Particles Effect
3. Observar logs no console
4. Verificar se partículas aparecem e reagem ao áudio

#### B. Gradient → Particles

1. Abrir app
2. Ativar Gradient Effect
3. Ativar Particles Effect
4. Observar diferença nos logs

#### C. Particles → Gradient

1. Abrir app
2. Ativar Particles Effect
3. Ativar Gradient Effect
4. Verificar se particles já funcionava antes

### 3. Análise de Resultados

Comparar logs entre cenários para identificar:

- Diferenças no `audioDataProvider`
- Timing de inicialização
- Estado do canvas
- Callbacks de áudio

### 4. Correção

Baseado nos logs, aplicar fix específico:

- Se audioDataProvider: Garantir disponibilidade independente
- Se timing: Adicionar delay ou promise
- Se canvas: Verificar z-index e posicionamento
- Se state: Isolar completamente

---

## Build Status

**Status**: ✅ **Success** (11.26s)

```
dist/assets/index-Bqldacl1.js  224.70 kB │ gzip: 76.36 kB
```

**Mudanças**:

- VisualControls.vue removido (-138 linhas legadas)
- Logging detalhado adicionado (+60 linhas debug)
- Index.ts atualizado (exports corretos)

---

## Arquivos Modificados

### Removidos

- `src/features/visual-effects/components/VisualControls.vue`

### Atualizados

- `src/features/visual-effects/index.ts` (exports)
- `src/features/visual-effects/composables/useVisualEffectsManager.ts` (logging)
- `src/features/visual-effects/composables/useParticlesEffect.ts` (logging)

---

## Conclusão

✅ **Código reorganizado** - Removido legado  
✅ **Exports atualizados** - Refletem arquitetura atual  
✅ **Logging implementado** - Pronto para debugging  
🔍 **Próximo**: Testar com logs para identificar causa raiz da dependência

**Objetivo**: Garantir que **particles funcione completamente independente** do gradient.
