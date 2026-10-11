import { parseFrequency, calculateQuantity, parseDosageUnits } from "./frequency";

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

describe("parseDosageUnits", () => {
  test.each([
    ["2 tablets", 2],
    ["1.5 tablets", 1.5],
    ["0.5 tablet", 0.5],
    ["0.25 tablet", 0.25],
    ["as directed", 1],
  ])("parses \"%s\" as %d units", (dosage, expected) => {
    expect(parseDosageUnits(dosage)).toBe(expected);
  });
});

describe("calculateQuantity - decimal dosage and rounding", () => {
  test("regression: decimal dosage like '1.5 tablets' was previously truncated to 1", () => {
    // 1.5 tablets, Twice daily (2x/day), 1 day => 3 exactly (no rounding needed)
    expect(calculateQuantity("1.5 tablets", "Twice daily", 1)).toBe(3);
  });

  test("regression: '0.5 tablet' previously truncated to 1 unit instead of 0.5", () => {
    // 0.5 tablet, Twice daily, 1 day => raw 1.0, still 1
    expect(calculateQuantity("0.5 tablet", "Twice daily", 1)).toBe(1);
  });

  test("rounds up fractional total quantity since partial pills cannot be dispensed", () => {
    // 0.5 tablet, After meals (3x/day), 1 day => raw 1.5 -> ceil to 2
    expect(calculateQuantity("0.5 tablet", "After meals", 1)).toBe(2);
  });

  test("rounds up for multi-day fractional totals", () => {
    // 1.5 tablets, Twice daily, 3 days => raw 9 -> exact, no rounding needed
    expect(calculateQuantity("1.5 tablets", "Twice daily", 3)).toBe(9);
    // 0.25 tablet, Twice daily, 3 days => raw 1.5 -> ceil to 2
    expect(calculateQuantity("0.25 tablet", "Twice daily", 3)).toBe(2);
  });
});
