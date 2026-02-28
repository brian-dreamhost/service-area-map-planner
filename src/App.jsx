import { useState, useRef, useCallback } from 'react';
import AddressSearch from './AddressSearch';
import DrawingControls from './DrawingControls';
import RadiusControl from './RadiusControl';
import PolygonDrawer from './PolygonDrawer';
import ZoneManager from './ZoneManager';
import StyleControls from './StyleControls';
import MapView from './MapView';
import ExportPanel from './ExportPanel';
import { DRAWING_MODES } from './constants';

let zoneIdCounter = 0;
function generateZoneId() {
  return `zone-${++zoneIdCounter}`;
}

export default function App() {
  // Location state
  const [center, setCenter] = useState(null);

  // Drawing mode
  const [drawingMode, setDrawingMode] = useState(DRAWING_MODES.RADIUS);

  // Single zone state (radius and polygon modes)
  const [radius, setRadius] = useState(15);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);

  // Multi-zone state
  const [zones, setZones] = useState([]);
  const [activeZoneId, setActiveZoneId] = useState(null);

  // Style state
  const [color, setColor] = useState('#0073EC');
  const [opacity, setOpacity] = useState(0.2);
  const [borderWidth, setBorderWidth] = useState(2);
  const [showLabels, setShowLabels] = useState(true);

  // Mobile controls toggle - default closed on mobile for better map visibility
  const [controlsOpen, setControlsOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  // Map ref for export
  const mapRef = useRef(null);

  const handleLocationSelect = useCallback((location) => {
    setCenter(location);
  }, []);

  const handleModeChange = (mode) => {
    setDrawingMode(mode);
    setIsDrawingPolygon(false);
    if (mode === DRAWING_MODES.MULTI_ZONE && zones.length === 0) {
      // Auto-add a first zone
      const id = generateZoneId();
      setZones([{
        id,
        name: 'Primary',
        type: DRAWING_MODES.RADIUS,
        color: '#00CAAA',
        radius: 15,
        points: [],
        opacity: 0.2,
        borderWidth: 2,
      }]);
      setActiveZoneId(id);
    }
  };

  // Polygon drawing
  const handleMapClick = useCallback((latlng) => {
    if (drawingMode === DRAWING_MODES.POLYGON && !isDrawingPolygon) {
      setIsDrawingPolygon(true);
      setPolygonPoints([latlng]);
    } else if (drawingMode === DRAWING_MODES.POLYGON && isDrawingPolygon) {
      setPolygonPoints(prev => [...prev, latlng]);
    } else if (drawingMode === DRAWING_MODES.MULTI_ZONE && activeZoneId) {
      const activeZone = zones.find(z => z.id === activeZoneId);
      if (activeZone && activeZone.type === DRAWING_MODES.POLYGON) {
        if (!activeZone._isDrawing) {
          setZones(prev => prev.map(z =>
            z.id === activeZoneId ? { ...z, points: [latlng], _isDrawing: true } : z
          ));
        } else {
          setZones(prev => prev.map(z =>
            z.id === activeZoneId ? { ...z, points: [...z.points, latlng] } : z
          ));
        }
      }
    }
  }, [drawingMode, isDrawingPolygon, activeZoneId, zones]);

  const handleCompletePolygon = () => {
    if (drawingMode === DRAWING_MODES.POLYGON) {
      setIsDrawingPolygon(false);
    } else if (drawingMode === DRAWING_MODES.MULTI_ZONE && activeZoneId) {
      setZones(prev => prev.map(z =>
        z.id === activeZoneId ? { ...z, _isDrawing: false } : z
      ));
    }
  };

  const handleUndoPoint = () => {
    if (drawingMode === DRAWING_MODES.POLYGON) {
      setPolygonPoints(prev => prev.slice(0, -1));
      if (polygonPoints.length <= 1) {
        setIsDrawingPolygon(false);
      }
    } else if (drawingMode === DRAWING_MODES.MULTI_ZONE && activeZoneId) {
      setZones(prev => prev.map(z => {
        if (z.id === activeZoneId) {
          const newPoints = z.points.slice(0, -1);
          return { ...z, points: newPoints, _isDrawing: newPoints.length > 0 };
        }
        return z;
      }));
    }
  };

  const handleClearPolygon = () => {
    if (drawingMode === DRAWING_MODES.POLYGON) {
      setPolygonPoints([]);
      setIsDrawingPolygon(false);
    }
  };

  const handlePolygonPointMove = (index, newPos) => {
    setPolygonPoints(prev => {
      const updated = [...prev];
      updated[index] = newPos;
      return updated;
    });
  };

  const handleZonePointMove = (zoneId, pointIndex, newPos) => {
    setZones(prev => prev.map(z => {
      if (z.id === zoneId) {
        const updatedPoints = [...z.points];
        updatedPoints[pointIndex] = newPos;
        return { ...z, points: updatedPoints };
      }
      return z;
    }));
  };

  // Zone management
  const handleAddZone = (zoneData) => {
    const id = generateZoneId();
    const newZone = { ...zoneData, id };
    setZones(prev => [...prev, newZone]);
    setActiveZoneId(id);
  };

  const handleRemoveZone = (id) => {
    setZones(prev => prev.filter(z => z.id !== id));
    if (activeZoneId === id) {
      setActiveZoneId(zones.length > 1 ? zones.find(z => z.id !== id)?.id : null);
    }
  };

  const handleUpdateZone = (id, updates) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  // Active zone controls
  const activeZone = zones.find(z => z.id === activeZoneId);

  const handleClearAll = () => {
    setPolygonPoints([]);
    setIsDrawingPolygon(false);
    setZones([]);
    setActiveZoneId(null);
    setRadius(15);
  };

  const handleResetView = () => {
    if (center) {
      setCenter({ ...center });
    }
  };

  // Determine if we are in a drawing state for the map
  const isDrawing = isDrawingPolygon || (activeZone && activeZone._isDrawing);

  // Build single zone object for export
  const singleZone = drawingMode === DRAWING_MODES.RADIUS
    ? { type: 'radius', radius, color, opacity, borderWidth, name: '' }
    : drawingMode === DRAWING_MODES.POLYGON
      ? { type: 'polygon', points: polygonPoints, color, opacity, borderWidth, name: '' }
      : null;

  return (
    <div className="min-h-screen bg-abyss bg-glow bg-grid">
      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 pt-8 pb-4 max-w-[1600px] mx-auto">
          <nav className="mb-8 text-sm text-galactic">
            <a href="https://seo-tools-tau.vercel.app/" className="text-azure hover:text-white transition-colors">Free Tools</a>
            <span className="mx-2 text-metal">/</span>
            <a href="https://seo-tools-tau.vercel.app/local-business/" className="text-azure hover:text-white transition-colors">Local Business Tools</a>
            <span className="mx-2 text-metal">/</span>
            <span className="text-cloudy">Service Area Map Planner</span>
          </nav>

          <div className="max-w-3xl mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Service Area Map Planner
            </h1>
            <p className="text-cloudy text-base sm:text-lg">
              Draw your service area on an interactive map, then export it as embeddable HTML, a downloadable image, or a city list for Google Business Profile.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 pb-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Sidebar Controls */}
            <div className="lg:w-80 xl:w-96 flex-shrink-0">
              {/* Mobile toggle */}
              <button
                onClick={() => setControlsOpen(!controlsOpen)}
                className="lg:hidden w-full flex items-center justify-between card-gradient border border-metal/20 rounded-2xl px-4 py-3 mb-2 text-white font-medium focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                  </svg>
                  Map Controls
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`w-5 h-5 transition-transform ${controlsOpen ? 'rotate-180' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              <div className={`space-y-4 ${controlsOpen ? 'block' : 'hidden lg:block'}`}>
                {/* Address Search */}
                <div className="card-gradient border border-metal/20 rounded-2xl p-4">
                  <AddressSearch onLocationSelect={handleLocationSelect} />
                </div>

                {/* Drawing Controls */}
                <div className="card-gradient border border-metal/20 rounded-2xl p-4 space-y-5">
                  <DrawingControls
                    mode={drawingMode}
                    onModeChange={handleModeChange}
                    disabled={!center}
                  />

                  {/* Radius controls */}
                  {drawingMode === DRAWING_MODES.RADIUS && center && zones.length === 0 && (
                    <RadiusControl radius={radius} onRadiusChange={setRadius} />
                  )}

                  {/* Polygon controls */}
                  {drawingMode === DRAWING_MODES.POLYGON && center && zones.length === 0 && (
                    <PolygonDrawer
                      points={polygonPoints}
                      isDrawing={isDrawingPolygon}
                      onComplete={handleCompletePolygon}
                      onUndo={handleUndoPoint}
                      onClear={handleClearPolygon}
                    />
                  )}

                  {/* Multi-Zone controls */}
                  {drawingMode === DRAWING_MODES.MULTI_ZONE && center && (
                    <>
                      <ZoneManager
                        zones={zones}
                        onAddZone={handleAddZone}
                        onRemoveZone={handleRemoveZone}
                        onUpdateZone={handleUpdateZone}
                        activeZoneId={activeZoneId}
                        onSelectZone={setActiveZoneId}
                      />

                      {/* Active zone controls */}
                      {activeZone && (
                        <div className="space-y-3 pt-3 border-t border-metal/20">
                          <p className="text-xs font-medium text-cloudy">
                            Editing: <span className="text-white">{activeZone.name}</span>
                          </p>
                          {activeZone.type === DRAWING_MODES.RADIUS && (
                            <RadiusControl
                              radius={activeZone.radius}
                              onRadiusChange={(r) => handleUpdateZone(activeZone.id, { radius: r })}
                            />
                          )}
                          {activeZone.type === DRAWING_MODES.POLYGON && (
                            <PolygonDrawer
                              points={activeZone.points}
                              isDrawing={!!activeZone._isDrawing}
                              onComplete={handleCompletePolygon}
                              onUndo={handleUndoPoint}
                              onClear={() => handleUpdateZone(activeZone.id, { points: [], _isDrawing: false })}
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {!center && (
                    <p className="text-xs text-galactic text-center py-2">
                      Enter your business address above to start drawing.
                    </p>
                  )}
                </div>

                {/* Style Controls */}
                {center && (
                  <div className="card-gradient border border-metal/20 rounded-2xl p-4">
                    {drawingMode === DRAWING_MODES.MULTI_ZONE && activeZone ? (
                      <StyleControls
                        color={activeZone.color}
                        opacity={activeZone.opacity}
                        borderWidth={activeZone.borderWidth}
                        showLabel={showLabels}
                        onColorChange={(c) => handleUpdateZone(activeZone.id, { color: c })}
                        onOpacityChange={(o) => handleUpdateZone(activeZone.id, { opacity: o })}
                        onBorderWidthChange={(w) => handleUpdateZone(activeZone.id, { borderWidth: w })}
                        onShowLabelChange={setShowLabels}
                      />
                    ) : (
                      <StyleControls
                        color={color}
                        opacity={opacity}
                        borderWidth={borderWidth}
                        showLabel={showLabels}
                        onColorChange={setColor}
                        onOpacityChange={setOpacity}
                        onBorderWidthChange={setBorderWidth}
                        onShowLabelChange={setShowLabels}
                      />
                    )}
                  </div>
                )}

                {/* Map Actions */}
                {center && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetView}
                      className="flex-1 bg-midnight border border-metal/30 text-cloudy rounded-lg px-3 py-2.5 text-sm hover:text-white hover:border-azure/50 transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                      Reset View
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="flex-1 bg-midnight border border-coral/30 text-coral rounded-lg px-3 py-2.5 text-sm hover:bg-coral/10 transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 focus:ring-offset-abyss"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="flex-1 min-h-[400px] lg:min-h-[600px]">
              <MapView
                ref={mapRef}
                center={center}
                drawingMode={drawingMode}
                radius={radius}
                polygonPoints={polygonPoints}
                zones={zones}
                activeZoneId={activeZoneId}
                styleOptions={{ color, opacity, borderWidth }}
                isDrawing={isDrawing}
                showLabels={showLabels}
                onMapClick={handleMapClick}
                onPolygonPointMove={handlePolygonPointMove}
                onZonePointMove={handleZonePointMove}
              />
            </div>
          </div>

          {/* Export Panel */}
          <div className="mt-6">
            <ExportPanel
              center={center}
              zones={zones}
              singleZone={singleZone}
              drawingMode={drawingMode}
              mapRef={mapRef}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-metal/30 px-4 py-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-galactic text-sm">
                Built by <a href="https://www.dreamhost.com" target="_blank" rel="noopener noreferrer" className="text-azure hover:text-white transition-colors">DreamHost</a>
              </p>
              <div className="flex items-center gap-4 text-sm">
                <a href="https://seo-tools-tau.vercel.app/" className="text-azure hover:text-white transition-colors">
                  All Free Tools
                </a>
                <span className="text-metal">|</span>
                <a href="https://seo-tools-tau.vercel.app/local-business/" className="text-azure hover:text-white transition-colors">
                  Local Business Tools
                </a>
              </div>
            </div>
            <p className="text-galactic/60 text-xs text-center mt-4">
              Map data &copy; OpenStreetMap contributors, &copy; CartoDB. This tool does not store any data.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
