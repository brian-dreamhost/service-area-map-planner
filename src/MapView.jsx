import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polygon, useMap, useMapEvents, Tooltip } from 'react-leaflet';
import L from './leafletSetup';
import { TILE_URL, TILE_ATTRIBUTION, MILES_TO_METERS, DEFAULT_CENTER, DEFAULT_ZOOM, CITY_ZOOM, DRAWING_MODES } from './constants';

// Custom azure marker icon
const createBusinessIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px;
      height: 32px;
      background: #0073EC;
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "><div style="
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 50%;
      margin: 8px;
    "></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to re-center map when center changes
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], CITY_ZOOM, { animate: true });
    }
  }, [center, map]);
  return null;
}

// Component to handle polygon drawing clicks
function PolygonClickHandler({ isDrawing, onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (isDrawing) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

// Draggable polygon vertices
function DraggableVertices({ points, onPointMove, color }) {
  return points.map((point, index) => (
    <Marker
      key={`vertex-${index}`}
      position={point}
      icon={L.divIcon({
        className: 'polygon-vertex',
        html: `<div style="
          width: 12px;
          height: 12px;
          background: ${color || '#0073EC'};
          border: 2px solid white;
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const latlng = e.target.getLatLng();
          onPointMove(index, [latlng.lat, latlng.lng]);
        },
      }}
    />
  ));
}

const MapView = forwardRef(function MapView({
  center,
  drawingMode,
  radius,
  polygonPoints,
  zones,
  activeZoneId,
  styleOptions,
  isDrawing,
  showLabels,
  onMapClick,
  onPolygonPointMove,
  onZonePointMove,
}, ref) {
  const mapContainerRef = useRef(null);

  useImperativeHandle(ref, () => mapContainerRef.current);

  const businessIcon = createBusinessIcon();

  const singleZoneColor = styleOptions?.color || '#0073EC';
  const singleZoneOpacity = styleOptions?.opacity || 0.2;
  const singleZoneBorder = styleOptions?.borderWidth || 2;

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-metal/20 ${
        isDrawing ? 'drawing-mode' : ''
      }`}
      style={{ zIndex: 1 }}
    >
      <MapContainer
        center={center ? [center.lat, center.lng] : DEFAULT_CENTER}
        zoom={center ? CITY_ZOOM : DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
        className={isDrawing ? 'drawing-mode' : ''}
        zoomControl={true}
      >
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
          maxZoom={19}
        />

        {center && <MapUpdater center={center} />}

        <PolygonClickHandler isDrawing={isDrawing} onMapClick={onMapClick} />

        {/* Business location marker */}
        {center && (
          <Marker position={[center.lat, center.lng]} icon={businessIcon}>
            {center.name && (
              <Tooltip direction="top" offset={[0, -35]} permanent={false}>
                <span style={{ color: '#AFBFC9', fontSize: '12px' }}>{center.name.split(',')[0]}</span>
              </Tooltip>
            )}
          </Marker>
        )}

        {/* Single Radius Mode */}
        {drawingMode === DRAWING_MODES.RADIUS && center && zones.length === 0 && (
          <Circle
            center={[center.lat, center.lng]}
            radius={radius * MILES_TO_METERS}
            pathOptions={{
              color: singleZoneColor,
              fillColor: singleZoneColor,
              fillOpacity: singleZoneOpacity,
              weight: singleZoneBorder,
            }}
          >
            {showLabels && (
              <Tooltip direction="center" permanent>
                <span style={{ color: '#AFBFC9', fontSize: '11px' }}>{radius} mi</span>
              </Tooltip>
            )}
          </Circle>
        )}

        {/* Single Polygon Mode */}
        {drawingMode === DRAWING_MODES.POLYGON && zones.length === 0 && polygonPoints.length >= 3 && !isDrawing && (
          <>
            <Polygon
              positions={polygonPoints}
              pathOptions={{
                color: singleZoneColor,
                fillColor: singleZoneColor,
                fillOpacity: singleZoneOpacity,
                weight: singleZoneBorder,
              }}
            />
            <DraggableVertices
              points={polygonPoints}
              onPointMove={onPolygonPointMove}
              color={singleZoneColor}
            />
          </>
        )}

        {/* Polygon being drawn (preview line) */}
        {drawingMode === DRAWING_MODES.POLYGON && isDrawing && polygonPoints.length >= 2 && (
          <Polygon
            positions={polygonPoints}
            pathOptions={{
              color: singleZoneColor,
              fillColor: singleZoneColor,
              fillOpacity: singleZoneOpacity * 0.5,
              weight: singleZoneBorder,
              dashArray: '6 4',
            }}
          />
        )}

        {/* Drawing markers for polygon in progress */}
        {isDrawing && polygonPoints.map((point, index) => (
          <Marker
            key={`draw-point-${index}`}
            position={point}
            icon={L.divIcon({
              className: 'draw-point',
              html: `<div style="
                width: 10px;
                height: 10px;
                background: ${singleZoneColor};
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 1px 4px rgba(0,0,0,0.3);
              "></div>`,
              iconSize: [10, 10],
              iconAnchor: [5, 5],
            })}
          />
        ))}

        {/* Multi-Zone rendering */}
        {zones.map((zone) => {
          if (zone.type === DRAWING_MODES.RADIUS && center) {
            return (
              <Circle
                key={zone.id}
                center={[center.lat, center.lng]}
                radius={zone.radius * MILES_TO_METERS}
                pathOptions={{
                  color: zone.color,
                  fillColor: zone.color,
                  fillOpacity: zone.opacity,
                  weight: zone.borderWidth,
                  dashArray: activeZoneId === zone.id ? '6 4' : undefined,
                }}
              >
                {showLabels && zone.name && (
                  <Tooltip direction="center" permanent>
                    <span style={{ color: '#AFBFC9', fontSize: '11px' }}>{zone.name} ({zone.radius} mi)</span>
                  </Tooltip>
                )}
              </Circle>
            );
          }

          if (zone.type === DRAWING_MODES.POLYGON && zone.points.length >= 3) {
            return (
              <Polygon
                key={zone.id}
                positions={zone.points}
                pathOptions={{
                  color: zone.color,
                  fillColor: zone.color,
                  fillOpacity: zone.opacity,
                  weight: zone.borderWidth,
                  dashArray: activeZoneId === zone.id ? '6 4' : undefined,
                }}
              >
                {showLabels && zone.name && (
                  <Tooltip direction="center" permanent>
                    <span style={{ color: '#AFBFC9', fontSize: '11px' }}>{zone.name}</span>
                  </Tooltip>
                )}
              </Polygon>
            );
          }

          return null;
        })}

        {/* Active zone polygon vertices */}
        {zones.map((zone) => {
          if (zone.type === DRAWING_MODES.POLYGON && zone.points.length >= 3 && activeZoneId === zone.id) {
            return (
              <DraggableVertices
                key={`vertices-${zone.id}`}
                points={zone.points}
                onPointMove={(pointIndex, newPos) => onZonePointMove(zone.id, pointIndex, newPos)}
                color={zone.color}
              />
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
});

export default MapView;
