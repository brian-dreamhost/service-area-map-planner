export default function PolygonDrawer({ points, isDrawing, onComplete, onUndo, onClear }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-cloudy">
        Polygon Drawing
      </label>

      {isDrawing ? (
        <div className="space-y-2">
          <p className="text-xs text-galactic">
            Click on the map to place points. Add at least 3 points to create a shape.
          </p>
          <div className="flex items-center gap-2 text-xs text-cloudy bg-midnight/50 rounded-lg px-3 py-2 border border-metal/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-azure flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <span>{points.length} point{points.length !== 1 ? 's' : ''} placed</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onComplete}
              disabled={points.length < 3}
              className="flex-1 bg-azure text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-azure-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss"
            >
              Complete Shape
            </button>
            <button
              onClick={onUndo}
              disabled={points.length === 0}
              className="bg-midnight border border-metal/30 text-cloudy rounded-lg px-3 py-2 text-sm hover:text-white hover:border-azure/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss"
              title="Undo last point"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-galactic">
            Click the map to start drawing your service area boundary. Place points to outline your area.
          </p>
          {points.length > 0 && (
            <button
              onClick={onClear}
              className="w-full bg-midnight border border-coral/30 text-coral rounded-lg px-3 py-2 text-sm hover:bg-coral/10 transition-colors focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 focus:ring-offset-abyss"
            >
              Clear Polygon
            </button>
          )}
        </div>
      )}
    </div>
  );
}
