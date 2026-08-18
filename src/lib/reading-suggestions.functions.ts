import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getReadingSuggestions = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({
    userId: z.string(),
    limit: z.number().optional().default(5),
  }).parse(data))
  .handler(async ({ data }: { data: { userId: string, limit: number } }) => {
    // Deterministic suggestions
    const seed = data.userId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const books = ["JHN", "PSA", "PRO", "ROM", "GEN"];
    
    return books.map((bookId, i) => ({
      id: `${bookId}-${i}`,
      bookId,
      reason: i === 0 ? "Continuidade" : "Recomendado para você",
      priority: 5 - i
    }));
  });
