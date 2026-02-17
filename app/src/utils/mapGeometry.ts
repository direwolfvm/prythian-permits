export type NormalizedPoint = [number, number] // x, y in 0..1

export type NormalizedPolygon = NormalizedPoint[]

export type BBox = { minX: number; minY: number; maxX: number; maxY: number }

export function normalizeCoords(
  pixelCoords: Array<[number, number]>,
  imageWidth: number,
  imageHeight: number
): NormalizedPolygon {
  return pixelCoords.map(([x, y]) => [x / imageWidth, y / imageHeight])
}

export function denormalizeCoords(
  normalizedCoords: NormalizedPolygon,
  displayWidth: number,
  displayHeight: number
): Array<[number, number]> {
  return normalizedCoords.map(([x, y]) => [x * displayWidth, y * displayHeight])
}

export function computeBBox(polygon: NormalizedPolygon): BBox {
  let minX = 1, minY = 1, maxX = 0, maxY = 0
  for (const [x, y] of polygon) {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }
  return { minX, minY, maxX, maxY }
}

export function bboxCenter(bbox: BBox): [number, number] {
  return [(bbox.minX + bbox.maxX) / 2, (bbox.minY + bbox.maxY) / 2]
}

export function polygonArea(polygon: NormalizedPolygon): number {
  // Shoelace formula
  let area = 0
  const n = polygon.length
  for (let i = 0; i < n; i++) {
    const [x1, y1] = polygon[i]
    const [x2, y2] = polygon[(i + 1) % n]
    area += x1 * y2 - x2 * y1
  }
  return Math.abs(area) / 2
}

export function toGeoJson(polygon: NormalizedPolygon): string {
  // Convert normalized coords to a GeoJSON Polygon
  // Map x to longitude (-180..180) and y to latitude (90..-90) for compatibility
  const ring = polygon.map(([x, y]) => [x * 360 - 180, 90 - y * 180])
  // Close the ring
  if (ring.length > 0) {
    const first = ring[0]
    const last = ring[ring.length - 1]
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push([...first])
    }
  }
  return JSON.stringify({
    type: "Polygon",
    coordinates: [ring]
  })
}

export function fromGeoJson(geoJson: string): NormalizedPolygon | null {
  try {
    const parsed = JSON.parse(geoJson)
    if (parsed?.type !== "Polygon" || !Array.isArray(parsed.coordinates?.[0])) {
      return null
    }
    const ring: Array<[number, number]> = parsed.coordinates[0]
    return ring.map(([lon, lat]) => [(lon + 180) / 360, (90 - lat) / 180] as [number, number])
  } catch {
    return null
  }
}
