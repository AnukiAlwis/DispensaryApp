import { parseFrequency, calculateQuantity } from "./frequency";

describe("parseFrequency", () => {
  test.each([
    ["After meals", 3],
    ["Before meals", 3],
    ["Twice daily", 2],
    ["At bedtime", 1],
    ["Every 6 hours", 4],
    ["Every 4 hours", 6],
    ["Every 8 hours", 3],
    ["Every 12 hours", 2],
    ["Once daily", 1],
    ["Once a day", 1],
  ])("maps predefined option \"%s\" to %d times/day", (freq, expected) => {
    expect(parseFrequency(freq)).toBe(expected);
  });

  test.each([
    ["3 times daily", 3],
    ["3 times a day", 3],
    ["5 times", 5],
    ["2 times", 2],
  ])("parses free-text numeric frequency \"%s\" as %d times/day", (freq, expected) => {
    expect(parseFrequency(freq)).toBe(expected);
  });

  test("is case-insensitive", () => {
    expect(parseFrequency("EVERY 6 HOURS")).toBe(4);
    expect(parseFrequency("tWiCe DaiLy")).toBe(2);
  });

  test("defaults to 1 for unrecognized text", () => {
    expect(parseFrequency("as needed")).toBe(1);
    expect(parseFrequency("")).toBe(1);
  });
});

describe("calculateQuantity", () => {
  test("computes units x timesPerDay x duration", () => {
    // 1 tablet, After meals (3x/day), 1 day => 3
    expect(calculateQuantity("1 tablet", "After meals", 1)).toBe(3);
  });

  test("regression: 'Every 6 hours' previously defaulted to 1x/day (bug), now correctly 4x/day", () => {
    // Bug repro: dosage "1 tablet", 5 days -> was 5 (1x/day), should be 20 (4x/day)
    expect(calculateQuantity("1 tablet", "Every 6 hours", 5)).toBe(20);
  });

  test("regression: changing frequency after dosage/duration set recalculates correctly", () => {
    const dosage = "2 tablets";
    const duration = 3;
    expect(calculateQuantity(dosage, "Twice daily", duration)).toBe(12); // 2*2*3
    expect(calculateQuantity(dosage, "Every 6 hours", duration)).toBe(24); // 2*4*3
    expect(calculateQuantity(dosage, "At bedtime", duration)).toBe(6); // 2*1*3
  });

  test("regression: free-text frequency not in dropdown is parsed instead of defaulting to 1", () => {
    expect(calculateQuantity("1 tablet", "3 times daily", 2)).toBe(6); // was 2 (bug), now 6
  });

  test("defaults dosage units to 1 when no number present", () => {
    expect(calculateQuantity("as directed", "Twice daily", 1)).toBe(2);
  });
});
