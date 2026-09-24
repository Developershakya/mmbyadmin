"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Navigation,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

export default function RouteMapLeaflet({
  route = [],
  stats = {},
  height = "280px",
  interactive = true,
  showControls = true,
  title = "Route Map",
  className = "",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const leafletRef = useRef(null);

  const polylineLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  const scrollHintTimeoutRef = useRef(null);
  const wheelHandlerRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routingData, setRoutingData] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  // =========================================================
  // NORMALIZE ROUTE WAYPOINTS
  // =========================================================

  const validWaypoints = useMemo(() => {
    return (Array.isArray(route) ? route : [])
      .map((step, idx) => {
        const lat = parseFloat(step?.latitude ?? step?.lat);
        const lng = parseFloat(step?.longitude ?? step?.lng ?? step?.lon);

        return {
          ...step,
          order: typeof step?.order === "number" ? step.order : idx,
          latitude: lat,
          longitude: lng,
          hasCoords:
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180 &&
            !(lat === 0 && lng === 0),
        };
      })
      .filter((waypoint) => waypoint.hasCoords)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [route]);

  const waypointKey = useMemo(() => {
    return validWaypoints
      .map((w) => `${w.latitude},${w.longitude}`)
      .join("|");
  }, [validWaypoints]);

  // =========================================================
  // FETCH REAL ROAD DIRECTIONS
  // =========================================================

  useEffect(() => {
    let isMounted = true;

    if (validWaypoints.length < 2) {
      setRoutingData(null);
      setLoading(false);
      setErrorNotice(null);
      return;
    }

    const fetchDirections = async () => {
      try {
        setLoading(true);
        setErrorNotice(null);

        const response = await fetch("/api/route/directions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            waypoints: validWaypoints.map((w) => ({
              name: w.name,
              latitude: w.latitude,
              longitude: w.longitude,
            })),
          }),
        });

        if (!response.ok) throw new Error(`Directions API returned ${response.status}`);

        const data = await response.json();
        if (!isMounted) return;

        if (data.success) {
          setRoutingData(data);
          setErrorNotice(data.status === "fallback" ? "Connecting via direct transit paths" : null);
        } else {
          setRoutingData(null);
          setErrorNotice(data.error || "Could not fetch road route");
        }
      } catch (error) {
        if (!isMounted) return;
        console.warn("Leaflet map directions fetch error:", error?.message);
        setRoutingData(null);
        setErrorNotice("Routing service unavailable; using direct path");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDirections();
    return () => { isMounted = false; };
  }, [waypointKey]);

  // =========================================================
  // INITIALIZE MAP ONCE
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const initializeMap = async () => {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return; // already created

      try {
        if (!leafletRef.current) {
          const leafletModule = await import("leaflet");
          if (cancelled) return;
          leafletRef.current = leafletModule.default || leafletModule;
        }

        const L = leafletRef.current;
        if (!L || !mapContainerRef.current || cancelled) return;

        const defaultCenter =
          validWaypoints.length > 0
            ? [validWaypoints[0].latitude, validWaypoints[0].longitude]
            : [28.6139, 77.209];

        const map = L.map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 9,
          zoomControl: false,
          scrollWheelZoom: false,
          touchZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          attributionControl: false,
          dragging: interactive,
          keyboard: interactive,
        });

        // Custom wheel handler
        const container = mapContainerRef.current;
        const handleWheel = (event) => {
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (event.deltaY < 0) map.zoomIn(1);
            else if (event.deltaY > 0) map.zoomOut(1);
            return;
          }
          setShowScrollHint(true);
          if (scrollHintTimeoutRef.current) clearTimeout(scrollHintTimeoutRef.current);
          scrollHintTimeoutRef.current = setTimeout(() => setShowScrollHint(false), 1400);
        };
        wheelHandlerRef.current = handleWheel;
        container.addEventListener("wheel", handleWheel, { passive: false });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          subdomains: ["a", "b", "c"],
        }).addTo(map);

        L.control
          .attribution({ position: "bottomright", prefix: false })
          .addAttribution(
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
          )
          .addTo(map);

        mapInstanceRef.current = map;
        // Order matters: polylines BELOW markers
        polylineLayerRef.current = L.layerGroup().addTo(map);
        markersLayerRef.current = L.layerGroup().addTo(map);

        // Give Leaflet the correct container size after layout settles
        requestAnimationFrame(() => map.invalidateSize());
        setTimeout(() => map.invalidateSize(), 250);
      } catch (error) {
        console.error("Leaflet initialization error:", error);
        if (!cancelled) setErrorNotice("Map could not be initialized");
      }
    };

    initializeMap();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive]);

  // =========================================================
  // DRAW / REDRAW ROUTE WHEN WAYPOINTS OR ROUTING CHANGE
  // =========================================================

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const polylineLayer = polylineLayerRef.current;
    const markersLayer = markersLayerRef.current;

    if (!L || !map || !polylineLayer || !markersLayer) return;

    polylineLayer.clearLayers();
    markersLayer.clearLayers();

    if (validWaypoints.length === 0) return;

    const bounds = L.latLngBounds([]);

    // ---------- MARKERS ----------
    validWaypoints.forEach((waypoint, index) => {
      const isStart = index === 0;
      const isEnd = index === validWaypoints.length - 1;
      const latLng = [waypoint.latitude, waypoint.longitude];
      bounds.extend(latLng);

      const badgeNumber = index + 1;

      let bgColor = "#FFFFFF";
      let textColor = "#0F172A";
      let borderColor = "#94A3B8";
      if (isStart) { bgColor = "#2563EB"; textColor = "#FFFFFF"; borderColor = "#1D4ED8"; }
      else if (isEnd) { bgColor = "#EA580C"; textColor = "#FFFFFF"; borderColor = "#C2410C"; }

      const iconHtml = `
        <div style="
          width: 26px; height: 26px; border-radius: 50%;
          background: ${bgColor}; color: ${textColor};
          border: 2px solid ${borderColor};
          box-shadow: 0 2px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 11px; line-height: 1;
          font-family: system-ui, -apple-system, sans-serif;
        ">${badgeNumber}</div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-route-marker-compact",
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -14],
      });

      const safeName = waypoint.name || "Route Point";
      const popupContent = `
        <div style="padding:4px;font-family:system-ui,sans-serif;min-width:140px;">
          <div style="font-size:10px;font-weight:700;color:${
            isStart ? "#2563EB" : isEnd ? "#EA580C" : "#64748B"
          };text-transform:uppercase;margin-bottom:2px;letter-spacing:0.5px;">
            ${
              isStart
                ? "● 1 · Starting Point"
                : isEnd
                ? `● ${badgeNumber} · Final Destination`
                : `● Stop ${badgeNumber}`
            }
          </div>
          <div style="font-size:13px;font-weight:800;color:#0F172A;line-height:1.2;">${safeName}</div>
          ${waypoint.time ? `<div style="font-size:11px;color:#475569;margin-top:3px;">🕒 ${waypoint.time}</div>` : ""}
          ${waypoint.distance ? `<div style="font-size:11px;color:#EA580C;font-weight:600;margin-top:2px;">📍 ${waypoint.distance}</div>` : ""}
          <div style="font-size:9px;color:#94A3B8;margin-top:4px;">
            ${waypoint.latitude.toFixed(4)}°N, ${waypoint.longitude.toFixed(4)}°E
          </div>
        </div>
      `;

      const marker = L.marker(latLng, { icon: customIcon }).bindPopup(popupContent);
      markersLayer.addLayer(marker);
    });

    // ---------- POLYLINE ----------
    let polylinePoints = [];

    if (
      routingData?.geometry &&
      Array.isArray(routingData.geometry.coordinates) &&
      routingData.geometry.coordinates.length > 1
    ) {
      // OSRM: [lng, lat] → Leaflet [lat, lng]
      polylinePoints = routingData.geometry.coordinates.map((coord) => [coord[1], coord[0]]);
    } else {
      polylinePoints = validWaypoints.map((w) => [w.latitude, w.longitude]);
    }

    if (polylinePoints.length > 1) {
      // Casing (white halo)
      polylineLayer.addLayer(
        L.polyline(polylinePoints, {
          color: "#FFFFFF",
          weight: 6,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
        })
      );

      // Main orange route
      polylineLayer.addLayer(
        L.polyline(polylinePoints, {
          color: "#F97316",
          weight: 3.5,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
          dashArray: routingData?.status === "fallback" ? "6, 8" : undefined,
        })
      );

      polylinePoints.forEach((point) => bounds.extend(point));
    }

    // ---------- FIT ----------
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }

    // ---------- INVALIDATE ----------
    requestAnimationFrame(() => map.invalidateSize());
  }, [waypointKey, routingData, validWaypoints]);

  // =========================================================
  // RESIZE WHEN FULLSCREEN TOGGLES
  // =========================================================

  useEffect(() => {
    if (mapInstanceRef.current) {
      requestAnimationFrame(() => mapInstanceRef.current?.invalidateSize());
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 250);
    }
  }, [isFullscreen]);

  // =========================================================
  // CLEANUP ON UNMOUNT
  // =========================================================

  useEffect(() => {
    return () => {
      if (scrollHintTimeoutRef.current) clearTimeout(scrollHintTimeoutRef.current);

      if (mapContainerRef.current && wheelHandlerRef.current) {
        mapContainerRef.current.removeEventListener("wheel", wheelHandlerRef.current);
        wheelHandlerRef.current = null;
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      polylineLayerRef.current = null;
      markersLayerRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  // =========================================================
  // CONTROLS
  // =========================================================

  const handleRecenter = async () => {
    if (!mapInstanceRef.current || validWaypoints.length === 0) return;
    try {
      if (!leafletRef.current) {
        const leafletModule = await import("leaflet");
        leafletRef.current = leafletModule.default || leafletModule;
      }
      const L = leafletRef.current;
      const bounds = L.latLngBounds(
        validWaypoints.map((w) => [w.latitude, w.longitude])
      );
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    } catch (error) {
      console.error("Recenter map error:", error);
    }
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const totalDist = routingData?.totalDistance || stats?.totalDistance;
  const totalDuration = routingData?.totalDuration || stats?.totalTime;

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
        isFullscreen ? "fixed inset-4 z-50 rounded-2xl shadow-2xl flex flex-col" : className
      }`}
    >
      {/* Header */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none gap-2">
        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white shadow-md pointer-events-auto flex items-center gap-2 min-w-0">
          <Navigation className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
          <div className="text-left min-w-0">
            <div className="text-[11px] font-bold leading-tight flex items-center gap-1.5 truncate">
              <span className="truncate">{title}</span>
              {totalDist && <span className="text-orange-400 font-extrabold shrink-0">· {totalDist}</span>}
            </div>
            {totalDuration && (
              <div className="text-[9px] text-slate-400 leading-tight truncate">
                Est. driving time: {totalDuration}
              </div>
            )}
          </div>
        </div>

        {showControls && (
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
            <button type="button" onClick={handleZoomIn} title="Zoom In"
              className="p-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 transition-colors shadow-md active:scale-95 cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={handleZoomOut} title="Zoom Out"
              className="p-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 transition-colors shadow-md active:scale-95 cursor-pointer">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={handleRecenter} title="Reset View / Center Route"
              className="p-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 transition-colors shadow-md active:scale-95 cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-400" : ""}`} />
            </button>
            <button type="button" onClick={() => setIsFullscreen((p) => !p)}
              title={isFullscreen ? "Exit Full View" : "Expand Map"}
              className="p-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 transition-colors shadow-md active:scale-95 cursor-pointer">
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Scroll hint */}
      {showScrollHint && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-[450] flex justify-center pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-semibold shadow-xl">
            Use <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[11px] font-mono border border-slate-600">Ctrl</kbd> + scroll to zoom map, or use the <strong>+ / -</strong> buttons
          </div>
        </div>
      )}

      {/* Map */}
      <div
        ref={mapContainerRef}
        style={{ height: isFullscreen ? "100%" : height }}
        className="w-full bg-slate-950 z-0"
      />

      {/* Footer */}
      <div className="absolute bottom-2 left-3 right-3 z-[400] pointer-events-none flex items-center justify-between text-[10px]">
        <div className="bg-slate-900/85 backdrop-blur-md text-slate-300 px-2.5 py-1 rounded-lg border border-white/10 shadow-sm flex items-center gap-1.5 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{validWaypoints.length} Checkpoints</span>
          {routingData?.status === "osrm" && (
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