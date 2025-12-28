# Debug Terminal - Refatoração para Monitor Global

**Data**: 2024-06-13  
**Tipo**: Refatoração Arquitetural  
**Impacto**: Alto - Quebra total de acoplamento com componentes específicos

---

## 🎯 Objetivo

Transformar o **System Monitor** (DebugTerminal) de um componente acoplado a efeitos visuais específicos em um **monitor de estado global verdadeiramente independente**.

### Problema Original

```typescript
// ❌ ANTES: Dependente de dados do Orb Effect
interface Props {
  spherePosition: { x: number; y: number }  // Do orb
  sphereSize: number                        // Do orb
  sphereReactivity: number                  // Do orb
  layerCount: number                        // Do sistema de layers
  isPlaying: boolean                        // Global
  currentTime: number                       // Global
  duration: number                          // Global
  volume: number                            // Global
  beatDetected: boolean                     // Global
}

// Parent precisava injetar dados de componentes específicos
<DebugTerminal
  :sphere-position="spherePosition"
  :sphere-size="sphereSize"
  :sphere-reactivity="sphereReactivity"
  :layer-count="8"
  :is-playing="isPlaying"
  ...
/>
```

**Consequências**:

- Monitor não funcionava sem Orb Effect ativo
- Violação de separação de responsabilidades
- Acoplamento tight entre monitoring e visual effects
- Parent (HomeView) precisava conhecer estrutura interna do Orb

---

## ✅ Solução Implementada

### Nova Arquitetura

```typescript
// ✅ AGORA: Auto-contido, sem props
<script setup lang="ts">
import { useGlobalAudio, useGlobalTheme } from '../../../core/global'

const globalAudio = useGlobalAudio()
const globalTheme = useGlobalTheme()
const windowId = inject<string>('windowId', 'unknown')

// Local refs sincronizados via watch
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0)
const beatDetected = ref(false)
const currentTheme = ref('')

// Sync automático do estado global
watch(() => globalAudio.state.value, syncFromGlobal, { deep: true })
watch(() => globalTheme.state.value, syncFromGlobal, { deep: true })
</script>

<!-- Parent usa componente sem props -->
<DebugTerminal v-if="showDebugTerminal" />
```

### Nova Interface de Monitoramento

**Template com 3 seções organizadas**:

```vue
<template>
  <div class="terminal-content">
    <!-- ÁUDIO GLOBAL -->
    <div class="terminal-section">
      <div class="section-label">[ AUDIO ]</div>
      <div class="terminal-line">
        <span class="var-name">playing:</span>
        <span class="var-value">{{ isPlaying ? "TRUE" : "FALSE" }}</span>
      </div>
      <div class="terminal-line">
        <span class="var-name">time:</span>
        <span class="var-value"
          >{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span
        >
      </div>
      <div class="terminal-line">
        <span class="var-name">volume:</span>
        <span class="var-value">{{ Math.round(volume * 100) }}%</span>
      </div>
      <div class="terminal-line">
        <span class="var-name">beat.detected:</span>
        <span class="var-value beat-indicator">{{
          beatDetected ? "■" : "□"
        }}</span>
      </div>
    </div>

    <!-- TEMA GLOBAL -->
    <div class="terminal-section">
      <div class="section-label">[ THEME ]</div>
      <div class="terminal-line">
        <span class="var-name">current:</span>
        <span class="var-value">{{ currentTheme || "matrix-green" }}</span>
      </div>
    </div>

    <!-- SISTEMA -->
    <div class="terminal-section">
      <div class="section-label">[ SYSTEM ]</div>
      <div class="terminal-line">
        <span class="var-name">fps:</span>
        <span class="var-value">{{ fps }}</span>
      </div>
      <div class="terminal-line">
        <span class="var-name">window.id:</span>
        <span class="var-value">{{ windowId }}</span>
      </div>
    </div>
  </div>
</template>
```

---

## 📋 Mudanças Detalhadas

### DebugTerminal.vue

**Removido**:

