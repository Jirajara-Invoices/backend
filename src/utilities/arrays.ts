export function mapToArray(map: Map<unknown, unknown>) {
  return Array.from(map.entries());
}

export function mapToString(map: Map<unknown, unknown>) {
  return Array.from(map)
    .map(([key, value]) => `[${key}: ${value}]`)
    .join(", ");
}
