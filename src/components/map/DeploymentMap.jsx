// src/components/map/DeploymentMap.jsx
// Reusable Leaflet deployment map: pin clustering-free markers, a live
// street/satellite/dark/terrain basemap switcher, and resilience against
// tile-load failures and render errors so a flaky network can't blank the
// whole dashboard card.
import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map as MapIcon, Satellite, Moon, Mountain, AlertTriangle, RefreshCw, MapPin } from "lucide-react";

const STORAGE_KEY = "deploymentMap.basemap";

// ── Basemaps (all free / no API key required) ──────────────────────────────
// NOTE: CARTO's basemaps.cartocdn.com CDN (the tile source the old inline
// map used) now requires a registered API key — anonymous requests get back
// a 200 OK "API KEY REQUIRED" watermark tile instead of a real map, which is
// silent (no network error, so nothing catches it) and was already affecting
// production before this component existed. Verified live with `curl` on
// 2026-09-11. Esri/OSM/OpenTopoMap below were each confirmed to still return
// real, unwatermarked imagery without any key.
export const MAP_TYPES = {
  street: {
    label: "Street",
    icon: MapIcon,
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    label: "Satellite",
    icon: Satellite,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxZoom: 19,
  },
  dark: {
    label: "Dark",
    icon: Moon,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, FAO, NOAA, USGS",
    maxZoom: 16,
  },
  terrain: {
    label: "Terrain",
    icon: Mountain,
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      "Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)",
    maxZoom: 17,
  },
};

const FALLBACK_TYPE = "street";

// ── Pin icons ────────────────────────────────────────────────────────────
const makePinIcon = (color) =>
  L.divIcon({
    className: "presence-pin",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
    <defs><filter id="ds" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-opacity="0.35"/>
    </filter></defs>
    <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26c0-7.7-6.3-14-14-14z"
          fill="${color}" filter="url(#ds)"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
  </svg>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -36],
  });
const PIN_ONLINE = makePinIcon("#10b981");
const PIN_OFFLINE = makePinIcon("#ef4444");

// ── Imperative fit-to-bounds bridge ─────────────────────────────────────────
export const MapController = ({ fitRef }) => {
  const map = useMap();
  useEffect(() => {
    if (!fitRef) return;
    const safeFit = (bounds) => {
      if (!bounds || !bounds.isValid()) return;
      try {
        const pane = map.getPane("mapPane");
        if (!pane || pane._leaflet_pos === undefined) return;
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch {
        // map pane not ready yet — retry after next paint
        requestAnimationFrame(() => {
          try {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
          } catch {
            // give up silently: a stale fit request is harmless
          }
        });
      }
    };
    fitRef.current = safeFit;
  }, [fitRef, map]);
  return null;
};

// ── Floating basemap switcher (Google-Maps-style layer control) ────────────
const MapTypeSwitcher = ({ value, onChange }) => (
  <div className="absolute top-3 right-3 z-[500] flex gap-1 bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-md p-1">
    {Object.entries(MAP_TYPES).map(([key, cfg]) => {
      const Icon = cfg.icon;
      const active = value === key;
      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          title={cfg.label}
          aria-pressed={active}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap
            ${active ? "bg-[#195C51] text-white" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{cfg.label}</span>
        </button>
      );
    })}
  </div>
);

// ── Guards against render-time crashes (e.g. Leaflet/StrictMode teardown
// races on rapid fullscreen toggles) so one bad frame doesn't blank the page.
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("DeploymentMap render error:", error, info);
  }
  reset = () => this.setState({ hasError: false });
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500 text-sm">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <p>The map couldn&apos;t be displayed.</p>
          <button
            onClick={this.reset}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * @param {Array} locations - devices with `.location.lat` / `.location.lng`
 * @param {import('react').MutableRefObject} fitRef - filled with a `(bounds) => void` fit function
 * @param {[number, number]} center - fallback map center
 * @param {number} zoom - initial zoom
 * @param {string|number} height - CSS height of the map area
 * @param {(device: any) => void} onMarkerClick
 * @param {(device: any) => import('react').ReactNode} renderPopup
 * @param {import('react').ReactNode} emptyState - shown when locations is empty
 * @param {boolean} loading
 */
export default function DeploymentMap({
  locations = [],
  fitRef,
  center = [-1.9441, 30.0619],
  zoom = 12,
  height = "100%",
  onMarkerClick,
  renderPopup,
  emptyState,
  loading = false,
}) {
  const [mapType, setMapType] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && MAP_TYPES[saved] ? saved : FALLBACK_TYPE;
    } catch {
      return FALLBACK_TYPE;
    }
  });
  const [tileError, setTileError] = useState(false);
  const [tileGeneration, setTileGeneration] = useState(0);

  useEffect(() => {
    setTileError(false);
    try {
      localStorage.setItem(STORAGE_KEY, mapType);
    } catch {
      // storage may be unavailable (private mode, quota) — non-fatal
    }
  }, [mapType]);

  const handleTileError = useCallback(() => setTileError(true), []);
  const retryTiles = useCallback(() => {
    setTileError(false);
    setTileGeneration((g) => g + 1);
  }, []);
  const switchToStreet = useCallback(() => setMapType(FALLBACK_TYPE), []);

  const activeTile = MAP_TYPES[mapType] || MAP_TYPES[FALLBACK_TYPE];

  if (loading) {
    return (
      <div style={{ height, width: "100%" }} className="flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-[#195C51] rounded-full animate-spin" />
      </div>
    );
  }

  if (!locations.length) {
    return (
      <div style={{ height, width: "100%" }} className="flex flex-col items-center justify-center text-slate-400 text-sm">
        {emptyState || (
          <>
            <MapPin className="w-8 h-8 mb-2 opacity-30" />
            No deployed devices have GPS coordinates yet.
          </>
        )}
      </div>
    );
  }

  return (
    <MapErrorBoundary>
      <div style={{ height, width: "100%" }} className="relative">
        <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%", zIndex: 1 }} scrollWheelZoom>
          <MapController fitRef={fitRef} />
          <TileLayer
            key={`${mapType}-${tileGeneration}`}
            attribution={activeTile.attribution}
            url={activeTile.url}
            maxZoom={activeTile.maxZoom}
            eventHandlers={{ tileerror: handleTileError }}
          />
          {locations.map((device) => (
            <Marker
              key={device.id}
              position={[device.location.lat, device.location.lng]}
              icon={device.connectivity?.isOnline ? PIN_ONLINE : PIN_OFFLINE}
              eventHandlers={onMarkerClick ? { click: () => onMarkerClick(device) } : undefined}
            >
              {renderPopup && (
                <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
                  {renderPopup(device)}
                </Popup>
              )}
            </Marker>
          ))}
        </MapContainer>

        <MapTypeSwitcher value={mapType} onChange={setMapType} />

        {tileError && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-medium px-3 py-2 rounded-lg shadow-md">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Some {MAP_TYPES[mapType]?.label.toLowerCase()} tiles failed to load.
            <button onClick={retryTiles} className="inline-flex items-center gap-1 font-bold underline underline-offset-2">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
            {mapType !== FALLBACK_TYPE && (
              <button onClick={switchToStreet} className="font-bold underline underline-offset-2">
                Use street map
              </button>
            )}
          </div>
        )}
      </div>
    </MapErrorBoundary>
  );
}
