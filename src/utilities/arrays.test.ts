import { mapToArray, mapToString } from "./arrays";

describe("array utilities", () => {
  describe("map to array", () => {
    it("should convert a map to an array", () => {
      const map = new Map();
      map.set("key", "value");
      map.set("key2", "value2");
      expect(mapToArray(map)).toEqual([
        ["key", "value"],
        ["key2", "value2"],
      ]);
    });

    it("should convert an empty map to an empty array", () => {
      const map = new Map();
      expect(mapToArray(map)).toEqual([]);
    });
  });

  describe("map to string", () => {
    it("should convert a map to a string", () => {
      const map = new Map();
      map.set("key", "value");
      map.set("key2", "value2");
      expect(mapToString(map)).toEqual("[key: value], [key2: value2]");
    });

    it("should convert an empty map to an empty string", () => {
      const map = new Map();
      expect(mapToString(map)).toEqual("");
    });
  });
});
