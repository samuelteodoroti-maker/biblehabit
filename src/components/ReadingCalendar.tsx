import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

interface ReadingCalendarProps {
  year: number;
  month: number; // 0-indexed
  readDates: Set<string>;
  today?: string;
  className?: string;
}

export function ReadingCalendar({
  year,
  month,
  readDates,
  today,
  className,
}: ReadingCalendarProps) {
  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const leadingEmptyCells = firstDayOfMonth;
  const totalCells = leadingEmptyCells + daysInMonth;
  const trailingEmptyCells = (7 - (totalCells % 7)) % 7;
  const totalGridCells = totalCells + trailingEmptyCells;

  const pad = (n: number) => String(n).padStart(2, "0");
  const dateKey = (day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

  const readCount = Array.from(readDates).filter((d) =>
    d.startsWith(`${year}-${pad(month + 1)}`),
  ).length;

  return (
    <Card className={cn("border-border/60 bg-card/70 p-5 shadow-card backdrop-blur-sm", className)}>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-base font-semibold">Calendário</h2>
          <p className="mt-0.5 text-xs capitalize text-muted-foreground">{monthLabel}</p>
        </div>
        <span className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {readCount} {readCount === 1 ? "dia lido" : "dias lidos"}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEK_DAYS.map((day, i) => (
          <div key={`${day}-${i}`} className="pb-2 text-[11px] font-semibold text-muted-foreground">
            {day}
          </div>
        ))}

        {Array.from({ length: totalGridCells }).map((_, index) => {
          const dayNumber = index - leadingEmptyCells + 1;
          const isEmpty = dayNumber < 1 || dayNumber > daysInMonth;
          const key = isEmpty ? `empty-${index}` : dateKey(dayNumber);
          const isRead = !isEmpty && readDates.has(key);
          const isToday = !isEmpty && today === key;

          return (
            <div
              key={key}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-xl text-[13px] font-medium transition-all",
                isEmpty && "invisible",
                isRead
                  ? "text-primary-foreground shadow-glow gradient-primary"
                  : "border border-border/50 bg-background/40 text-foreground/80",
                isToday && !isRead && "ring-2 ring-primary/70 ring-offset-2 ring-offset-background",
              )}
              title={
                isEmpty
                  ? undefined
                  : isRead
                    ? `${key}: leitura registrada`
                    : `${key}: sem leitura`
              }
            >
              {isEmpty ? null : dayNumber}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end gap-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full gradient-primary" />
          <span>Lido</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full border border-border/70 bg-background/40" />
          <span>Pendente</span>
        </div>
      </div>
    </Card>
  );
}
