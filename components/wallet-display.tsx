"use client";

import { Copy, Check, Wallet, LogOut, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { useState } from "react";

interface WalletDisplayProps {
  address: string | null;
  balance: number | null;
  isConnected: boolean;
  isLoading: boolean;
  isInstalled: boolean;
  error: string | null;
  network: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefreshBalance: () => void;
}

export function WalletDisplay({ 
  address, 
  balance, 
  isConnected, 
  isLoading,
  isInstalled,
  error,
  network,
  onConnect, 
  onDisconnect,
  onRefreshBalance,
}: WalletDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshBalance();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-3">
        <button
          onClick={onConnect}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="h-6 w-6" />
              Connect Freighter Wallet
            </>
          )}
        </button>
        
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
            {!isInstalled && (
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Install Freighter <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      {/* Network Badge */}
      {network && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {network === "PUBLIC" ? "Mainnet" : network}
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Wallet Address</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-foreground">
                {address ? truncateAddress(address) : "---"}
              </span>
              <button
                onClick={handleCopy}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Copy address"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted-foreground">Balance</p>
          <div className="flex items-center gap-1">
            <p className="text-xl font-bold text-foreground">
              {balance !== null ? balance.toFixed(2) : "---"} 
              <span className="text-sm font-medium text-muted-foreground"> XLM</span>
            </p>
            <button
              onClick={handleRefresh}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Refresh balance"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Disconnect Button */}
      <button
        onClick={onDisconnect}
        className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Disconnect Wallet
      </button>
    </div>
  );
}
