import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";


import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          O caminho que você procura não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-primary-foreground shadow-glow gradient-primary transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Algo deu errado
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Não conseguimos carregar esta página. Tente novamente ou volte ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold text-primary-foreground gradient-primary transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0a0a1a" },
      { title: "Bible Habit — Sua jornada diária na Palavra" },
      { name: "description", content: "Crie constância na Palavra. Registre suas leituras, acompanhe seu progresso e fortaleça sua jornada bíblica todos os dias." },
      { property: "og:site_name", content: "Bible Habit" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },

      // Security Headers
      { "http-equiv": "Content-Security-Policy", content: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline' https://*.lovable.app; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://mntomcjsbbhveliauopg.supabase.co wss://mntomcjsbbhveliauopg.supabase.co https://*.lovable.app; frame-src 'self' blob:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests;" },
      { "http-equiv": "X-Frame-Options", content: "DENY" },
      { name: "Permissions-Policy", content: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=(), display-capture=()" },
    ],
    scripts: [
      {
        // Default to dark unless the user explicitly picked light.
        children:
          "(function(){try{var s=localStorage.getItem('theme');var d=s?s!=='light':true;if(d)document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();",
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "Bible Habit",
              url: "https://biblehabit.lovable.app",
              logo: "https://biblehabit.lovable.app/favicon.png",
            },
            {
              "@type": "WebSite",
              name: "Bible Habit",
              url: "https://biblehabit.lovable.app",
              description: "Rastreador de leitura bíblica com ofensiva diária, planos, grupos e conquistas.",
              inLanguage: "pt-BR",
            },
          ],
        }),
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Figtree:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <Outlet />
      </AuthGate>
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}

const PUBLIC_PATHS = new Set(["/auth", "/updates", "/support", "/"]);
const PUBLIC_DYNAMIC_PATHS = ["/updates/"];

function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublic = PUBLIC_PATHS.has(pathname) || 
                  PUBLIC_DYNAMIC_PATHS.some(p => pathname.startsWith(p));

  useEffect(() => {
    if (loading) return;
    if (!session && !isPublic) {
      navigate({ to: "/auth", replace: true });
    }
  }, [loading, session, isPublic, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-pulse rounded-full gradient-primary opacity-70" />
      </div>
    );
  }
  if (!session && !isPublic) {
    return <div className="min-h-screen bg-background" />;
  }
  return <>{children}</>;
}
