
import React from 'react';
import { STOPS } from '../constants';
import { Stop } from '../types';

interface BusMapProps {
  currentStopIndex: number;
  nextStopIndex: number;
  progress: number; // 0 to 1
}

const BusMap: React.FC<BusMapProps> = ({ currentStopIndex, nextStopIndex, progress }) => {
  const current = STOPS[currentStopIndex];
  const next = STOPS[nextStopIndex];

  // Interpolate bus position
  const busX = current.x + (next.x - current.x) * progress;
  const busY = current.y + (next.y - current.y) * progress;

  return (
    <div className="relative w-full h-[600px] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-xl font-bold text-gray-800">Live Route Map</h3>
        <p className="text-sm text-gray-500">Kasaragod to Kottayam Express</p>
      </div>

      <svg width="100%" height="100%" viewBox="0 0 500 650" className="bg-blue-50/30">
        {/* Background Decorative Coastline (Simple) */}
        <path 
          d="M 150 0 Q 180 300 130 650" 
          stroke="#e2e8f0" 
          strokeWidth="40" 
          fill="none" 
        />

        {/* Route Line */}
        <path
          d={`M ${STOPS.map(s => `${s.x} ${s.y}`).join(' L ')}`}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Progress Line */}
        <path
           d={`M ${STOPS.slice(0, currentStopIndex + 1).map(s => `${s.x} ${s.y}`).join(' L ')} L ${busX} ${busY}`}
           fill="none"
           stroke="#3b82f6"
           strokeWidth="4"
           strokeLinecap="round"
           className="route-path"
        />

        {/* Stops */}
        {STOPS.map((stop, idx) => {
          const isActive = idx === currentStopIndex;
          const isUpcoming = idx > currentStopIndex;
          return (
            <g key={stop.id}>
              <circle
                cx={stop.x}
                cy={stop.y}
                r={isActive ? "10" : "6"}
                fill={isActive ? "#3b82f6" : isUpcoming ? "#94a3b8" : "#10b981"}
                className={`transition-all duration-500 ${isActive ? 'ring-4 ring-blue-100' : ''}`}
              />
              <text
                x={stop.x + 15}
                y={stop.y + 5}
                className={`text-sm font-medium fill-current ${isActive ? 'text-blue-600 font-bold scale-110' : 'text-gray-400'}`}
              >
                {stop.name}
              </text>
            </g>
          );
        })}

        {/* Bus Marker */}
        <g transform={`translate(${busX - 15}, ${busY - 15})`}>
          <rect width="30" height="15" rx="4" fill="#1d4ed8" className="animate-bus" />
          <circle cx="8" cy="15" r="3" fill="#1e293b" />
          <circle cx="22" cy="15" r="3" fill="#1e293b" />
          <rect x="5" y="3" width="20" height="5" rx="1" fill="#bfdbfe" />
        </g>
      </svg>

      <div className="absolute bottom-6 left-6 right-6 flex justify-between bg-white/80 backdrop-blur p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Current</span>
          <p className="font-bold text-blue-600">{STOPS[currentStopIndex].name}</p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Next Stop</span>
          <p className="font-bold text-gray-800">{STOPS[nextStopIndex].name}</p>
        </div>
      </div>
    </div>
  );
};

export default BusMap;
