import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({
  title,
  subtitle,
  children,
  hero,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  hero?: ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Ambient hero glow behind content */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] hero-glow" aria-hidden />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col pb-28">
        {title ? (
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 px-5 py-4 backdrop-blur-xl">
            <h1 className="font-display text-lg font-semibold tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </header>
        ) : null}
        {hero ? <div className="px-5 pt-6">{hero}</div> : null}
        <main className="flex-1 px-5 py-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
