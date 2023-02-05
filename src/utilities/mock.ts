import { createMockPool, createMockQueryResult, QueryResultRow } from "slonik";

export function makePool(queryResults: QueryResultRow[]) {
  return createMockPool({
    query: async () => {
      return createMockQueryResult(queryResults);
    },
  });
}
