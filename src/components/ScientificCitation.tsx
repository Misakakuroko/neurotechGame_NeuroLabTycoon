import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen } from 'lucide-react';
import { SCIENCE_REFS } from '../data/scientificRefs';

interface ScientificCitationProps {
    refId: keyof typeof SCIENCE_REFS;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

const ScientificCitation: React.FC<ScientificCitationProps> = ({ refId, children, position = 'top', className }) => {
    const data = SCIENCE_REFS[refId];
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    // If no data, return children directly
    if (!data) return <>{children}</>;

    const handleMouseEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            let top = 0;
            let left = 0;
            const GAP = 12; // Gap between trigger and tooltip

            switch (position) {
                case 'top':
                    top = rect.top - GAP;
                    left = rect.left + rect.width / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + GAP;
                    left = rect.left + rect.width / 2;
                    break;
                case 'left':
                    top = rect.top + rect.height / 2;
                    left = rect.left - GAP;
                    break;
                case 'right':
                    top = rect.top + rect.height / 2;
                    left = rect.right + GAP;
                    break;
            }
            
            setCoords({ top, left });
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <>
            <div 
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={className || "group relative inline-block cursor-help border-b border-dotted border-blue-500/50 hover:border-blue-400 transition-colors"}
            >
                {children}
            </div>
            
            {isVisible && createPortal(
                <div 
                    className="fixed z-[9999] pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95"
                    style={{ 
                        top: coords.top, 
                        left: coords.left,
                        // Center or align based on position using transform
                        transform: position === 'top' ? 'translate(-50%, -100%)' : 
                                  position === 'bottom' ? 'translate(-50%, 0)' :
                                  position === 'left' ? 'translate(-100%, -50%)' : 
                                  'translate(0, -50%)'
                    }}
                >
                     <div className="w-72 bg-slate-950/95 backdrop-blur-xl border border-blue-500/30 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] text-left overflow-hidden ring-1 ring-blue-500/20">
                        {/* Header */}
                        <div className="bg-blue-900/20 px-3 py-2 border-b border-blue-500/20 flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Scientific Context</span>
                        </div>
                        
                        {/* Content */}
                        <div className="p-4 space-y-3">
                            <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                "{data.fact}"
                            </p>
                            <div className="flex items-start gap-1.5 pt-2 border-t border-blue-500/10">
                                <span className="text-[9px] text-blue-400/60 uppercase tracking-wider font-bold mt-0.5">SOURCE:</span>
                                <p className="text-[10px] text-slate-500 italic leading-tight">
                                    {data.source}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default ScientificCitation;
