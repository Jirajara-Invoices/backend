export interface Pagination {
  limit: number;
  direction: "ASC" | "DESC";
  cursor?: string;
  cursorDirection?: "ASC" | "DESC";
}
