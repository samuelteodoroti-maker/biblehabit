import { createServerFn } from "@tanstack/react-router";
import { z } from "zod";

export const getReadingSuggestions = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({
    userId: z.string(),
    limit: z.number().optional().default(5),
  }).parse(data))
  .handler(async ({ data }) => {
    // In a real app, this would use an algorithm based on user history
    // For now, return deterministic suggestions based on userId
    const seed = data.userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const books = ["JHN", "PSA", "PRO", "ROM", "GEN"];
    
    return books.map((bookId, i) => ({
      id: `${bookId}-${i}`,
      bookId,
      reason: i === 0 ? "Continuidade" : "Recomendado para você",
      priority: 5 - i
    }));
  });
