import { Palette } from 'lucide-react';
import { AppState, WatchStyle, Movement, SoundSystem } from '../types';

interface SidebarProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

const styles: WatchStyle[] = ['Digital', 'Radio', 'Orbit', 'Analog'];
const movements: Movement[] = ['Quartz', 'Mechanical', 'Dots'];
const colors = ['#8FB996', '#F2C14E', '#F8F9FA', '#2B2D42', '#3D5A80'];
const sounds: SoundSystem[] = ['Mute', 'System', 'Watch'];

export default function Sidebar({ state, updateState }: SidebarProps) {
  return (
    <aside className="w-80 bg-[#F4F5F7] h-full flex flex-col px-8 py-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-white/50 z-10 overflow-y-auto">
      
      {/* Top Nav */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex space-x-1 bg-[#E8EAEE] p-1 rounded-full shadow-inner">
          <button className="px-5 py-2 rounded-full bg-white shadow-sm text-sm font-medium text-gray-800 transition-all">Watch</button>
          <button className="px-5 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-all">Focus</button>
        </div>
        <button className="w-10 h-10 rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors">
          <Palette size={18} />
        </button>
      </div>

      <div className="flex-1 space-y-10">
        
        {/* System Preferences */}
        <section>
          <h2 className="text-[11px] font-bold tracking-[0.2em] text-gray-400 mb-6 uppercase">System Preferences</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">Style</label>
              <div className="flex flex-wrap gap-2">
                {styles.map(s => (
                  <button
                    key={s}
                    onClick={() => updateState({ style: s })}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      state.style === s 
                        ? 'bg-gray-800 text-white shadow-md' 
                        : 'bg-white text-gray-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">Movement</label>
              <div className="flex flex-wrap gap-2">
                {movements.map(m => (
                  <button
                    key={m}
                    onClick={() => updateState({ movement: m })}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      state.movement === m 
                        ? 'bg-white text-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.08)] ring-1 ring-gray-100' 
                        : 'text-gray-500 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">Color</label>
              <div className="flex gap-3">
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => updateState({ color: c })}
                    className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                    style={{ backgroundColor: c }}
                  >
                    <span className={`w-full h-full rounded-full border-2 transition-all ${state.color === c ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent scale-100 shadow-sm'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sound System */}
        <section>
          <h2 className="text-[11px] font-bold tracking-[0.2em] text-gray-400 mb-6 uppercase">Sound System</h2>
          
          <div className="space-y-6">
            <div className="flex bg-[#E8EAEE] p-1 rounded-full shadow-inner">
              {sounds.map(s => (
                <button
                  key={s}
                  onClick={() => updateState({ sound: s })}
                  className={`flex-1 py-2 rounded-full text-xs font-medium transition-all ${
                    state.sound === s 
                      ? 'bg-white text-gray-800 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-600">Volume</label>
                <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded-md shadow-sm">{state.volume}%</span>
              </div>
              <div className="relative h-2 bg-[#E8EAEE] rounded-full shadow-inner flex items-center group">
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={state.volume}
                  onChange={(e) => updateState({ volume: parseInt(e.target.value) })}
                  className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="absolute h-full bg-gray-800 rounded-full transition-all"
                  style={{ width: `${state.volume}%` }}
                />
                <div 
                  className="absolute w-4 h-4 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] ring-1 ring-black/5 group-hover:scale-110 transition-transform"
                  style={{ left: `calc(${state.volume}% - 8px)` }}
                />
              </div>
            </div>
          </div>
        </section>

      </div>
    </aside>
  );
}
