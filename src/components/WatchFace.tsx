import { useEffect, useState, useRef } from 'react';
import { AppState } from '../types';

interface WatchFaceProps {
  state: AppState;
}

export default function WatchFace({ state }: WatchFaceProps) {
  const [time, setTime] = useState(new Date());
  
  // Web Audio Context for ticking sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTickSecondRef = useRef<number>(-1);

  const playTick = () => {
    if (state.sound === 'Mute' || state.volume === 0) return;
    
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        return;
      }
    }
    
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Different tick sound for Mechanical vs Quartz
    if (state.movement === 'Mechanical') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
      gainNode.gain.setValueAtTime((state.volume / 100) * 0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime((state.volume / 100) * 0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
  };

  useEffect(() => {
    let animationFrameId: number;
    let intervalId: NodeJS.Timeout;

    if (state.movement === 'Mechanical') {
      const renderLoop = () => {
        const now = new Date();
        setTime(now);
        
        // Mechanical ticks very fast, maybe 4 times a second (4Hz)
        const currentTick = Math.floor(now.getTime() / 250);
        if (currentTick !== lastTickSecondRef.current) {
          lastTickSecondRef.current = currentTick;
          playTick();
        }
        
        animationFrameId = requestAnimationFrame(renderLoop);
      };
      animationFrameId = requestAnimationFrame(renderLoop);
    } else {
      intervalId = setInterval(() => {
        const now = new Date();
        setTime(now);
        
        // Quartz ticks once per second
        const currentSec = now.getSeconds();
        if (currentSec !== lastTickSecondRef.current) {
          lastTickSecondRef.current = currentSec;
          playTick();
        }
      }, 1000); // Ticks 1 time a sec
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [state.movement, state.sound, state.volume]);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const milliseconds = time.getMilliseconds();

  const getSecondsDegrees = () => {
    if (state.movement === 'Mechanical') {
      return ((seconds + milliseconds / 1000) / 60) * 360;
    }
    return (seconds / 60) * 360;
  };

  const secondsDegrees = getSecondsDegrees();
  const minutesDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hoursDegrees = ((hours % 12 + minutes / 60) / 12) * 360;

  return (
    <div className="flex-1 flex items-center justify-center bg-[#EBEDF0] relative overflow-hidden">
      
      {/* Background large text / decorative */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <h1 className="text-[20vw] font-bold tracking-tighter leading-none whitespace-nowrap text-gray-900 select-none">
          CO'WATCH
        </h1>
      </div>

      {/* The Watch */}
      <div className="relative w-[500px] h-[500px] rounded-full bg-[#F4F5F7] shadow-[20px_20px_60px_#c8c9cc,-20px_-20px_60px_#ffffff] flex items-center justify-center">
        
        {/* Inner bezel / depth */}
        <div className="absolute inset-4 rounded-full bg-white shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] border border-gray-100 flex items-center justify-center overflow-hidden">
          
          {/* Glass reflection */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rotate-[-15deg] origin-bottom-left rounded-tl-full pointer-events-none z-20"></div>

          {/* Dial Face */}
          <div className="relative w-full h-full flex items-center justify-center transition-colors duration-500" style={{ backgroundColor: state.color === '#F8F9FA' ? '#ffffff' : state.color }}>
            
            {/* Style: Analog */}
            {state.style === 'Analog' && (
              <>
                {/* Number Marks */}
                <div className="absolute inset-0 z-0">
                  {[...Array(12)].map((_, i) => {
                    const num = i === 0 ? 12 : i;
                    return (
                      <div 
                        key={i} 
                        className="absolute top-0 left-1/2 w-16 -ml-8 h-full flex justify-center pt-8 text-center font-serif text-3xl font-bold"
                        style={{ 
                          transform: `rotate(${i * 30}deg)`,
                          color: state.color === '#2B2D42' || state.color === '#3D5A80' ? '#F4F5F7' : '#2B2D42',
                          opacity: 0.85
                        }}
                      >
                        <div style={{ transform: `rotate(${-i * 30}deg)` }}>
                          {num}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Minute Ticks */}
                <div className="absolute inset-0">
                  {[...Array(60)].map((_, i) => (
                    <div
                      key={`tick-${i}`}
                      className="absolute top-0 left-1/2 -translate-x-1/2 h-full flex pt-3"
                      style={{ transform: `rotate(${i * 6}deg)` }}
                    >
                      <div 
                        className={`w-[2px] rounded-full ${i % 5 === 0 ? 'h-3' : 'h-1.5'}`} 
                        style={{ backgroundColor: state.color === '#2B2D42' || state.color === '#3D5A80' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Hands */}
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  
                  {/* Hour Hand */}
                  <div 
                    className="absolute w-2 h-[28%] bg-gradient-to-b from-[#111] to-[#333] rounded-full bottom-1/2 origin-bottom shadow-[2px_4px_8px_rgba(0,0,0,0.3)]"
                    style={{ transform: `rotate(${hoursDegrees}deg)` }}
                  >
                    {/* inner highlight */}
                    <div className="absolute inset-x-[1px] top-[1px] bottom-4 bg-white/20 rounded-full"></div>
                  </div>

                  {/* Minute Hand */}
                  <div 
                    className="absolute w-1.5 h-[38%] bg-gradient-to-b from-[#222] to-[#444] rounded-full bottom-1/2 origin-bottom shadow-[3px_5px_10px_rgba(0,0,0,0.25)]"
                    style={{ transform: `rotate(${minutesDegrees}deg)` }}
                  >
                    {/* inner highlight */}
                    <div className="absolute inset-x-[1px] top-[1px] bottom-6 bg-white/20 rounded-full"></div>
                  </div>

                  {/* Second Hand / Dot based on Movement */}
                  {state.movement === 'Dots' ? (
                    <div 
                      className="absolute w-[8px] h-[8px] bg-[#E63946] rounded-full shadow-[0_0_10px_rgba(230,57,70,0.6)] transition-transform duration-75"
                      style={{ 
                        transform: `rotate(${secondsDegrees}deg) translateY(-180px)`,
                        transformOrigin: '0 180px',
                        transitionTimingFunction: 'cubic-bezier(0.4, 2.08, 0.55, 0.44)'
                      }}
                    />
                  ) : (
                    <div 
                      className="absolute w-[2px] h-[45%] bg-[#E63946] bottom-1/2 origin-bottom shadow-[1px_2px_4px_rgba(230,57,70,0.4)] transition-transform duration-75"
                      style={{ 
                        transform: `rotate(${secondsDegrees}deg)`,
                        transitionTimingFunction: state.movement === 'Mechanical' ? 'linear' : 'cubic-bezier(0.4, 2.08, 0.55, 0.44)'
                      }}
                    >
                      {/* Counter weight */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-1.5 h-8 bg-[#E63946] rounded-full"></div>
                    </div>
                  )}
                  
                  {/* Center Pin */}
                  <div className="absolute w-4 h-4 bg-[#E63946] rounded-full z-20 shadow-[0_2px_4px_rgba(0,0,0,0.3)] border-2 border-[#111]"></div>
                  <div className="absolute w-1.5 h-1.5 bg-black rounded-full z-30"></div>
                </div>
              </>
            )}

            {/* Style: Digital */}
            {state.style === 'Digital' && (
              <div 
                className="flex flex-col items-center justify-center font-mono"
                style={{ color: state.color === '#2B2D42' || state.color === '#3D5A80' ? '#F4F5F7' : '#111' }}
              >
                <div className="text-8xl font-bold tracking-tighter tabular-nums flex items-baseline">
                  {hours.toString().padStart(2, '0')}
                  <span className={`${state.movement === 'Quartz' && seconds % 2 === 0 ? 'opacity-20' : 'opacity-100'} transition-opacity mx-2`}>:</span>
                  {minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-3xl font-medium tracking-widest mt-2 flex items-center gap-4">
                  <span>{time.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</span>
                  <span className="text-[#E63946]">{seconds.toString().padStart(2, '0')}</span>
                  <span>{time.getDate()}</span>
                </div>
                
                {/* Movement Dots representation for Digital */}
                {state.movement === 'Dots' && (
                  <div className="mt-8 flex gap-2">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${i < (seconds % 10) + 1 ? 'bg-[#E63946] scale-110 shadow-[0_0_8px_rgba(230,57,70,0.5)]' : 'bg-black/10'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Style: Radio */}
            {state.style === 'Radio' && (
              <div className="relative w-[360px] h-[360px] flex items-center justify-center">
                {/* Hours Ring */}
                <svg className="absolute w-full h-full -rotate-90">
                  <circle cx="180" cy="180" r="160" fill="none" stroke={state.color === '#2B2D42' || state.color === '#3D5A80' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} strokeWidth="12" />
                  <circle cx="180" cy="180" r="160" fill="none" stroke={state.color === '#2B2D42' || state.color === '#3D5A80' ? '#fff' : '#111'} strokeWidth="12" 
                          strokeDasharray="1005" strokeDashoffset={1005 - (1005 * (hoursDegrees / 360))} className="transition-all duration-1000 ease-out" />
                </svg>
                {/* Minutes Ring */}
                <svg className="absolute w-[280px] h-[280px] -rotate-90">
                  <circle cx="140" cy="140" r="120" fill="none" stroke={state.color === '#2B2D42' || state.color === '#3D5A80' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} strokeWidth="12" />
                  <circle cx="140" cy="140" r="120" fill="none" stroke={state.color === '#2B2D42' || state.color === '#3D5A80' ? 'rgba(255,255,255,0.8)' : '#444'} strokeWidth="12" 
                          strokeDasharray="754" strokeDashoffset={754 - (754 * (minutesDegrees / 360))} className="transition-all duration-1000 ease-out" />
                </svg>
                {/* Seconds Ring */}
                <svg className="absolute w-[200px] h-[200px] -rotate-90">
                  <circle cx="100" cy="100" r="80" fill="none" stroke={state.color === '#2B2D42' || state.color === '#3D5A80' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} strokeWidth="8" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#E63946" strokeWidth="8" 
                          strokeDasharray="502" strokeDashoffset={502 - (502 * (secondsDegrees / 360))} 
                          className="transition-all duration-75"
                          style={{ transitionTimingFunction: state.movement === 'Mechanical' ? 'linear' : 'cubic-bezier(0.4, 2.08, 0.55, 0.44)' }} />
                </svg>
                
                <div className="absolute font-mono text-2xl font-bold" style={{ color: state.color === '#2B2D42' || state.color === '#3D5A80' ? '#fff' : '#111' }}>
                  {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
                </div>
              </div>
            )}

            {/* Style: Orbit */}
            {state.style === 'Orbit' && (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Center Sun/Core */}
                <div className="absolute w-12 h-12 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)] z-10" style={{ backgroundColor: state.color === '#2B2D42' || state.color === '#3D5A80' ? '#fff' : '#111' }}></div>
                
                {/* Orbit Rings */}
                <div className="absolute w-[160px] h-[160px] rounded-full border border-black/5" style={{ borderColor: state.color === '#2B2D42' || state.color === '#3D5A80' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}></div>
                <div className="absolute w-[260px] h-[260px] rounded-full border border-black/5" style={{ borderColor: state.color === '#2B2D42' || state.color === '#3D5A80' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}></div>
                <div className="absolute w-[360px] h-[360px] rounded-full border border-black/5" style={{ borderColor: state.color === '#2B2D42' || state.color === '#3D5A80' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}></div>

                {/* Hours Planet */}
                <div className="absolute w-full h-full flex justify-center" style={{ transform: `rotate(${hoursDegrees}deg)` }}>
                  <div className="mt-[54px] w-8 h-8 rounded-full shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3)] bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-[10px] font-bold text-white font-mono" style={{ transform: `rotate(${-hoursDegrees}deg)` }}>
                    {hours}
                  </div>
                </div>

                {/* Minutes Planet */}
                <div className="absolute w-full h-full flex justify-center" style={{ transform: `rotate(${minutesDegrees}deg)` }}>
                  <div className="mt-[106px] w-6 h-6 rounded-full shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3)] bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-[8px] font-bold text-white font-mono" style={{ transform: `rotate(${-minutesDegrees}deg)` }}>
                    {minutes}
                  </div>
                </div>

                {/* Seconds Moon */}
                <div className="absolute w-full h-full flex justify-center transition-transform duration-75" style={{ transform: `rotate(${secondsDegrees}deg)`, transitionTimingFunction: state.movement === 'Mechanical' ? 'linear' : 'cubic-bezier(0.4, 2.08, 0.55, 0.44)' }}>
                  <div className="mt-[166px] w-4 h-4 rounded-full shadow-[0_0_8px_rgba(230,57,70,0.5)] bg-[#E63946]"></div>
                </div>
              </div>
            )}

            {/* Complication (Date) - Render only for styles that need it */}
            {(state.style === 'Analog' || state.style === 'Orbit') && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md px-2 py-1 rounded shadow-inner border border-black/5 text-xs font-bold font-mono tracking-widest"
                   style={{ color: state.color === '#2B2D42' || state.color === '#3D5A80' ? '#fff' : '#111' }}>
                {time.getDate()}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
