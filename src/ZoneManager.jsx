import { useState } from 'react';
import { PRESET_COLORS, DRAWING_MODES } from './constants';

export default function ZoneManager({ zones, onAddZone, onRemoveZone, onUpdateZone: _onUpdateZone, activeZoneId, onSelectZone }) {
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneType, setNewZoneType] = useState(DRAWING_MODES.RADIUS);
  const [newZoneColor, setNewZoneColor] = useState(PRESET_COLORS[1].value);

  const handleAdd = () => {
    const name = newZoneName.trim() || `Zone ${zones.length + 1}`;
    onAddZone({
      name,
      type: newZoneType,
      color: newZoneColor,
      radius: 15,
      points: [],
      opacity: 0.2,
      borderWidth: 2,
    });
    setNewZoneName('');
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-cloudy">
        Service Zones
      </label>

      {/* Existing zones */}
      {zones.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {zones.map((zone) => (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                activeZoneId === zone.id
                  ? 'border-azure/50 bg-azure/10'
                  : 'border-metal/20 bg-midnight/50 hover:border-metal/40'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 border border-white/20"
                style={{ backgroundColor: zone.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{zone.name}</div>
                <div className="text-xs text-galactic capitalize">
                  {zone.type === DRAWING_MODES.RADIUS
                    ? `${zone.radius} mi radius`
                    : zone.points.length > 0
                      ? `${zone.points.length} points`
                      : 'Not drawn yet'}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveZone(zone.id);
                }}
                className="p-2 -m-1 text-galactic hover:text-coral transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-1 focus:ring-offset-abyss"
                title="Delete zone"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new zone form */}
      <div className="space-y-2 pt-2 border-t border-metal/20">
        <input
          type="text"
          value={newZoneName}
          onChange={(e) => setNewZoneName(e.target.value)}
          placeholder="Zone name (e.g., Primary)"
          className="w-full bg-midnight border border-metal/30 rounded-lg px-3 py-2 text-white placeholder-galactic text-sm focus:outline-none focus:ring-2 focus:ring-azure focus:border-transparent"
        />
        <div className="flex gap-2">
          <select
            value={newZoneType}
            onChange={(e) => setNewZoneType(e.target.value)}
            className="flex-1 bg-midnight border border-metal/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-azure focus:border-transparent"
          >
            <option value={DRAWING_MODES.RADIUS}>Radius</option>
            <option value={DRAWING_MODES.POLYGON}>Polygon</option>
          </select>
          <div className="flex gap-1.5 items-center">
            {PRESET_COLORS.slice(0, 4).map((color) => (
              <button
                key={color.value}
                onClick={() => setNewZoneColor(color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-transform focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-1 focus:ring-offset-abyss ${
                  newZoneColor === color.value ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="w-full bg-azure text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-azure-hover transition-colors focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss"
        >
          + Add Zone
        </button>
      </div>
    </div>
  );
}
