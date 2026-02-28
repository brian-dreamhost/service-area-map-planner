import { useState } from 'react';
import html2canvas from 'html2canvas';
import { generateEmbedCode } from './EmbedCodeGenerator';

export default function ExportPanel({ center, zones, singleZone, drawingMode, mapRef }) {
  const [activeTab, setActiveTab] = useState('embed');
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [cityList, setCityList] = useState('');
  const [cityListInitialized, setCityListInitialized] = useState(false);

  const embedCode = generateEmbedCode({ center, zones, singleZone, drawingMode });

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImageExport = async () => {
    if (!mapRef?.current) return;
    setExporting(true);
    try {
      const mapContainer = mapRef.current;
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#071C26',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'service-area-map.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export error:', err);
      alert('Unable to export image. Some map tiles may block cross-origin capture. Try taking a screenshot instead.');
    } finally {
      setExporting(false);
    }
  };

  const initCityList = () => {
    if (!cityListInitialized && center) {
      setCityList(
        `# Cities/Areas in Your Service Area\n# Edit this list to match your actual service areas\n# Copy and paste into Google Business Profile > Service Areas\n\n# Example format:\n# Springfield, IL\n# Decatur, IL\n# Jacksonville, IL\n`
      );
      setCityListInitialized(true);
    }
  };

  const tabs = [
    { id: 'embed', label: 'Embed Code' },
    { id: 'image', label: 'Image Export' },
    { id: 'cities', label: 'City List (GBP)' },
  ];

  const hasContent = center && (
    zones.length > 0 ||
    (singleZone && (singleZone.type === 'radius' || (singleZone.points && singleZone.points.length >= 3)))
  );

  return (
    <div className="card-gradient border border-metal/20 rounded-2xl p-4 sm:p-6 animate-fadeIn">
      <h3 className="text-lg font-bold text-white mb-4">Export Service Area</h3>

      {/* Tabs */}
      <div className="flex rounded-lg overflow-hidden border border-metal/30 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'cities') initCityList();
            }}
            className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-azure focus:ring-inset ${
              activeTab === tab.id
                ? 'bg-azure text-white'
                : 'bg-midnight text-galactic hover:text-cloudy'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!hasContent ? (
        <div className="text-center py-8 text-galactic text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto mb-2 opacity-50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
          <p>Set your business location and draw a service area first.</p>
        </div>
      ) : (
        <>
          {/* Embed Code */}
          {activeTab === 'embed' && (
            <div className="space-y-3">
              <p className="text-xs text-galactic">
                Copy this HTML code and paste it into your website to embed an interactive map of your service area.
              </p>
              <div className="relative">
                <pre className="bg-midnight border border-metal/20 rounded-lg p-4 text-xs text-cloudy overflow-x-auto max-h-64 overflow-y-auto">
                  <code>{embedCode}</code>
                </pre>
                <button
                  onClick={() => handleCopy(embedCode)}
                  className="absolute top-2 right-2 bg-azure text-white rounded-md px-3 py-1.5 text-xs font-medium hover:bg-azure-hover transition-colors focus:outline-none focus:ring-2 focus:ring-azure"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Image Export */}
          {activeTab === 'image' && (
            <div className="space-y-3">
              <p className="text-xs text-galactic">
                Download your service area map as a PNG image. Great for social media, print materials, or presentations.
              </p>
              <button
                onClick={handleImageExport}
                disabled={exporting}
                className="w-full bg-azure text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-azure-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download PNG
                  </>
                )}
              </button>
              <p className="text-xs text-galactic italic">
                Note: Some map tiles may not render in the export due to cross-origin restrictions. If the export appears blank, try using a screenshot tool instead.
              </p>
            </div>
          )}

          {/* City List */}
          {activeTab === 'cities' && (
            <div className="space-y-3">
              <p className="text-xs text-galactic">
                List the cities and areas within your service area. Edit the list below, then copy it for your Google Business Profile &quot;Service areas&quot; section.
              </p>
              <textarea
                value={cityList}
                onChange={(e) => setCityList(e.target.value)}
                rows={10}
                className="w-full bg-midnight border border-metal/30 rounded-lg px-4 py-3 text-sm text-cloudy placeholder-galactic focus:outline-none focus:ring-2 focus:ring-azure focus:border-transparent font-mono"
                placeholder="Enter cities/areas in your service area, one per line..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(cityList.split('\n').filter(l => l.trim() && !l.startsWith('#')).join('\n'))}
                  className="flex-1 bg-azure text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-azure-hover transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  {copied ? 'Copied!' : 'Copy City List'}
                </button>
              </div>
              <p className="text-xs text-galactic italic">
                Lines starting with # are comments and will not be copied.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
