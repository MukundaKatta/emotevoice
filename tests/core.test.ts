import { describe, it, expect } from "vitest";
import { Emotevoice } from "../src/core.js";
describe("Emotevoice", () => {
  it("init", () => { expect(new Emotevoice().getStats().ops).toBe(0); });
  it("op", async () => { const c = new Emotevoice(); await c.process(); expect(c.getStats().ops).toBe(1); });
  it("reset", async () => { const c = new Emotevoice(); await c.process(); c.reset(); expect(c.getStats().ops).toBe(0); });
});
