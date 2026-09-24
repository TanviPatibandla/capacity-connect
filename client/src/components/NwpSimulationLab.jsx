import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Layers, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Gauge, 
  Zap, 
  Activity,
  HardDrive
} from 'lucide-react';

export default function NwpSimulationLab({ onCompleteLab, isCompleted }) {
  const [selectedNest, setSelectedNest] = useState('d03'); // d01 (27km), d02 (9km), d03 (3km)
  const [timeStep, setTimeStep] = useState(18); // dt in seconds
  const [microphysics, setMicrophysics] = useState('wsm6'); // wsm6, thompson, morrison
  const [pblScheme, setPblScheme] = useState('ysu'); // ysu, myj
  const [isRunning, setIsRunning] = useState(false);
  const [simStep, setSimStep] = useState(0); // forecast hours 0 to 72h
  const [cflValue, setCflValue] = useState(1.0);
  const [labSubmitted, setLabSubmitted] = useState(isCompleted);

  const canvasRef = useRef(null);

  // Calculate CFL: dt <= 6 * dx (for dx in km, dt in seconds)
  // For d03 (3km): max dt is 18s
  useEffect(() => {
    const currentDx = selectedNest === 'd03' ? 3 : selectedNest === 'd02' ? 9 : 27;
    const maxStableDt = currentDx * 6;
    const cfl = (timeStep / maxStableDt).toFixed(2);
    setCflValue(cfl);
  }, [timeStep, selectedNest]);

  // Simulation execution runner
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setSimStep(prev => {
          if (prev >= 72) {
            setIsRunning(false);
            return 72;
          }
          return prev + 6;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // Canvas Drawing for WRF Domain Nesting
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Dark Map Background
    ctx.fillStyle = '#060d17';
    ctx.fillRect(0, 0, w, h);

    // Geographical Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Rough Indian Coastline Schematic
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.35);
    ctx.lineTo(w * 0.42, h * 0.5);
    ctx.lineTo(w * 0.48, h * 0.72);
    ctx.lineTo(w * 0.52, h * 0.72);
    ctx.lineTo(w * 0.58, h * 0.55);
    ctx.lineTo(w * 0.65, h * 0.42);
    ctx.stroke();

    // 1. D01: Outer Parent Domain (27km)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = selectedNest === 'd01' ? 3 : 1.5;
    ctx.fillStyle = selectedNest === 'd01' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(56, 189, 248, 0.05)';
    ctx.fillRect(20, 20, w - 40, h - 40);
    ctx.strokeRect(20, 20, w - 40, h - 40);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('d01: South Asia (27 km)', 30, 36);

    // 2. D02: Regional Indian Subcontinent Nest (9km)
    const d02X = w * 0.22;
    const d02Y = h * 0.18;
    const d02W = w * 0.58;
    const d02H = h * 0.64;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = selectedNest === 'd02' ? 3 : 1.5;
    ctx.fillStyle = selectedNest === 'd02' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.07)';
    ctx.fillRect(d02X, d02Y, d02W, d02H);
    ctx.strokeRect(d02X, d02Y, d02W, d02H);
    ctx.fillStyle = '#10b981';
    ctx.fillText('d02: Subcontinent (9 km)', d02X + 8, d02Y + 16);

    // 3. D03: High-Resolution Convective Permitting Nest (3km)
    const d03X = w * 0.38;
    const d03Y = h * 0.42;
    const d03W = w * 0.28;
    const d03H = h * 0.32;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = selectedNest === 'd03' ? 3 : 1.5;
    ctx.fillStyle = selectedNest === 'd03' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.08)';
    ctx.fillRect(d03X, d03Y, d03W, d03H);
    ctx.strokeRect(d03X, d03Y, d03W, d03H);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('d03: High-Res (3 km)', d03X + 6, d03Y + 14);

    // Render simulated precipitation forecast contour if model is running or completed
    if (simStep > 0) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.beginPath();
      ctx.arc(d03X + d03W * 0.45, d03Y + d03H * 0.55, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.beginPath();
      ctx.arc(d03X + d03W * 0.5, d03Y + d03H * 0.4, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.fillText(`Fcst +${simStep}h Valid`, d03X + 10, d03Y + d03H - 10);
    }

  }, [selectedNest, simStep]);

  const handleMarkComplete = () => {
    setLabSubmitted(true);
    if (onCompleteLab) onCompleteLab();
  };

  const isCflViolation = cflValue > 1.0;

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-semibold mb-1">
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>Digital Laboratory • Atmospheric Numerical Modeling</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            WRF-ARW Multi-Domain Nesting & HPC Stability Workbench
          </h3>
          <p className="text-xs text-slate-400">
            Interactive grid resolution configuration, Courant-Friedrichs-Lewy (CFL) stability diagnostics, and physics parametrization on MoES PRATYUSH supercomputing clusters.
          </p>
        </div>

        {labSubmitted ? (
          <span className="px-4 py-2 bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>NWP Practical Verified</span>
          </span>
        ) : (
          <button
            onClick={handleMarkComplete}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform hover:scale-102"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark NWP Practical as Completed</span>
          </button>
        )}
      </div>

      {/* Simulator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Domain Nesting Scope View (Canvas) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950 p-4 rounded-2xl border border-slate-800 relative">
          <canvas
            ref={canvasRef}
            width={440}
            height={360}
            className="rounded-xl shadow-2xl max-w-full"
          />

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <button
              onClick={() => setSelectedNest('d01')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-colors ${
                selectedNest === 'd01' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-sky-400'
              }`}
            >
              d01 (27 km Parent)
            </button>
            <button
              onClick={() => setSelectedNest('d02')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-colors ${
                selectedNest === 'd02' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-emerald-400'
              }`}
            >
              d02 (9 km Regional)
            </button>
            <button
              onClick={() => setSelectedNest('d03')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-colors ${
                selectedNest === 'd03' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'
              }`}
            >
              d03 (3 km High-Res)
            </button>
          </div>
        </div>

        {/* Physics & CFL Controls */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* CFL Stability Monitor */}
          <div className={`p-4 rounded-2xl border ${
            isCflViolation
              ? 'bg-rose-950/70 border-rose-500/70 text-rose-100'
              : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-100'
          } space-y-2`}>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4" />
                <span>CFL Numerical Stability Condition</span>
              </span>
              <span className="font-mono text-sm">{cflValue}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] opacity-90">
                <span>Time-Step ($\Delta t$): <strong>{timeStep} seconds</strong></span>
                <span>Grid Spacing ($\Delta x$): <strong>{selectedNest === 'd03' ? 3 : selectedNest === 'd02' ? 9 : 27} km</strong></span>
              </div>
              <input 
                type="range"
                min="6"
                max="36"
                value={timeStep}
                onChange={(e) => setTimeStep(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            <div className="text-[11px] leading-snug pt-1">
              {isCflViolation ? (
                <span className="text-rose-300 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>CFL Violation (cfl &gt; 1.0)! Model will diverge and crash with NaN wind speeds.</span>
                </span>
              ) : (
                <span className="text-emerald-300 font-medium">
                  ✓ Stable numerical integration ($\Delta t \le 6 \times \Delta x$). Runge-Kutta 3rd-order solver converges smoothly.
                </span>
              )}
            </div>
          </div>

          {/* Physics Parametrizations */}
          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-750 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>WRF Atmospheric Physics Schemes</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Microphysics</label>
                <select
                  value={microphysics}
                  onChange={(e) => setMicrophysics(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden"
                >
                  <option value="wsm6">WSM6 (6-class Graupel)</option>
                  <option value="thompson">Thompson (Aerosol-aware)</option>
                  <option value="morrison">Morrison 2-moment</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">PBL Scheme</label>
                <select
                  value={pblScheme}
                  onChange={(e) => setPblScheme(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden"
                >
                  <option value="ysu">Yonsei University (YSU)</option>
                  <option value="myj">Mellor-Yamada-Janjic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Supercomputer Model Integration Runner */}
          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-750 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>PRATYUSH HPC Cluster (256 MPI Ranks)</span>
              </span>
              <span className="font-mono text-emerald-400">
                {simStep > 0 ? `T+${simStep} Hours` : 'Initialized'}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${(simStep / 72) * 100}%` }}
              />
            </div>

            <button
              onClick={() => {
                if (isCflViolation) {
                  alert('Cannot run integration: Courant-Friedrichs-Lewy (CFL) condition is violated. Reduce time-step first!');
                  return;
                }
                setSimStep(0);
                setIsRunning(true);
              }}
              disabled={isRunning || isCflViolation}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                isCflViolation
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{isRunning ? 'Integrating Atmospheric Dynamics...' : 'Run 72-Hour WRF Integration'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
