# 🎵 Multi-Window Testing Guide

## ✅ Implementação Completa - Fase 3

### 📋 O que foi implementado:

#### 1. **Window Type Detection** (`useWindowType.ts`)

- Detecta automaticamente se é janela main, visual ou generic
- Fornece configuração de renderização para cada tipo
- Define quais componentes mostrar (header, sidebar, player, etc)

#### 2. **Layout Unificado** (`MainLayout.vue`)

- Todas as rotas agora usam o mesmo layout
- Renderização condicional baseada no tipo de janela
- Indicador de status de conexão para janelas filhas
- Monitoramento de heartbeat (conexão com main)

#### 3. **Audio Broadcasting System**

- **Main Window**: Analisa FFT e transmite dados a 60 FPS
- **Child Windows**: Recebem dados via BroadcastChannel
- Cache de dados para garantir smooth playback
- Throttle de 16ms (~60 FPS) para otimizar performance

#### 4. **Player Synchronization** (`usePlayerSync.ts`)

- Sincroniza play/pause entre todas as janelas
- Sincroniza seek (mudança de posição)
- Sincroniza volume
- Sincroniza mudanças de track (next/previous)

#### 5. **Playlist Synchronization** (`usePlaylist.ts`)

- Broadcasts TRACK_CHANGE ao trocar música
- Todas as janelas atualizam simultaneamente
- Mantém estado consistente entre janelas

#### 6. **Component Management Multi-Window**

- Cada janela tem lista independente de componentes
- `windowId` único para cada janela
- Persistência isolada no localStorage por janela
- Chave: `spectral-visualizer-global-state-window-{windowId}`

#### 7. **App Initialization** (`App.vue`)

- Detecta tipo de janela (main vs child)
- Registra janela com role correto ('main' ou 'secondary')
- **ONLY MAIN**: Carrega áudio físico (`<audio>` element)
- **ALL WINDOWS**: Recebem análise de áudio via broadcast

---

## 🧪 Como Testar

### 1️⃣ **Abrir Janela Main**

```
URL: http://localhost:5173/
```

- Deve mostrar header, sidebar e player
- Player deve estar funcional
- Componentes podem ser adicionados via [COMPONENTS]

### 2️⃣ **Abrir Janela Visual (Child)**

```
URL: http://localhost:5173/#/visual
```

- Deve mostrar apenas componentes visuais
- Não tem header/sidebar/player
- Tem titlebar e botão de configuração
- Deve sincronizar com áudio da main

### 3️⃣ **Abrir Janela Generic (Child)**

```
URL: http://localhost:5173/#/window
```

- Layout genérico configurável
- Não tem header/sidebar/player
- Tem titlebar e botão de configuração
- Deve sincronizar com áudio da main

### 4️⃣ **Testar Sincronização**

#### Audio Data:

1. Abra main + visual
2. Play música na main
3. Visual deve reagir ao áudio em tempo real
4. Verifique status de conexão no canto superior direito

#### Player Controls:

1. Abra main + visual
2. Play/pause na main
3. Visual deve atualizar estado
4. Mude volume na main
5. Todas as janelas devem refletir

#### Playlist:

1. Abra main + visual
2. Clique "Next" na main
3. Todas as janelas devem trocar de música simultaneamente

---

## 🔍 Debug Tools

### Console Messages:

```javascript
// Enable logging no useGlobalState
useGlobalState({ enableLogging: true });

// Enable logging no windowManager
useWindowManager({ enableLogging: true });
```

### LocalStorage Inspection:

```javascript
// Ver todas as chaves salvas
Object.keys(localStorage)
  .filter((k) => k.includes("spectral-visualizer"))
  .forEach((k) => console.log(k, localStorage.getItem(k)));
```

### BroadcastChannel Monitoring:

```javascript
// Escutar todos os broadcasts (cole no console)
const channel = new BroadcastChannel("spectral-visualizer-sync");
channel.onmessage = (e) => console.log("[BROADCAST]", e.data);
```

---

## 📊 Arquitetura de Dados

### Main Window (http://localhost:5173/)

```typescript
{
  windowId: 'main-{timestamp}',
  role: 'main',
  hasAudio: true, // <audio> element exists
  components: [], // lista própria
  broadcasts: [
    'AUDIO_DATA',     // 60 FPS
    'TRACK_CHANGE',   // on track change
    'PLAYBACK_STATE', // on play/pause
    'VOLUME_CHANGE'   // on volume change
  ]
}
```

### Child Window (/#/visual ou /#/window)

```typescript
{
  windowId: 'secondary-{timestamp}',
  role: 'secondary',
  hasAudio: false, // no physical audio
  components: [], // lista própria (independente)
  receives: [
    'AUDIO_DATA',     // from main
    'TRACK_CHANGE',   // from main
    'PLAYBACK_STATE', // from main
    'VOLUME_CHANGE'   // from main
  ]
}
```

---

## ✨ Features Implementadas

✅ **Phase 1**: Component synchronization (windowId management)  
✅ **Phase 2**: Hide/Show behavior fixes  
✅ **Phase 3**: Show/Hide All for active components  
✅ **Phase 4.1**: Layout unification (MainLayout universal)  
✅ **Phase 4.2**: Audio broadcast system (60 FPS)  
✅ **Phase 4.3**: Playlist synchronization  
✅ **Phase 4.4**: Player controls sync  
✅ **Phase 4.5**: Window-specific localStorage persistence  
✅ **Phase 4.6**: Window type detection and conditional rendering

---

## 🐛 Possíveis Issues

### Child window não recebe áudio:

- Verifique se main window está tocando
- Abra console e veja se há broadcasts
- Verifique indicador de conexão (verde = ok, vermelho = desconectado)

### Componentes desaparecendo:

- Cada janela tem lista própria no localStorage
- Chave: `spectral-visualizer-global-state-window-{windowId}`
- Se limpar localStorage, componentes resetam

### Performance:

- Audio broadcast é throttled a 60 FPS (16ms)
- Se lento, reduza `layerCount` em `useSpectralVisualEffect`
- Desative efeitos pesados em janelas filhas

---

## 🎯 Próximos Passos Sugeridos

1. **Heartbeat System**: Main envia heartbeat, child detecta desconexão
2. **Reconnection Logic**: Child tenta reconectar se main cair
3. **Visual Feedback**: Melhorar indicadores de sincronização
4. **Component Drag**: Arrastar componentes entre janelas
5. **Effects Sync**: Sincronizar efeitos visuais entre janelas

---

## 📝 Notas Técnicas

- **BroadcastChannel**: API nativa do browser, sem overhead
- **Throttle**: 60 FPS = 16.67ms, usando 16ms para segurança
- **Cache**: Última análise guardada caso broadcast atrase
- **WindowId**: Timestamp garante unicidade entre janelas
- **Role**: 'main' = tem áudio físico, 'secondary' = recebe broadcasts
