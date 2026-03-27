"use client";

import { AlertTriangle, Battery, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "low-balance" | "expiring" | "success";
  message: string;
}

interface AlertsProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

export function Alerts({ alerts, onDismiss }: AlertsProps) {
  if (alerts.length === 0) return null;

  const getAlertConfig = (type: Alert["type"]) => {
    switch (type) {
      case "low-balance":
        return {
          icon: Battery,
          bgClass: "bg-destructive/10 border-destructive/20",
          iconClass: "text-destructive",
        };
      case "expiring":
        return {
          icon: Clock,
          bgClass: "bg-accent/20 border-accent/30",
          iconClass: "text-accent-foreground",
        };
      case "success":
        return {
          icon: Check,
          bgClass: "bg-primary/10 border-primary/20",
          iconClass: "text-primary",
        };
    }
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const config = getAlertConfig(alert.type);
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 transition-all duration-300 animate-in fade-in slide-in-from-top-2",
              config.bgClass
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className={cn("h-5 w-5", config.iconClass)} />
              <span className="text-sm font-medium text-foreground">{alert.message}</span>
            </div>
            <button
              onClick={() => onDismiss(alert.id)}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
