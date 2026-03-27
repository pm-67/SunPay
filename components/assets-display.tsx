"use client";

import { Coins, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StellarAsset } from "@/hooks/use-freighter";

interface AssetsDisplayProps {
  assets: StellarAsset[];
  isLoading: boolean;
}

export function AssetsDisplay({ assets, isLoading }: AssetsDisplayProps) {
  const truncateIssuer = (issuer: string) => {
    if (!issuer) return "";
    return `${issuer.slice(0, 4)}...${issuer.slice(-4)}`;
  };

  const openStellarExpert = (asset: StellarAsset) => {
    if (asset.assetType === "native") {
      window.open("https://stellar.expert/explorer/public/asset/XLM", "_blank");
    } else {
      window.open(
        `https://stellar.expert/explorer/public/asset/${asset.assetCode}-${asset.assetIssuer}`,
        "_blank"
      );
    }
  };

  // Filter out native XLM since it's shown in the main wallet display
  const nonNativeAssets = assets.filter((a) => a.assetType !== "native");

  if (nonNativeAssets.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Other Assets</h2>
        <span className="text-sm text-muted-foreground">
          {nonNativeAssets.length} asset{nonNativeAssets.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {nonNativeAssets.map((asset, index) => (
          <button
            key={`${asset.assetCode}-${asset.assetIssuer}`}
            onClick={() => openStellarExpert(asset)}
            className="flex w-full items-center justify-between rounded-xl bg-muted/30 p-3 text-left transition-colors hover:bg-muted/50"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                <Coins className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{asset.assetCode}</p>
                {asset.assetIssuer && (
                  <p className="text-xs text-muted-foreground">
                    Issuer: {truncateIssuer(asset.assetIssuer)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {asset.balance.toLocaleString(undefined, { maximumFractionDigits: 7 })}
              </span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
