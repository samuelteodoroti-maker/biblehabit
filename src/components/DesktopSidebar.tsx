import { Link } from "@tanstack/react-router";
import { 
  Home, 
  Bookmark, 
  Users, 
  Settings, 
  ChartNoAxesColumnIncreasing, 
  Bell,
  HelpCircle,
  History,
  HandHeart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReleaseNotes } from "@/hooks/useReleaseNotes";

const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/progress", label: "Planos", icon: Bookmark },
  { to: "/statistics", label: "Progresso", icon: ChartNoAxesColumnIncreasing },
  { to: "/groups", label: "Comunidade", icon: Users },
  { to: "/novidades", label: "Novidades", icon: Bell },
  { to: "/support", label: "Suporte", icon: HelpCircle },
  { to: "/settings", label: "Ajustes", icon: Settings },
  { to: "/apoie", label: "Apoie este app", icon: HandHeart },
] as const;

export function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card/30 backdrop-blur-xl md:flex md:flex-col lg:w-72">
      <div className="flex h-20 items-center px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Bookmark className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-serif-title text-xl font-bold tracking-tight">Bible Habit</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 pt-6">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            activeOptions={{ exact: to === "/" }}
            activeProps={{ "data-active": "true" } as unknown as { className?: string }}
            className={cn(
              "group flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all",
              "hover:bg-accent/50 hover:text-foreground",
              "data-[active=true]:bg-primary-soft data-[active=true]:text-primary"
            )}
          >
            <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" strokeWidth={2.2} />
            <span className="font-sans tracking-tight">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4">
        <div className="rounded-3xl border border-primary/10 bg-primary/5 p-5 text-center">
          <p className="font-serif text-sm font-medium italic text-primary">"Lâmpada para os meus pés é a tua palavra..."</p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary/60">Salmos 119:105</p>
        </div>
      </div>
    </aside>
  );
}
