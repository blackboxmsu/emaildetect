import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Globe, MapPin, Info } from 'lucide-react';

export const GeoMap = ({ hops = [], earliestReliableGeo }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter = earliestReliableGeo?.latitude && earliestReliableGeo?.longitude
      ? [earliestReliableGeo.latitude, earliestReliableGeo.longitude]
      : [25, 10];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: earliestReliableGeo ? 3 : 2,
      minZoom: 2,
      maxZoom: 14,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Clean standard OpenStreetMap tiles (no API key required, crisp light map)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const latLngs = [];
    const markers = [];

    hops.forEach(hop => {
      if (hop.location?.latitude && hop.location?.longitude) {
        const lat = hop.location.latitude;
        const lng = hop.location.longitude;
        latLngs.push([lat, lng]);

        const isOrigin = hop.isEarliestReliable;

        const markerIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="
              width: ${isOrigin ? '26px' : '20px'};
              height: ${isOrigin ? '26px' : '20px'};
              border-radius: 50%;
              background: ${isOrigin ? '#dc2626' : '#2563eb'};
              border: 2px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: bold;
              font-size: ${isOrigin ? '12px' : '10px'};
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">
              ${hop.hopIndex}
            </div>
          `,
          iconSize: isOrigin ? [26, 26] : [20, 20],
          iconAnchor: isOrigin ? [13, 13] : [10, 10]
        });

        const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        marker.bindPopup(`
          <div style="padding: 4px; font-family: sans-serif;">
            <div style="font-weight: 700; color: ${isOrigin ? '#dc2626' : '#2563eb'}; font-size: 12px; margin-bottom: 2px;">
              Hop #${hop.hopIndex}: ${isOrigin ? 'Origin Infrastructure' : 'Relay Gateway'}
            </div>
            <div style="font-family: monospace; font-size: 11px; color: #0f172a; font-weight: 600;">
              IP: ${hop.ip || 'N/A'}
            </div>
            <div style="font-size: 11px; color: #475569; margin-top: 3px;">
              📍 ${hop.location.city || ''}, ${hop.location.country}
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 1px;">
              ISP: ${hop.location.isp || hop.location.asn || 'Mail Transit'}
            </div>
          </div>
        `);
        markers.push(marker);
      }
    });

    // Fallback origin marker if not in hops
    if (earliestReliableGeo?.latitude && earliestReliableGeo?.longitude && latLngs.length === 0) {
      const lat = earliestReliableGeo.latitude;
      const lng = earliestReliableGeo.longitude;
      latLngs.push([lat, lng]);

      const markerIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: #dc2626;
            border: 2px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            📍
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
      marker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif;">
          <div style="font-weight: 700; color: #dc2626; font-size: 12px; margin-bottom: 2px;">
            Earliest Reliable Origin Node
          </div>
          <div style="font-family: monospace; font-size: 11px; color: #0f172a; font-weight: 600;">
            IP: ${earliestReliableGeo.ip || 'N/A'}
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 3px;">
            📍 ${earliestReliableGeo.city || ''}, ${earliestReliableGeo.country}
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 1px;">
            ISP: ${earliestReliableGeo.isp || earliestReliableGeo.asn || 'Mail Transit'}
          </div>
        </div>
      `);
      markers.push(marker);
    }

    // Connect transmission path hops with clean polyline
    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: '#2563eb',
        weight: 2.5,
        opacity: 0.7,
        dashArray: '5, 8'
      }).addTo(map);
    }

    // Fit bounds if markers exist
    if (latLngs.length > 0) {
      try {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      } catch {
        // Center fallback
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hops, earliestReliableGeo]);

  return (
    <div className="panel p-5 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 m-0">
            <Globe className="w-4 h-4 text-blue-600" />
            Origin Infrastructure Geolocation
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographical location of mail servers and earliest reliable origin IP.
          </p>
        </div>

        {earliestReliableGeo && (
          <span className="badge badge-info text-xs py-1 px-2.5">
            <MapPin className="w-3 h-3" />
            {earliestReliableGeo.city ? `${earliestReliableGeo.city}, ` : ''}{earliestReliableGeo.country}
          </span>
        )}
      </div>

      {/* Clean Interactive Map */}
      <div className="w-full flex-1 min-h-[300px] rounded-lg border border-slate-200 relative overflow-hidden bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '300px' }} />
      </div>

      {/* Map Legend */}
      <div className="flex items-center justify-between mt-3 text-[11px] text-slate-600 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 border border-white inline-block shadow-sm"></span>
            <span>Origin Server (Earliest Reliable)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white inline-block shadow-sm"></span>
            <span>Intermediate Relay</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          <span>Indicates mail relay server coordinates, not physical human location</span>
        </div>
      </div>
    </div>
  );
};
