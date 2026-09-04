import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Server, ArrowDown, ShieldCheck } from 'lucide-react';

export const RelayRouteVisualizer = ({
  hops = [],
  earliestReliableIp,
  anomalies = []
}) => {
  return (
    <div className="panel p-5 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 m-0">
            <Server className="w-4 h-4 text-blue-600" />
            Sender Trace Path (Relay Route)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological mail server hops reconstructed from "Received:" headers.
          </p>
        </div>
        <span className="badge badge-neutral text-xs py-1 px-2.5">
          {hops.length} Mail Hops
        </span>
      </div>

      {/* Routing Anomalies Callout */}
      {anomalies.length > 0 && (
        <div className="mb-3.5 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-1.5 text-red-800 text-xs font-bold mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            Routing & Transmission Anomalies Detected:
          </div>
          <ul className="pl-5 text-red-700 text-xs m-0 flex flex-col gap-1 list-disc">
            {anomalies.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Chronological Hop List */}
      <div className="flex flex-col gap-2.5 flex-1">
        {hops.map((hop, index) => {
          const isEarliest = hop.isEarliestReliable || hop.ip === earliestReliableIp;
          const isLastHop = index === hops.length - 1;

          return (
            <div key={hop.hopIndex || index} className="flex flex-col">
              <div
                className={`p-3.5 rounded-lg border transition ${
                  isEarliest
                    ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                        isEarliest ? 'bg-blue-600' : 'bg-slate-500'
                      }`}
                    >
                      {hop.hopIndex}
                    </span>

                    <span className="text-xs font-bold text-slate-900">
                      {isEarliest ? 'Originating Mail Server' : (isLastHop ? 'Destination Gateway' : 'Relay Gateway')}
                    </span>

                    {isEarliest && (
                      <span className="badge badge-info text-[10px] py-0.5 px-2 font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        Earliest Reliable Origin
                      </span>
                    )}
                  </div>

                  {hop.ip && (
                    <span className="badge badge-neutral font-mono text-xs py-0.5 px-2 bg-white border border-slate-300 text-slate-800">
                      IP: {hop.ip}
                    </span>
                  )}
                </div>

                {/* Hostname routing info */}
                <div className="text-xs text-slate-700 pl-8 font-mono break-all">
                  <span>{hop.by || 'Mail Delivery Agent'}</span>
                  {hop.from && (
                    <span className="text-slate-500 block text-[11px] font-sans mt-0.5">
                      Received from: <strong>{hop.from}</strong>
                    </span>
                  )}
                </div>

                {/* Geolocation info if available */}
                {hop.location && (
                  <div className="text-[11px] text-slate-600 pl-8 mt-1">
                    📍 {hop.location.city ? `${hop.location.city}, ` : ''}{hop.location.country} ({hop.location.isp || hop.location.asn})
                  </div>
                )}

                {/* Delay & Timestamp */}
                <div className="flex items-center gap-3 pl-8 mt-1 text-[11px] text-slate-500 flex-wrap">
                  {hop.timestamp && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{hop.timestamp}</span>
                    </div>
                  )}
                  {hop.delaySeconds !== undefined && hop.delaySeconds > 0 && (
                    <span className="text-amber-600 font-medium">
                      Transit delay: +{hop.delaySeconds}s
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow connector between hops */}
              {!isLastHop && (
                <div className="flex justify-center my-0.5 text-slate-400">
                  <ArrowDown className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
