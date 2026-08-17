import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { Bookmark, User } from "lucide-react";
import { Link } from "@tanstack/react-router";

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
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Editorial Decorative Background Elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] -left-[5%] h-[50%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[40%] w-[30%] rounded-full bg-biblical-gold/5 blur-[100px]" />
      </div>

      <DesktopSidebar />

      <div className="relative z-10 flex min-h-screen flex-col md:pl-64 lg:pl-72">
        {/* Top Header for Mobile & Tablet/Desktop context */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-xl md:h-20 lg:px-10">
          <div className="flex flex-col">
            {title ? (
              <>
                <h1 className="font-serif-title text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
                {subtitle && <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:text-xs">{subtitle}</p>}
              </>
            ) : (
              <div className="flex items-center gap-2.5 md:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Bookmark className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-serif-title text-lg font-bold tracking-tight">Bible Habit</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
             <Link to="/settings" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-accent md:h-10 md:w-10">
               <User className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
             </Link>
          </div>
        </header>

        {hero && <div className="px-6 pt-6 lg:px-10 lg:pt-8">{hero}</div>}

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:py-8 md:px-6 lg:px-10">
          <div className="pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
