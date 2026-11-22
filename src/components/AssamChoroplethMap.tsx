import { useState } from 'react'
import type { DistrictDistress } from '../engine/types'
import { Waves, MapPin } from 'lucide-react'

interface AssamChoroplethMapProps {
  districts: DistrictDistress[]
  selectedDistrict: string
  onSelectDistrict: (name: string) => void
}

interface DistrictNodeLayout {
  id: string
  name: string
  x: number
  y: number
  w: number
  h: number
  labelOffset?: { x: number; y: number }
}

const DISTRICT_LAYOUTS: DistrictNodeLayout[] = [
  // Brahmaputra Valley (West to East)
  { id: 'AS-05', name: 'Dhubri', x: 25, y: 145, w: 72, h: 48 },
  { id: 'AS-07', name: 'Barpeta', x: 110, y: 125, w: 75, h: 48 },
  { id: 'AS-01', name: 'Kamrup Metropolitan', x: 200, y: 145, w: 90, h: 50 },
  { id: 'AS-09', name: 'Sonitpur', x: 290, y: 90, w: 82, h: 48 },
  { id: 'AS-06', name: 'Nagaon', x: 305, y: 155, w: 80, h: 48 },
  { id: 'AS-13', name: 'Lakhimpur', x: 410, y: 65, w: 84, h: 48 },
  { id: 'AS-15', name: 'Golaghat', x: 410, y: 135, w: 78, h: 46 },
  { id: 'AS-12', name: 'Jorhat', x: 500, y: 105, w: 76, h: 46 },
  { id: 'AS-08', name: 'Dibrugarh', x: 590, y: 75, w: 82, h: 48 },
  { id: 'AS-14', name: 'Tinsukia', x: 670, y: 40, w: 76, h: 48 },

  // Hill Districts (Central-South)
  { id: 'AS-11', name: 'Karbi Anglong', x: 385, y: 200, w: 94, h: 50 },
  { id: 'AS-10', name: 'Dima Hasao', x: 335, y: 265, w: 85, h: 48 },

  // Barak Valley (Southern basin)
  { id: 'AS-03', name: 'Karimganj', x: 260, y: 325, w: 82, h: 46 },
  { id: 'AS-04', name: 'Hailakandi', x: 350, y: 325, w: 80, h: 46 },
  { id: 'AS-02', name: 'Cachar', x: 440, y: 320, w: 86, h: 50 },
]

