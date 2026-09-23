import React, { useState } from 'react';
import {
  Activity,
  Bot,
  CheckCircle2,
  ExternalLink,
  Flame,
  Globe,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  GovtCommodityPrice,
  GovtPortalStatus,
  simulateGovtUpdate,
  triggerGovtSync,
} from '../services/api';

interface GovtAiSyncBannerProps {
  prices: GovtCommodityPrice[];
  portals: GovtPortalStatus[];
  latestEventMessage: string | null;
  lastSyncTime: string;
  isSyncing: boolean;
  onRefresh: () => void;
}

export const GovtAiSyncBanner: React.FC<GovtAiSyncBannerProps> = ({
  prices,
  portals,
  latestEventMessage,
  lastSyncTime,
  isSyncing,
  onRefresh,
}) => {
  const [showSources, setShowSources] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

  const handleSimulateChange = async () => {
    setSimulating(true);
    try {
      const newPrice = 1600 + Math.floor(Math.random() * 400);
      const res = await simulateGovtUpdate({
        commodity: 'Tomato',
        newModalPrice: newPrice,
        market: 'Ramanagara APMC Yard',
        bulletin: `Agmarknet Daily Flash: Tomato rate updated to ₹${newPrice}/quintal at Ramanagara APMC following morning arrivals.`,
      });
      setSimulationNotice(`⚡ Govt update sent! AI updated Tomato to ₹${newPrice}/qtl next-second.`);
      setTimeout(() => setSimulationNotice(null), 6000);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const handleManualSync = async () => {
    onRefresh();
    try {
      await triggerGovtSync();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-teal-950/40 p-4 shadow-lg backdrop-blur-md">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Live Govt Data Stream
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-200 border border-emerald-400/30">
              Agmarknet & Krishi Marata Vahini
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400/80 font-mono">
            {lastSyncTime ? `Synced: ${lastSyncTime}` : 'Listening for govt updates...'}
          </span>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700/40 hover:bg-emerald-700/60 px-2.5 py-1 text-xs font-medium text-emerald-100 transition-colors border border-emerald-500/30"
            title="Sync latest prices from government portals"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
          <button
            onClick={handleSimulateChange}
            disabled={simulating}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 px-2.5 py-1 text-xs font-medium text-amber-200 transition-colors border border-amber-500/40"
            title="Simulate official government price change to observe real-time AI reaction"
          >
            <Zap className={`h-3.5 w-3.5 text-amber-400 ${simulating ? 'animate-bounce' : ''}`} />
            Simulate Govt Update
          </button>
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-900/70 px-2.5 py-1 text-xs text-emerald-300 transition-colors border border-emerald-700/40"
          >
            <Globe className="h-3.5 w-3.5" />
            Sources
          </button>
        </div>
      </div>

      {/* AI Real-Time Alert Banner */}
      {(latestEventMessage || simulationNotice) && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-100 animate-fadeIn">
          <Bot className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold text-emerald-300">AI Real-Time Change Detector: </span>
            <span>{simulationNotice || latestEventMessage}</span>
          </div>
        </div>
      )}

      {/* Live Commodity Prices Ticker */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {prices.slice(0, 6).map((item) => (
          <div
            key={item.commodity}
            className="rounded-xl bg-black/20 border border-emerald-500/20 p-2.5 hover:border-emerald-400/40 transition-all hover:bg-black/30"
          >
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-medium text-zinc-200 truncate">{item.commodity.split(' ')[0]}</span>
              {item.trend === 'up' && (
                <span className="flex items-center text-emerald-400 font-semibold text-[10px]">
                  <TrendingUp className="h-3 w-3 mr-0.5" />+{item.changeAmount}
                </span>
              )}
              {item.trend === 'down' && (
                <span className="flex items-center text-rose-400 font-semibold text-[10px]">
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                  {item.changeAmount}
                </span>
              )}
              {item.trend === 'stable' && (
                <span className="text-zinc-500 text-[10px]">MSP</span>
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-bold text-white">₹{item.modalPrice}</span>
              <span className="text-[10px] text-zinc-400">/qtl</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[9px] text-emerald-400/80">
              <span className="truncate">{item.market.split(' ')[0]}</span>
              <span className="text-zinc-500">MSP ₹{item.mspRate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Official Government Sources Modal / Expandable Details */}
      {showSources && (
        <div className="mt-4 pt-3 border-t border-emerald-500/20 text-xs text-zinc-300 animate-fadeIn">
          <div className="font-semibold text-emerald-300 mb-2 flex items-center gap-1.5">
            <Globe className="h-4 w-4" />
            Official Government Portals Connected Directly:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {portals.map((p) => (
              <a
                key={p.name}
                href={p.portalUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg bg-emerald-950/60 border border-emerald-600/30 p-2.5 hover:bg-emerald-900/40 hover:border-emerald-500 transition-colors group"
              >
                <div>
                  <div className="font-medium text-emerald-200 group-hover:text-emerald-100 flex items-center gap-1">
                    {p.name}
                    <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                  </div>
                  <div className="text-[10px] text-zinc-400 line-clamp-1">{p.organization}</div>
                </div>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400">
                  {p.status}
                </span>
              </a>
            ))}
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            Ground Truth: Prices, MSP rates, and arrivals are synchronized with the Directorate of Marketing & Inspection, Government of India and the Karnataka State Agricultural Marketing Board.
          </div>
        </div>
      )}
    </div>
  );
};
