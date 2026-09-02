import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Globe, MapPin } from 'lucide-react';

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

    // Clean Dark carto tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
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
              width: ${isOrigin ? '24px' : '16px'};
              height: ${isOrigin ? '24px' : '16px'};
              border-radius: 50%;
              background: ${isOrigin ? '#2563eb' : '#38bdf8'};
              border: 2px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: bold;
              font-size: ${isOrigin ? '11px' : '9px'};
              font-family: monospace;
            ">
              ${hop.hopIndex}
            </div>
          `,
          iconSize: isOrigin ? [24, 24] : [16, 16],
          iconAnchor: isOrigin ? [12, 12] : [8, 8]
        });

        const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        marker.bindPopup(`
          <div style="padding: 4px; font-family: var(--font-sans);">
            <div style="font-weight: 600; color: #38bdf8; font-size: 12px; margin-bottom: 2px;">
              Hop #${hop.hopIndex}: ${isOrigin ? 'Origin Infrastructure' : 'Relay Gateway'}
            </div>
            <div style="font-family: monospace; font-size: 11px; color: #f8fafc;">
              IP: ${hop.ip || 'N/A'}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
              ${hop.location.city}, ${hop.location.country} (${hop.location.isp || hop.location.asn})
            </div>
          </div>
        `);
        markers.push(marker);
      }
    });

    // Origin geo if not in hops
    if (earliestReliableGeo?.latitude && earliestReliableGeo?.longitude && latLngs.length === 0) {
      const lat = earliestReliableGeo.latitude;
      const lng = earliestReliableGeo.longitude;
      latLngs.push([lat, lng]);

      const markerIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #2563eb;
            border: 2px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: bold;
            font-size: 11px;
            font-family: monospace;
          ">
            ★
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
      marker.bindPopup(`
        <div style="padding: 4px; font-family: var(--font-sans);">
          <div style="font-weight: 600; color: #38bdf8; font-size: 12px;">Origin Infrastructure Node</div>
          <div style="font-family: monospace; font-size: 11px;">${earliestReliableGeo.ip}</div>
          <div style="font-size: 11px; color: #94a3b8;">${earliestReliableGeo.city}, ${earliestReliableGeo.country}</div>
        </div>
      `);
      markers.push(marker);
    }

    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: '#38bdf8',
        weight: 2,
        dashArray: '4, 6'
      }).addTo(map);
    }

    if (markers.length > 1) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.3));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hops, earliestReliableGeo]);

  return (
    <div className="panel p-5 mb-4 bg-slate-900/90 border border-slate-800 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 m-0">
            <Globe className="w-4 h-4 text-cyan-400" />
            Origin Infrastructure Geolocation
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Probable relay and hosting infrastructure coordinates.
          </p>
        </div>

        {earliestReliableGeo && (
          <div className="badge badge-neutral font-mono text-xs py-1 px-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-cyan-400" />
            {earliestReliableGeo.city}, {earliestReliableGeo.country} ({earliestReliableGeo.ip})
          </div>
        )}
      </div>

      <div className="h-80 w-full rounded-md overflow-hidden border border-slate-800">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-400 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span>Earliest Reliable Origin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Intermediate Relay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 border-t-2 border-dashed border-cyan-400"></span>
          <span>Transit Path</span>
        </div>
      </div>
    </div>
  );
};
