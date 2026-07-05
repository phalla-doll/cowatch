import { useEffect, useState } from 'react';
import { AppState } from '../types';

interface WatchFaceProps {
  state: AppState;
}

export default function WatchFace({ state }: WatchFaceProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    let animationFrameId: number;
    let intervalId: NodeJS.Timeout;

    if (state.movement === 'Mechanical') {
      const renderLoop = () => {
        setTime(new Date());
        animationFrameId = requestAnimationFrame(renderLoop);
      };
      animationFrameId = requestAnimationFrame(renderLoop);
    } else {
      intervalId = setInterval(() => {
        setTime(new Date());
      }, state.movement === 'Quartz' ? 1000 : 1000); // Need specialized dots logic if selected
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [state.movement]);

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
          <div className="relative w-full h-full flex items-center justify-center" style={{ backgroundColor: state.color === '#F8F9FA' ? '#ffffff' : state.color }}>
            
            {/* Number Marks */}
            {state.style === 'Analog' && (
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => {
                  const num = i === 0 ? 12 : i;
                  return (
                    <div 
                      key={i} 
                      className="absolute inset-6 flex justify-center text-center font-serif text-2xl font-bold"
                      style={{ 
                        transform: `rotate(${i * 30}deg)`,
                        color: state.color === '#2B2D42' ? '#F4F5F7' : '#2B2D42',
                        opacity: 0.8
                      }}
                    >
                      <span style={{ transform: `rotate(${-i * 30}deg)` }}>
                        {num}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Minute Ticks */}
            {state.style === 'Analog' && (
              <div className="absolute inset-0">
                {[...Array(60)].map((_, i) => (
                  <div
                    key={`tick-${i}`}
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-full flex pt-3"
                    style={{ transform: `rotate(${i * 6}deg)` }}
                  >
                    <div 
                      className={`w-[2px] rounded-full ${i % 5 === 0 ? 'h-3' : 'h-1.5'}`} 
                      style={{ backgroundColor: state.color === '#2B2D42' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)' }}
                    />
                  </div>
                ))}
              </div>
            )}

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

            {/* Complication (Date) */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md px-2 py-1 rounded shadow-inner border border-black/5 text-xs font-bold font-mono tracking-widest"
                 style={{ color: state.color === '#2B2D42' ? '#fff' : '#111' }}>
              {time.getDate()}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
