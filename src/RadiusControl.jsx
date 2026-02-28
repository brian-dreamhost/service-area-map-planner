export default function RadiusControl({ radius, onRadiusChange }) {
  const handleSliderChange = (e) => {
    onRadiusChange(Number(e.target.value));
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      onRadiusChange(1);
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 50) {
      onRadiusChange(num);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-cloudy">
        Service Radius
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="1"
          max="50"
          value={radius}
          onChange={handleSliderChange}
          className="flex-1"
        />
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="1"
            max="50"
            value={radius}
            onChange={handleInputChange}
            className="w-16 bg-midnight border border-metal/30 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-azure focus:border-transparent"
          />
          <span className="text-xs text-galactic">mi</span>
        </div>
      </div>
      <p className="text-xs text-galactic">
        {(radius * 1.60934).toFixed(1)} km
      </p>
    </div>
  );
}
