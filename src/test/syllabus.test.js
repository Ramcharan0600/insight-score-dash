import { describe, expect, it } from "vitest";

import { hasSyllabus, subjectSyllabus, unitSyllabus } from "@/lib/syllabus";

const unit = {
  unit: 2,
  title: "Limits",
  topics: "Epsilon-delta, Continuity; L'Hopital\nSeries",
  configured: true,
};

describe("syllabus download", () => {
  it("lists each topic of a unit on its own line", () => {
    const f = unitSyllabus("Maths", unit);
    expect(f.name).toBe("Maths - Unit 2 syllabus.txt");
    expect(f.text).toContain("Unit 2: Limits");
    expect(f.text).toContain("  1. Epsilon-delta");
    expect(f.text).toContain("  4. Series");
  });

  it("says so when no topics are published, and skips unpublished units in the full syllabus", () => {
    const empty = { unit: 3, title: "Unit 3", topics: "", configured: false };
    expect(hasSyllabus(empty)).toBe(false);
    expect(unitSyllabus("Maths", { ...empty, configured: true }).text).toContain(
      "not been published",
    );
    const full = subjectSyllabus("Maths", [unit, empty]);
    expect(full.text).toContain("Unit 2");
    expect(full.text).not.toContain("Unit 3");
  });
});
