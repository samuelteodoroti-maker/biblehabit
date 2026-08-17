import { Link } from "@tanstack/react-router";
import { Home, Bookmark, Users, Settings, ChartNoAxesColumnIncreasing, Bell } from "lucide-react";

const tabs = [
  { to: "/", label: "Início", icon: Home },
  { to: "/progress", label: "Planos", icon: Bookmark },
  { to: "/statistics", label: "Progresso", icon: ChartNoAxesColumnIncreasing },
  { to: "/groups", label: "Comunidade", icon: Users },
  { to: "/settings", label: "Mais", icon: Settings },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)', minHeight: 'calc(72px + env(safe-area-inset-bottom))' }}>
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ "data-active": "true" } as unknown as { className?: string }}
              className="group relative flex flex-col items-center gap-1 py-1 text-[10px] font-medium text-muted-foreground transition-all data-[active=true]:text-primary"
            >
              <span className="relative grid h-8 w-12 place-items-center rounded-full transition-all group-data-[active=true]:bg-primary-soft">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="font-sans leading-none">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
