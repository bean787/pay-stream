'use client';

import React, { useState } from 'react';
import { StreamInfo } from '../lib/stellar';
import { StreamCard } from './StreamCard';
import { Columns, ArrowUpRight, ArrowDownLeft, Terminal, Cpu } from 'lucide-react';

interface DashboardProps {
  streams: StreamInfo[];
  currentUserAddress: string;
  onWithdraw: (streamId: number) => Promise<void>;
  onCancel: (streamId: number) => Promise<void>;
  loadingWithdrawId: number | null;
  loadingCancelId: number | null;
  refreshing: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  streams,
  currentUserAddress,
  onWithdraw,
  onCancel,
  loadingWithdrawId,
  loadingCancelId,
  refreshing,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received'>('all');

  const sentStreams = streams.filter(s => s.sender.toLowerCase() === currentUserAddress.toLowerCase());
  const receivedStreams = streams.filter(s => s.recipient.toLowerCase() === currentUserAddress.toLowerCase());

  const filteredStreams = 
    activeTab === 'sent' 
      ? sentStreams 
      : activeTab === 'received' 
        ? receivedStreams 
        : streams;

  return (
    <div className="space-y-6">
      {/* Tabs / Filtering HUD */}
      <div className="flex flex-wrap border border-cyan-500/20 bg-slate-950/60 p-1 clip-cyber-sm max-w-lg shadow-[0_0_15px_rgba(6,182,212,0.02)] backdrop-blur-md">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-grow flex items-center justify-center gap-1.5 py-2 px-3 font-mono text-[10px] font-black uppercase tracking-wider transition-all clip-btn ${
            activeTab === 'all' 
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.1)]' 
              : 'hover:bg-slate-900/60 hover:text-cyan-400/70 border border-transparent text-slate-400'
          }`}
        >
          <Columns size={12} />
          ALL INSTANCES ({streams.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-grow flex items-center justify-center gap-1.5 py-2 px-3 font-mono text-[10px] font-black uppercase tracking-wider transition-all clip-btn ${
            activeTab === 'sent' 
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.1)]' 
              : 'hover:bg-slate-900/60 hover:text-cyan-400/70 border border-transparent text-slate-400'
          }`}
        >
          <ArrowUpRight size={12} />
          OUTBOUND ({sentStreams.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-grow flex items-center justify-center gap-1.5 py-2 px-3 font-mono text-[10px] font-black uppercase tracking-wider transition-all clip-btn ${
            activeTab === 'received' 
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.1)]' 
              : 'hover:bg-slate-900/60 hover:text-cyan-400/70 border border-transparent text-slate-400'
          }`}
        >
          <ArrowDownLeft size={12} />
          INBOUND ({receivedStreams.length})
        </button>
      </div>

      {/* Grid of Streams */}
      {refreshing && streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-cyan-500/20 bg-slate-950/40 clip-cyber shadow-[0_0_15px_rgba(6,182,212,0.05)]">
          <Cpu size={24} className="text-cyan-400 animate-spin mb-3" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-500/60 animate-pulse">
            Syncing streaming state matrices...
          </p>
        </div>
      ) : filteredStreams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-cyan-500/20 bg-slate-950/60 clip-cyber shadow-[0_0_20px_rgba(6,182,212,0.05)] text-center p-8 backdrop-blur-md relative overflow-hidden scanner-sweep">
          <div className="absolute top-2 left-2 font-mono text-[7px] text-cyan-500/20">
            [SYS_QUERY: EMPTY]
          </div>
          <Terminal size={24} className="text-cyan-500/40 mb-3" />
          <p className="font-mono text-xs uppercase tracking-widest text-slate-200 font-bold mb-2">
            No Active Streams Identified
          </p>
          <p className="font-mono text-[10px] text-slate-400 max-w-xs leading-relaxed uppercase tracking-wider">
            {activeTab === 'all' 
              ? "No ledger traces found for vesting streams. Deploy a vault module to initialize streams!"
              : activeTab === 'sent'
                ? "No outbound streams logged for current public key."
                : "No inbound streams registered under current signature."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStreams.map((stream) => (
            <StreamCard
              key={stream.id}
              stream={stream}
              currentUserAddress={currentUserAddress}
              onWithdraw={onWithdraw}
              onCancel={onCancel}
              loadingWithdraw={loadingWithdrawId === stream.id}
              loadingCancel={loadingCancelId === stream.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
