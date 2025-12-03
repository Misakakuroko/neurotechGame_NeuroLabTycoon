import React, { useState, useEffect, useRef } from 'react';
import { useOpticalGameStore } from '../../store/opticalGameStore';
import { Zap, RefreshCw, MousePointer2, ShieldAlert, Crosshair, ThermometerSun, ArrowDown, Info } from 'lucide-react';

// Grid Constants
const GRID_W = 20;
const GRID_H = 15;
const CELL_SIZE = 30;

type CellType = 'empty' | 'skull' | 'tissue' | 'vessel' | 'target' | 'ucnp';
type LaserType = 'blue' | 'nir';

interface Cell {
    x: number;
    y: number;
    type: CellType;
    // 物理量
    blueIntensity: number; // 蓝光强度 (0-100)
    nirIntensity: number;  // 近红外强度 (0-100)
    temp: number;          // 温度积累 (37-45)
}

const BASE_MESSAGE = "MISSION: Use UCNPs to scatter light around obstacles.";

const Chapter1: React.FC = () => {
    const { setChapter, addKnowledgePoints, c1_config, initC1Level } = useOpticalGameStore();
    const [grid, setGrid] = useState<Cell[]>([]);
    
    // --- 新的核心状态 ---
    const [angle, setAngle] = useState(0); // 入射角度 -45 ~ 45 度 (扩大范围)
    const [power, setPower] = useState(50); // 激光功率 0-100 mW
    const [laserType, setLaserType] = useState<LaserType>('nir'); // 默认 NIR
    
    // --- 仿真状态 ---
    const [isScanning, setIsScanning] = useState(false); 
    const [isFiring, setIsFiring] = useState(false);     
    const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');
    const [message, setMessage] = useState(BASE_MESSAGE);
    
    const [targetActivation, setTargetActivation] = useState(0); 
    const [maxVesselTemp, setMaxVesselTemp] = useState(37.0);

    const [ucnpCount, setUcnpCount] = useState(3);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 初始化关卡
    useEffect(() => {
        initC1Level();
    }, []);

    // 同步 Grid 数据
    useEffect(() => {
        if (!c1_config || !c1_config.vessels) return;

        const newGrid: Cell[] = [];
        for (let y = 0; y < GRID_H; y++) {
            for (let x = 0; x < GRID_W; x++) {
                let type: CellType = 'tissue';
                if (y < 2) type = 'skull';
                else if (y === 0) type = 'empty';
                
                if (c1_config.vessels.some(v => v.x === x && v.y === y)) type = 'vessel';
                if (x === c1_config.targetX && y === c1_config.targetY) type = 'target';

                newGrid.push({ x, y, type, blueIntensity: 0, nirIntensity: 0, temp: 37.0 });
            }
        }
        setGrid(newGrid);
        setUcnpCount(3);
        setStatus('idle');
        setMessage(BASE_MESSAGE);
    }, [c1_config]); 

    // 点击放置 UCNP 
    const handleCellClick = (index: number) => {
        if (isFiring || status === 'success') return;
        
        const newGrid = [...grid];
        const oldCell = newGrid[index];
        const newCell = { ...oldCell }; 

        if (newCell.type === 'tissue' && ucnpCount > 0) {
            newCell.type = 'ucnp';
            setUcnpCount(prev => prev - 1);
        } else if (newCell.type === 'ucnp') {
            newCell.type = 'tissue';
            setUcnpCount(prev => prev + 1);
        } else {
            return; 
        }
        
        newGrid[index] = newCell;
        setGrid(newGrid);
    };

    const resetAttempt = () => {
        setIsFiring(false);
        setStatus('idle');
        setMessage(BASE_MESSAGE);
        setTargetActivation(0);
        setMaxVesselTemp(37);
        setGrid(prev => prev.map(cell => ({
            ...cell,
            blueIntensity: 0,
            nirIntensity: 0,
            temp: 37
        })));
    };

    // --- 核心物理引擎 ---
    const calculatePhysics = (firingMode: boolean) => {
        const currentPower = firingMode ? power : 10;
        const newGrid = grid.map(c => ({ ...c, blueIntensity: 0, nirIntensity: 0, temp: 37.0 }));
        
        const startX = c1_config.sourceX * CELL_SIZE + CELL_SIZE / 2;
        const startY = 0;
        
        // 修正角度逻辑：+45度对应向右偏移
        // Canvas 0度是水平向右，垂直向下是90度
        const rad = (90 + angle) * (Math.PI / 180); // 改回 +angle，因为Y轴向下
        const dirX = Math.cos(rad); // angle>0 (向右偏) -> rad>90 -> cos(rad)<0 (向左) ???
        // 让我们重新推导：
        // 0度 = 水平右 (X+)
        // 90度 = 垂直下 (Y+)
        // 我们希望 angle=0 -> 垂直下 -> 90度
        // 我们希望 angle>0 -> 向右偏 -> 角度 < 90度 (如80度) 还是 > 90度?
        // 如果向右偏，X增加，Y增加。
        // 90度时 X不变 (cos90=0)
        // <90度 (如45度) -> X增加 (cos45>0), Y增加
        // >90度 (如135度) -> X减少 (cos135<0), Y增加
        // 所以如果滑块向右(angle > 0) 代表向右偏，那么我们需要角度 < 90
        // 即：rad = (90 - angle) * PI/180
        // 之前的 (90-angle) 是对的吗？
        // 如果 angle=20, rad=70. cos(70)>0 (向右). 正确。
        // 那为什么视觉上反了？可能是 Canvas 旋转的逻辑和射线逻辑不一致。
        
        // 统一逻辑：
        // 物理计算使用: (90 - angle) * DEG2RAD
        // Canvas 绘图使用: -angle * DEG2RAD (因为 rotate 是顺时针)
        // 或者更简单：
        // 定义 angle 为 "偏离垂直线的角度"，向右为正。
        // 物理：垂直向下是 (0,1)。向右偏意味着向量变成 (sin(a), cos(a))
        const physRad = angle * (Math.PI / 180);
        const physDirX = Math.sin(physRad);
        const physDirY = Math.cos(physRad);

        let currentX = startX;
        let currentY = startY;
        let energy = currentPower; 

        const stepSize = 5;
        const maxSteps = 300; 

        for (let i = 0; i < maxSteps; i++) {
            currentX += physDirX * stepSize;
            currentY += physDirY * stepSize;

            if (currentX < 0 || currentX >= GRID_W * CELL_SIZE || currentY >= GRID_H * CELL_SIZE) break;

            const gx = Math.floor(currentX / CELL_SIZE);
            const gy = Math.floor(currentY / CELL_SIZE);
            const cellIdx = gy * GRID_W + gx;
            
            if (cellIdx >= 0 && cellIdx < newGrid.length) {
                const cell = newGrid[cellIdx];

                // A. 障碍物
                if (cell.type === 'skull' && laserType === 'blue') {
                    energy *= 0.5; 
                    cell.temp += energy * 0.1;
                }
                if (cell.type === 'vessel') {
                     energy *= 0.8; 
                     const absorption = energy * 0.5;
                     cell.temp += absorption;
                }

                // B. 光强
                if (laserType === 'blue') {
                    cell.blueIntensity = Math.max(cell.blueIntensity, energy);
                    energy *= 0.90; 
                } else {
                    cell.nirIntensity = Math.max(cell.nirIntensity, energy);
                    energy *= 0.99; 
                }

                // C. UCNP 转换
                if (cell.type === 'ucnp' && laserType === 'nir' && energy > 5) {
                    const conversionPower = energy * 0.8; 
                    const radius = 3.5; 
                    
                    for (let dy = -3; dy <= 3; dy++) {
                        for (let dx = -3; dx <= 3; dx++) {
                            const nx = gx + dx;
                            const ny = gy + dy;
                            
                            if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
                                const dist = Math.sqrt(dx*dx + dy*dy);
                                if (dist <= radius) {
                                    const targetIdx = ny * GRID_W + nx;
                                    const falloff = 1 / (1 + dist * 0.5);
                                    newGrid[targetIdx].blueIntensity += conversionPower * falloff;
                                    
                                    if (newGrid[targetIdx].type === 'vessel') {
                                        newGrid[targetIdx].temp += (conversionPower * falloff) * 0.08;
                                    }
                                }
                            }
                        }
                    }
                    energy *= 0.8;
                }

                if (energy < 1) break;
            }
        }

        return newGrid;
    };

    // 实时循环
    useEffect(() => {
        if (grid.length === 0) return; 

        const computedGrid = calculatePhysics(isFiring);
        setGrid(computedGrid);

        let maxTemp = 37.0;
        let targetActiv = 0;

        computedGrid.forEach(cell => {
            if (cell.temp > maxTemp) maxTemp = cell.temp;
            if (cell.type === 'target') {
                targetActiv = Math.min(100, cell.blueIntensity * 2.5); 
            }
        });

        setMaxVesselTemp(maxTemp);
        setTargetActivation(targetActiv);

        if (isFiring) {
            if (maxTemp > 42.0) {
                setStatus('fail');
                setMessage("FAILURE: Vessel overheated! Thermal damage detected.");
                setIsFiring(false);
            } else if (targetActiv >= 100) {
                setStatus('success');
                setMessage("SUCCESS: Target Activated! Neural link established.");
                addKnowledgePoints(200);
                setTimeout(() => setChapter('chapter2'), 2000);
            }
        }

    }, [angle, power, laserType, isFiring, ucnpCount, status]);

    // Canvas 渲染
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制网格
        grid.forEach(cell => {
            const x = cell.x * CELL_SIZE;
            const y = cell.y * CELL_SIZE;

            // 1. 基础层
            if (cell.type === 'skull') ctx.fillStyle = '#334155'; 
            else if (cell.type === 'vessel') ctx.fillStyle = '#7f1d1d'; 
            else if (cell.type === 'target') ctx.fillStyle = '#064e3b'; 
            else if (cell.type === 'ucnp') ctx.fillStyle = '#155e75'; 
            else ctx.fillStyle = '#0f172a'; 
            
            ctx.fillRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);

            // 2. 光照效果
            ctx.globalCompositeOperation = 'screen';
            if (cell.blueIntensity > 1) {
                const alpha = Math.min(0.9, cell.blueIntensity / 80);
                ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`; 
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            }
            if (cell.nirIntensity > 1) {
                const alpha = Math.min(0.7, cell.nirIntensity / 80);
                ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            }
            ctx.globalCompositeOperation = 'source-over';

            // 3. 实体图标
            if (cell.type === 'vessel') {
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.strokeRect(x+2, y+2, CELL_SIZE-4, CELL_SIZE-4);
                if (cell.temp > 38) {
                     ctx.fillStyle = `rgba(255, 50, 50, ${(cell.temp - 37)/5})`;
                     ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                }
            }
            if (cell.type === 'target') {
                ctx.strokeStyle = '#34d399';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 8, 0, Math.PI*2);
                ctx.stroke();
                
                ctx.fillStyle = targetActivation > 50 ? '#fff' : '#34d399';
                ctx.beginPath();
                ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 3, 0, Math.PI*2);
                ctx.fill();
                
                if (cell.blueIntensity > 5) {
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 12, 0, Math.PI*2);
                    ctx.stroke();
                }
            }
            if (cell.type === 'ucnp') {
                ctx.fillStyle = '#22d3ee'; 
                ctx.beginPath();
                ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 6, 0, Math.PI*2);
                ctx.fill();
                
                if (!isFiring) {
                     ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
                     ctx.lineWidth = 1;
                     ctx.setLineDash([2, 2]);
                     ctx.beginPath();
                     ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, CELL_SIZE * 3, 0, Math.PI*2); 
                     ctx.stroke();
                     ctx.setLineDash([]);
                }
            }
        });

        // 绘制激光器 (Visual)
        const sourcePixelX = c1_config.sourceX * CELL_SIZE + CELL_SIZE / 2;
        ctx.save();
        ctx.translate(sourcePixelX, 0);
        // Canvas 旋转：顺时针为正。
        // 如果我们希望 Angle > 0 (右滑) -> 激光向右偏。
        // 向右偏 = 逆时针旋转 (相对于垂直向下) 还是顺时针？
        // 垂直向下是 Y 轴。向右是 X 轴。
        // 向右偏意味着向 X 轴正方向靠近，即角度减小（如果0度是X轴）。
        // 但在这里，我们定义 0 度是垂直向下。
        // 所以向右偏应该是逆时针旋转，即 -angle。
        // 等等，物理层我们用了 Math.sin(angle)，当 angle>0 时 X>0 (向右)。
        // Canvas 的坐标系：X向右，Y向下。rotate(0) = 原点方向。
        // 我们画的激光是 lineTo(0, 1000)，即垂直向下。
        // 如果 rotate(positive)，它会向顺时针转 -> 向左偏 (因为Y轴向下，X轴向右，顺时针是从Y轴转向-X轴...不，顺时针是从Y(下)转向-X(左)吗？)
        // 让我们看 Canvas 默认坐标系：
        // 0度：水平右。90度：垂直下。
        // 我们画线是 (0,0) -> (0, 1000)。这是垂直向下。
        // 如果我们 rotate(10 deg)，线会变成向左偏还是向右偏？
        // 垂直向下是 90 度。顺时针 +10 度 -> 100 度 (向左偏)。
        // 逆时针 -10 度 -> 80 度 (向右偏)。
        // 所以：如果 angle > 0 (代表向右)，我们需要 rotate(-angle)。
        ctx.rotate((-angle * Math.PI) / 180);
        
        ctx.fillStyle = laserType === 'blue' ? '#3b82f6' : '#a855f7';
        ctx.fillRect(-10, -20, 20, 20);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 1000); // 这里的线是相对于局部坐标系的垂直向下
        ctx.strokeStyle = `rgba(255, 255, 255, ${isFiring ? 0.5 : 0.1})`;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        
        ctx.restore();

    }, [grid, angle, isFiring, laserType, c1_config, targetActivation]);

    return (
        <div className="p-6 max-w-6xl mx-auto text-slate-200 font-mono h-full flex flex-col">
            <div className="mb-4 border-b border-slate-700 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-400 mb-1">CHAPTER 1: STEREOTACTIC INJECTION</h1>
                    <p className="text-slate-400 text-xs">OBJECTIVE: Deliver sufficient blue light to Target via UCNPs. Avoid overheating vessels.</p>
                </div>
                <div className="flex gap-4">
                    {grid.length === 0 && <span className="text-red-500 text-xs animate-pulse">LOADING MAP DATA...</span>}
                    
                    <div className="bg-slate-800 px-3 py-1 rounded border border-slate-600 flex items-center gap-2">
                         <ThermometerSun className={`w-4 h-4 ${maxVesselTemp > 40 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                         <span className={`font-bold ${maxVesselTemp > 40 ? 'text-red-500' : 'text-slate-200'}`}>{maxVesselTemp.toFixed(1)}°C</span>
                         <span className="text-[10px] text-slate-500">LIMIT: 42.0°C</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
                
                {/* LEFT: CONTROLS */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    
                    {/* Laser Config */}
                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 space-y-4">
                        <h3 className="font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                            <Crosshair className="w-5 h-5 text-purple-500"/> OPTICAL ALIGNMENT
                        </h3>

                        <div className="flex p-1 bg-slate-800 rounded-lg">
                            <button onClick={() => setLaserType('blue')} className={`flex-1 py-1 text-xs font-bold rounded transition-colors ${laserType==='blue' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>473nm (Blue)</button>
                            <button onClick={() => setLaserType('nir')} className={`flex-1 py-1 text-xs font-bold rounded transition-colors ${laserType==='nir' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white'}`}>980nm (NIR)</button>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">INJECTION ANGLE</span>
                                <span className="text-cyan-400 font-bold">{angle}°</span>
                            </div>
                            <input 
                                type="range" min="-45" max="45" step="1" 
                                value={angle} onChange={(e) => setAngle(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                             <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                                <span>-45° (Left)</span><span>0°</span><span>+45° (Right)</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">LASER POWER</span>
                                <span className={`font-bold ${power > 80 ? 'text-red-500' : 'text-orange-400'}`}>{power} mW</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" step="1" 
                                value={power} onChange={(e) => setPower(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                        </div>
                    </div>

                    {/* Inventory */}
                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-sm">
                            <MousePointer2 className="w-4 h-4 text-cyan-500"/> NANOPARTICLES (UCNPs)
                        </h3>
                        <div className="flex items-center justify-between bg-slate-800 p-3 rounded mb-2">
                             <span className="text-xs text-slate-400">AVAILABLE</span>
                             <span className="text-xl font-bold text-cyan-400">x{ucnpCount}</span>
                        </div>
                        
                         <div className="flex gap-2 bg-cyan-900/20 p-2 rounded border border-cyan-900/50">
                            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-cyan-200/80 leading-relaxed">
                                <span className="font-bold text-cyan-400">TIP:</span> You can place UCNPs *next* to the target. The blue glow will reach it!
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto space-y-3">
                         <div className={`p-3 rounded border text-xs font-bold flex items-start gap-2 transition-colors
                            ${status === 'fail' ? 'bg-red-900/30 border-red-500 text-red-400' : 
                              status === 'success' ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 
                              'bg-slate-800 border-slate-600 text-slate-300'}`}>
                            {status === 'fail' ? <ShieldAlert className="w-4 h-4 shrink-0"/> : <Zap className="w-4 h-4 shrink-0"/>}
                            <span>{message}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onMouseDown={() => setIsFiring(true)}
                                onMouseUp={() => setIsFiring(false)}
                                onMouseLeave={() => setIsFiring(false)}
                                disabled={status === 'success' || status === 'fail'}
                                className={`py-4 rounded-lg font-bold flex flex-col items-center justify-center transition-all active:scale-95
                                    ${status === 'success' || status === 'fail' ? 'opacity-50 bg-slate-700' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'}`}
                            >
                                <span className="text-lg">HOLD TO FIRE</span>
                            </button>

                            <button 
                                onClick={initC1Level}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-lg flex flex-col items-center justify-center border border-slate-700"
                            >
                                <RefreshCw className="w-5 h-5 mb-1" />
                                <span className="text-[10px]">NEW SUBJECT</span>
                            </button>
                        </div>

                        {status === 'fail' && (
                            <button 
                                onClick={resetAttempt}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg border border-blue-400 transition-colors"
                            >
                                RETRY SAME MAP
                            </button>
                        )}
                    </div>
                </div>

                {/* RIGHT: SIMULATION VIEW */}
                <div className="lg:col-span-8 bg-black rounded-xl border border-slate-800 relative flex items-center justify-center overflow-hidden shadow-2xl">
                    <canvas 
                        ref={canvasRef}
                        width={GRID_W * CELL_SIZE}
                        height={GRID_H * CELL_SIZE}
                        className="relative z-10 cursor-crosshair"
                        onClick={(e) => {
                            const rect = canvasRef.current?.getBoundingClientRect();
                            if (rect) {
                                const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
                                const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
                                handleCellClick(y * GRID_W + x);
                            }
                        }}
                    />
                    {/* Background Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-20" 
                         style={{ 
                             backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
                             backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                         }}>
                    </div>
                    
                    {/* Target HUD */}
                    <div className="absolute bottom-4 right-4 z-20 bg-black/80 backdrop-blur border border-emerald-500/30 p-3 rounded-lg w-48">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-emerald-400 font-bold">NEURAL ACTIVATION</span>
                            <span className="text-white">{targetActivation.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-100 ${targetActivation >= 100 ? 'bg-white' : 'bg-emerald-500'}`}
                                style={{ width: `${targetActivation}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Chapter1;
