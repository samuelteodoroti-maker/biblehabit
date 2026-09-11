import { LucideIcon, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BibleCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "editorial" | "gold" | "glass";
  icon?: LucideIcon;
  title?: string;
  titleClassName?: string;
  headerGapClassName?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function BibleCard({
  children,
  className,
  variant = "default",
  icon: Icon,
  title,
  subtitle,
  action,
}: BibleCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 ease-out transform-gpu",
        variant === "default" && "border-border/50 bg-card shadow-card hover:shadow-xl hover:border-primary/20",
        variant === "editorial" && "paper-texture border-border bg-card shadow-card hover:shadow-xl hover:-translate-y-1",
        variant === "gold" && "border-biblical-gold/30 bg-card shadow-card ring-1 ring-biblical-gold/10 hover:shadow-gold/20 hover:-translate-y-1",
        variant === "glass" && "border-white/10 bg-white/5 backdrop-blur-2xl dark:border-white/5 dark:bg-white/5 hover:bg-white/10",
        className
      )}
    >
      {/* Decorative Arch (Sutle) */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full border border-primary/5 group-hover:scale-110 transition-transform duration-700" aria-hidden="true" />
      
      {(title || Icon) && (
        <div className="flex items-center justify-between px-5 pt-5 pb-2 md:px-7 md:pt-7 md:pb-3">
          <div className="flex items-center gap-3.5">
            {Icon && (
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                variant === "gold" ? "bg-biblical-gold/10 text-biblical-gold" : "bg-primary-soft text-primary"
              )}>
                <Icon className="h-5.5 w-5.5" strokeWidth={2.2} />
              </div>
            )}
            <div>
              {title && <h3 className="font-serif-title text-lg font-bold tracking-tight text-foreground break-keep [text-wrap:balance]">{title}</h3>}
              {subtitle && <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      
      <div className={cn("relative z-10 p-5 md:p-7", (title || Icon) && "pt-0")}>
        {children}
      </div>
    </div>
  );
}

export function BibleReference({ book, reference, className }: { book: string, reference: string, className?: string }) {
  return (
    <div className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span className="font-serif-title text-xl font-bold italic tracking-tight text-foreground">{book}</span>
      <span className="font-sans text-sm font-semibold tracking-tighter text-muted-foreground">{reference}</span>
    </div>
  );
}

export function ProgressRing({ progress, size = 64, strokeWidth = 5, color = "var(--primary)" }: { progress: number, size?: number, strokeWidth?: number, color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute font-sans text-[10px] font-bold tracking-tighter text-foreground">
        {Math.round(progress)}%
      </span>
    </div>
  );
}
