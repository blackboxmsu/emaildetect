import React from 'react';
import { AlertTriangle, ShieldCheck, Clock, Server, MapPin } from 'lucide-react';

export const RelayRouteVisualizer = ({
  hops = [],
  earliestReliableIp,
  anomalies = []
}) => {
  return (
    <div className="panel p-5 mb-4 bg-slate-900/90 border border-slate-800 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 m-0">
            <Server className="w-4 h-4 text-cyan-400" />
            Transmission Relay Route
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Reconstructed chronological hop path from Received headers (bottom to top).
          </p>
        </div>
        <span className="badge badge-neutral text-xs py-0.5 px-2 bg-slate-800 border border-slate-700 text-slate-300 rounded">
          {hops.length} Hops
        </span>
      </div>

      {/* Anomalies alert */}
      {anomalies.length > 0 && (
        <div className="mb-3.5 p-2.5 px-3 bg-rose-500/10 border border-rose-500/30 rounded-md">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Routing Anomalies:
          </div>
          <ul className="pl-4 text-rose-300/90 text-xs m-0 flex flex-col gap-0.5 list-disc">
            {anomalies.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Hop List */}
      <div className="flex flex-col gap-2.5">
        {hops.map((hop) => {
          const isEarliest = hop.isEarliestReliable || hop.ip === earliestReliableIp;

          return (
            <div
              key={hop.hopIndex}
              className={`rounded-md p-3 border transition ${
                isEarliest
                  ? 'bg-cyan-950/20 border-cyan-700/60 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded flex items-center justify-center font-semibold text-[11px] font-mono text-white ${
                    isEarliest ? 'bg-cyan-600' : 'bg-slate-800'
                  }`}>
                    {hop.hopIndex}
                  </span>

                  <div>
                    <span className="text-xs font-semibold text-slate-100">
                      {hop.by || 'Destination MX'}
                    </span>
                    {hop.from && (
                      <span className="text-xs text-slate-400 ml-1.5">
                        ← {hop.from}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isEarliest && (
                    <span className="badge badge-info text-[10px] py-0.5 px-1.5 flex items-center gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      Earliest Reliable Origin Node
                    </span>
                  )}

                  {hop.ip && (
                    <span className="badge badge-neutral font-mono text-xs py-0.5 px-2 bg-slate-800 border border-slate-700 text-slate-300 rounded">
                      {hop.ip}
                    </span>
                  )}
                </div>
              </div>

              {/* Hop Details */}
              <div className="flex items-center gap-3.5 mt-2 text-[11px] text-slate-400 flex-wrap">
                {hop.timestamp && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="font-mono text-slate-400">{hop.timestamp}</span>
                  </div>
                )}
                {hop.delaySeconds !== undefined && hop.delaySeconds > 0 && (
                  <div className="text-amber-400">
                    Delay: +{hop.delaySeconds}s
                  </div>
                )}
                {hop.location && (
                  <div className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{hop.location.city}, {hop.location.country} ({hop.location.isp || hop.location.asn})</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
