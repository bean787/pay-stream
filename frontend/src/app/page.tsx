'use client';

import '../lib/polyfill';
import React, { useState, useEffect, useCallback } from 'react';
import { WalletConnect } from '../components/WalletConnect';
import { CreateStreamForm } from '../components/CreateStreamForm';
import { Dashboard } from '../components/Dashboard';
import { ActivityFeed, ActivityEvent } from '../components/ActivityFeed';
import { CyberCanvas } from '../components/CyberCanvas';
import {
  connectWallet,
  getTokenBalance,
  listStreamsFor,
  getStreamDetails,
  createStream,
  withdrawFromStream,
  cancelStream,
  StreamInfo,
  addTokenToWallet,
  mintTokens,
} from '../lib/stellar';
import { ShieldCheck, Flame, Terminal, Cpu, Coins, PlusCircle } from 'lucide-react';

export default function Home() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [streams, setStreams] = useState<StreamInfo[]>([]);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  
  const [connecting, setConnecting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingWithdrawId, setLoadingWithdrawId] = useState<number | null>(null);
  const [loadingCancelId, setLoadingCancelId] = useState<number | null>(null);
  
  const [errorNotice, setErrorNotice] = useState<{ message: string; type: 'error' | 'info' | 'warning' } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Parse error messages into user-friendly notices
  const parseError = (err: unknown) => {
    let msg = '';
    if (err instanceof Error) {
      msg = err.message;
    } else if (err && typeof err === 'object') {
      if ('message' in err && typeof (err as Record<string, unknown>).message === 'string') {
        msg = (err as Record<string, unknown>).message as string;
      } else {
        try {
          msg = JSON.stringify(err);
        } catch {
          msg = String(err);
        }
      }
    } else {
      msg = String(err);
    }

    if (!msg || msg === '{}' || msg === '[object Object]') {
      msg = 'An unknown wallet or network error occurred.';
    }

    console.error('Captured Error:', msg);

    if (msg.toLowerCase().includes('freighter') && msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('wallet not found')) {
      return {
        message: 'Freighter extension not found. Please install Freighter from freighter.app to connect.',
        type: 'warning' as const,
      };
    }
    if (msg.toLowerCase().includes('user reject') || msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('declined') || msg.toLowerCase().includes('closed')) {
      return {
        message: 'Signature request cancelled. No changes were made.',
        type: 'info' as const,
      };
    }
    if (msg.toLowerCase().includes('insufficient') || msg.toLowerCase().includes('balance')) {
      return {
        message: 'Insufficient balance to complete the transaction.',
        type: 'error' as const,
      };
    }
    return {
      message: msg || 'Transaction failed. Please try again.',
      type: 'error' as const,
    };
  };

  const loadBlockchainData = useCallback(async (userAddress: string) => {
    if (!userAddress) return;
    setRefreshing(true);
    setErrorNotice(null);
    try {
      // Get balance
      const tokenBal = await getTokenBalance(userAddress);
      setBalance(tokenBal);

      // Get streams list
      const streamIds = await listStreamsFor(userAddress);
      
      const streamList: StreamInfo[] = [];
      for (const id of streamIds) {
        const details = await getStreamDetails(id);
        if (details) {
          streamList.push(details);
        }
      }
      setStreams(streamList);
    } catch (err) {
      setErrorNotice(parseError(err));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setErrorNotice(null);
    try {
      const walletAddr = await connectWallet();
      setAddress(walletAddr);
      await loadBlockchainData(walletAddr);
    } catch (err) {
      setErrorNotice(parseError(err));
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAddress('');
    setBalance(0);
    setStreams([]);
    setErrorNotice({
      message: 'Wallet disconnected successfully.',
      type: 'info',
    });
  };

  const handleAddToken = async () => {
    setErrorNotice(null);
    try {
      setErrorNotice({
        message: 'Requesting to add SV to Freighter...',
        type: 'info',
      });
      await addTokenToWallet();
      setErrorNotice({
        message: 'SV token successfully added/verified in your Freighter wallet!',
        type: 'info',
      });
    } catch (err) {
      setErrorNotice(parseError(err));
    }
  };

  const handleMintTokens = async () => {
    if (!address) return;
    setErrorNotice(null);
    try {
      setErrorNotice({
        message: 'Minting 1000 SV from the testnet faucet... Please wait.',
        type: 'info',
      });
      const txHash = await mintTokens(address, 1000);
      setErrorNotice({
        message: `Successfully minted 1000 SV to your wallet! Hash: ${txHash.slice(0, 16)}...`,
        type: 'info',
      });
      await loadBlockchainData(address);
    } catch (err) {
      setErrorNotice(parseError(err));
    }
  };

  const handleCreateStream = async (recipient: string, amount: number, duration: number) => {
    setCreating(true);
    setErrorNotice(null);
    try {
      const txHash = await createStream(address, recipient, amount, duration);
      
      // Add event to feed
      const newEvent: ActivityEvent = {
        id: Math.random().toString(),
        type: 'created',
        streamId: streams.length + 1, // temporary mock ID calculation for feed
        amount,
        timestamp: Math.floor(Date.now() / 1000),
        txHash,
      };
      setEvents(prev => [newEvent, ...prev]);

      setErrorNotice({
        message: `Vesting stream of ${amount} SV initiated successfully! Hash: ${txHash.slice(0, 16)}...`,
        type: 'info',
      });

      // Reload
      await loadBlockchainData(address);
    } catch (err) {
      setErrorNotice(parseError(err));
    } finally {
      setCreating(false);
    }
  };

  const handleWithdraw = async (streamId: number) => {
    setLoadingWithdrawId(streamId);
    setErrorNotice(null);
    try {
      const txHash = await withdrawFromStream(address, streamId);

      // Find stream details to log amount
      const targetStream = streams.find(s => s.id === streamId);
      const amountWithdrawn = targetStream ? (targetStream.deposit - targetStream.withdrawn) : 0; // estimation

      const newEvent: ActivityEvent = {
        id: Math.random().toString(),
        type: 'withdrawn',
        streamId,
        amount: amountWithdrawn,
        timestamp: Math.floor(Date.now() / 1000),
        txHash,
      };
      setEvents(prev => [newEvent, ...prev]);

      setErrorNotice({
        message: `Tokens withdrawn successfully! Hash: ${txHash.slice(0, 16)}...`,
        type: 'info',
      });

      await loadBlockchainData(address);
    } catch (err) {
      setErrorNotice(parseError(err));
    } finally {
      setLoadingWithdrawId(null);
    }
  };

  const handleCancel = async (streamId: number) => {
    setLoadingCancelId(streamId);
    setErrorNotice(null);
    try {
      const txHash = await cancelStream(address, streamId);

      const newEvent: ActivityEvent = {
        id: Math.random().toString(),
        type: 'cancelled',
        streamId,
        amount: 0, // remainder returned
        timestamp: Math.floor(Date.now() / 1000),
        txHash,
      };
      setEvents(prev => [newEvent, ...prev]);

      setErrorNotice({
        message: `Stream cancelled successfully. Remaining unvested funds returned to sender. Hash: ${txHash.slice(0, 16)}...`,
        type: 'info',
      });

      await loadBlockchainData(address);
    } catch (err) {
      setErrorNotice(parseError(err));
    } finally {
      setLoadingCancelId(null);
    }
  };

  // Poll blockchain data every 8 seconds when connected
  useEffect(() => {
    if (!address) return;
    const interval = setInterval(() => {
      loadBlockchainData(address);
    }, 8000);
    return () => clearInterval(interval);
  }, [address, loadBlockchainData]);

  return (
    <main className="min-h-screen text-slate-100 pb-16 relative">
      {/* Background Interactive Particles Canvas */}
      <CyberCanvas />

      {/* Top Banner Wallet Panel */}
      <WalletConnect
        address={address}
        balance={balance}
        connecting={connecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onRefreshBalance={() => loadBlockchainData(address)}
        onAddTokenToWallet={handleAddToken}
        onMintTokens={handleMintTokens}
      />

      {/* Main content grid */}
      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8 relative z-10">
        
        {/* User feedback / alerts panel */}
        {errorNotice && (
          <div 
            className={`p-4 border font-mono text-xs flex items-center justify-between clip-cyber-sm backdrop-blur-md ${
              errorNotice.type === 'error'
                ? 'bg-rose-950/40 border-rose-500/80 text-rose-300 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                : errorNotice.type === 'warning'
                  ? 'bg-amber-950/40 border-amber-500/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                  : 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`font-black tracking-widest ${
                errorNotice.type === 'error' ? 'text-rose-500' : errorNotice.type === 'warning' ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                [{errorNotice.type.toUpperCase()}]
              </span>
              <span>{errorNotice.message}</span>
            </div>
            <button 
              onClick={() => setErrorNotice(null)} 
              className="font-bold hover:text-white transition-colors font-mono text-[9px] uppercase ml-4 border border-slate-700 hover:border-slate-400 px-2 py-1 bg-black/60 text-slate-400 clip-btn"
            >
              Dismiss
            </button>
          </div>
        )}

        {address ? (
          <div className="space-y-8">
            {/* Quick Wallet Asset Configuration Notice */}
            <div className="flex flex-col md:flex-row items-center justify-between p-4 border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md clip-cyber-sm gap-4 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <div className="flex items-center gap-3 font-mono text-[10px] text-cyan-300 uppercase tracking-widest">
                <Coins size={16} className="text-cyan-400 animate-pulse drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                <span>Terminal Token Sync // Add the <strong className="text-white text-xs">SV</strong> asset code to track balance updates on your active terminal ledger.</span>
              </div>
              <button
                onClick={handleAddToken}
                className="flex items-center gap-1.5 px-4 py-2 border border-cyan-400 bg-cyan-500 text-black font-black uppercase tracking-widest text-[9px] font-mono hover:bg-cyan-400 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] clip-btn"
              >
                <PlusCircle size={12} className="text-black" />
                Add SV Token to Wallet
              </button>
            </div>

            {/* Section 1: Active Streams (Full Width HUD) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-4">
                <h2 className="text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] font-mono">
                  <ShieldCheck size={20} className="text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                  Active Telemetry Streams
                </h2>
                {refreshing && (
                  <span className="font-mono text-[9px] text-cyan-400/70 uppercase tracking-widest animate-pulse flex items-center gap-1.5 bg-cyan-950/20 px-2 py-0.5 border border-cyan-500/20">
                    <Cpu size={10} className="animate-spin" />
                    Syncing...
                  </span>
                )}
              </div>

              <Dashboard
                streams={streams}
                currentUserAddress={address}
                onWithdraw={handleWithdraw}
                onCancel={handleCancel}
                loadingWithdrawId={loadingWithdrawId}
                loadingCancelId={loadingCancelId}
                refreshing={refreshing}
              />
            </div>

            {/* Section 2: Command Console & Activity logs (Stacked below) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start pt-8 border-t border-slate-800">
              {/* Form (40% width on large screens) */}
              <div className="lg:col-span-2">
                <CreateStreamForm
                  balance={balance}
                  onSubmit={handleCreateStream}
                  loading={creating}
                />
              </div>

              {/* Activity Feed (60% width on large screens) */}
              <div className="lg:col-span-3">
                <ActivityFeed events={events} />
              </div>
            </div>
          </div>
        ) : (
          /* Locked UI screen if not connected */
          <div className="relative p-1 bg-gradient-to-b from-cyan-500/40 via-blue-600/20 to-transparent clip-cyber max-w-xl mx-auto shadow-[0_0_30px_rgba(0,68,255,0.15)] mt-12">
            <div className="flex flex-col items-center justify-center py-20 bg-slate-950/90 backdrop-blur-md clip-cyber text-center p-8 border border-cyan-500/30 relative overflow-hidden scanner-sweep">
              
              {/* Corner decor lines */}
              <div className="absolute top-3 left-3 font-mono text-[8px] text-cyan-500/40 tracking-wider">
                [SYS_ACCESS: SHUTDOWN]
              </div>
              <div className="absolute top-3 right-3 font-mono text-[8px] text-cyan-500/40 tracking-wider">
                PORT: 443 // SOROBAN
              </div>
              
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-rose-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)] mb-6 text-rose-500 relative">
                <div className="absolute inset-0 rounded-full border border-rose-500/20 animate-ping"></div>
                <Flame size={28} className="stroke-[1.5]" />
              </div>
              
              <h2 className="text-2xl font-black uppercase tracking-wider text-slate-100 mb-3 font-mono">
                System Interface Locked
              </h2>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest max-w-sm mb-10 leading-relaxed">
                Connect your encrypted Freighter terminal wallet key to initiate, monitor, and claim vesting payment streams in real time.
              </p>
              
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="group relative flex items-center justify-center gap-2 px-8 py-4 border border-cyan-400 bg-cyan-950/30 hover:bg-cyan-400 text-cyan-400 hover:text-black font-black uppercase tracking-widest text-xs active:translate-x-[1px] active:translate-y-[1px] shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] clip-btn transition-all duration-300 disabled:opacity-50"
              >
                <Terminal size={14} className="stroke-[2.5] text-cyan-400 group-hover:text-black" />
                {connecting ? 'INITIALIZING LINK...' : 'CONNECT CORE KEY'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
