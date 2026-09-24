import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Gauge, 
  Compass, 
  CheckCircle2, 
  HelpCircle, 
  Eye, 
  Download,
  Sparkles
} from 'lucide-react';

export default function RadarSimulationLab({ onCompleteLab, isCompleted }) {
  const [scenario, setScenario] = useState('cyclone'); // cyclone, squall, orographic
  const [product, setProduct] = useState('reflectivity'); // reflectivity, velocity, zdr
  const [elevation, setElevation] = useState('0.5'); // 0.5, 1.5, 3.0
  const [isScanning, setIsScanning] = useState(true);
  const [scanAngle, setScanAngle] = useState(0);
  const [mousePos, setMousePos] = useState({ r: 0, theta: 0, x: 0, y: 0, dbz: 0 });
  const [labSubmitted, setLabSubmitted] = useState(isCompleted);

  const canvasRef = useRef(null);

  // Animation Loop for Scanning Beam
  useEffect(() => {
    let animId;
    if (isScanning) {
      const updateSweep = () => {
        setScanAngle(prev => (prev + 1.5) % 360);
        animId = requestAnimationFrame(updateSweep);
      };
      animId = requestAnimationFrame(updateSweep);
    }
    return () => cancelAnimationFrame(animId);
  }, [isScanning]);

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = cx - 25;

    // 1. Dark Radar Background
    ctx.fillStyle = '#060d17';
    ctx.fillRect(0, 0, width, height);

    // 2. Concentric Range Rings (50km, 100km, 150km, 200km)
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1.0].forEach((ratio, idx) => {
      const r = maxRadius * ratio;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(`${(idx + 1) * 50} km`, cx + 4, cy - r + 12);
    });

    // 3. Azimuth Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.stroke();

    // 4. Render Weather Scenario Echoes
    const drawWeatherPattern = () => {
      if (scenario === 'cyclone') {
        // Spiral Eyewall Bands
        const spiralCount = 3;
        for (let i = 0; i < spiralCount; i++) {
          const baseOffset = (i * Math.PI * 2) / spiralCount;
          for (let a = 0; a < Math.PI * 2.5; a += 0.08) {
            const rad = 25 + a * 28;
            if (rad > maxRadius - 10) break;
            const angle = a + baseOffset;
            const x = cx + rad * Math.cos(angle);
            const y = cy + rad * Math.sin(angle);

            // Intensity varies along eyewall
            const distFromEye = Math.abs(rad - 70);
            let color = '#0284c7'; // Light rain 20-30 dBZ
            if (distFromEye < 20) color = '#dc2626'; // Eyewall Core 50-60 dBZ
            else if (distFromEye < 40) color = '#eab308'; // Moderate rain 35-45 dBZ
            else color = '#10b981';

            if (product === 'velocity') {
              // Cyclonic Couplet (Inbound Left / Outbound Right)
              color = Math.cos(angle) > 0 ? '#10b981' : '#f43f5e';
            } else if (product === 'zdr') {
              color = distFromEye < 15 ? '#6366f1' : '#0ea5e9';
            }

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Cyclone Eye marker
        ctx.fillStyle = '#060d17';
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.stroke();

      } else if (scenario === 'squall') {
        // Severe Convective Squall Line with Hook Echo & Hail Core
        for (let yOffset = -120; yOffset <= 120; yOffset += 8) {
          const xOffset = -60 + Math.sin(yOffset * 0.03) * 35;
          const x = cx + xOffset;
          const y = cy + yOffset;

          // Hail core at center
          const isHailCore = Math.abs(yOffset) < 30;
          let color = '#22c55e';
          if (isHailCore) color = '#a855f7'; // Purple 65+ dBZ hail
          else if (Math.abs(yOffset) < 70) color = '#ef4444'; // Red 50 dBZ
          else color = '#eab308';

          if (product === 'velocity') {
            color = yOffset > 0 ? '#ef4444' : '#10b981';
          } else if (product === 'zdr') {
            color = isHailCore ? '#3b82f6' : '#ec4899'; // Negative ZDR for hail
          }

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fill();
        }

      } else {
        // Stratiform Rain with Bright Band (Melting Layer)
        for (let r = 40; r < maxRadius - 20; r += 12) {
          const isBrightBand = r > 90 && r < 125;
          for (let theta = 0; theta < Math.PI * 2; theta += 0.2) {
            const x = cx + r * Math.cos(theta);
            const y = cy + r * Math.sin(theta);
            ctx.fillStyle = isBrightBand ? '#f59e0b' : '#0284c7';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    drawWeatherPattern();

    // 5. Rotating Radar Sweep Beam
    const radSweep = (scanAngle * Math.PI) / 180;
    const beamGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
    beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
    beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.02)');

    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxRadius, radSweep - 0.25, radSweep);
    ctx.closePath();
    ctx.fill();

    // Beam Line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + maxRadius * Math.cos(radSweep), cy + maxRadius * Math.sin(radSweep));
    ctx.stroke();

    // 6. Central Radar Tower Marker
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

  }, [scanAngle, scenario, product, elevation]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;
    const r = Math.sqrt(x * x + y * y);
    const theta = Math.round((Math.atan2(y, x) * 180) / Math.PI + 180);
    const km = Math.round((r / (canvas.width / 2 - 25)) * 200);

    // Simulated dBZ based on position
    const simDbz = Math.min(65, Math.max(15, Math.round(55 - (r % 40) + Math.random() * 5)));
    setMousePos({ r: km, theta, x: Math.round(x), y: Math.round(y), dbz: simDbz });
  };

  // Rain rate calculator via Marshall-Palmer (Z = 200 * R^1.6)
  const calculateRainRate = (dbz) => {
    const zLinear = Math.pow(10, dbz / 10);
    const r = Math.pow(zLinear / 200, 1 / 1.6);
    return r.toFixed(1);
  };

  const handleMarkComplete = () => {
    setLabSubmitted(true);
    if (onCompleteLab) onCompleteLab();
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-400 text-xs font-semibold mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Digital Laboratory • Dual-Polarization Radar Simulator</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Interactive Doppler Weather Radar (DWR) Operational Console
          </h3>
          <p className="text-xs text-slate-400">
            Real-time PPI Volume Scan rendering with hydrometeor diagnostics and Marshall-Palmer QPE calculations.
          </p>
        </div>

        {labSubmitted ? (
          <span className="px-4 py-2 bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Lab Practical Verified</span>
          </span>
        ) : (
          <button
            onClick={handleMarkComplete}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform hover:scale-102"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Practical Lab as Completed</span>
          </button>
        )}
      </div>

      {/* Simulator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Radar Scope View (Canvas) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950 p-4 rounded-2xl border border-slate-800 relative">
          <canvas
            ref={canvasRef}
            width={420}
            height={420}
            onMouseMove={handleMouseMove}
            className="rounded-full shadow-2xl cursor-crosshair max-w-full"
          />

          {/* Radar Sweep Controls Overlay */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setIsScanning(!isScanning)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {isScanning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isScanning ? 'Freeze Sweep' : 'Resume Sweep'}</span>
            </button>
            <span className="text-xs font-mono text-sky-400">
              Azimuth: {Math.round(scanAngle)}° • PRF: 600 Hz
            </span>
          </div>

          {/* Color Scale Bar */}
          <div className="mt-3 w-full max-w-xs space-y-1">
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-sky-500 via-emerald-500 via-yellow-400 via-red-500 to-purple-600" />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>15 dBZ (Drizzle)</span>
              <span>35 dBZ (Rain)</span>
              <span>65 dBZ (Hail)</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Panel & Controls */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* 1. Case Selection */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-750 space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Operational Case Study Scenario
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => setScenario('cyclone')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                  scenario === 'cyclone'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
                }`}
              >
                1. Cyclone Biparjoy (Kandla S-Band DWR Eyewall)
              </button>
              <button
                onClick={() => setScenario('squall')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                  scenario === 'squall'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
                }`}
              >
                2. Severe Nor'wester / Kalbaishakhi (Kolkata C-Band)
              </button>
              <button
                onClick={() => setScenario('orographic')}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                  scenario === 'orographic'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
                }`}
              >
                3. Western Ghats Orographic Cloudburst (Mahabaleshwar)
              </button>
            </div>
          </div>

          {/* 2. Product & Elevation Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-750 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Radar Product</label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden"
              >
                <option value="reflectivity">Reflectivity (Z in dBZ)</option>
                <option value="velocity">Doppler Velocity (V in m/s)</option>
                <option value="zdr">Differential Reflectivity (ZDR)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-750 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Elevation Angle</label>
              <select
                value={elevation}
                onChange={(e) => setElevation(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden"
              >
                <option value="0.5">0.5° (Surveillance)</option>
                <option value="1.5">1.5° (Low Core)</option>
                <option value="3.0">3.0° (Mid Convective)</option>
              </select>
            </div>
          </div>

          {/* 3. Live Cursor Diagnostics & Marshall-Palmer Calculator */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-850 to-slate-900 border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-sky-400">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4" />
                <span>Live Target Crosshair Diagnostics</span>
              </span>
              <span className="font-mono">{mousePos.theta}° / {mousePos.r} km</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-slate-400 text-[10px] block">Calculated Reflectivity:</span>
                <span className="text-base font-mono font-bold text-amber-400">{mousePos.dbz} dBZ</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-slate-400 text-[10px] block">Marshall-Palmer Rain Rate:</span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  {calculateRainRate(mousePos.dbz)} mm/hr
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 pt-1 leading-snug">
              <strong>Meteorological Classification:</strong>{' '}
              {mousePos.dbz > 55 ? (
                <span className="text-purple-400 font-bold">Severe Hail Core / Mesocyclonic Torrential Rain</span>
              ) : mousePos.dbz > 40 ? (
                <span className="text-red-400 font-bold">Heavy Convective Downpour</span>
              ) : (
                <span className="text-sky-300 font-medium">Moderate Rain / Stratiform Cloud</span>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
