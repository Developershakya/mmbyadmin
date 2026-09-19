import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Navigation,
  MapPin,
  Clock,
  Layers,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';

export default function RouteMapLeaflet({
  route = [],
  stats = {},
  height = '280px',
  interactive = true,
  showControls = true,
  title = 'Route Map',
  className = ''
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routingData, setRoutingData] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrollHintTimeoutRef = useRef(null);

  // Normalize waypoints from route
  const validWaypoints = (Array.isArray(route) ? route : [])
    .map((step, idx) => {
      const lat = parseFloat(step.latitude || step.lat);
      const lng = parseFloat(step.longitude || step.lng || step.lon);
      return {
        ...step,
        order: typeof step.order === 'number' ? step.order : idx,
        latitude: lat,
        longitude: lng,
        hasCoords: !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      };
    })
    .filter(w => w.hasCoords);

  // Fetch real directions from our server-side routeService (backed by OSRM)
  useEffect(() => {
    let isMounted = true;
    if (validWaypoints.length < 2) {
      setRoutingData(null);
      return;
    }

    const fetchDirections = async () => {
      try {
        setLoading(true);
        setErrorNotice(null);
        const resp = await fetch('/api/route/directions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            waypoints: validWaypoints.map(w => ({
              name: w.name,
              latitude: w.latitude,
              longitude: w.longitude
            }))
          })
        });

        if (!resp.ok) {
          throw new Error(`Directions API returned ${resp.status}`);
        }

        const data = await resp.json();
        if (isMounted) {
          if (data.success) {
            setRoutingData(data);
            if (data.status === 'fallback') {
              setErrorNotice('Connecting via direct transit paths');
            }
          } else {
            setErrorNotice(data.error || 'Could not fetch road route');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Leaflet map directions fetch error:', err.message);
          setErrorNotice('Routing service unavailable; using direct path');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDirections();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(validWaypoints.map(w => `${w.latitude},${w.longitude}`))]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance once
    if (!mapInstanceRef.current) {
      const defaultCenter = validWaypoints.length > 0
        ? [validWaypoints[0].latitude, validWaypoints[0].longitude]
        : [28.6139, 77.2090]; // Delhi

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 9,
        zoomControl: false, // Using our custom non-overlapping + / - controls
        scrollWheelZoom: false, // Prevent wheel scroll hijacking full page scroll
        touchZoom: true, // Smooth pinch zoom on touch devices
        doubleClickZoom: true,
        boxZoom: true,
        attributionControl: false
      });

      // Handle Ctrl + wheel zoom behavior
      const container = mapContainerRef.current;
      const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
          // If Ctrl or Meta is held, allow zooming via wheel
          e.preventDefault();
          if (e.deltaY < 0) {
            map.zoomIn(1);
          } else if (e.deltaY > 0) {
            map.zoomOut(1);
          }
        } else {
          // User is scrolling the page over the map
          setShowScrollHint(true);
          if (scrollHintTimeoutRef.current) {
            clearTimeout(scrollHintTimeoutRef.current);
          }
          scrollHintTimeoutRef.current = setTimeout(() => {
            setShowScrollHint(false);
          }, 1400);
        }
      };

      container.addEventListener('wheel', handleWheel, { passive: false });

      // Standard OSM Tile Layer with attribution
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // Attribution control in bottom right
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>')
        .addTo(map);

      mapInstanceRef.current = map;
      polylineLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const polylineLayer = polylineLayerRef.current;
    const markersLayer = markersLayerRef.current;

    // Clear previous layers
    polylineLayer.clearLayers();
    markersLayer.clearLayers();

    if (validWaypoints.length === 0) return;

    const bounds = L.latLngBounds([]);

    // 1. Draw Checkpoint Markers with sequential numbers (1, 2, 3...) and sleek compact size
    validWaypoints.forEach((wp, index) => {
      const isStart = index === 0;
      const isEnd = index === validWaypoints.length - 1;
      const latLng = [wp.latitude, wp.longitude];
      bounds.extend(latLng);

      // Sequential numbering: 1 for start, 2, 3... N for destination. No A or B.
      const badgeNumber = index + 1;

      // Compact, high-contrast, beautiful marker design (24x24px)
      let bgColor = '#FFFFFF';
      let textColor = '#0F172A';
      let borderColor = '#94A3B8';

      if (isStart) {
        bgColor = '#2563EB'; // Royal Blue for Start (1)
        textColor = '#FFFFFF';
        borderColor = '#1D4ED8';
      } else if (isEnd) {
        bgColor = '#EA580C'; // Vivid Orange for Final Destination
        textColor = '#FFFFFF';
        borderColor = '#C2410C';
      }

      const iconHtml = `
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${bgColor};
          color: ${textColor};
          border: 2px solid ${borderColor};
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 11px;
          line-height: 1;
          font-family: system-ui, -apple-system, sans-serif;
          cursor: pointer;
          transition: transform 0.15s ease;
        " class="route-marker-badge hover:scale-110">
          ${badgeNumber}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-route-marker-compact',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14]
      });

      const popupContent = `
        <div style="padding: 4px; font-family: system-ui, sans-serif; min-width: 140px;">
          <div style="font-size: 10px; font-weight: 700; color: ${isStart ? '#2563EB' : isEnd ? '#EA580C' : '#64748B'}; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">
            ${isStart ? `● 1 · Starting Point` : isEnd ? `● ${badgeNumber} · Final Destination` : `● Stop ${badgeNumber}`}
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #0F172A; line-height: 1.2;">
            ${wp.name}
          </div>
          ${wp.time ? `<div style="font-size: 11px; color: #475569; margin-top: 3px;">🕒 ${wp.time}</div>` : ''}
          ${wp.distance ? `<div style="font-size: 11px; color: #EA580C; font-weight: 600; margin-top: 2px;">📍 ${wp.distance}</div>` : ''}
          <div style="font-size: 9px; color: #94A3B8; margin-top: 4px;">${wp.latitude.toFixed(4)}°N, ${wp.longitude.toFixed(4)}°E</div>
        </div>
      `;

      const marker = L.marker(latLng, { icon: customIcon }).bindPopup(popupContent);
      markersLayer.addLayer(marker);
    });

    // 2. Draw Real Road Route Polyline (from OSRM geometry if available, else straight segments)
    let polylinePoints = [];
    if (routingData && routingData.geometry && Array.isArray(routingData.geometry.coordinates)) {
      // OSRM coordinates are [lon, lat], Leaflet needs [lat, lon]
      polylinePoints = routingData.geometry.coordinates.map(coord => [coord[1], coord[0]]);
    } else {
      // Fallback straight segments connecting valid waypoints
      polylinePoints = validWaypoints.map(w => [w.latitude, w.longitude]);
    }

    if (polylinePoints.length > 1) {
      // Underline / casing line for contrast
      const casingLine = L.polyline(polylinePoints, {
        color: '#FFFFFF',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      });
      polylineLayer.addLayer(casingLine);

      // Active Route line
      const mainLine = L.polyline(polylinePoints, {
        color: '#F97316',
        weight: 3.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: routingData?.status === 'fallback' ? '6, 8' : undefined
      });
      polylineLayer.addLayer(mainLine);

      polylinePoints.forEach(p => bounds.extend(p));
    }

    // 3. Auto-fit bounds with padding
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 14
      });
    }

    // Force tile recalculation after layout
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

  }, [validWaypoints.length, routingData, isFullscreen]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scrollHintTimeoutRef.current) {
        clearTimeout(scrollHintTimeoutRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleRecenter = () => {
    if (mapInstanceRef.current && validWaypoints.length > 0) {
      const bounds = L.latLngBounds(validWaypoints.map(w => [w.latitude, w.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const totalDist = routingData?.totalDistance || stats.totalDistance;
  const totalDuration = routingData?.totalDuration || stats.totalTime;

  // Render empty state if no coordinates
  if (validWaypoints.length === 0) {
    return (
      <div className={`bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center ${className}`}>
        <Navigation className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-xs font-bold text-slate-700">No Geographic Coordinates Found</h4>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
          Add route checkpoints with verified locations to render the interactive live GPS road map.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl flex flex-col' : className
      }`}
    >
      {/* Top Header Bar (Distance summary pill on left, Map Controls on right - NO overlap) */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none gap-2">
        {/* Route distance summary pill */}
        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white shadow-md pointer-events-auto flex items-center gap-2 min-w-0">
          <Navigation className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
          <div className="text-left min-w-0">
            <div className="text-[11px] font-bold leading-tight flex items-center gap-1.5 truncate">
              <span className="truncate">{title}</span>
              {totalDist && (
                <span className="text-orange-400 font-extrabold shrink-0">· {totalDist}</span>
              )}
            </div>
            {totalDuration && (
              <div className="text-[9px] text-slate-400 leading-tight truncate">
                Est. driving time: {totalDuration}
              </div>
            )}
          </div>
        </div>

        {/* Dedicated Map Control Actions (Zoom In, Zoom Out, Recenter, Fullscreen) */}
        {showControls && (
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 transition-colors shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 transition-colors shadow-md active:scale-95 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRecenter}
              title="Reset View / Center Route"
              className="p-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 transition-colors shadow-md active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Full View' : 'Expand Map'}
              className="p-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 transition-colors shadow-md active:scale-95 cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Touchpad / Wheel scroll helper banner */}
      {showScrollHint && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-[450] flex justify-center pointer-events-none animate-in fade-in duration-200">
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-semibold shadow-xl">
            Use <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[11px] font-mono border border-slate-600">Ctrl</kbd> + scroll to zoom map, or use the <strong>+ / -</strong> buttons
          </div>
        </div>
      )}

      {/* Leaflet Map Stage */}
      <div
        ref={mapContainerRef}
        style={{ height: isFullscreen ? '100%' : height }}
        className="w-full bg-slate-950 z-0"
      />

      {/* Footer Info Strip */}
      <div className="absolute bottom-2 left-3 right-3 z-[400] pointer-events-none flex items-center justify-between text-[10px]">
        <div className="bg-slate-900/85 backdrop-blur-md text-slate-300 px-2.5 py-1 rounded-lg border border-white/10 shadow-sm flex items-center gap-1.5 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{validWaypoints.length} Checkpoints</span>
          {routingData?.status === 'osrm' && (
            <span className="text-slate-400 hidden sm:inline">· OpenStreetMap Road Route</span>
          )}
        </div>

        {errorNotice && (
          <div className="bg-amber-950/90 backdrop-blur-md text-amber-200 px-2.5 py-1 rounded-lg border border-amber-500/30 text-[9px] pointer-events-auto flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>{errorNotice}</span>
          </div>
        )}
      </div>
    </div>
  );
}
