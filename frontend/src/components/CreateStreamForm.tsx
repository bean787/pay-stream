'use client';

import React, { useState } from 'react';
import { Send, Clock, DollarSign, User, RefreshCw, Layers } from 'lucide-react';
import { StrKey } from '@stellar/stellar-sdk';

interface CreateStreamFormProps {
  balance: number;
  onSubmit: (recipient: string, amount: number, duration: number) => Promise<void>;
  loading: boolean;
}

export const CreateStreamForm: React.FC<CreateStreamFormProps> = ({
  balance,
  onSubmit,
  loading,
}) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('120'); // Default 120 seconds for fast demo
  const [error, setError] = useState('');

  const ratePerSecond = 
    amount && duration && Number(duration) > 0 
      ? (Number(amount) / Number(duration)).toFixed(6)
      : '0.000000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!recipient) {
      setError('Recipient address is required.');
      return;
    }
    
    // Validate Stellar public key format
    if (!StrKey.isValidEd25519PublicKey(recipient) && !recipient.startsWith('C')) {
      setError('Invalid recipient Stellar address (must start with G or C).');
      return;
    }

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    if (numAmount > balance) {
      setError(`Insufficient SV token balance. You have ${balance} SV.`);
      return;
    }

    const numDuration = Number(duration);
    if (!duration || isNaN(numDuration) || numDuration <= 0) {
      setError('Duration must be greater than 0.');
      return;
    }

    try {
      await onSubmit(recipient, numAmount, numDuration);
      setRecipient('');
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit transaction.');
    }
  };

  return (
    <div className="relative p-0.5 bg-gradient-to-b from-cyan-500/20 to-transparent clip-cyber shadow-[0_0_20px_rgba(6,182,212,0.05)]">
      <div className="bg-slate-950/80 backdrop-blur-md p-6 clip-cyber border border-cyan-500/20 relative overflow-hidden scanner-sweep">
        
        {/* Terminal Header Decor */}
        <div className="absolute top-2 right-4 font-mono text-[7px] text-cyan-500/30">
          [INIT_SYS_VAULT_MOD]
        </div>

        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-cyan-500/20">
          <Layers size={16} className="text-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-200 font-mono">
            Vesting Stream Console
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 border border-rose-500/40 bg-rose-950/20 text-rose-300 font-mono text-[10px] uppercase tracking-wide">
              ⚠️ SYSTEM_ERROR: {error}
            </div>
          )}

          {/* Recipient Input */}
          <div>
            <label className="block text-[8px] font-mono font-black uppercase tracking-widest text-cyan-500/70 mb-1.5">
              &gt; RECIPIENT_LEDGER_ADDRESS
            </label>
            <div className="relative clip-cyber-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-500/50">
                <User size={14} />
              </div>
              <input
                type="text"
                placeholder="G... or C..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={loading}
                className="block w-full pl-9 pr-3 py-2 border border-cyan-500/30 bg-slate-900/60 focus:bg-slate-900/90 text-cyan-300 placeholder-cyan-700/50 font-mono text-xs outline-none focus:border-cyan-400 focus:shadow-[0_0_8px_rgba(6,182,212,0.15)] transition-all clip-cyber-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount Input */}
            <div>
              <label className="block text-[8px] font-mono font-black uppercase tracking-widest text-cyan-500/70 mb-1.5">
                &gt; STREAM_QUANTITY (SV)
              </label>
              <div className="relative clip-cyber-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-500/50">
                  <DollarSign size={14} />
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                  className="block w-full pl-9 pr-3 py-2 border border-cyan-500/30 bg-slate-900/60 focus:bg-slate-900/90 text-cyan-300 placeholder-cyan-700/50 font-mono text-xs outline-none focus:border-cyan-400 focus:shadow-[0_0_8px_rgba(6,182,212,0.15)] transition-all clip-cyber-sm"
                />
              </div>
            </div>

            {/* Duration Input */}
            <div>
              <label className="block text-[8px] font-mono font-black uppercase tracking-widest text-cyan-500/70 mb-1.5">
                &gt; VESTING_TIME (SEC)
              </label>
              <div className="relative clip-cyber-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-500/50">
                  <Clock size={14} />
                </div>
                <input
                  type="number"
                  placeholder="120"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={loading}
                  className="block w-full pl-9 pr-3 py-2 border border-cyan-500/30 bg-slate-900/60 focus:bg-slate-900/90 text-cyan-300 placeholder-cyan-700/50 font-mono text-xs outline-none focus:border-cyan-400 focus:shadow-[0_0_8px_rgba(6,182,212,0.15)] transition-all clip-cyber-sm"
                />
              </div>
            </div>
          </div>

          {/* Telemetry output box */}
          <div className="p-3 border border-cyan-500/20 bg-slate-900/40 font-mono text-[10px] space-y-1.5 text-slate-300 clip-cyber-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold uppercase tracking-wider">FLOW RATE:</span>
              <span className="font-bold text-cyan-400 drop-shadow-[0_0_3px_rgba(6,182,212,0.2)]">{ratePerSecond} SV/sec</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold uppercase tracking-wider">CONTRACT INTERACTION:</span>
              <span className="font-bold uppercase text-amber-500">Linear Escrow</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex items-center justify-center gap-2 py-3 border border-cyan-300 bg-cyan-500 text-black hover:bg-cyan-400 font-black uppercase tracking-widest text-[10px] transition-all duration-300 clip-btn shadow-[0_0_12px_rgba(6,182,212,0.15)] hover:shadow-[0_0_22px_rgba(6,182,212,0.45)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw size={12} className="animate-spin text-black" />
                INITIATING TRANSACTIONS...
              </>
            ) : (
              <>
                <Send size={12} className="stroke-[2.5] text-black" />
                DEPLOY VESTING INSTANCE
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
