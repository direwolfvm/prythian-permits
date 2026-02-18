const DEFAULT_BUFFER_MILES = 0.1;
const NEPA_ARCGIS_URL = "https://nepassisttool.epa.gov/nepassist/api/arcgis/geometry/buffer";
const NEPA_BROKER_URL = "https://nepassisttool.epa.gov/nepassist/nepaRESTbroker.aspx";
const IPAC_URL = "https://ipac.ecosphere.fws.gov/location/api/resources";
const USER_AGENT = "copilotkit-forms-geospatial-proxy/1.0";

class ProxyError extends Error {
  constructor(message, status = 500, details) {
    super(message);
    this.name = "ProxyError";
    this.status = status;
    this.details = details;
  }
}

function normalizeBufferMiles(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return DEFAULT_BUFFER_MILES;
}

function flattenCoordinates(coords) {
  if (coords === undefined || coords === null) {
    return "";
  }
  if (Array.isArray(coords)) {
    if (coords.length === 0) {
      return "";
    }
    if (Array.isArray(coords[0])) {
      const flat = [];
      for (const value of coords) {
        if (!Array.isArray(value)) {
          continue;
        }
        if (typeof value[0] === "number" && typeof value[1] === "number") {
          flat.push(value[0], value[1]);
        } else if (Array.isArray(value[0])) {
          for (const nested of value) {
            if (Array.isArray(nested) && typeof nested[0] === "number" && typeof nested[1] === "number") {
              flat.push(nested[0], nested[1]);
            }
          }
        }
      }
      return flat.join(",");
    }
    return coords.join(",");
  }
  if (typeof coords === "object") {
    if (typeof coords.x === "number" && typeof coords.y === "number") {
      return `${coords.x},${coords.y}`;
    }
  }
  return String(coords);
}

function clamp01(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function polygonArea(points) {
  if (!Array.isArray(points) || points.length < 3) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (!Array.isArray(a) || !Array.isArray(b)) {
      continue;
    }
    const ax = Number(a[0]);
    const ay = Number(a[1]);
    const bx = Number(b[0]);
    const by = Number(b[1]);
    if (!Number.isFinite(ax) || !Number.isFinite(ay) || !Number.isFinite(bx) || !Number.isFinite(by)) {
      continue;
    }
    sum += ax * by - bx * ay;
  }
  return Math.abs(sum) / 2;
}

function computeBBox(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return [0, 0, 0, 0];
  }
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const p of points) {
    if (!Array.isArray(p) || p.length < 2) {
      continue;
    }
    const x = Number(p[0]);
    const y = Number(p[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      continue;
    }
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return [0, 0, 0, 0];
  }

  return [minX, minY, maxX, maxY];
}

