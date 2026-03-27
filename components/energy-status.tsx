"use client";

import { Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SolarDevice } from "./solar-device";

interface EnergyStatusProps {
  isOn: boolean;
  remainingTime: string;
  usagePercent: number;
}

export function EnergyStatus({ isOn, remainingTime, usagePercent }: EnergyStatusProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Energy Status</h2>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
            isOn
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive"
          )}
        >
          <span className={cn(
            "h-2 w-2 rounded-full",
            isOn ? "bg-primary animate-pulse" : "bg-destructive"
          )} />
          {isOn ? "ON" : "OFF"}
        </div>
      </div>

      <div className="mb-6 flex justify-center">
        <SolarDevice isActive={isOn} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Remaining Time</span>
          </div>
          <span className="text-lg font-bold text-foreground">{remainingTime}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Energy Usage</span>
            <span className="font-medium text-foreground">{usagePercent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                usagePercent > 80 ? "bg-destructive" : usagePercent > 50 ? "bg-accent" : "bg-primary"
              )}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
