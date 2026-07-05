import { useState } from 'react';
import Sidebar from './components/Sidebar';
import WatchFace from './components/WatchFace';
import { AppState } from './types';

export default function App() {
  const [state, setState] = useState<AppState>({
    style: 'Analog',
    movement: 'Quartz',
    color: '#E8EAEE', // off-white default
    sound: 'Watch',
    volume: 80,
  });

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex h-screen w-full font-sans bg-[#EBEDF0] text-gray-900 overflow-hidden">
      <Sidebar state={state} updateState={updateState} />
      <WatchFace state={state} />
    </div>
  );
}
