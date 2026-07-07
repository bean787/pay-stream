'use client';

import React from 'react';
import { CheckCircle, Flame, Gift, Terminal, ExternalLink } from 'lucide-react';

export interface ActivityEvent {
  id: string;
  type: 'created' | 'withdrawn' | 'cancelled';
  streamId: number;
  amount: number;
  timestamp: number;
  txHash: string;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ events }) => {
  return (
    <div className="relative p-0.5 bg-gradient-to-b from-cyan-500/20 to-transparent clip-cyber shadow-[0_0_20px_rgba(6,182,212,0.05)]">
      <div className="bg-slate-950/80 backdrop-blur-md p-6 clip-cyber border border-cyan-500/20 relative overflow-hidden scanner-sweep">
        
        {/* Terminal Header Decor */}
        <div className="absolute top-2 right-4 font-mono text-[7px] text-cyan-500/30">
          [SYS_LOGS_DAEMON]
        </div>

        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-cyan-500/20">
          <Terminal size={16} className="text-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-200 font-mono">
            Transaction Activity Feed
          </h2>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
            &gt; SYSTEM_STATE: LISTENING_FOR_EVENTS...
          </div>
        ) : (
          <div className="space-y-3 pr-1">
            {events.map((event) => {
              const dateStr = new Date(event.timestamp * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              });

              return (
                <div 
                  key={event.id} 
                  className="flex items-start gap-3 p-3 border border-cyan-500/10 bg-slate-900/30 hover:bg-slate-900/60 transition-all clip-cyber-sm"
                >
                  <div className="mt-0.5">
                    {event.type === 'created' && (
                      <div className="p-1 bg-cyan-950 text-cyan-400 border border-cyan-500/30 shadow-[0_0_6px_rgba(6,182,212,0.2)]">
                        <Gift size={10} className="stroke-[2.5]" />
                      </div>
                    )}
                    {event.type === 'withdrawn' && (
                      <div className="p-1 bg-emerald-950 text-emerald-400 border border-emerald-500/30 shadow-[0_0_6px_rgba(16,185,129,0.2)]">
                        <CheckCircle size={10} className="stroke-[2.5]" />
                      </div>
                    )}
                    {event.type === 'cancelled' && (
                      <div className="p-1 bg-rose-950 text-rose-400 border border-rose-500/30 shadow-[0_0_6px_rgba(244,63,94,0.2)]">
                        <Flame size={10} className="stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-grow space-y-1 font-mono">
                    <div className="flex justify-between items-baseline text-[8px] text-slate-500 uppercase tracking-widest">
                      <span>STREAM_INSTANCE: #{event.streamId}</span>
                      <span>{dateStr}</span>
                    </div>
                    <p className="text-[10px] text-slate-200 font-semibold tracking-wide leading-tight">
                      {event.type === 'created' && `Initialized stream: ${event.amount} SV`}
                      {event.type === 'withdrawn' && `Claimed capital: ${event.amount.toFixed(4)} SV`}
                      {event.type === 'cancelled' && `Terminated stream: remainder returned`}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-slate-500">TX:</span>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[8px] text-cyan-400 hover:text-cyan-300 transition-colors font-bold uppercase tracking-wider hover:underline"
                      >
                        {event.txHash.slice(0, 12)}...
                        <ExternalLink size={8} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
