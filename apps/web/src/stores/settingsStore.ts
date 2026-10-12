import { create } from 'zustand';

export type GraphicsQuality = 'low' | 'medium' | 'high';
export type CameraMode = 'follow' | 'tactical';

interface SettingsState {
  graphicsQuality: GraphicsQuality;
  cameraMode: CameraMode;
  masterVolume: number;
  sfxVolume: number;
  showMinimap: boolean;
  showTacticalPanel: boolean;
  setGraphicsQuality: (quality: GraphicsQuality) => void;
  setCameraMode: (mode: CameraMode) => void;
  setMasterVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMinimap: () => void;
  toggleTacticalPanel: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  graphicsQuality: 'medium',
  cameraMode: 'follow',
  masterVolume: 80,
  sfxVolume: 80,
  showMinimap: true,
  showTacticalPanel: true,
  setGraphicsQuality: (graphicsQuality) => set({ graphicsQuality }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setMasterVolume: (masterVolume) => set({ masterVolume }),
  setSfxVolume: (sfxVolume) => set({ sfxVolume }),
  toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),
  toggleTacticalPanel: () => set((state) => ({ showTacticalPanel: !state.showTacticalPanel })),
}));
