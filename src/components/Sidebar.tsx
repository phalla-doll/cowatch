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
    <aside className="w-80 bg-[#EEEEF0] h-full flex flex-col px-8 py-10 z-10 overflow-y-auto">
      
      {/* Top Nav */}
      <div className="flex items-center gap-4 mb-12">
        <div className={`flex ${pillBg} p-1 rounded-full`}>
          <button className="px-5 py-2.5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-sm font-semibold text-black transition-all">Watch</button>
          <button className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-400 hover:text-gray-600 transition-all">Timer</button>
        </div>
        <button className="w-11 h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center justify-center text-black transition-colors">
          <Palette size={20} fill="currentColor" />
        </button>
      </div>

      <div className="flex-1 space-y-10">
        
        {/* System Preferences */}
        <section>
          <h2 className="text-[12px] font-bold text-gray-400 mb-6 uppercase">System Preferences</h2>
          
          <div className="space-y-5">
            {/* Styles */}
            <div className={`flex ${pillBg} p-1 rounded-full w-max`}>
              {styles.map(s => (
                <button
                  key={s}
                  onClick={() => updateState({ style: s })}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
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
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
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
            <div className="flex gap-3 pt-2">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => updateState({ color: c })}
                  className="w-12 h-12 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex items-center justify-center transition-transform hover:scale-105"
                >
                  <span 
                    className="w-6 h-6 rounded-full transition-all"
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
          <h2 className="text-[12px] font-bold text-gray-400 mb-6 uppercase">Sound System</h2>
          
          <div className="space-y-5">
            {/* Sounds */}
            <div className={`flex ${pillBg} p-1 rounded-full w-max`}>
              {sounds.map(s => (
                <button
                  key={s}
                  onClick={() => updateState({ sound: s })}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
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
            <div className="pt-4">
              <div className={`relative h-12 ${pillBg} rounded-full flex items-center group`}>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={state.volume}
                  onChange={(e) => updateState({ volume: parseInt(e.target.value) })}
                  className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="absolute h-full bg-white rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all flex items-center justify-end px-4 min-w-[3rem]"
                  style={{ width: `${Math.max(15, state.volume)}%` }} // keep a min width so text is readable
                >
                  <span className="font-bold text-black text-sm">{state.volume}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </aside>
  );
}
