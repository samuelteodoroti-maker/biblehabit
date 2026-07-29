import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, BookOpenCheck, CalendarDays } from "lucide-react";
import { currentUser, readingHeatmap, readingPlans } from "@/lib/mockData";
import { ReadingCalendar } from "@/components/ReadingCalendar";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — Bible Tracker" },
      { name: "description", content: "Acompanhe sua leitura bíblica diária, ofensiva e progresso." },
      { property: "og:title", content: "Home — Bible Tracker" },
      { property: "og:description", content: "Acompanhe sua leitura bíblica diária, ofensiva e progresso." },
    ],
  }),
  component: HomePage,
});

// Dados fixos para garantir consistência entre SSR e CSR.
const CURRENT_YEAR = 2026;
const CURRENT_MONTH = 6; // July (0-indexed)
const TODAY = "2026-07-29";
const readDates = new Set(
  readingHeatmap
    .filter((d) => d.value > 0)
    .map((d) => d.date)
    .filter((d) => d.startsWith("2026-07"))
);


function HomePage() {
  const [registered, setRegistered] = useState(false);
  const activePlan = readingPlans[0];

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Olá, boa manhã</p>
        <h1 className="text-2xl font-bold tracking-tight">{currentUser.name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hoje: <span className="font-medium text-foreground">{activePlan.booksToday}</span>
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs">Ofensiva</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{currentUser.streak} dias</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-xs">Total</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{currentUser.totalDays}</p>
        </Card>
      </div>

      <Button
        size="lg"
        className="mb-6 w-full gap-2 py-6 text-base"
        disabled={registered}
        onClick={() => {
          setRegistered(true);
          toast.success("Leitura de hoje registrada! 🔥");
        }}
      >
        <BookOpenCheck className="h-5 w-5" />
        {registered ? "Leitura registrada ✓" : "Registrar leitura de hoje"}
      </Button>

      <ReadingCalendar
        year={CURRENT_YEAR}
        month={CURRENT_MONTH}
        today={TODAY}
        readDates={readDates}
        className="mb-6"
      />
    </AppShell>
  );
}

