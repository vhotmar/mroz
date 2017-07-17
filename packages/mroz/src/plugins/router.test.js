import plugin from "./router";

describe("router plugin", () => {
  describe("plugin", () => {
    it("should have correct properties", () => {
      const p = plugin({ history: {} })({});

      expect(p).toHaveProperty("reducers.router");
      expect(p).toHaveProperty("middleware");
      expect(p.middleware.length).toBe(1);
    });
  });
});