- ❌ Interface `Props` completa
- ❌ `defineProps<Props>()`
- ❌ Computed `position` (calculava de spherePosition)
- ❌ Todas as variáveis do template: `sphere.position.x/y`, `sphere.size`, `sphere.reactivity`, `layers.active`

**Adicionado**:

- ✅ `useGlobalAudio()` - Acesso direto ao gerenciador global de áudio
- ✅ `useGlobalTheme()` - Acesso direto ao gerenciador global de tema
- ✅ `inject('windowId')` - ID da janela do sistema de multi-window
- ✅ `syncFromGlobal()` - Função que sincroniza refs locais com estado global
- ✅ `watch` em `globalAudio.state` e `globalTheme.state`
- ✅ Seções organizadas no template: [AUDIO], [THEME], [SYSTEM]

### HomeView.vue

**Antes**:

```vue
<DebugTerminal
  v-if="showDebugTerminal"
  :sphere-position="{ x: 50, y: 50 }"
  :sphere-size="250"
  :sphere-reactivity="100"
  :is-playing="isPlaying"
  :current-time="currentTime"
  :duration="duration"
  :volume="currentVolume"
  :beat-detected="beatDetected"
  :layer-count="8"
/>

// Variáveis computadas necessárias const beatDetected = computed(() =>
globalAudio.state.value.frequencyData.beat) const currentVolume = computed(() =>
globalAudio.state.value.volume)
```

**Depois**:

```vue
<!-- Debug Terminal - Monitor de estado global (sem props) -->
<DebugTerminal v-if="showDebugTerminal" />
```

**Variáveis removidas**:

- ❌ `beatDetected` - Não mais necessária
- ❌ `currentVolume` - Não mais necessária
- ❌ `isPlaying`, `currentTime`, `duration` - Passados como props antes, agora acessados internamente

---

## 🎨 Dados Monitorados

### Antes (Mistura de Global + Componentes)

| Variável                            | Fonte        | Tipo          |
| ----------------------------------- | ------------ | ------------- |
| `sphere.position.x/y`               | Orb Effect   | ❌ Componente |
| `sphere.size`                       | Orb Effect   | ❌ Componente |
| `sphere.reactivity`                 | Orb Effect   | ❌ Componente |
| `layers.active`                     | Layer System | ❌ Componente |
| `playing`, `time`, `volume`, `beat` | GlobalAudio  | ✅ Global     |
| `fps`                               | Local        | ✅ Sistema    |

### Agora (Apenas Global)

| Variável        | Fonte          | Descrição             |
| --------------- | -------------- | --------------------- |
| `playing`       | GlobalAudio    | Estado de reprodução  |
| `time`          | GlobalAudio    | Tempo atual / duração |
| `volume`        | GlobalAudio    | Volume 0-100%         |
| `beat.detected` | GlobalAudio    | Detecção de batida    |
| `current`       | GlobalTheme    | Tema ativo            |
| `fps`           | Computed Local | Frames por segundo    |
| `window.id`     | Inject         | ID da janela          |

---

## 🏗️ Princípios Arquiteturais

### 1. Separação de Responsabilidades

```
Monitor NÃO deve saber sobre:
❌ Estrutura interna de componentes (orb, particles, etc)
❌ Como efeitos visuais funcionam
❌ Quantos layers existem

Monitor DEVE saber sobre:
✅ Estado global da aplicação (audio, theme)
✅ Métricas de sistema (fps, window)
✅ Broadcast Channel events
```

### 2. Acoplamento Frouxo

```typescript
// ❌ ERRADO: Tight coupling
const orb = inject("orbEffect");
const position = orb.sphere.position;

// ✅ CORRETO: Loose coupling via global managers
const globalAudio = useGlobalAudio();
const isPlaying = globalAudio.state.value.isPlaying;
```

### 3. Single Responsibility

```
DebugTerminal tem UMA responsabilidade:
"Exibir estado global da aplicação para debugging"

NÃO é responsabilidade do DebugTerminal:
- Conhecer estrutura de efeitos visuais
- Controlar componentes
- Modificar estado
```

---

## 🧪 Testes de Validação

### ✅ Cenários Testados