function bboxCenter(bbox) {
  const [minX, minY, maxX, maxY] = Array.isArray(bbox) && bbox.length === 4 ? bbox : [0, 0, 0, 0];
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

function fnv1aHash(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, list) {
  if (!Array.isArray(list) || list.length === 0) {
    return undefined;
  }
  const idx = Math.floor(rng() * list.length);
  return list[Math.max(0, Math.min(list.length - 1, idx))];
}

function sampleUnique(rng, list, count) {
  const copy = Array.isArray(list) ? [...list] : [];
  const out = [];
  while (copy.length > 0 && out.length < count) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function parseWktPoints(wkt) {
  if (typeof wkt !== "string" || wkt.trim().length === 0) {
    return [];
  }
  const matches = wkt.match(/-?\\d+(?:\\.\\d+)?/g);
  if (!matches || matches.length < 2) {
    return [];
  }
  const nums = matches.map((v) => Number(v)).filter((n) => Number.isFinite(n));
  const points = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    points.push([nums[i], nums[i + 1]]);
  }
  return points;
}

function extractGeometryPoints(payload) {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  if (typeof payload.wkt === "string") {
    return parseWktPoints(payload.wkt);
  }

  const geometry = payload.geometry;
  if (!geometry || typeof geometry !== "object") {
    return [];
  }

  const type = typeof geometry.type === "string" ? geometry.type.toLowerCase() : "";
  const coords = geometry.coordinates;
  if (!Array.isArray(coords)) {
    return [];
  }

  if (type === "polygon") {
    const ring = coords[0];
    return Array.isArray(ring) ? ring : [];
  }

  if (type === "multipolygon") {
    const first = coords[0];
    const ring = Array.isArray(first) ? first[0] : undefined;
    return Array.isArray(ring) ? ring : [];
  }

  if (type === "linestring") {
    return coords;
  }

  if (type === "multilinestring") {
    const first = coords[0];
    return Array.isArray(first) ? first : [];
  }

  return [];
}

function describeCourtFromCanvas(centerX, centerY) {
  const x = clamp01(centerX);
  const y = clamp01(centerY);

  if (y >= 0.66 && x < 0.45) return { id: "spring", label: "Spring Court" };
  if (y >= 0.66 && x >= 0.45) return { id: "dawn", label: "Dawn Court" };
  if (y < 0.33 && x < 0.5) return { id: "autumn", label: "Autumn Court" };
  if (y < 0.33 && x >= 0.5) return { id: "night", label: "Night Court" };
  if (x < 0.33) return { id: "summer", label: "Summer Court" };
  if (x > 0.72) return { id: "winter", label: "Winter Court" };
  return { id: "day", label: "Day Court" };
}

function buildPretendLeyLineRegistryPayload(payload) {
  const points = extractGeometryPoints(payload);
  const bbox = computeBBox(points);
  const center = bboxCenter(bbox);
  const area = polygonArea(points);
  const bufferMiles = normalizeBufferMiles(payload.buffer_miles ?? payload.bufferMiles ?? payload.bufferSize);

  const seedInput = JSON.stringify({
    points: points.slice(0, 64),
    bufferMiles,
    hint: payload.project_id ?? payload.projectId ?? payload.petition_id ?? undefined
  });
  const seed = fnv1aHash(seedInput);
  const rng = mulberry32(seed);

  const normalizedCanvas =
    points.length > 0 &&
    points.every(
      (p) =>
        Array.isArray(p) &&
        p.length >= 2 &&
        typeof p[0] === "number" &&
        typeof p[1] === "number" &&
        p[0] >= 0 &&
        p[0] <= 1 &&
        p[1] >= 0 &&
        p[1] <= 1
    );

  const court = normalizedCanvas ? describeCourtFromCanvas(center[0], center[1]) : { id: "mortal", label: "Mortal Lands" };

  const regionTags = [
    "Sidra River Basin",
    "Rainbow District",
    "Illyrian Steppes",
    "Rosehall Estates",
    "Starfall Route",
    "Duskward Bluffs",
    "The Hewn Road",
    "The Verity Glade"
  ];

  const listedSpecies = [
    { name: "Suriel", status: "Protected" },
    { name: "Peregryn falconer spirit", status: "Sensitive" },
    { name: "Lesser wraith", status: "Regulated" },
    { name: "Kelpie brood", status: "Watchlist" },
    { name: "Starlight moth swarm", status: "Protected" },
    { name: "Pegasus rookery", status: "Sensitive" }
  ];

  const habitats = [
    "Ancient grove ward lattice",
    "Riverbank ward corridor",
    "Moonstone aquifer line",
    "Cliffside wind shear channel",
    "Subterranean basalt ley conduit",
    "Marsh-lantern fen weave"
  ];

  const birds = [
    "Starling of Starfall",
    "Nightjar of Velaris",
    "Dawn crane",
    "Winter swan"
  ];

  const wetlands = [
    { name: "Sidra backwater wetland", acres: 2.4 },
    { name: "Rosehall irrigation terraces", acres: 1.2 },
    { name: "Moon-pond fringe marsh", acres: 0.7 },
    { name: "Salt-spray fen", acres: 3.6 }
  ];

  const speciesCount = 2 + Math.floor(rng() * 3);
  const habitatCount = 1 + Math.floor(rng() * 3);
  const birdCount = 1 + Math.floor(rng() * 2);
  const wetlandCount = Math.floor(rng() * 3);

  const chosenSpecies = sampleUnique(rng, listedSpecies, speciesCount);
  const chosenHabitats = sampleUnique(rng, habitats, habitatCount);
  const chosenBirds = sampleUnique(rng, birds, birdCount);
  const chosenWetlands = wetlandCount > 0 ? sampleUnique(rng, wetlands, wetlandCount) : [];
  const tag = pick(rng, regionTags);

  const locationDescription = normalizedCanvas
    ? `Prythian canvas region: ${court.label}${tag ? ` (${tag})` : ""} at X=${clamp01(center[0]).toFixed(2)}, Y=${clamp01(center[1]).toFixed(2)}`
    : `Ley Line Registry location: buffered footprint (${bufferMiles.toFixed(2)} miles)`;

  const populationsBySid = {};
  for (let i = 0; i < chosenSpecies.length; i++) {
    const entry = chosenSpecies[i];
    populationsBySid[`SID-${seed.toString(16)}-${i + 1}`] = {
      population: {
        optionalCommonName: `${entry.name} (${entry.status})`,
        listingStatusName: entry.status
      }
    };
  }

  const crithabs = chosenHabitats.map((name) => ({ criticalHabitatName: name }));
  const migbirds = chosenBirds.map((name) => ({ phenologySpecies: { commonName: name } }));
  const wetlandItems = chosenWetlands.map((wetland) => ({
    wetlandType: wetland.name,
    wetlandAcres: Number((wetland.acres * (0.75 + rng() * 0.7)).toFixed(1))
  }));

  return {
    ipac_report: {
      body: {
        resources: {
          location: {
            description: locationDescription,
            court: court.id,
            canvas_center: normalizedCanvas ? { x: clamp01(center[0]), y: clamp01(center[1]) } : undefined,
            buffer_miles: bufferMiles,
            area_hint: area
          },
          populationsBySid,
          crithabs,
          migbirds,
          wetlands: wetlandItems
        }
      }
    }
  };
}

async function tryFetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "User-Agent": USER_AGENT,
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = text;
  }
  return { response, data, rawText: text };
}

