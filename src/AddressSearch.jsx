import { useState, useRef, useCallback, useEffect } from 'react';
import { NOMINATIM_BASE } from './constants';

export default function AddressSearch({ onLocationSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (err) {
      console.error('Geocoding error:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAddress(value);
    }, 1000);
  };

  const handleSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setQuery(result.display_name);
    setShowResults(false);
    setResults([]);
    onLocationSelect({ lat, lng: lon, name: result.display_name });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `${NOMINATIM_BASE}/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept': 'application/json' } }
          );
          const data = await response.json();
          const name = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setQuery(name);
          onLocationSelect({ lat: latitude, lng: longitude, name });
        } catch {
          setQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          onLocationSelect({
            lat: latitude,
            lng: longitude,
            name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to retrieve your location. Please check your browser permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      searchAddress(query);
    }
  };

  return (
    <div ref={wrapperRef} className="space-y-3">
      <label className="block text-sm font-medium text-cloudy">
        Business Address
      </label>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => results.length > 0 && setShowResults(true)}
              placeholder="Enter your business address..."
              className="w-full bg-midnight border border-metal/30 rounded-lg px-4 py-2.5 text-white placeholder-galactic focus:outline-none focus:ring-2 focus:ring-azure focus:border-transparent text-sm"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-4 w-4 text-azure" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </div>
          <button
            onClick={handleUseMyLocation}
            disabled={locating}
            className="flex items-center gap-1.5 bg-midnight border border-metal/30 rounded-lg px-3 py-2.5 text-cloudy hover:text-white hover:border-azure/50 transition-colors text-sm whitespace-nowrap disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-azure"
            title="Use my location"
          >
            {locating ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            )}
            <span className="hidden sm:inline">My Location</span>
          </button>
        </div>

        {showResults && results.length > 0 && (
          <ul className="absolute z-[1000] w-full mt-1 bg-oblivion border border-metal/30 rounded-lg overflow-hidden shadow-xl max-h-60 overflow-y-auto">
            {results.map((result, index) => (
              <li key={result.place_id || index}>
                <button
                  onClick={() => handleSelect(result)}
                  className="w-full text-left px-4 py-3 text-sm text-cloudy hover:bg-midnight hover:text-white transition-colors border-b border-metal/10 last:border-b-0 focus:outline-none focus:bg-midnight"
                >
                  <span className="line-clamp-2">{result.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
