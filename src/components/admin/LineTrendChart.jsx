import React, { useState, useMemo } from 'react';
import { BarChart3, LineChart as LineChartIcon, Check, Layers } from 'lucide-react';

const SERVICES_CONFIG = [
  {
    id: 'package',
    label: 'Holiday Packages',
    shortLabel: 'Packages',
    color: '#F97316', // Orange
    stopColor: '#EA580C',
    fillOpacity: 0.12,
    dash: '0'
  },
  {
    id: 'flight',
    label: 'Flights',
    shortLabel: 'Flights',
    color: '#2563EB', // Blue
    stopColor: '#1D4ED8',
    fillOpacity: 0.10,
    dash: '0'
  },
  {
    id: 'hotel',
    label: 'Hotels & Stays',
    shortLabel: 'Hotels',
    color: '#10B981', // Emerald
    stopColor: '#059669',
    fillOpacity: 0.10,
    dash: '0'
  },
  {
    id: 'bus',
    label: 'Buses',
    shortLabel: 'Buses',
    color: '#F59E0B', // Amber
    stopColor: '#D97706',
    fillOpacity: 0.10,
    dash: '0'
  },
  {
    id: 'car',
    label: 'Cabs & Transfers',
    shortLabel: 'Cabs',
    color: '#8B5CF6', // Purple
    stopColor: '#7C3AED',
    fillOpacity: 0.10,
    dash: '0'
  }
];

