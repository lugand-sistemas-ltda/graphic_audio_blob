/**
 * Core Sync Module - Multi-Window Synchronization
 * 
 * Exporta todos os componentes do sistema de sincronização multi-window
 */

// Types
export type {
    SyncMessageType,
    WindowRole,
    SyncMessage,
    AudioSyncData,
    AudioControlData,
    PlaybackStateData,
    SphereConfigData,
    ThemeChangeData,
    ComponentStateData,
    WindowInfo,
    MessageHandler,
    SyncConfig
} from './types'

// Broadcast Sync (low-level)
export {
    useBroadcastSync,
    broadcast,
    onMessage,
    offMessage,
    setWindowRole,
    getConnectedWindows,
    getAliveWindows,
    getWindowsByRole,
    hasOtherWindows
} from './useBroadcastSync'

// Window Manager (high-level)
export { useWindowManager } from './useWindowManager'
