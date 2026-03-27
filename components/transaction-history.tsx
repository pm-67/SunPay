"use client";

import { ArrowUpRight, ArrowDownLeft, Check, ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StellarPayment } from "@/hooks/use-freighter";

interface TransactionHistoryProps {
  payments: StellarPayment[];
  isLoading: boolean;
  walletAddress: string | null;
  onRefresh: () => void;
}

export function TransactionHistory({ payments, isLoading, walletAddress, onRefresh }: TransactionHistoryProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const openStellarExpert = (hash: string) => {
    window.open(`https://stellar.expert/explorer/public/tx/${hash}`, "_blank");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Transaction History</h2>
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading
            </>
          ) : (
            <>
              Refresh
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {isLoading && payments.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : payments.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ArrowUpRight className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No transactions yet</p>
          <p className="text-sm text-muted-foreground">
            {walletAddress ? "Your transaction history will appear here" : "Connect wallet to see transactions"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment, index) => (
            <button
              key={payment.id}
              onClick={() => openStellarExpert(payment.transactionHash)}
              className="flex w-full items-center justify-between rounded-xl bg-muted/30 p-3 text-left transition-colors hover:bg-muted/50"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  payment.isIncoming ? "bg-primary/10" : "bg-accent/20"
                )}>
                  {payment.isIncoming ? (
                    <ArrowDownLeft className="h-5 w-5 text-primary" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-accent-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {payment.isIncoming ? "+" : "-"}{payment.amount.toFixed(2)} {payment.asset}
                    </p>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      payment.isIncoming ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {payment.isIncoming ? "Received" : "Sent"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTimestamp(payment.timestamp)}</span>
                    <span>•</span>
                    <span>
                      {payment.isIncoming ? "From" : "To"}: {truncateAddress(payment.isIncoming ? payment.from : payment.to)}
                    </span>
                  </div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