export const AssamChoroplethMap = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
}: AssamChoroplethMapProps) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictDistress | null>(null)

  const districtMap = new Map<string, DistrictDistress>(
    districts.map((d) => [d.name.toLowerCase(), d])
  )

  const getDistrictColor = (d?: DistrictDistress, isSelected = false) => {
    if (!d) return '#94a3b8'
    if (isSelected) return '#2563eb' // Active selected highlight
    if (d.isSurge) return '#e11d48' // Rose-600
    if (d.zScore >= 1.96) return '#d97706' // Amber-600
    return '#059669' // Emerald-600
  }

  const getDistrictBg = (d?: DistrictDistress, isSelected = false) => {
    if (!d) return 'rgba(148, 163, 184, 0.15)'
    if (isSelected) return 'rgba(37, 99, 235, 0.25)'
    if (d.isSurge) return 'rgba(225, 29, 72, 0.2)'
    if (d.zScore >= 1.96) return 'rgba(217, 119, 6, 0.2)'
    return 'rgba(5, 150, 105, 0.15)'
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
        <div>
          <span className="eyebrow">Geospatial Early Identification</span>
          <h2 className="text-base font-bold text-charcoal tracking-tight flex items-center gap-2 mt-0.5">
            <span className="icon-chip sm" style={{ ['--accent' as string]: 'var(--brand-1)' }}>
              <MapPin className="w-4 h-4" />
            </span>
            Assam District Distress Choropleth Map
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Real-time discrete Poisson tail anomaly topology ($Z$-scores) across riverine basins and hill tracts.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-xs shadow-rose-500/50"></span>
            <span className="text-muted">Surge ($Z \ge 2.50$, $p &lt; 0.01$)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-muted">Elevated ($Z \ge 1.96$)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-muted">Baseline ($Z &lt; 1.96$)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-muted">ASDMA Flood Inundated</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative bg-container rounded-xl border border-hairline p-3 overflow-hidden">
        <svg
          viewBox="0 0 760 385"
          className="w-full h-auto select-none font-sans"
          aria-label="Assam Mental Health Distress Choropleth Map"
        >
          <defs>
            {/* River Gradient */}
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.6" />
            </linearGradient>

            {/* Inundation Pattern */}
            <pattern id="floodPattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M0,5 Q2.5,2 5,5 T10,5" fill="none" stroke="#06b6d4" strokeWidth="0.8" opacity="0.6" />
            </pattern>
          </defs>

          {/* Regional Zone Labels (Watermarks) */}
          <text x="210" y="80" fill="currentColor" opacity="0.08" className="text-[28px] font-black uppercase tracking-widest pointer-events-none">
            Brahmaputra Valley
          </text>
          <text x="430" y="240" fill="currentColor" opacity="0.08" className="text-[22px] font-black uppercase tracking-widest pointer-events-none">
            Hill Tracts
          </text>
          <text x="310" y="375" fill="currentColor" opacity="0.08" className="text-[24px] font-black uppercase tracking-widest pointer-events-none">
            Barak Valley
          </text>

          {/* Brahmaputra River Vector (East to West) */}
          <path
            d="M 750,55 C 670,75 580,95 490,110 C 400,125 320,135 240,150 C 160,165 90,175 10,180"
            fill="none"
            stroke="url(#riverGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            opacity="0.75"
          />
          <text x="540" y="128" fill="#0284c7" className="text-[9px] font-bold uppercase tracking-wider opacity-70 pointer-events-none">
            Brahmaputra River Corridor &rarr;
          </text>

          {/* Barak River Vector (Barak Valley Basin) */}
          <path
            d="M 520,330 C 460,340 390,345 320,345 C 270,345 220,340 180,340"
            fill="none"
            stroke="url(#riverGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.75"
          />
          <text x="460" y="365" fill="#0284c7" className="text-[8.5px] font-bold uppercase tracking-wider opacity-70 pointer-events-none">
            Barak River &rarr;
          </text>

          {/* District Nodes */}
          {DISTRICT_LAYOUTS.map((node) => {
            const data = districtMap.get(node.name.toLowerCase())
            const isSelected = selectedDistrict === node.name
            const isSurge = data?.isSurge ?? false
            const isFlood = data?.floodCrisis ?? false
            const strokeColor = getDistrictColor(data, isSelected)
            const bgColor = getDistrictBg(data, isSelected)

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelectDistrict(node.name)}
                onMouseEnter={() => data && setHoveredDistrict(data)}
                onMouseLeave={() => setHoveredDistrict(null)}
              >
                {/* Outer Glow on Selected or Surge */}
                {(isSelected || isSurge) && (
                  <rect
                    x={node.x - 3}
                    y={node.y - 3}
                    width={node.w + 6}
                    height={node.h + 6}
                    rx="10"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    strokeDasharray={isSurge ? '4,2' : undefined}
                    opacity={isSelected ? 0.9 : 0.6}
                  />
                )}

                {/* Base District Card */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.w}
                  height={node.h}
                  rx="7"
                  fill={bgColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? '2' : '1.2'}
                  className="transition-colors hover:brightness-110"
                />

                {/* Flood Overlay Texture */}
                {isFlood && (
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.w}
                    height={node.h}
                    rx="7"
                    fill="url(#floodPattern)"
                    className="pointer-events-none"
                  />
                )}

                {/* District Name Label */}
                <text
                  x={node.x + node.w / 2}
                  y={node.y + 15}
                  textAnchor="middle"
                  fill="currentColor"
                  className="text-[10.5px] font-bold pointer-events-none text-charcoal"
                >
                  {node.name.length > 11 ? `${node.name.slice(0, 10)}.` : node.name}
                </text>

                {/* Calls and Z-Score Label */}
                <text
                  x={node.x + node.w / 2}
                  y={node.y + 29}
                  textAnchor="middle"
                  fill="currentColor"
                  className="text-[9.5px] font-mono font-semibold pointer-events-none opacity-85"
                >
                  {data ? `${data.callsLast30Days} calls` : '---'}
                </text>

                {/* Status Badge Tag */}
                <g transform={`translate(${node.x + node.w / 2 - 24}, ${node.y + 34})`}>
                  <rect
                    width="48"
                    height="11"
                    rx="3"
                    fill={isSurge ? '#f43f5e' : isFlood ? '#0891b2' : isSelected ? '#2563eb' : 'currentColor'}
                    opacity={isSurge || isFlood || isSelected ? 0.9 : 0.12}
                  />
                  <text
                    x="24"
                    y="8.5"
                    textAnchor="middle"
                    fill={isSurge || isFlood || isSelected ? '#ffffff' : 'currentColor'}
                    className="text-[7.5px] font-mono font-bold uppercase pointer-events-none"
                  >
                    {isSurge ? `Z=+${data?.zScore.toFixed(1)}` : isFlood ? 'Flood' : node.name === 'Cachar' ? 'Pilot' : `Z=${data?.zScore.toFixed(1)}`}
                  </text>
                </g>
              </g>
            )
          })}
        </svg>

        {/* Hover Inspection Tooltip */}
        {hoveredDistrict && (
          <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-md border border-hairline p-3.5 rounded-xl shadow-xl max-w-xs text-xs pointer-events-none z-20 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-start justify-between gap-2 border-b border-hairline pb-1.5">
              <div>
                <span className="font-bold text-charcoal text-sm">{hoveredDistrict.name}</span>
                <span className="text-[11px] text-muted block">{hoveredDistrict.zone}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hoveredDistrict.isSurge
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {hoveredDistrict.isSurge ? 'Surge Alert' : 'Normal'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-[10px] text-muted block uppercase">Observed</span>
                <span className="font-bold text-charcoal">{hoveredDistrict.callsLast30Days} calls</span>
              </div>
              <div>
                <span className="text-[10px] text-muted block uppercase">Expected</span>
                <span className="text-muted">{hoveredDistrict.poissonExpected} calls</span>
              </div>
              <div>
                <span className="text-[10px] text-muted block uppercase">Poisson Z</span>
                <span className="font-bold text-rose-700 dark:text-rose-400">+{hoveredDistrict.zScore.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted block uppercase">Significance</span>
                <span className="font-bold text-charcoal">{hoveredDistrict.pValueFormatted}</span>
              </div>
            </div>

            {hoveredDistrict.floodCrisis && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 p-1.5 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <Waves className="w-3.5 h-3.5 shrink-0" />
                <span>ASDMA Riverine Flood Multiplier Active (1.5x&ndash;2.5x)</span>
              </div>
            )}

            <div className="text-[10px] text-muted text-center pt-0.5">
              Click district node to filter entire system
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted pt-1">
        <span>Click any district tile to isolate its surveillance, clinic facilities, and patient records.</span>
        {selectedDistrict !== 'All Districts' && (
          <button
            onClick={() => onSelectDistrict('All Districts')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
          >
            Clear filter (Show All Districts)
          </button>
        )}
      </div>
    </div>
  )
}
