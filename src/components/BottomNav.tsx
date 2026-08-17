import { Link } from "@tanstack/react-router";
import { Home, BookOpen, Users, Settings, BarChart3, Bell } from "lucide-react";

const tabs = [
  { to: "/", label: "Início", icon: Home },
  { to: "/progress", label: "Planos", icon: BookOpen },
  { to: "/statistics", label: "Dados", icon: BarChart3 },
  { to: "/groups", label: "Grupos", icon: Users },
  { to: "/updates", label: "Novidades", icon: Bell },
  { to: "/settings", label: "Ajustes", icon: Settings },
] as const;


export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-xl safe-bottom">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1.5">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ "data-active": "true" } as unknown as { className?: string }}
              className="group relative flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium text-muted-foreground transition-colors data-[active=true]:text-foreground"
            >
              <span className="relative grid h-9 w-9 place-items-center rounded-full transition-all group-data-[active=true]:gradient-primary group-data-[active=true]:text-primary-foreground group-data-[active=true]:shadow-glow">
                <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </span>
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
