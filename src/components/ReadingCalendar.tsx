import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

interface ReadingCalendarProps {
  year: number;
  month: number; // 0-indexed (0 = January, 11 = December)
  readDates: Set<string>; // "YYYY-MM-DD"
  today?: string; // "YYYY-MM-DD"
  className?: string;
}

export function ReadingCalendar({
  year,
  month,
  readDates,
  today,
  className,
}: ReadingCalendarProps) {
  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString(
    "pt-BR",
    { month: "long", year: "numeric", timeZone: "UTC" }
  );

  const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const leadingEmptyCells = firstDayOfMonth; // 0 = Sunday
  const totalCells = leadingEmptyCells + daysInMonth;
  const trailingEmptyCells = (7 - (totalCells % 7)) % 7;
  const totalGridCells = totalCells + trailingEmptyCells;

  const pad = (n: number) => String(n).padStart(2, "0");
  const dateKey = (day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

  return (
    <Card className={cn("p-4", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Calendário de leitura</h2>
        <span className="text-xs font-medium capitalize text-muted-foreground">
          {monthLabel}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="pb-2 text-xs font-medium text-muted-foreground"
          >
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
                "flex aspect-square items-center justify-center rounded-full text-sm",
                isEmpty && "invisible",
                isRead
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-foreground",
                isToday && !isRead && "ring-2 ring-primary ring-offset-2 ring-offset-background"
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

      <div className="mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-primary" />
          <span>Dia lido</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border border-border" />
          <span>Sem leitura</span>
        </div>
      </div>
    </Card>
  );
}