1. **Independência de Efeitos**

   - Desabilitar Orb Effect
   - System Monitor continua funcionando
   - Mostra dados de áudio/tema normalmente

2. **Broadcast Sync**

   - Abrir múltiplas janelas
   - Cada uma tem seu próprio monitor
   - Todos sincronizados via GlobalAudio/GlobalTheme

3. **Lifecycle**

   - Montar componente → watch inicia, FPS calculado
   - Desmontar componente → intervals limpos, watches desfeitos

4. **Props Cleanup**
   - HomeView não passa props
   - Nenhuma variável intermediária necessária
   - Código mais limpo e simples

---

## 📊 Métricas de Impacto

| Métrica                | Antes              | Depois                        | Melhoria         |
| ---------------------- | ------------------ | ----------------------------- | ---------------- |
| Props do DebugTerminal | 9                  | 0                             | -100%            |
| Linhas de código       | 309                | ~240                          | -22%             |
| Dependências diretas   | 2 (Props + Inject) | 2 (GlobalAudio + GlobalTheme) | Melhor qualidade |
| Acoplamento com Orb    | Alto               | Zero                          | ✅ Desacoplado   |
| Reusabilidade          | Baixa              | Alta                          | ✅ Independente  |

---

## 🔄 Migração para Outros Componentes

**Pattern estabelecido para debug/monitoring tools**:

```typescript
// ✅ PADRÃO CORRETO para ferramentas de monitoramento
<script setup lang="ts">
import { useGlobalAudio, useGlobalTheme } from '@/core/global'

const globalAudio = useGlobalAudio()
const globalTheme = useGlobalTheme()
const windowId = inject<string>('windowId')

// Apenas acessa estado global - nunca props de componentes
</script>
```

**Componentes que PODEM seguir este pattern**:

- System Performance Monitor
- Audio Analyzer Overlay
- Theme Preview
- Connection Status

**Componentes que NÃO devem** (precisam de estado local):

- Visual Effects (Orb, Particles) - têm estado próprio
- Audio Controls - manipulam estado
- Theme Selector - lista temas disponíveis

---

## 🎓 Lições Aprendidas

### ❌ Anti-Pattern Identificado

```vue
<!-- Passar dados de componentes específicos para ferramentas globais -->
<DebugTool :component-data="componentInternalState" />
```

### ✅ Pattern Correto

```vue
<!-- Ferramenta acessa apenas gerenciadores globais -->
<DebugTool />

<!-- Dentro do componente -->
<script setup>
const globalManager = useGlobalManager();
const data = computed(() => globalManager.state.value);
</script>
```

### Regra de Ouro

> **"Se um componente de debug/monitoring precisa de props de outro componente específico, a arquitetura está errada. Deve acessar apenas gerenciadores globais."**

---

## 📝 Próximos Passos

### Melhorias Futuras

1. **Expandir monitoramento global**

   - Adicionar `mouse.position` do GlobalState
   - Adicionar `broadcast.status` do BroadcastSync
   - Adicionar `windows.count` do WindowManager

2. **Criar categoria de dados**

   ```vue
   [ AUDIO ] - GlobalAudio [ THEME ] - GlobalTheme [ MOUSE ] - GlobalState
   (mouse position) [ SYNC ] - BroadcastSync (channel status) [ SYSTEM ] - FPS,
   windowId, memory usage
   ```

3. **Adicionar toggles de seção**
   - Permitir colapsar/expandir cada categoria
   - Salvar preferências no localStorage

---

## ✅ Conclusão

**System Monitor agora é**:

- ✅ Completamente independente de efeitos visuais
- ✅ Auto-contido (sem props)
- ✅ Reutilizável em qualquer contexto
- ✅ Focado apenas em estado global
- ✅ Segue Single Responsibility Principle
- ✅ Estabelece pattern para outros monitores

**Impacto na arquitetura**:

- Quebrou acoplamento tight entre monitoring e visual effects
- Estabeleceu boundary claro: global managers vs component state
- Criou precedente para todas as ferramentas de debug futuras

**Status**: ✅ Refatoração completa e testada
