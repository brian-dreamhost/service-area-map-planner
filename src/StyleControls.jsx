import { PRESET_COLORS } from './constants';

export default function StyleControls({ color, opacity, borderWidth, showLabel, onColorChange, onOpacityChange, onBorderWidthChange, onShowLabelChange }) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-cloudy">
        Zone Style
      </label>

      {/* Color */}
      <div className="space-y-2">
        <span className="text-xs text-galactic">Color</span>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onColorChange(preset.value)}
              className={`w-9 h-9 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss ${
                color === preset.value
                  ? 'border-white scale-110 shadow-lg'
                  : 'border-metal/30 hover:border-metal/60 hover:scale-105'
              }`}
              style={{ backgroundColor: preset.value }}
              title={preset.name}
            />
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-galactic">Fill Opacity</span>
          <span className="text-xs text-cloudy">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="50"
          value={Math.round(opacity * 100)}
          onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
          className="w-full"
        />
      </div>

      {/* Border Width */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-galactic">Border Width</span>
          <span className="text-xs text-cloudy">{borderWidth}px</span>
        </div>
        <input
          type="range"
          min="1"
          max="4"
          value={borderWidth}
          onChange={(e) => onBorderWidthChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Label toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-galactic">Show Zone Labels</span>
        <button
          onClick={() => onShowLabelChange(!showLabel)}
          className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss ${
            showLabel ? 'bg-azure' : 'bg-metal/50'
          }`}
          role="switch"
          aria-checked={showLabel}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              showLabel ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