export async function callNepassistProxy(payload = {}) {
  const coordsParam = flattenCoordinates(payload.coords);
  const typeParam = typeof payload.type === "string" ? payload.type : "";
  const bufferMiles = normalizeBufferMiles(payload.bufferMiles ?? payload.bufferSize ?? payload.newBufferDistance);

  if (!coordsParam) {
    throw new ProxyError("Missing geometry coordinates for NEPA Assist request.", 400);
  }

  const brokerUrl = new URL(NEPA_BROKER_URL);
  brokerUrl.searchParams.set("ptitle", "");
  brokerUrl.searchParams.set("coords", coordsParam);
  brokerUrl.searchParams.set("type", typeParam);
  brokerUrl.searchParams.set("newBufferDistance", bufferMiles.toString());
  brokerUrl.searchParams.set("newBufferUnits", "miles");
  brokerUrl.searchParams.set("f", "pjson");

  const arcgisOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      coords: payload.coords,
      type: typeParam,
      bufferSize: bufferMiles,
      newBufferUnits: "miles"
    })
  };

  try {
    const { response, data, rawText } = await tryFetchJson(NEPA_ARCGIS_URL, arcgisOptions);
    if (response.ok && data) {
      return {
        data,
        meta: {
          upstreamUrl: NEPA_ARCGIS_URL,
          bufferMiles,
          type: typeParam,
          coords: coordsParam,
          usedFallback: false
        }
      };
    }
    if (!response.ok) {
      console.warn("NEPA ArcGIS endpoint returned status", response.status, rawText?.slice(0, 400));
    }
  } catch (error) {
    console.warn("Failed to reach NEPA ArcGIS endpoint, falling back to broker:", error?.message || error);
  }

  const { response: brokerResponse, data: brokerData, rawText: brokerRaw } = await tryFetchJson(
    brokerUrl.toString()
  );

  if (!brokerResponse.ok) {
    throw new ProxyError(
      `NEPA Assist upstream error ${brokerResponse.status}`,
      brokerResponse.status,
      typeof brokerData === "string" ? brokerData : brokerData?.error ?? brokerRaw
    );
  }

  return {
    data: brokerData,
    meta: {
      upstreamUrl: brokerUrl.toString(),
      bufferMiles,
      type: typeParam,
      coords: coordsParam,
      usedFallback: true
    }
  };
}

export async function callIpacProxy(payload = {}) {
  if (!payload || typeof payload !== "object") {
    throw new ProxyError("Invalid Ley Line Registry payload.", 400);
  }

  // Prythian Permits uses a fake 0..1 canvas (not real lat/lon), so we return deterministic fantasy results.
  // If we ever need the real upstream again, we can re-enable it behind an env flag.
  const data = buildPretendLeyLineRegistryPayload(payload);
  return { data, meta: { mode: "pretend", source: "prythian-ley-line-registry", upstreamUrl: IPAC_URL } };
}

export async function callFakeScreening(payload = {}) {
  // This is a passthrough - the real logic is on the client side in fakeScreening.ts
  // The server just returns the payload back since screening is deterministic on the client
  return {
    data: { mode: "fake", ...payload },
    meta: { source: "prythian-fake-screening" }
  };
}

export { ProxyError };
