import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md pb-24">
        {title ? (
          <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-5 py-4 backdrop-blur-md">
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          </header>
        ) : null}
        <main className="px-5 py-5">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
