'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Power, ShieldAlert, Cpu } from 'lucide-react';
import { StreamInfo } from '../lib/stellar';
import { ThreeDTilt } from './ThreeDTilt';
import { calculateVestedAmount } from '../lib/utils';

interface StreamCardProps {
  stream: StreamInfo;
  currentUserAddress: string;
  onWithdraw: (streamId: number) => Promise<void>;
  onCancel: (streamId: number) => Promise<void>;
  loadingWithdraw: boolean;
  loadingCancel: boolean;
}

export const StreamCard: React.FC<StreamCardProps> = ({
  stream,
  currentUserAddress,
  onWithdraw,
  onCancel,
  loadingWithdraw,
  loadingCancel,
}) => {
  const isSender = currentUserAddress.toLowerCase() === stream.sender.toLowerCase();
  const isRecipient = currentUserAddress.toLowerCase() === stream.recipient.toLowerCase();

  const [liveVested, setLiveVested] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateTicker = () => {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = Math.max(0, now - stream.startTime);
      
      const vested = calculateVestedAmount(stream.deposit, stream.startTime, stream.duration, now);
      
      setLiveVested(vested);
      setProgress(Math.min(100, (elapsed / stream.duration) * 100));
    };

    updateTicker();
    const interval = setInterval(updateTicker, 50); // High-frequency tick for seamless animation

    return () => clearInterval(interval);
  }, [stream]);

  const withdrawable = Math.max(0, liveVested - stream.withdrawn);
  const isFullyVested = progress >= 100;
  const isCompleted = stream.withdrawn >= stream.deposit;

  // Visual highlights based on status
  const glowBorder = isCompleted 
    ? 'border-emerald-500/20 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
    : isRecipient 
      ? 'border-cyan-500/20 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.05)]' 
      : 'border-pink-500/20 hover:border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.05)]';

  return (
    <ThreeDTilt maxTilt={8} className="h-full">
      <div className={`bg-slate-950/80 backdrop-blur-md border ${glowBorder} clip-cyber flex flex-col justify-between h-full relative overflow-hidden scanner-sweep`}>
        
        {/* Decorative Grid Grid Ticks */}
        <div className="absolute top-1 right-2 font-mono text-[6px] text-cyan-500/20 select-none">
          [VS_MATRIX_NODE_#{stream.id}]
        </div>

        {/* Top Header info */}
        <div className="p-4 border-b border-cyan-500/10 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 border border-cyan-500 bg-cyan-950/30 text-cyan-400 font-mono text-[9px] font-black uppercase tracking-wider shadow-[0_0_6px_rgba(6,182,212,0.2)]">
              ID: #{stream.id}
            </span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
              {isSender ? 'Outbound Stream' : isRecipient ? 'Inbound Stream' : 'Inter-Escrow'}
            </span>
          </div>
          <div>
            {isSender ? (
              <ArrowUpRight size={14} className="text-pink-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.5)] stroke-[2.5]" />
            ) : (
              <ArrowDownLeft size={14} className="text-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.5)] stroke-[2.5]" />
            )}
          </div>
        </div>

        {/* Main Body */}
        <div className="p-5 space-y-4 flex-grow">
          {/* Node Ledger Details */}
          <div className="space-y-1 bg-slate-900/40 p-2.5 border border-cyan-500/10 font-mono text-[9px] text-slate-400 clip-cyber-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold uppercase tracking-wider text-[8px]">SND_ADDR:</span>
              <span className="text-slate-300 font-semibold">{stream.sender.slice(0, 8)}...{stream.sender.slice(-8)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold uppercase tracking-wider text-[8px]">RCP_ADDR:</span>
              <span className="text-slate-300 font-semibold">{stream.recipient.slice(0, 8)}...{stream.recipient.slice(-8)}</span>
            </div>
          </div>

          {/* Hero Vesting Ticker (Hologram screen) */}
          <div className="text-center py-2 relative">
            <p className="text-[8px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
              VESTED_BALANCE / TOTAL_DEPOSIT
            </p>
            <div className="flex items-baseline justify-center gap-1 font-mono">
              <span className={`text-2xl font-black font-mono tracking-tight text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)] tabular-nums`}>
                {liveVested.toFixed(5)}
              </span>
              <span className="text-[10px] font-bold text-slate-500">/ {stream.deposit.toFixed(0)} SV</span>
            </div>
          </div>

          {/* Segmented Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
              <span>STREAM_PROGRESS</span>
              <span className="text-cyan-400">{progress.toFixed(1)}%</span>
            </div>
            
            <div className="w-full h-3 border border-cyan-500/30 bg-slate-950 p-0.5 clip-cyber-sm">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-75 ease-out relative" 
                style={{ width: `${progress}%` }}
              >
                {/* Horizontal scanner overlay inside progress */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Ledger state values */}
          <div className="p-3 border border-dashed border-cyan-500/25 bg-cyan-950/10 font-mono text-[10px] space-y-1 text-slate-300 clip-cyber-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold uppercase">WITHDRAWN:</span>
              <span className="font-semibold text-slate-200">{stream.withdrawn.toFixed(2)} SV</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold uppercase">CLAIMABLE:</span>
              <span className="font-bold text-cyan-400 drop-shadow-[0_0_3px_rgba(6,182,212,0.3)]">{withdrawable.toFixed(5)} SV</span>
            </div>
          </div>
        </div>

        {/* Footer / Actions HUD */}
        <div className="p-4 border-t border-cyan-500/10 bg-slate-900/40 flex gap-3 items-center">
          {isRecipient ? (
            <button
              onClick={() => onWithdraw(stream.id)}
              disabled={loadingWithdraw || withdrawable <= 0 || isCompleted}
              className="flex-grow flex items-center justify-center gap-1.5 py-2.5 border border-cyan-300 bg-cyan-500 text-black hover:bg-cyan-400 font-bold uppercase tracking-wider text-[10px] active:scale-95 transition-all clip-btn shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-cyan-950/20 disabled:text-cyan-400/50 disabled:border-cyan-500/20 disabled:shadow-none"
            >
              {loadingWithdraw ? (
                <>
                  <Cpu size={11} className="animate-spin text-black" />
                  SYNCING...
                </>
              ) : isCompleted ? (
                'TRANSACTION COMPLETE'
              ) : (
                `WITHDRAW ${withdrawable.toFixed(2)} SV`
              )}
            </button>
          ) : (
            <div className="flex-grow flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-slate-700 bg-slate-950/60 font-mono text-[9px] text-slate-500 font-bold uppercase tracking-widest clip-cyber-sm">
              <ShieldAlert size={10} />
              RECIPIENT SECRET ONLY
            </div>
          )}

          {isSender && !isFullyVested && !isCompleted && (
            <button
              onClick={() => onCancel(stream.id)}
              disabled={loadingCancel}
              title="Terminate Stream"
              className="p-2.5 border border-rose-400 bg-rose-500 text-white hover:bg-rose-400 active:scale-95 transition-all clip-btn shadow-[0_0_12px_rgba(244,63,94,0.25)] hover:shadow-[0_0_20px_rgba(244,63,94,0.45)] disabled:opacity-40 disabled:bg-rose-950/20 disabled:text-rose-400/50 disabled:border-rose-500/20 disabled:shadow-none"
            >
              {loadingCancel ? (
                <Cpu size={12} className="animate-spin" />
              ) : (
                <Power size={12} className="stroke-[2.5]" />
              )}
            </button>
          )}
        </div>
      </div>
    </ThreeDTilt>
  );
};
