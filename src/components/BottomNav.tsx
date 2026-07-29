import { Link } from "@tanstack/react-router";
import { Home, BookOpen, Users, Trophy, Settings } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/progress", label: "Progresso", icon: BookOpen },
  { to: "/groups", label: "Grupos", icon: Users },
  { to: "/achievements", label: "Conquistas", icon: Trophy },
  { to: "/settings", label: "Ajustes", icon: Settings },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors hover:text-foreground"
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
