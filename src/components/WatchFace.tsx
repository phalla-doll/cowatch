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
    
    const t = ctx.currentTime;
    const vol = state.volume / 100;

    if (state.sound === 'System') {
      // System: crisp digital UI tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      // Pitch drop creates a distinct "tock" UI sound
      osc.frequency.setValueAtTime(1000, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.03);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol * 0.5, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.04);
      return;
    }

    // Create a short noise burst for the "click" mechanism
    const bufferSize = ctx.sampleRate * 0.05; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    const noiseGain = ctx.createGain();

    if (state.movement === 'Mechanical') {
      // Mechanical: softer, more frequent ticking (escapement sound)
      noiseFilter.frequency.value = 5000;
      noiseFilter.Q.value = 2;
      
      noiseGain.gain.setValueAtTime(0, t);
      noiseGain.gain.linearRampToValueAtTime(vol * 0.3, t + 0.001);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      noise.start(t);
      noise.stop(t + 0.02);
    } else {
      // Quartz: sharp, distinct single tick (stepper motor sound)
      noiseFilter.frequency.value = 6000;
      noiseFilter.Q.value = 1;
      
      noiseGain.gain.setValueAtTime(0, t);
      noiseGain.gain.linearRampToValueAtTime(vol * 0.6, t + 0.001);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2500, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.02);
      
      oscGain.gain.setValueAtTime(0, t);
      oscGain.gain.linearRampToValueAtTime(vol * 0.3, t + 0.001);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.03);
      noise.start(t);
      noise.stop(t + 0.03);
    }
  };

  useEffect(() => {
    let animationFrameId: number;
    let intervalId: NodeJS.Timeout;

    if (state.movement === 'Mechanical') {
      const renderLoop = () => {
        const now = new Date();
        setTime(now);
        
        // Mechanical ticks very fast, 8 times a second
        const currentTick = Math.floor(now.getTime() / 125);
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
      <div className="relative w-[500px] h-[500px] scale-[1.35] 2xl:scale-[1.5] rounded-full bg-[#F4F5F7] shadow-[20px_20px_60px_#c8c9cc,-20px_-20px_60px_#ffffff] flex items-center justify-center transition-transform duration-500">
        
        {/* Inner bezel / depth */}
        <div className="absolute inset-4 rounded-full bg-white shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] border border-gray-100 flex items-center justify-center overflow-hidden">
          
          {/* Glass reflection */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rotate-[-15deg] origin-bottom-left rounded-tl-full pointer-events-none z-20"></div>

          {/* Dial Face */}
          <div className="relative w-full h-full flex items-center justify-center transition-colors duration-500" style={{ backgroundColor: state.color === '#F8F9FA' || state.color === '#E8EAEE' ? '#ffffff' : state.color }}>
            
            {/* Style: Analog */}
            {state.style === 'Analog' && (
              <>
                {/* Number Marks */}
                <div className="absolute inset-0 z-0">
                  {[...Array(12)].map((_, i) => {
                    const num = i === 0 ? 12 : i;
                    const isDark = state.color === '#111111' || state.color === '#5B86E5';
                    // 12 is at top (rotate -90deg)
                    const angle = (i * 30 - 90) * (Math.PI / 180);
                    const radius = 175; // Adjust distance from center
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    return (
                      <div 
                        key={i} 
                        className="absolute w-12 h-12 flex items-center justify-center font-rounded text-3xl font-bold"
                        style={{ 
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: 'translate(-50%, -50%)',
                          color: isDark ? '#F4F5F7' : '#2B2D42',
                          opacity: 0.85
                        }}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>

                {/* Minute Ticks */}
                <div className="absolute inset-0 z-0">
                  {[...Array(60)].map((_, i) => {
                    const isDark = state.color === '#111111' || state.color === '#5B86E5';
                    return (
                      <div
                        key={`tick-${i}`}
                        className="absolute top-0 left-1/2 -translate-x-1/2 h-full flex pt-3"
                        style={{ transform: `rotate(${i * 6}deg)` }}
                      >
                        <div 
                          className={`w-[2px] rounded-full ${i % 5 === 0 ? 'h-3' : 'h-1.5'}`} 
                          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)' }}
                        />
                      </div>
                    );
                  })}
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

                  {/* Second Hand */}
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
                  
                  {/* Center Pin */}
                  <div className="absolute w-4 h-4 bg-[#E63946] rounded-full z-20 shadow-[0_2px_4px_rgba(0,0,0,0.3)] border-2 border-[#111]"></div>
                  <div className="absolute w-1.5 h-1.5 bg-black rounded-full z-30"></div>
                </div>
              </>
            )}

            {/* Style: Radio */}
            {state.style === 'Radio' && (() => {
              const isDark = state.color === '#111111' || state.color === '#5B86E5';
              return (
              <div className="relative w-[360px] h-[360px] flex items-center justify-center">
                {/* Hours Ring */}
                <svg className="absolute w-full h-full -rotate-90">
                  <circle cx="180" cy="180" r="160" fill="none" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} strokeWidth="12" />
                  <circle cx="180" cy="180" r="160" fill="none" stroke={isDark ? '#fff' : '#111'} strokeWidth="12" 
                          strokeDasharray="1005" strokeDashoffset={1005 - (1005 * (hoursDegrees / 360))} className="transition-all duration-1000 ease-out" />
                </svg>
                {/* Minutes Ring */}
                <svg className="absolute w-[280px] h-[280px] -rotate-90">
                  <circle cx="140" cy="140" r="120" fill="none" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} strokeWidth="12" />
                  <circle cx="140" cy="140" r="120" fill="none" stroke={isDark ? 'rgba(255,255,255,0.8)' : '#444'} strokeWidth="12" 
                          strokeDasharray="754" strokeDashoffset={754 - (754 * (minutesDegrees / 360))} className="transition-all duration-1000 ease-out" />
                </svg>
                {/* Seconds Ring */}
                <svg className="absolute w-[200px] h-[200px] -rotate-90">
                  <circle cx="100" cy="100" r="80" fill="none" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} strokeWidth="8" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#E63946" strokeWidth="8" 
                          strokeDasharray="502" strokeDashoffset={502 - (502 * (secondsDegrees / 360))} 
                          className="transition-all duration-75"
                          style={{ transitionTimingFunction: state.movement === 'Mechanical' ? 'linear' : 'cubic-bezier(0.4, 2.08, 0.55, 0.44)' }} />
                </svg>
                
                <div className="absolute font-mono text-2xl font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
                  {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
                </div>
              </div>
            )})()}

            {/* Style: Orbit */}
            {state.style === 'Orbit' && (() => {
              const isDark = state.color === '#111111' || state.color === '#5B86E5';
              return (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Center Sun/Core */}
                <div className="absolute w-12 h-12 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)] z-10" style={{ backgroundColor: isDark ? '#fff' : '#111' }}></div>
                
                {/* Orbit Rings */}
                <div className="absolute w-[160px] h-[160px] rounded-full border border-black/5" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}></div>
                <div className="absolute w-[260px] h-[260px] rounded-full border border-black/5" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}></div>
                <div className="absolute w-[360px] h-[360px] rounded-full border border-black/5" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}></div>

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
            )})()}



          </div>
        </div>
      </div>
    </div>
  );
}
