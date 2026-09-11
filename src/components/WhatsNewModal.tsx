import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReleaseNotes } from "@/hooks/useReleaseNotes";

/**
 * Aviso discreto exibido uma única vez por versão.
 */
export function WhatsNewModal() {
  const { hasUnseen, latest, markSeen } = useReleaseNotes();

  return (
    <Dialog open={hasUnseen} onOpenChange={(open) => { if (!open) markSeen(); }}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Versão {latest.version}
            </span>
          </div>
          <DialogTitle className="text-left font-serif-title text-xl">
            O que há de novo
          </DialogTitle>
          <DialogDescription className="text-left text-sm leading-relaxed">
            {latest.summary}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" className="h-11 w-full rounded-xl sm:w-auto">
            <Link to="/novidades" onClick={markSeen}>
              Ver todas as novidades
            </Link>
          </Button>
          <Button className="h-11 w-full rounded-xl sm:w-auto" onClick={markSeen}>
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
