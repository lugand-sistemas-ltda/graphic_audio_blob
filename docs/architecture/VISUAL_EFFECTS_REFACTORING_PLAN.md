# 🎯 Plano de Refatoração: Visual Effects Feature

**Data:** 28 de Dezembro de 2025  
**Objetivo:** Separar responsabilidades e garantir isolamento completo entre efeitos visuais

---

## 📋 Problema Identificado

### Estrutura Atual (Monolítica)
```
src/features/visual-effects/
├── components/              # ❌ Mistura todos os controles
│   ├── OrbEffectControl.vue
│   ├── ParticlesEffectControl.vue
│   └── shared/
├── composables/             # ❌ Mistura lógica de todos os efeitos
│   ├── useSpectralVisualEffect.ts
│   ├── useParticlesEffect.ts
│   ├── useEffectHelpers.ts (compartilhado)
│   └── useVisualEffectsManager.ts
├── types/
└── index.ts
```

### Problemas:
1. **Dependências cruzadas** entre efeitos (ex: mouseFollow do Particles depende do Orb)
2. **Difícil manutenção** - mudanças em um efeito podem quebrar outro
3. **Falta de isolamento** - helpers compartilhados criam acoplamento
4. **Difícil testar** isoladamente cada efeito

---

## 🎯 Estrutura Proposta (Modular)

```
src/features/visual-effects/
│
├── core/                           # 🎯 NÚCLEO GLOBAL
│   ├── components/
│   │   └── VisualEffectsContainer.vue  # Container master
│   ├── composables/
│   │   ├── useVisualEffectsManager.ts  # Manager central
│   │   └── useGlobalMousePosition.ts   # Mouse position singleton
│   └── types/
│       └── base-effect.types.ts        # Interfaces base
│
├── effects/                        # 🎯 EFEITOS ISOLADOS
│   │
│   ├── spectral-orb/               # Efeito 1: Orb/Gradient
│   │   ├── components/
│   │   │   └── OrbEffectControl.vue
│   │   ├── composables/
│   │   │   └── useSpectralVisualEffect.ts
│   │   ├── types/
│   │   │   └── spectral-effect.types.ts
│   │   └── index.ts                # API pública do efeito
│   │
│   ├── particles/                  # Efeito 2: Particles
│   │   ├── components/
│   │   │   └── ParticlesEffectControl.vue
│   │   ├── composables/
│   │   │   └── useParticlesEffect.ts
│   │   ├── types/
│   │   │   └── particles-effect.types.ts
│   │   └── index.ts                # API pública do efeito
│   │
│   └── waveform/                   # Efeito 3: Waveform (futuro)
│       ├── components/
│       ├── composables/
│       ├── types/
│       └── index.ts
│
├── shared/                         # 🎯 SHARED UI COMPONENTS
│   ├── components/
│   │   ├── EffectSizeControl.vue
│   │   ├── EffectReactivityControl.vue
│   │   └── EffectBehaviorControls.vue
│   ├── composables/
│   │   ├── useEffectTheme.ts       # Theme helper
│   │   └── useEffectLifecycle.ts   # Lifecycle helper
│   └── types/
│       └── shared-controls.types.ts
│
├── types/                          # 🎯 TIPOS GLOBAIS
│   ├── index.ts
│   └── visual-effects.types.ts
│
└── index.ts                        # 🎯 API PÚBLICA DA FEATURE
```

---

## 🔄 Princípios Arquiteturais

### 1. **Isolamento Completo**
Cada efeito é uma **feature independente**:
- ✅ Pode ser desenvolvido sem afetar outros
- ✅ Pode ser testado isoladamente
- ✅ Pode ser removido sem quebrar o sistema
- ✅ Expõe apenas interface pública via `index.ts`

### 2. **Manager como Orquestrador**
O manager **NÃO** contém lógica de efeitos:
- ✅ Apenas inicializa/para efeitos
- ✅ Fornece dados compartilhados (áudio, mouse position)
- ✅ Coordena ciclo de vida
- ❌ NÃO conhece implementação interna dos efeitos

### 3. **Dados Compartilhados Explícitos**
```typescript
// Manager fornece
interface SharedEffectData {
    audioDataProvider: () => AudioFrequencyData
    mousePositionProvider: ReturnType<typeof useGlobalMousePosition>
    themeProvider: ReturnType<typeof useEffectTheme>
}

// Efeito recebe
interface EffectOptions extends SharedEffectData {
    // Opções específicas do efeito
}
```

### 4. **Controles Isolados**
```typescript
// ❌ ANTES: Controles compartilhados
let sharedMouseFollowEnabled = true  // Afeta TODOS os efeitos

// ✅ DEPOIS: Controles locais
// spectral-orb/composables/useSpectralVisualEffect.ts
let orbMouseFollow = true

// particles/composables/useParticlesEffect.ts  
let particlesMouseFollow = true
```

