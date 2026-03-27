"use client";

import { Lock, Unlock, Power, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceControlProps {
  isLocked: boolean;
  lastPayment: string;
  onToggle: () => void;
  canToggle: boolean;
}

export function DeviceControl({ isLocked, lastPayment, onToggle, canToggle }: DeviceControlProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Device Control</h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
              isLocked ? "bg-destructive/10" : "bg-primary/10"
            )}
          >
            {isLocked ? (
              <Lock className="h-6 w-6 text-destructive" />
            ) : (
              <Unlock className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {isLocked ? "Device Locked" : "Device Unlocked"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isLocked ? "Make a payment to unlock" : "Energy is flowing"}
            </p>
          </div>
        </div>

        <button
          onClick={onToggle}
          disabled={!canToggle}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300",
            canToggle
              ? isLocked
                ? "border-primary bg-primary text-primary-foreground hover:scale-105 active:scale-95"
                : "border-primary bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
              : "cursor-not-allowed border-muted bg-muted text-muted-foreground"
          )}
          aria-label={isLocked ? "Turn on device" : "Turn off device"}
        >
          <Power className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Last payment: <span className="font-medium text-foreground">{lastPayment}</span>
        </span>
      </div>
    </div>
  );
}
