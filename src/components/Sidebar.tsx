import { Palette } from 'lucide-react';
import { AppState, WatchStyle, Movement, SoundSystem } from '../types';

interface SidebarProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

const styles: WatchStyle[] = ['Digital', 'Radio', 'Orbit', 'Analog'];
const movements: Movement[] = ['Quartz', 'Mechanical', 'Dots'];
const colors = ['#D3E4C5', '#FDF094', '#E8EAEE', '#111111', '#5B86E5'];
const sounds: SoundSystem[] = ['Mute', 'System', 'Watch'];

export default function Sidebar({ state, updateState }: SidebarProps) {
  // We use slightly lighter gray for the container backgrounds to match the image
  const pillBg = "bg-[#E3E5E9]";

  return (
    <aside className="w-[300px] bg-[#EEEEF0] h-full flex flex-col px-6 py-8 z-10 overflow-y-auto">
      
      {/* Top Nav */}
      <div className="flex items-center gap-3 mb-10">
        <div className={`flex ${pillBg} p-1 rounded-full`}>
          <button className="px-4 py-2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-sm font-semibold text-black transition-all">Watch</button>
          <button className="px-4 py-2 rounded-full text-sm font-semibold text-gray-400 hover:text-gray-600 transition-all">Timer</button>
        </div>
        <button className="w-10 h-10 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center justify-center text-black transition-colors">
          <Palette size={18} fill="currentColor" />
        </button>
      </div>

      <div className="flex-1 space-y-8">
        
        {/* System Preferences */}
        <section>
          <h2 className="text-[11px] font-bold text-gray-400 mb-5 uppercase">System Preferences</h2>
          
          <div className="space-y-5">
            {/* Styles */}
            <div className={`flex ${pillBg} p-1 rounded-full w-max`}>
              {styles.map(s => (
                <button
                  key={s}
                  onClick={() => updateState({ style: s })}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    state.style === s 
                      ? 'bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.06)]' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Movements */}
            <div className={`flex ${pillBg} p-1 rounded-full w-max`}>
              {movements.map(m => (
                <button
                  key={m}
                  onClick={() => updateState({ movement: m })}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    state.movement === m 
                      ? 'bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.06)]' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Colors */}
            <div className="flex gap-2 pt-1">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => updateState({ color: c })}
                  className="w-10 h-10 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex items-center justify-center transition-transform hover:scale-105"
                >
                  <span 
                    className="w-5 h-5 rounded-full transition-all"
                    style={{ 
                      backgroundColor: c,
                      transform: state.color === c ? 'scale(1.2)' : 'scale(1)',
                      boxShadow: state.color === c ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }} 
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Sound System */}
        <section>
          <h2 className="text-[11px] font-bold text-gray-400 mb-5 uppercase">Sound System</h2>
          
          <div className="space-y-5">
            {/* Sounds */}
            <div className={`flex ${pillBg} p-1 rounded-full w-max`}>
              {sounds.map(s => (
                <button
                  key={s}
                  onClick={() => updateState({ sound: s })}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    state.sound === s 
                      ? 'bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.06)]' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Volume Slider */}
            <div className="pt-3">
              <div className={`relative h-10 ${pillBg} rounded-full flex items-center group`}>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={state.volume}
                  onChange={(e) => updateState({ volume: parseInt(e.target.value) })}
                  className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="absolute h-full bg-white rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all flex items-center justify-end px-3 min-w-[2.5rem]"
                  style={{ width: `${Math.max(15, state.volume)}%` }} // keep a min width so text is readable
                >
                  <span className="font-bold text-black text-xs">{state.volume}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </aside>
  );
}