---

## 📦 Migração por Etapas

### **Fase 1: Preparação (SEM QUEBRAR)**
1. ✅ Criar estrutura de pastas
2. ✅ Mover arquivos mantendo imports
3. ✅ Atualizar paths nos imports
4. ✅ Testar que tudo funciona

### **Fase 2: Isolamento de State**
1. ✅ Separar `mouseFollow/autoCenter` por efeito
2. ✅ Manager fornece apenas `mousePositionProvider`
3. ✅ Cada efeito calcula seu próprio `mouse3DOffset`
4. ✅ Testar controles independentes

### **Fase 3: APIs Públicas**
1. ✅ Criar `index.ts` em cada efeito
2. ✅ Expor apenas interface pública
3. ✅ Manager importa via API pública
4. ✅ Remover exports desnecessários

### **Fase 4: Shared Components**
1. ✅ Extrair componentes reutilizáveis
2. ✅ Criar composables compartilhados
3. ✅ Garantir zero acoplamento entre efeitos
4. ✅ Documentar uso dos shared components

---

## 🎯 Exemplo: API Pública de Efeito

### `effects/spectral-orb/index.ts`
```typescript
/**
 * Spectral Orb Effect - Public API
 * Efeito de gradiente radial reativo ao áudio
 */

import type { BaseEffectOptions, BaseVisualEffect } from '../../core/types'

export interface SpectralOrbOptions extends BaseEffectOptions {
    layerCount?: number
    size?: number
    reactivity?: number
}

export interface SpectralOrbEffect extends BaseVisualEffect {
    setSize(size: number): void
    setReactivity(reactivity: number): void
    setMouseFollow(enabled: boolean): void
    setAutoCenter(enabled: boolean): void
    getSize(): number
    getReactivity(): number
    getMouseFollow(): boolean
    getAutoCenter(): boolean
}

// Re-export apenas o que é público
export { useSpectralVisualEffect } from './composables/useSpectralVisualEffect'
export { default as OrbEffectControl } from './components/OrbEffectControl.vue'

// Tipos específicos
export type { SpectralLayer } from './types/spectral-effect.types'
```

### Manager usa API pública
```typescript
// core/composables/useVisualEffectsManager.ts
import { useSpectralVisualEffect } from '../../effects/spectral-orb'
import { useParticlesEffect } from '../../effects/particles'

// Manager NÃO conhece implementação interna
const initGradient = () => {
    const effect = useSpectralVisualEffect({
        audioDataProvider,
        mousePositionProvider: managerMousePos,
        layerCount: 8
    })
    // ...
}
```

---

## ✅ Benefícios da Refatoração

### Para Desenvolvimento
- 🎯 **Isolamento**: Trabalhar em um efeito sem afetar outros
- 🎯 **Testabilidade**: Testar cada efeito independentemente
- 🎯 **Clareza**: Código organizado por responsabilidade
- 🎯 **Escalabilidade**: Adicionar novos efeitos facilmente

### Para Manutenção
- 🎯 **Debugging**: Problemas isolados em seu módulo
- 🎯 **Refactoring**: Mudar implementação sem quebrar interface
- 🎯 **Remoção**: Deletar efeito sem impacto no sistema
- 🎯 **Documentação**: Cada efeito auto-documentado

### Para Performance
- 🎯 **Tree-shaking**: Carregar apenas efeitos usados
- 🎯 **Lazy loading**: Importar efeitos sob demanda
- 🎯 **Code splitting**: Chunks separados por efeito

---

## 🚀 Próximos Passos

### Imediato (Bug Fix Crítico)
- [x] **Fix: Controles isolados** - mouseFollow/autoCenter locais
- [x] **Test: Cada efeito responde apenas seus controles**

### Curto Prazo (Semana 1)
- [ ] **Criar estrutura de pastas**
- [ ] **Mover spectral-orb para effects/spectral-orb/**
- [ ] **Mover particles para effects/particles/**
- [ ] **Criar APIs públicas (index.ts)**

### Médio Prazo (Semana 2)
- [ ] **Extrair shared components**
- [ ] **Criar useGlobalMousePosition separado do useMousePosition local**
- [ ] **Documentar cada efeito**

### Longo Prazo (Semana 3+)
- [ ] **Implementar waveform effect seguindo novo padrão**
- [ ] **Criar testes unitários por efeito**
- [ ] **Performance profiling individual**

---

## 📚 Referências

- **Feature-Sliced Design**: https://feature-sliced.design/
- **Atomic Design**: https://bradfrost.com/blog/post/atomic-web-design/
- **Vue 3 Composables Best Practices**: https://vuejs.org/guide/reusability/composables.html
