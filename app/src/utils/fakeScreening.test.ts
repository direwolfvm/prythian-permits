import { describe, expect, it } from "vitest"

import { runAllScreenings, screeningResultsToIpacSummary } from "./fakeScreening"

describe("screeningResultsToIpacSummary", () => {
  it("returns richer results when screenings indicate elevated concerns", () => {
    const results = runAllScreenings({
      // High ley line interference (centerY > 0.75) and high Suriel sightings (area > 0.4)
      bboxCenter: [0.5, 0.9],
      area: 0.6
    })

    const summary = screeningResultsToIpacSummary(results)

    expect(summary.locationDescription).toContain("elevated arcane sensitivity")
    expect(summary.listedSpecies.length).toBeGreaterThan(0)
    expect(summary.criticalHabitats.length).toBeGreaterThan(0)
    expect(summary.wetlands.length).toBeGreaterThan(0)
  })

  it("is deterministic for the same inputs", () => {
    const input = { bboxCenter: [0.12, 0.52] as [number, number], area: 0.2 }
    const a = screeningResultsToIpacSummary(runAllScreenings(input))
    const b = screeningResultsToIpacSummary(runAllScreenings(input))
    expect(a).toEqual(b)
  })
})