export default function LineTrendChart({
  data = [],
  activeService = 'ALL',
  period = '7d'
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [chartType, setChartType] = useState('line'); // 'line' | 'bar'
  const [showTotalLine, setShowTotalLine] = useState(false);
  const [visibleServices, setVisibleServices] = useState({
    package: true,
    flight: true,
    hotel: true,
    bus: true,
    car: true
  });

  // Toggle individual service line visibility
  const toggleService = (id) => {
    setVisibleServices(prev => {
      const next = { ...prev, [id]: !prev[id] };
      // Keep at least one active
      if (!Object.values(next).some(Boolean)) return prev;
      return next;
    });
  };

  const selectAllServices = () => {
    setVisibleServices({
      package: true,
      flight: true,
      hotel: true,
      bus: true,
      car: true
    });
  };

  // Dimensions
  const svgWidth = 680;
  const svgHeight = 240;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartAreaWidth = svgWidth - paddingLeft - paddingRight;
  const chartAreaHeight = svgHeight - paddingTop - paddingBottom;

  // Filter services to display
  const activeServiceList = useMemo(() => {
    if (activeService !== 'ALL') {
      return SERVICES_CONFIG.filter(s => s.id === activeService);
    }
    return SERVICES_CONFIG.filter(s => visibleServices[s.id]);
  }, [activeService, visibleServices]);

  // Compute maximum value for scaling
  const niceMax = useMemo(() => {
    if (!data || data.length === 0) return 100;
    let max = 0;
    data.forEach(item => {
      if (showTotalLine && activeService === 'ALL') {
        if (item.total > max) max = item.total;
      }
      SERVICES_CONFIG.forEach(s => {
        const val = item[s.id] || 0;
        if (val > max) max = val;
      });
    });

    if (activeService === 'ALL' && showTotalLine) {
      return Math.ceil(max / 50) * 50;
    }

    // Individual lines max cushion
    return Math.max(Math.ceil((max * 1.2) / 10) * 10, 50);
  }, [data, activeService, showTotalLine]);

  // Construct smooth bezier curve path
  const createSmoothPath = (pts) => {
    if (!pts || pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  // Compute points and paths for each active service
  const servicePaths = useMemo(() => {
    if (!data || data.length === 0) return [];

    return activeServiceList.map(svc => {
      const pts = data.map((item, index) => {
        const x = paddingLeft + (index / (data.length - 1)) * chartAreaWidth;
        const val = item[svc.id] || 0;
        const y = paddingTop + chartAreaHeight - (val / niceMax) * chartAreaHeight;
        return { x, y, val, item, service: svc };
      });

      const linePath = createSmoothPath(pts);
      const areaPath = pts.length > 0
        ? `${linePath} L ${pts[pts.length - 1].x} ${paddingTop + chartAreaHeight} L ${pts[0].x} ${paddingTop + chartAreaHeight} Z`
        : '';

      return {
        service: svc,
        points: pts,
        linePath,
        areaPath
      };
    });
  }, [data, activeServiceList, niceMax, chartAreaWidth, chartAreaHeight]);

  // Total line path if toggled
  const totalPathData = useMemo(() => {
    if (!data || data.length === 0 || !showTotalLine || activeService !== 'ALL') return null;
    const pts = data.map((item, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * chartAreaWidth;
      const val = item.total || 0;
      const y = paddingTop + chartAreaHeight - (val / niceMax) * chartAreaHeight;
      return { x, y, val, item };
    });
    return {
      points: pts,
      path: createSmoothPath(pts)
    };
  }, [data, showTotalLine, activeService, niceMax, chartAreaWidth, chartAreaHeight]);

  // 4 horizontal grid steps
  const gridSteps = [0, 0.25, 0.5, 0.75, 1];

  if (!data || data.length === 0) return null;

  const activeDayItem = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoverX = hoveredIndex !== null
    ? paddingLeft + (hoveredIndex / (data.length - 1)) * chartAreaWidth
    : null;

  return (
    <div className="w-full">
      {/* Chart Top Controls & Multi-Line Interactive Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-100">
        {/* Left: View style toggle & Total Line switch */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                chartType === 'line'
                  ? 'bg-white text-orange-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Multi-Line Trend</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                chartType === 'bar'
                  ? 'bg-white text-orange-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Stacked Segment</span>
            </button>
          </div>

          {activeService === 'ALL' && (
            <button
              type="button"
              onClick={() => setShowTotalLine(!showTotalLine)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                showTotalLine
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
              title="Toggle aggregate total bookings curve"
            >
              <span className="w-2 h-0.5 bg-current rounded-full" />
              <span>Aggregate Total</span>
            </button>
          )}
        </div>

        {/* Right: Individual Colored Line Toggles */}
        {activeService === 'ALL' ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lines:</span>
            {SERVICES_CONFIG.map(svc => {
              const isVisible = visibleServices[svc.id];
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => toggleService(svc.id)}
                  style={{
                    borderColor: isVisible ? svc.color : '#E2E8F0',
                    backgroundColor: isVisible ? `${svc.color}15` : '#F8FAFC',
                    color: isVisible ? svc.color : '#94A3B8'
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer hover:shadow-2xs"
                  title={`Click to toggle ${svc.label} line`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isVisible ? svc.color : '#CBD5E1' }}
                  />
                  <span>{svc.shortLabel}</span>
                  {isVisible && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
            <span>Viewing:</span>
            <span
              className="px-2.5 py-0.5 rounded-full text-white text-xs font-bold"
              style={{ backgroundColor: SERVICES_CONFIG.find(s => s.id === activeService)?.color || '#F97316' }}
            >
              {SERVICES_CONFIG.find(s => s.id === activeService)?.label}
            </span>
          </div>
        )}
      </div>

      {chartType === 'line' ? (
        <div className="relative w-full overflow-hidden select-none">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-56 sm:h-64 overflow-visible"
          >
            <defs>
              {/* Gradients for each service */}
              {SERVICES_CONFIG.map(svc => (
                <linearGradient key={`grad-${svc.id}`} id={`grad-${svc.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={svc.color} stopOpacity={svc.fillOpacity * 2.2} />
                  <stop offset="60%" stopColor={svc.color} stopOpacity={svc.fillOpacity * 0.5} />
                  <stop offset="100%" stopColor={svc.color} stopOpacity="0" />
                </linearGradient>
              ))}

              {/* Total Aggregate Gradient */}
              <linearGradient id="grad-total" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F172A" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-axis labels */}
            {gridSteps.map((step, idx) => {
              const yVal = paddingTop + chartAreaHeight - step * chartAreaHeight;
              const labelVal = Math.round(step * niceMax);
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={yVal}
                    x2={svgWidth - paddingRight}
                    y2={yVal}
                    stroke="#F1F5F9"
                    strokeDasharray={idx === 0 ? '0' : '4 4'}
                    strokeWidth="1.2"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={yVal + 3.5}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94A3B8"
                    fontWeight="600"
                    fontFamily="inherit"
                  >
                    {labelVal}
                  </text>
                </g>
              );
            })}

            {/* Vertical Day Gridlines & Bottom Tick Marks for every day */}
            {data.map((_, idx) => {
              const x = paddingLeft + (idx / (data.length - 1)) * chartAreaWidth;
              const isHovered = hoveredIndex === idx;
              return (
                <g key={`day-guide-${idx}`}>
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartAreaHeight}
                    stroke={isHovered ? "#E2E8F0" : "#F8FAFC"}
                    strokeDasharray={idx === 0 || idx === data.length - 1 ? "0" : "3 3"}
                    strokeWidth="1"
                  />
                  {/* Axis tick mark */}
                  <line
                    x1={x}
                    y1={paddingTop + chartAreaHeight}
                    x2={x}
                    y2={paddingTop + chartAreaHeight + 5}
                    stroke={isHovered ? "#94A3B8" : "#E2E8F0"}
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}

            {/* Area Fills for single focused service or subtle backdrops */}
            {activeService !== 'ALL' && servicePaths.map(sp => (
              <path
                key={`area-${sp.service.id}`}
                d={sp.areaPath}
                fill={`url(#grad-${sp.service.id})`}
                className="transition-all duration-300"
              />
            ))}

            {/* If All services and only 1 service selected */}
            {activeService === 'ALL' && servicePaths.length === 1 && (
              <path
                d={servicePaths[0].areaPath}
                fill={`url(#grad-${servicePaths[0].service.id})`}
                className="transition-all duration-300"
              />
            )}

            {/* Optional Total Curve */}
            {totalPathData && (
              <path
                d={totalPathData.path}
                fill="none"
                stroke="#0F172A"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                strokeOpacity="0.75"
                className="transition-all duration-300 drop-shadow-xs"
              />
            )}

            {/* 5 Distinct Service Curves with their individual colors */}
            {servicePaths.map(sp => (
              <path
                key={`line-${sp.service.id}`}
                d={sp.linePath}
                fill="none"
                stroke={sp.service.color}
                strokeWidth={activeService === sp.service.id ? "3.5" : "2.6"}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 drop-shadow-xs"
              />
            ))}

            {/* Permanent Data Points (Dots) on EVERY day for each line */}
            {servicePaths.map(sp => (
              <g key={`points-group-${sp.service.id}`}>
                {sp.points.map((pt, pIdx) => {
                  const isHovered = hoveredIndex === pIdx;
                  return (
                    <g key={`point-${sp.service.id}-${pIdx}`}>
                      {/* Outer pulse glow on active day */}
                      {isHovered && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="9"
                          fill={sp.service.color}
                          fillOpacity="0.22"
                          className="pointer-events-none"
                        />
                      )}
                      {/* Visible circle node at each day coordinate */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 5.5 : 3.8}
                        fill="#FFFFFF"
                        stroke={sp.service.color}
                        strokeWidth={isHovered ? 3 : 2.2}
                        className="transition-all duration-150 drop-shadow-xs pointer-events-none"
                      />
                    </g>
                  );
                })}
              </g>
            ))}

            {/* Permanent Points for Total line if enabled */}
            {totalPathData && (
              <g key="points-group-total">
                {totalPathData.points.map((pt, pIdx) => {
                  const isHovered = hoveredIndex === pIdx;
                  return (
                    <circle
                      key={`point-total-${pIdx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#FFFFFF"
                      stroke="#0F172A"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-150 pointer-events-none"
                    />
                  );
                })}
              </g>
            )}

            {/* X-axis labels */}
            {data.map((item, idx) => {
              const x = paddingLeft + (idx / (data.length - 1)) * chartAreaWidth;
              const isHovered = hoveredIndex === idx;
              return (
                <g key={`label-${idx}`}>
                  <text
                    x={x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fill={isHovered ? '#0F172A' : '#64748B'}
                    fontWeight={isHovered ? '700' : '600'}
                    fontFamily="inherit"
                    className="transition-colors"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}

            {/* Active Hover Vertical Ruler */}
            {hoverX !== null && (
              <line
                x1={hoverX}
                y1={paddingTop - 5}
                x2={hoverX}
                y2={paddingTop + chartAreaHeight}
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}

            {/* Transparent hover hit boxes across columns */}
            {data.map((_, idx) => {
              const colWidth = chartAreaWidth / (data.length - 1 || 1);
              const xCenter = paddingLeft + (idx / (data.length - 1)) * chartAreaWidth;
              return (
                <rect
                  key={`hitbox-${idx}`}
                  x={xCenter - colWidth / 2}
                  y={paddingTop - 10}
                  width={colWidth}
                  height={chartAreaHeight + paddingBottom + 10}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>

          {/* Interactive Floating Tooltip displaying all service counts */}
          {activeDayItem && hoverX !== null && (
            <div
              className="absolute pointer-events-none transition-all duration-100 z-30 bg-slate-900/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 min-w-[200px]"
              style={{
                left: `${(hoverX / svgWidth) * 100}%`,
                top: '10px',
                transform: hoverX > svgWidth * 0.65 ? 'translateX(-105%)' : hoverX < svgWidth * 0.35 ? 'translateX(5%)' : 'translateX(-50%)'
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
                <span className="font-bold text-white text-sm">{activeDayItem.label}</span>
                <span className="font-mono text-orange-400 font-bold text-xs bg-orange-950/70 px-2 py-0.5 rounded-md border border-orange-500/30">
                  {activeDayItem.total} Total
                </span>
              </div>

              <div className="space-y-1.5">
                {SERVICES_CONFIG.map(svc => {
                  const val = activeDayItem[svc.id] || 0;
                  const isVisible = visibleServices[svc.id] || activeService === svc.id;
                  return (
                    <div
                      key={svc.id}
                      className={`flex items-center justify-between text-[11px] ${
                        isVisible ? 'text-slate-200' : 'text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: svc.color }}
                        />
                        <span>{svc.label}</span>
                      </div>
                      <span className="font-mono font-bold text-white">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Alternative Multi-Service Stacked Bar View */
        <div className="h-60 flex items-end justify-between gap-3 px-2 pt-6">
          {data.map((item, idx) => {
            const packageH = (item.package / (niceMax * 2.5)) * 100;
            const flightH = (item.flight / (niceMax * 2.5)) * 100;
            const hotelH = (item.hotel / (niceMax * 2.5)) * 100;
            const busH = (item.bus / (niceMax * 2.5)) * 100;
            const carH = (item.car / (niceMax * 2.5)) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="relative w-full max-w-[48px] flex flex-col justify-end items-center h-full">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-2.5 rounded-lg whitespace-nowrap pointer-events-none transition-opacity z-20 shadow-xl border border-slate-700">
                    <span className="text-orange-400 font-bold">{item.label}:</span> {item.total} Bookings
                  </div>

                  {/* 5-Color Stacked Bar */}
                  <div className="w-full flex flex-col justify-end rounded-t-xl overflow-hidden shadow-2xs">
                    <div style={{ height: `${packageH}%` }} className="w-full bg-[#F97316] transition-all hover:brightness-110" title="Packages" />
                    <div style={{ height: `${flightH}%` }} className="w-full bg-[#2563EB] transition-all hover:brightness-110" title="Flights" />
                    <div style={{ height: `${hotelH}%` }} className="w-full bg-[#10B981] transition-all hover:brightness-110" title="Hotels" />
                    <div style={{ height: `${busH}%` }} className="w-full bg-[#F59E0B] transition-all hover:brightness-110" title="Buses" />
                    <div style={{ height: `${carH}%` }} className="w-full bg-[#8B5CF6] transition-all hover:brightness-110" title="Cabs" />
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
