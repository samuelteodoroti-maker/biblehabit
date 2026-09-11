import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dateKey as buildDateKey, formatFullDate, formatMonthLabel, toDayNumber } from "@/lib/reading-days";

const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

interface ReadingCalendarProps {
  /** Mês inicial exibido (0-indexado). Padrão: mês de "today". */
  year?: number;
  month?: number;
  readDates: Set<string>;
  /** Data local de hoje (YYYY-MM-DD) no fuso do usuário. */
  today: string;
  loading?: boolean;
  className?: string;
  onDateClick?: (date: string) => void;
}

export function ReadingCalendar({
  year,
  month,
  readDates,
  today,
  loading = false,
  className,
  onDateClick,
}: ReadingCalendarProps) {
  const [todayYear, todayMonth] = useMemo(() => {
    const [y, m] = today.split("-").map(Number);
    return [y, (m ?? 1) - 1];
  }, [today]);

  const [view, setView] = useState({ year: year ?? todayYear, month: month ?? todayMonth });

  useEffect(() => {
    if (year !== undefined && month !== undefined) setView({ year, month });
  }, [year, month]);

  const monthLabel = formatMonthLabel(view.year, view.month);
  const firstWeekday = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
  const totalCells = firstWeekday + daysInMonth;
  const totalGridCells = totalCells + ((7 - (totalCells % 7)) % 7);

  const todayNum = toDayNumber(today);
  const monthPrefix = `${view.year}-${String(view.month + 1).padStart(2, "0")}`;
  const readCount = Array.from(readDates).filter((d) => d.startsWith(monthPrefix)).length;

  const isCurrentMonth = view.year === todayYear && view.month === todayMonth;
  const canGoForward = view.year * 12 + view.month < todayYear * 12 + todayMonth;

  const shift = (delta: number) => {
    setView((v) => {
      const total = v.year * 12 + v.month + delta;
      return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
    });
  };

  return (
    <Card className={cn("border-border/60 bg-card/70 p-4 shadow-card backdrop-blur-sm sm:p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold">Calendário</h2>
          <p className="mt-0.5 truncate text-xs capitalize text-muted-foreground">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => shift(-1)}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {!isCurrentMonth && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-[11px]"
              onClick={() => setView({ year: todayYear, month: todayMonth })}
            >
              Hoje
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => shift(1)}
            disabled={!canGoForward}
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-end">
        <span className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            `${readCount} ${readCount === 1 ? "dia lido" : "dias lidos"}`
          )}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center sm:gap-1.5">
        {WEEK_DAYS.map((day, i) => (
          <div key={`${day}-${i}`} className="pb-2 text-[11px] font-semibold text-muted-foreground">
            {day}
          </div>
        ))}

        {Array.from({ length: totalGridCells }).map((_, index) => {
          const dayNumber = index - firstWeekday + 1;
          const isEmpty = dayNumber < 1 || dayNumber > daysInMonth;
          const key = isEmpty ? `empty-${index}` : buildDateKey(view.year, view.month, dayNumber);
          const isRead = !isEmpty && readDates.has(key);
          const isToday = !isEmpty && today === key;
          const isFuture = !isEmpty && toDayNumber(key) > todayNum;

          return (
            <button
              key={key}
              type="button"
              onClick={() => !isEmpty && !isFuture && onDateClick?.(key)}
              disabled={isEmpty || isFuture}
              aria-current={isToday ? "date" : undefined}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-xl text-[12px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-[13px]",
                isEmpty && "invisible",
                isRead
                  ? "text-primary-foreground shadow-glow gradient-primary hover:brightness-110"
                  : "border border-border/50 bg-background/40 text-foreground/80 hover:bg-background/60",
                isFuture && !isRead && "cursor-not-allowed border-dashed opacity-40 hover:bg-background/40",
                isToday && !isRead && "ring-2 ring-primary/70 ring-offset-2 ring-offset-background",
              )}
              aria-label={
                isEmpty
                  ? undefined
                  : `${formatFullDate(key)}${
                      isFuture ? ", dia futuro" : isRead ? ", leitura registrada" : ", sem leitura"
                    }${isToday ? ", hoje" : ""}`
              }
            >
              {isEmpty ? null : dayNumber}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-3 text-[11px] text-muted-foreground sm:gap-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full gradient-primary" />
          <span>Lido</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full border border-border/70 bg-background/40" />
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full border border-dashed border-border/70 opacity-50" />
          <span>Futuro</span>
        </div>
      </div>
    </Card>
  );
}
