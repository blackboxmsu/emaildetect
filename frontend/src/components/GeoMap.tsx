import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Globe, MapPin } from 'lucide-react';
import { RelayHop } from '../types';

interface GeoMapProps {
  hops: RelayHop[];
  earliestReliableGeo: any;
}

export const GeoMap: React.FC<GeoMapProps> = ({ hops, earliestReliableGeo }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter: [number, number] = earliestReliableGeo?.latitude && earliestReliableGeo?.longitude
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

    const latLngs: [number, number][] = [];
    const markers: L.Marker[] = [];

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
    <div className="panel" style={{ padding: '20px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Globe style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
            Origin Infrastructure Geolocation
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
            Probable relay and hosting infrastructure coordinates.
          </p>
        </div>

        {earliestReliableGeo && (
          <div className="badge badge-neutral font-mono">
            <MapPin style={{ width: '12px', height: '12px', color: '#38bdf8' }} />
            {earliestReliableGeo.city}, {earliestReliableGeo.country} ({earliestReliableGeo.ip})
          </div>
        )}
      </div>

      <div style={{ height: '320px', width: '100%', borderRadius: '6px', overflow: 'hidden', border: '1px solid #1f2937' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', fontSize: '11px', color: '#64748b', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }}></span>
          <span>Earliest Reliable Origin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }}></span>
          <span>Intermediate Relay</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '20px', height: '2px', borderTop: '2px dashed #38bdf8' }}></span>
          <span>Transit Path</span>
        </div>
      </div>
    </div>
  );
};
