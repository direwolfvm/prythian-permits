/**
 * The Seven Courts of Prythian.
 * Each court has a theme, emblem, capital city, and ruling High Lord/Lady.
 */

export interface Court {
  id: string
  name: string
  description: string
  emblemIcon: string
  themeKey: string
  capitalName: string
  stewardTitle: string
}

export const COURTS: Court[] = [
  {
    id: "night",
    name: "Night Court",
    description:
      "The most powerful court in Prythian, ruled from the hidden city of Velaris. Known for the Court of Dreams and the Illyrian warriors.",
    emblemIcon: "moon",
    themeKey: "night",
    capitalName: "Velaris",
    stewardTitle: "High Lord Rhysand",
  },
  {
    id: "spring",
    name: "Spring Court",
    description:
      "A land of eternal bloom and ancient forests, bordering the mortal lands to the south. The first court most mortals encounter.",
    emblemIcon: "flower",
    themeKey: "spring",
    capitalName: "Rosehall",
    stewardTitle: "High Lord Tamlin",
  },
  {
    id: "summer",
    name: "Summer Court",
    description:
      "A coastal paradise of sun-drenched cities and crystal waters. Known for its navy, trade routes, and the great city of Adriata.",
    emblemIcon: "sun",
    themeKey: "summer",
    capitalName: "Adriata",
    stewardTitle: "High Lord Tarquin",
  },
  {
    id: "autumn",
    name: "Autumn Court",
    description:
      "A realm of perpetual fall, dense forests of amber and crimson, and deep political intrigue among its ruling family.",
    emblemIcon: "leaf",
    themeKey: "autumn",
    capitalName: "The Forest House",
    stewardTitle: "High Lord Beron",
  },
  {
    id: "winter",
    name: "Winter Court",
    description:
      "A frozen kingdom of ice and snow, whose people endured great suffering Under the Mountain. Known for resilience and loyalty.",
    emblemIcon: "snowflake",
    themeKey: "winter",
    capitalName: "The Palace of Ice",
    stewardTitle: "High Lord Kallias",
  },
  {
    id: "day",
    name: "Day Court",
    description:
      "A radiant court dedicated to knowledge, light, and scholarly pursuit. Home to the greatest library in Prythian.",
    emblemIcon: "eye",
    themeKey: "day",
    capitalName: "The Library",
    stewardTitle: "High Lord Helion",
  },
  {
    id: "dawn",
    name: "Dawn Court",
    description:
      "The easternmost court, where the sun first touches Prythian. Known for healing magic, diplomacy, and the Peregryn warriors.",
    emblemIcon: "sunrise",
    themeKey: "dawn",
    capitalName: "The Palace of Prayer",
    stewardTitle: "High Lord Thesan",
  },
]

export function getCourtById(id: string): Court | undefined {
  return COURTS.find((c) => c.id === id)
}

export function getCourtByName(name: string): Court | undefined {
  return COURTS.find((c) => c.name === name)
}

/** Court names as a simple array for form dropdowns */
export const COURT_NAMES = COURTS.map((c) => c.name)
