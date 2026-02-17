import type { NepassistSummaryItem, IpacSummary } from "../types/geospatial.ts"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScreeningInput = {
  courtId?: string // e.g. "night", "spring", "summer", "autumn", "dawn", "day", "winter"
  bboxCenter: [number, number] // normalized 0..1
  area: number // normalized polygon area
}

export type ScreeningResult = {
  screeningType: string
  severity: "high" | "moderate" | "low" | "none"
  summary: string
  recommendedMitigations: string[]
  details: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp a number to [0, 1]. */
function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

/** Euclidean distance between two 2-D points. */
function dist(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  return Math.sqrt(dx * dx + dy * dy)
}

// ---------------------------------------------------------------------------
// 1. Ley Line Interference
//    Based on polygon center Y position — northern regions (higher Y) have
//    stronger ley line convergences.
// ---------------------------------------------------------------------------

function screenLeyLineInterference(input: ScreeningInput): ScreeningResult {
  const y = clamp01(input.bboxCenter[1])

  if (y > 0.75) {
    return {
      screeningType: "Ley Line Interference",
      severity: "high",
      summary:
        "The proposed petition footprint intersects a major ley line convergence. " +
        "Disturbance to the arcane currents could destabilize ward networks across the Court.",
      recommendedMitigations: [
        "Engage a Court-certified ley line surveyor before breaking ground.",
        "Install temporary ley dampening runes along the perimeter.",
        "Schedule construction around solstice surges to avoid resonance peaks.",
      ],
      details: { centerY: y, threshold: 0.75 },
    }
  }

  if (y > 0.45) {
    return {
      screeningType: "Ley Line Interference",
      severity: "moderate",
      summary:
        "Minor ley line threads pass through the petition area. " +
        "Standard precautions should be sufficient to prevent disruption.",
      recommendedMitigations: [
        "Monitor ambient arcane flux during foundation work.",
        "File a ley impact notice with the Court Recorder.",
      ],
      details: { centerY: y, threshold: 0.45 },
    }
  }

  if (y > 0.2) {
    return {
      screeningType: "Ley Line Interference",
      severity: "low",
      summary:
        "The petition area sits between major ley channels. Only faint residual currents are present.",
      recommendedMitigations: [],
      details: { centerY: y, threshold: 0.2 },
    }
  }

  return {
    screeningType: "Ley Line Interference",
    severity: "none",
    summary:
      "No measurable ley line activity detected within the petition footprint.",
    recommendedMitigations: [],
    details: { centerY: y, threshold: 0 },
  }
}

// ---------------------------------------------------------------------------
// 2. Suriel Sightings
//    Based on polygon area — larger areas are more likely to encompass known
//    Suriel hunting grounds.
// ---------------------------------------------------------------------------

function screenSurielSightings(input: ScreeningInput): ScreeningResult {
  const area = clamp01(input.area)

  if (area > 0.4) {
    return {
      screeningType: "Suriel Sightings",
      severity: "high",
      summary:
        "Multiple Suriel nesting zones fall within the petition boundary. " +
        "Displacement of these ancient truth-seekers may draw the attention of higher powers.",
      recommendedMitigations: [
        "Commission a Suriel census through the Court Naturalist.",
        "Designate a protected corridor to allow continued Suriel passage.",
        "Offer a tribute of fresh water at the boundary to appease displaced Suriel.",
      ],
      details: { area, threshold: 0.4 },
    }
  }

  if (area > 0.15) {
    return {
      screeningType: "Suriel Sightings",
      severity: "moderate",
      summary:
        "Suriel activity has been documented in this area. " +
        "Construction may displace these truth-seekers from established hunting grounds.",
      recommendedMitigations: [
        "Post warning sigils along the work perimeter to discourage Suriel approach.",
        "Avoid excavation during dawn and dusk when Suriel are most active.",
      ],
      details: { area, threshold: 0.15 },
    }
  }

  if (area > 0.05) {
    return {
      screeningType: "Suriel Sightings",
      severity: "low",
      summary:
        "Occasional Suriel transits have been recorded nearby. " +
        "The petition area is unlikely to significantly affect their patterns.",
      recommendedMitigations: [],
      details: { area, threshold: 0.05 },
    }
  }

  return {
    screeningType: "Suriel Sightings",
    severity: "none",
    summary:
      "No Suriel sightings have been recorded within or adjacent to the petition area.",
    recommendedMitigations: [],
    details: { area, threshold: 0 },
  }
}

// ---------------------------------------------------------------------------
// 3. Illyrian Airspace Conflicts
//    Night Court bias — center Y < 0.3 in Night Court territory means active
//    Illyrian training airspace.
// ---------------------------------------------------------------------------

function screenIllyrianAirspace(input: ScreeningInput): ScreeningResult {
  const y = clamp01(input.bboxCenter[1])
  const isNightCourt = input.courtId?.toLowerCase() === "night"

  if (isNightCourt && y < 0.3) {
    return {
      screeningType: "Illyrian Airspace Conflicts",
      severity: "high",
      summary:
        "This area falls within active Illyrian training airspace. " +
        "All vertical construction above 30 spans requires flight command authorization.",
      recommendedMitigations: [
        "Submit an airspace clearance request to the Illyrian War-Camp Commander.",
        "Restrict maximum structure height to 30 spans without flight corridor exemption.",
        "Install aerial warning beacons on any temporary scaffolding above 15 spans.",
      ],
      details: { centerY: y, courtId: input.courtId, isNightCourt },
    }
  }

  if (isNightCourt) {
    return {
      screeningType: "Illyrian Airspace Conflicts",
      severity: "moderate",
      summary:
        "The petition area borders Illyrian flight corridors. " +
        "Periodic training exercises may cause temporary access restrictions.",
      recommendedMitigations: [
        "Coordinate construction schedules with the Night Court Flight Registry.",
        "Maintain a 10-span vertical clearance buffer during scheduled exercises.",
      ],
      details: { centerY: y, courtId: input.courtId, isNightCourt },
    }
  }

  if (y < 0.2) {
    return {
      screeningType: "Illyrian Airspace Conflicts",
      severity: "low",
      summary:
        "Occasional Illyrian patrols traverse this region, but no dedicated training routes are affected.",
      recommendedMitigations: [],
      details: { centerY: y, courtId: input.courtId, isNightCourt },
    }
  }

  return {
    screeningType: "Illyrian Airspace Conflicts",
    severity: "none",
    summary:
      "No Illyrian airspace designations apply to this petition area.",
    recommendedMitigations: [],
    details: { centerY: y, courtId: input.courtId, isNightCourt },
  }
}

// ---------------------------------------------------------------------------
// 4. Cauldron Disturbance Risk
//    Based on distance from the normalized map center (0.5, 0.5).
// ---------------------------------------------------------------------------

function screenCauldronDisturbance(input: ScreeningInput): ScreeningResult {
  const center: [number, number] = [0.5, 0.5]
  const d = dist(input.bboxCenter, center)

  if (d < 0.1) {
    return {
      screeningType: "Cauldron Disturbance Risk",
      severity: "high",
      summary:
        "The petition area lies dangerously close to a known Cauldron resonance epicenter. " +
        "Unshielded construction could trigger unpredictable transformative energies.",
      recommendedMitigations: [
        "Obtain a Cauldron Proximity Waiver from the High Lord's office.",
        "Line all foundation trenches with nullification ore.",
        "Maintain an on-site healer trained in Cauldron-burn treatment.",
      ],
      details: { distance: d, threshold: 0.1 },
    }
  }

  if (d < 0.25) {
    return {
      screeningType: "Cauldron Disturbance Risk",
      severity: "moderate",
      summary:
        "Residual Cauldron energies are detectable in this region. " +
        "Workers may experience mild disorientation during high-magic phases.",
      recommendedMitigations: [
        "Distribute protective amulets to all on-site workers.",
        "Schedule sensitive operations outside of full-moon periods.",
      ],
      details: { distance: d, threshold: 0.25 },
    }
  }

  if (d < 0.45) {
    return {
      screeningType: "Cauldron Disturbance Risk",
      severity: "low",
      summary:
        "The petition area is distant from known Cauldron resonance zones. " +
        "No special precautions are anticipated.",
      recommendedMitigations: [],
      details: { distance: d, threshold: 0.45 },
    }
  }

  return {
    screeningType: "Cauldron Disturbance Risk",
    severity: "none",
    summary:
      "The petition area is well beyond any recorded Cauldron influence. No risk detected.",
    recommendedMitigations: [],
    details: { distance: d, threshold: 0.45 },
  }
}

// ---------------------------------------------------------------------------
// 5. Ward and Glamour Sensitivity
//    Based on court_id — each court has different ward characteristics.
// ---------------------------------------------------------------------------

const WARD_PROFILES: Record<
  string,
  { severity: ScreeningResult["severity"]; summary: string; mitigations: string[] }
> = {
  spring: {
    severity: "high",
    summary:
      "Spring Court ward matrices are especially sensitive in this region " +
      "due to proximity to the Wall foundations. Any excavation risks breaching " +
      "centuries-old glamour anchors.",
    mitigations: [
      "Conduct a pre-construction glamour integrity assessment.",
      "Engage Spring Court Sentinels to monitor ward flux during ground-breaking.",
      "Avoid iron-based tools within 5 spans of any identified glamour anchor.",
    ],
  },
  night: {
    severity: "moderate",
    summary:
      "The Night Court's layered wards — including Velaris's city-wide glamour — " +
      "require careful coordination. Construction vibrations can temporarily thin " +
      "glamour veils.",
    mitigations: [
      "Notify the Court of Dreams Ward-Keepers 48 hours before major demolition.",
      "Install vibration-dampening enchantments on heavy equipment.",
    ],
  },
  summer: {
    severity: "low",
    summary:
      "Summer Court wards are robust and self-repairing due to the abundance of " +
      "ambient solar magic. Standard construction activities pose minimal risk.",
    mitigations: [],
  },
  autumn: {
    severity: "moderate",
    summary:
      "Autumn Court wards are intricately woven with seasonal spell-work. " +
      "Construction during the equinox transition periods may cause localized " +
      "ward fluctuations.",
    mitigations: [
      "Avoid major structural work within two weeks of either equinox.",
      "Consult the Autumn Court Spell-Weavers for a ward compatibility review.",
    ],
  },
  dawn: {
    severity: "low",
    summary:
      "Dawn Court wards are among the most stable in Prythian, anchored to " +
      "ancient sunstone foundations. Construction is unlikely to cause disruption.",
    mitigations: [],
  },
  day: {
    severity: "low",
    summary:
      "Day Court wards rely on knowledge-based enchantments that are largely " +
      "unaffected by physical construction. Library proximity zones are the " +
      "only exception.",
    mitigations: [],
  },
  winter: {
    severity: "moderate",
    summary:
      "Winter Court wards are woven into the permafrost and ice structures. " +
      "Thermal construction activities (forges, kilns) may destabilize local " +
      "ward anchors.",
    mitigations: [
      "Limit on-site heat generation to approved thresholds.",
      "Use frost-compatible building materials certified by the Winter Court Guild.",
    ],
  },
}

const DEFAULT_WARD_PROFILE: (typeof WARD_PROFILES)[string] = {
  severity: "low",
  summary:
    "Ward sensitivity for this region is within normal parameters. " +
    "No court-specific concerns have been identified.",
  mitigations: [],
}

function screenWardSensitivity(input: ScreeningInput): ScreeningResult {
  const key = input.courtId?.toLowerCase() ?? ""
  const profile = WARD_PROFILES[key] ?? DEFAULT_WARD_PROFILE

  return {
    screeningType: "Ward and Glamour Sensitivity",
    severity: profile.severity,
    summary: profile.summary,
    recommendedMitigations: profile.mitigations,
    details: { courtId: input.courtId ?? null },
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run all five screening checks against the provided input.
 * Results are deterministic — same inputs always produce the same outputs.
 */
export function runAllScreenings(input: ScreeningInput): ScreeningResult[] {
  return [
    screenLeyLineInterference(input),
    screenSurielSightings(input),
    screenIllyrianAirspace(input),
    screenCauldronDisturbance(input),
    screenWardSensitivity(input),
  ]
}

// ---------------------------------------------------------------------------
// Conversion helpers — map ScreeningResult[] to existing UI types
// ---------------------------------------------------------------------------

function severityToDisplay(severity: ScreeningResult["severity"]): string {
  switch (severity) {
    case "high":
      return "\u26A0\uFE0F Yes"
    case "moderate":
      return "\u23F3 On demand"
    case "low":
      return "\u2705 No"
    case "none":
      return "\u2705 No"
  }
}

function severityToNepassist(
  severity: ScreeningResult["severity"],
): "yes" | "ondemand" | "no" | "other" {
  switch (severity) {
    case "high":
      return "yes"
    case "moderate":
      return "ondemand"
    case "low":
      return "no"
    case "none":
      return "no"
  }
}

export function screeningResultsToNepassistSummary(
  results: ScreeningResult[],
): NepassistSummaryItem[] {
  return results.map((r) => ({
    question: r.screeningType,
    displayAnswer: severityToDisplay(r.severity),
    severity: severityToNepassist(r.severity),
  }))
}

export function screeningResultsToIpacSummary(
  results: ScreeningResult[],
): IpacSummary {
  const highResults = results.filter(
    (r) => r.severity === "high" || r.severity === "moderate",
  )

  const pushUnique = (target: string[], value: string) => {
    if (!value) {
      return
    }
    if (!target.includes(value)) {
      target.push(value)
    }
  }

  const findByType = (type: string) =>
    results.find((r) => r.screeningType === type)

  const toNumber = (value: unknown): number | undefined => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value)
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        return parsed
      }
    }
    return undefined
  }

  const ley = findByType("Ley Line Interference")
  const suriel = findByType("Suriel Sightings")
  const illyrian = findByType("Illyrian Airspace Conflicts")
  const cauldron = findByType("Cauldron Disturbance Risk")
  const ward = findByType("Ward and Glamour Sensitivity")

  const centerY = toNumber(ley?.details?.centerY)
  const area = toNumber(suriel?.details?.area)
  const cauldronDistance = toNumber(cauldron?.details?.distance)

  const regionLabel = (() => {
    if (typeof centerY !== "number") {
      return undefined
    }
    if (centerY > 0.75) return "Northern Marches"
    if (centerY > 0.45) return "Central Lowlands"
    if (centerY > 0.2) return "Southern Borderlands"
    return "Coastal Fringe"
  })()

  return {
    locationDescription:
      highResults.length > 0
        ? `Area of elevated arcane sensitivity${regionLabel ? ` (${regionLabel})` : ""}`
        : "No significant arcane concerns identified",
    listedSpecies: (() => {
      const species: string[] = []
      switch (suriel?.severity) {
        case "high":
          pushUnique(species, "Suriel (Protected)")
          pushUnique(species, "Bogge (Restricted)")
          pushUnique(species, "Naga (Restricted)")
          break
        case "moderate":
          pushUnique(species, "Suriel (Protected)")
          pushUnique(species, "Bogge (Watch)")
          break
        case "low":
          pushUnique(species, "Suriel (Watch)")
          break
        default:
          break
      }

      // Cauldron proximity can attract unusual, sensitive fauna.
      if (cauldron?.severity === "high") {
        pushUnique(species, "Cauldron-touched beasts (Unclassified)")
      } else if (cauldron?.severity === "moderate") {
        pushUnique(species, "Cauldron-touched beasts (Watch)")
      }

      return species
    })(),
    criticalHabitats: (() => {
      const habitats: string[] = []
      switch (ley?.severity) {
        case "high":
          pushUnique(habitats, "Major ley convergence: Northern Nexus")
          pushUnique(habitats, "Ward anchor: Starfall Spur")
          break
        case "moderate":
          pushUnique(habitats, "Minor ley thread: Riverbend Line")
          pushUnique(habitats, "Glamour seam: Old Wall Trace")
          break
        case "low":
          pushUnique(habitats, "Residual ley current: Meadow Drift")
          break
        default:
          break
      }

      if (cauldron?.severity === "high" || cauldron?.severity === "moderate") {
        pushUnique(habitats, "Resonance buffer: Cauldron Echo Field")
      }

      if (ward?.severity === "high") {
        pushUnique(habitats, "Ward lattice: High-sensitivity zone")
      } else if (ward?.severity === "moderate") {
        pushUnique(habitats, "Ward lattice: Managed coordination zone")
      }

      return habitats
    })(),
    migratoryBirds: (() => {
      const routes: string[] = []
      switch (illyrian?.severity) {
        case "high":
          pushUnique(routes, "Illyrian training route: Windhaven Loop")
          pushUnique(routes, "Winnowing lane: Raven Ridge Gate")
          break
        case "moderate":
          pushUnique(routes, "Illyrian patrol corridor: Western Pass")
          break
        case "low":
          pushUnique(routes, "Seasonal patrols: Highwatch Drift")
          break
        default:
          break
      }
      return routes
    })(),
    wetlands: (() => {
      // This is a stylized subset of what a real registry might return. It is deterministic and
      // keyed off inputs already captured in the screening details.
      const wetlands: { name: string; acres?: string }[] = []

      // Convert normalized area to a plausible "acres" estimate for display.
      const toAcres = (scale: number) => {
        if (typeof area !== "number") {
          return undefined
        }
        const acres = Math.max(0.2, Math.min(75, area * scale))
        return acres.toFixed(1)
      }

      const likelyWetlands =
        (typeof area === "number" && area > 0.12) ||
        (typeof centerY === "number" && centerY > 0.28 && centerY < 0.66) ||
        ley?.severity === "high"

      if (!likelyWetlands) {
        return wetlands
      }

      if (typeof centerY === "number" && centerY > 0.66) {
        wetlands.push({ name: "Snowmelt fen", acres: toAcres(40) })
        wetlands.push({ name: "Ley-saturated bog", acres: toAcres(22) })
      } else if (typeof centerY === "number" && centerY > 0.35) {
        wetlands.push({ name: "Sidra riparian marsh", acres: toAcres(55) })
        wetlands.push({ name: "Reedbed backwater", acres: toAcres(18) })
      } else {
        wetlands.push({ name: "Coastal brackish flats", acres: toAcres(60) })
      }

      // Cauldron-adjacent locations tend to have small, unusual pools.
      if (typeof cauldronDistance === "number" && cauldronDistance < 0.25) {
        wetlands.push({ name: "Resonant pool", acres: "0.8" })
      }

      return wetlands
    })(),
  }
}
