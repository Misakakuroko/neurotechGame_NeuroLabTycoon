import React from 'react';

interface TechSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (val: number) => void;
  warning?: boolean;
  warningMsg?: string;
  color?: 'blue' | 'purple' | 'emerald' | 'orange';
}

const TechSlider: React.FC<TechSliderProps> = ({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  unit = '', 
  onChange, 
  warning = false, 
  warningMsg,
  color = 'blue' 
}) => {
  
  // Calculate percentage for background gradient
  const percentage = ((value - min) / (max - min)) * 100;
  
  const colorClasses = {
    blue: 'from-blue-600 to-blue-400',
    purple: 'from-purple-600 to-purple-400',
    emerald: 'from-emerald-600 to-emerald-400',
    orange: 'from-orange-600 to-orange-400',
  };

  const thumbColors = {
    blue: 'bg-blue-500 shadow-blue-500/50',
    purple: 'bg-purple-500 shadow-purple-500/50',
    emerald: 'bg-emerald-500 shadow-emerald-500/50',
    orange: 'bg-orange-500 shadow-orange-500/50',
  };

  return (
    <div className="group">
      <div className="flex justify-between text-xs mb-2 font-mono uppercase tracking-wider">
        <span className="text-slate-400 flex items-center gap-2">
          {label}
          {warning && <span className="text-amber-500 animate-pulse">??</span>}
        </span>
        <span className={`${warning ? 'text-amber-400' : 'text-slate-200'} font-bold`}>
            {value} {unit}
        </span>
      </div>
      
      <div className="relative h-6 flex items-center">
        {/* Track Background */}
        <div className="absolute w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
           {/* Grid lines inside track */}
           <div className="w-full h-full opacity-20 bg-[linear-gradient(90deg,transparent_95%,#fff_95%)] bg-[size:10%_100%]"></div>
        </div>

        {/* Fill Track */}
        <div 
            className={`absolute h-2 rounded-full bg-gradient-to-r ${colorClasses[color]} opacity-80`}
            style={{ width: `${percentage}%` }}
        ></div>

        {/* Input (Invisible but functional) */}
        <input 
            type="range" 
            min={min} 
            max={max} 
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute w-full h-full opacity-0 cursor-pointer z-20"
        />

        {/* Custom Thumb (Visual only, follows percentage) */}
        <div 
            className={`absolute h-4 w-4 rounded shadow-[0_0_10px] border border-white/20 transform -translate-x-1/2 pointer-events-none z-10 transition-transform group-hover:scale-110 ${thumbColors[color]}`}
            style={{ left: `${percentage}%` }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
        </div>
      </div>

      {/* Ticks / Ruler */}
      <div className="flex justify-between px-1 mt-1">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="w-px h-1 bg-slate-700"></div>
        ))}
      </div>

      {warning && warningMsg && (
          <div className="text-[10px] text-amber-500/80 mt-1 font-mono text-right">
              {warningMsg}
          </div>
      )}
    </div>
  );
};

export default TechSlider;