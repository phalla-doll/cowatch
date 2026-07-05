export type WatchStyle = 'Radio' | 'Orbit' | 'Analog';
export type Movement = 'Quartz' | 'Mechanical' | 'Dots';
export type SoundSystem = 'Mute' | 'System' | 'Watch';

export interface AppState {
  style: WatchStyle;
  movement: Movement;
  color: string;
  sound: SoundSystem;
  volume: number;
}
