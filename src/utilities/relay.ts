import { GraphQLError } from "graphql/error";

import { Pagination } from "../entities/types/pagination";

export function decodeCursor(cursor: string): Map<string, string> {
  const decoded = Buffer.from(cursor, "base64").toString("utf-8").split(";");

  if (decoded.length !== 3) {
    throw new GraphQLError("Invalid cursor", {
      extensions: {
        code: "RELAY_VALIDATION_ERROR",
      },
    });
  }

  return new Map([
    ["type", decoded[0]],
    ["id", decoded[1]],
    ["createdAt", decoded[2]],
  ]);
}

export function encodeCursor(type: string, id: string, createdAt: string): string {
  return Buffer.from(`${type};${id};${createdAt}`).toString("base64");
}

export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
};

export type Connection<T> = {
  edges: {
    node: T;
    cursor: string;
  }[];
  pageInfo: PageInfo;
  totalCount: number;
};

export type ConnectionArgs<T> = {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  filter: T;
};

export function mapGenericFilters<T>(args: ConnectionArgs<T>): Pagination {
  if (args.first && args.last) {
    throw new GraphQLError("Cannot specify both first and last", {
      extensions: {
        code: "RELAY_VALIDATION_ERROR",
      },
    });
  }
  if (args.before && args.after) {
    throw new GraphQLError("Cannot specify both before and after", {
      extensions: {
        code: "RELAY_VALIDATION_ERROR",
      },
    });
  }

  const cursor =
    args.after || args.before
      ? decodeCursor(args.after || args.before || "").get("createdAt")
      : undefined;
  const cursorDirection = args.after ? "ASC" : args.before ? "DESC" : undefined;

  return {
    limit: args.first || args.last || 10,
    cursor: cursor,
    cursorDirection: cursorDirection,
    direction: args.first || args.last === undefined ? "ASC" : "DESC",
  };
}

export function generateConnection<T extends { id: string; created_at: Date }>(
  type: string,
  edges: T[],
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: Date;
    endCursor?: Date;
  },
  totalCount: number,
): Connection<T> {
  return {
    edges: edges.map((edge) => ({
      node: edge,
      cursor: encodeCursor(type, edge.id, edge.created_at.toISOString()),
    })),
    pageInfo: {
      hasNextPage: pageInfo.hasNextPage,
      hasPreviousPage: pageInfo.hasPreviousPage,
      startCursor:
        pageInfo.startCursor && encodeCursor(type, edges[0].id, pageInfo.startCursor.toISOString()),
      endCursor:
        pageInfo.endCursor &&
        encodeCursor(type, edges[edges.length - 1].id, pageInfo.endCursor.toISOString()),
    },
    totalCount,
  };
}
