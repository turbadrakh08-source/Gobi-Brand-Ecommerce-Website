import { describe, test, expect } from "@jest/globals";
import { calculateTotal } from "../lib/calculateTotal";

describe("calculateTotal", () => {
  test("calculates the total price of products", () => {
    expect(calculateTotal(100, 3)).toBe(500);
  });

  test("returns zero when quantity is zero", () => {
    expect(calculateTotal(100, 0)).toBe(0);
  });

  test("calculates decimal prices correctly", () => {
    expect(calculateTotal(19.99, 2)).toBeCloseTo(39.98);
  });
});
