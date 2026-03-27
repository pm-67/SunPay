"use client";

import { cn } from "@/lib/utils";

interface SolarDeviceProps {
  isActive: boolean;
  className?: string;
}

export function SolarDevice({ isActive, className }: SolarDeviceProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Glow effect when active */}
      {isActive && (
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
      )}
      
      <svg
        viewBox="0 0 120 100"
        className="relative h-24 w-32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sun rays */}
        <g className={cn("transition-opacity duration-500", isActive ? "opacity-100" : "opacity-30")}>
          <line x1="60" y1="5" x2="60" y2="15" stroke="currentColor" strokeWidth="2" className="text-accent" />
          <line x1="85" y1="12" x2="80" y2="20" stroke="currentColor" strokeWidth="2" className="text-accent" />
          <line x1="35" y1="12" x2="40" y2="20" stroke="currentColor" strokeWidth="2" className="text-accent" />
          <line x1="95" y1="30" x2="87" y2="33" stroke="currentColor" strokeWidth="2" className="text-accent" />
          <line x1="25" y1="30" x2="33" y2="33" stroke="currentColor" strokeWidth="2" className="text-accent" />
        </g>
        
        {/* Solar panel */}
        <rect
          x="30"
          y="25"
          width="60"
          height="40"
          rx="4"
          className={cn(
            "transition-all duration-500",
            isActive ? "fill-primary stroke-primary" : "fill-muted stroke-muted-foreground"
          )}
          strokeWidth="2"
        />
        
        {/* Panel grid lines */}
        <line x1="50" y1="25" x2="50" y2="65" stroke="currentColor" strokeWidth="1" className="text-primary-foreground/50" />
        <line x1="70" y1="25" x2="70" y2="65" stroke="currentColor" strokeWidth="1" className="text-primary-foreground/50" />
        <line x1="30" y1="38" x2="90" y2="38" stroke="currentColor" strokeWidth="1" className="text-primary-foreground/50" />
        <line x1="30" y1="52" x2="90" y2="52" stroke="currentColor" strokeWidth="1" className="text-primary-foreground/50" />
        
        {/* Panel stand */}
        <path
          d="M55 65 L50 85 L70 85 L65 65"
          className="fill-muted-foreground/60"
        />
        
        {/* Battery */}
        <rect
          x="95"
          y="50"
          width="20"
          height="35"
          rx="3"
          className="fill-card stroke-border"
          strokeWidth="2"
        />
        
        {/* Battery top */}
        <rect
          x="100"
          y="45"
          width="10"
          height="5"
          rx="1"
          className="fill-muted-foreground"
        />
        
        {/* Battery level */}
        <rect
          x="98"
          y={isActive ? "55" : "75"}
          width="14"
          height={isActive ? 25 : 5}
          rx="2"
          className={cn(
            "transition-all duration-700",
            isActive ? "fill-primary" : "fill-destructive"
          )}
        />
        
        {/* Connection line */}
        <path
          d="M90 55 Q 92 55 95 55"
          stroke="currentColor"
          strokeWidth="2"
          className={cn(
            "transition-colors duration-500",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
          strokeDasharray={isActive ? "0" : "4"}
        />
        
        {/* Status indicator */}
        <circle
          cx="105"
          cy="92"
          r="4"
          className={cn(
            "transition-all duration-500",
            isActive 
              ? "fill-primary animate-pulse" 
              : "fill-destructive"
          )}
        />
      </svg>
    </div>
  );
}
