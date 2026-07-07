'use client';

import React from 'react';
import { Wallet, LogOut, RefreshCw, PlusCircle, Coins } from 'lucide-react';

interface WalletConnectProps {
  address: string;
  balance: number;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefreshBalance: () => void;
  onAddTokenToWallet: () => void;
  onMintTokens: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  address,
  balance,
  connecting,
  onConnect,
  onDisconnect,
  onRefreshBalance,
  onAddTokenToWallet,
  onMintTokens,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-cyan-500/30 bg-slate-950/85 backdrop-blur-md px-6 py-4 gap-4 sticky top-0 z-50 shadow-[0_1px_15px_rgba(0,240,255,0.05)]">
      {/* Brand logo section */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-900 border border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] relative">
          <div className="absolute inset-0 border border-cyan-400/20 animate-pulse"></div>
          <Wallet size={18} className="stroke-[1.5]" />
        </div>
        <div>
          <h1 className="text-lg font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)] font-mono">
            PayStream
          </h1>
          <p className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">
            Soroban Real-Time Vesting HUD
          </p>
        </div>
      </div>

      {/* Wallet controls section */}
      <div className="flex flex-wrap items-center gap-3">
        {address ? (
          <>
            {/* Connected Address panel */}
            <div className="flex items-center gap-2 px-3 py-1.5 border border-cyan-500/30 bg-slate-900/50 clip-cyber-sm font-mono text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.8)]"></span>
              <span className="font-semibold text-[10px] sm:text-xs">
                {address.slice(0, 6)}...{address.slice(-6)}
              </span>
            </div>

            {/* Token Balance panel */}
            <div className="flex items-center gap-2 px-3 py-1.5 border border-cyan-500/30 bg-slate-900/50 clip-cyber-sm font-mono text-xs">
              <span className="text-slate-500 uppercase text-[8px] tracking-wider font-black">BALANCE:</span>
              <span className="text-cyan-400 font-black text-sm drop-shadow-[0_0_4px_rgba(6,182,212,0.3)]">
                {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-cyan-500 font-bold text-[9px] uppercase tracking-wider">SV</span>
              <button 
                onClick={onRefreshBalance} 
                className="ml-1 p-0.5 hover:text-cyan-300 text-cyan-500 transition-colors"
                title="Synchronize ledger state"
              >
                <RefreshCw size={12} className="stroke-[2] hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            {/* Faucet/Add Token Actions */}
            <button
              onClick={onAddTokenToWallet}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-500 bg-slate-800/80 text-slate-200 font-bold uppercase tracking-wider text-[9px] hover:border-cyan-400 hover:text-cyan-400 hover:bg-slate-900 active:scale-95 transition-all clip-btn"
            >
              <PlusCircle size={10} />
              Add SV to Freighter
            </button>

            <button
              onClick={onMintTokens}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-cyan-400 bg-cyan-950/60 text-cyan-300 font-bold uppercase tracking-wider text-[9px] hover:bg-cyan-400 hover:text-black active:scale-95 transition-all clip-btn shadow-[0_0_12px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.45)]"
            >
              <Coins size={10} />
              Incentives Faucet
            </button>

            {/* Logout button */}
            <button
              onClick={onDisconnect}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-rose-500 bg-rose-950/60 text-rose-300 font-bold uppercase tracking-wider text-[9px] hover:bg-rose-500 hover:text-white active:scale-95 transition-all clip-btn shadow-[0_0_12px_rgba(244,63,94,0.15)] hover:shadow-[0_0_20px_rgba(244,63,94,0.45)]"
            >
              <LogOut size={10} />
              Terminal Logoff
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting}
            className="group relative flex items-center justify-center gap-2 px-5 py-2 border border-cyan-300 bg-cyan-500 text-black hover:bg-cyan-400 transition-all duration-300 clip-btn shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_22px_rgba(6,182,212,0.45)]"
          >
            {connecting ? (
              <>
                <RefreshCw size={12} className="animate-spin text-black" />
                <span className="font-bold text-[10px] tracking-widest font-mono text-black">LINKING KEY...</span>
              </>
            ) : (
              <>
                <Wallet size={12} className="stroke-[2] text-black" />
                <span className="font-black text-[10px] tracking-widest font-mono text-black">LINK Freighter WALLET</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
