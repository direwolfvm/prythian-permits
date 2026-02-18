import { useCallback, useMemo, useState } from "react"
import type { ChangeEvent } from "react"

import { CopilotKit, useCopilotReadable } from "@copilotkit/react-core"
import { CopilotSidebar } from "@copilotkit/react-ui"
import "@copilotkit/react-ui/styles.css"

import "./copilot-overrides.css"
import "./App.css"

import { ImageMapCanvas } from "./components/ImageMapCanvas"
import type { GeometryChange, UploadedGisFile } from "./types/gis"
import type { GeospatialResultsState, NepassistSummaryItem } from "./types/geospatial"
import {
  DEFAULT_BUFFER_MILES,
  formatGeospatialResultsSummary
} from "./utils/geospatial"
import {
  runAllScreenings,
  screeningResultsToNepassistSummary,
  screeningResultsToIpacSummary,
  type ScreeningInput
} from "./utils/fakeScreening"
import { fromGeoJson, computeBBox, bboxCenter, polygonArea } from "./utils/mapGeometry"
import { getRuntimeUrl } from "./runtimeConfig"

function createInitialGeospatialResults(): GeospatialResultsState {
  return {
    nepassist: { status: "idle" },
    ipac: { status: "idle" },
    messages: [],
    lastRunAt: undefined
  }
}

function formatTimestamp(timestamp?: string) {
  if (!timestamp) {
    return undefined
  }
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }
  return date.toLocaleString()
}

function countHighPriorityFindings(items: NepassistSummaryItem[] | undefined) {
  if (!items || items.length === 0) {
    return 0
  }
  return items.filter((item) => item.severity === "yes" || item.severity === "ondemand").length
}

function buildImplicationLines(results: GeospatialResultsState): string[] {
  const lines: string[] = []

  if (!results.lastRunAt) {
    return lines
  }

  const nepa = results.nepassist
  if (nepa.status === "success" && nepa.summary) {
    const elevated = countHighPriorityFindings(nepa.summary)
    if (elevated > 0) {
      lines.push(
        `Weave Review: ${elevated} screened resources may require a higher level of Weave Review or ward mitigation planning. Review the Ward Assessment findings to scope the appropriate decree and extraordinary circumstance checks.`
      )
    } else {
      lines.push(
        "Weave Review: No elevated concerns were returned by the Ward Assessment. Continue with the planned level of review and document any routine conditions."
      )
    }
  } else if (nepa.status === "error") {
    lines.push(
      `Weave Review: Screening results were unavailable (${nepa.error ?? "unknown error"}). Document the outage and consider alternative scrying sources before advancing Weave Review decisions.`
    )
  } else {
    lines.push("Weave Review: Screening has not returned any findings yet.")
  }

  const ipac = results.ipac
  if (ipac.status === "success" && ipac.summary) {
    if (ipac.summary.listedSpecies.length > 0 || ipac.summary.criticalHabitats.length > 0) {
      const species = ipac.summary.listedSpecies.slice(0, 5).join(", ")
      const habitats = ipac.summary.criticalHabitats.slice(0, 5).join(", ")
      const speciesText = species ? `listed creatures (${species})` : "listed creatures"
      const habitatText = habitats ? `protected territories (${habitats})` : "protected territories"
      lines.push(
        `Endangered Creatures Accord: The Ley Line Registry identified ${speciesText} and ${habitatText}. Coordinate with the Suriel Sightings Archive for consultation needs and survey timing.`
      )
    } else {
      lines.push(
        "Endangered Creatures Accord: The Ley Line Registry did not flag listed creatures or protected territories. Keep records of the Ley Line Registry response to support any No Effect determinations."
      )
    }

    if (ipac.summary.wetlands.length > 0) {
      const wetlands = ipac.summary.wetlands
        .slice(0, 5)
        .map((wetland) => (wetland.acres ? `${wetland.name} (${wetland.acres} ac)` : wetland.name))
        .join(", ")
      lines.push(
        `Sacred Waters Accord: Wetlands of interest were noted (${wetlands}). Engage the Court of Tides early to confirm jurisdiction and decree requirements.`
      )
    } else {
      lines.push(
        "Sacred Waters Accord: No wetlands of concern were identified in the Ley Line Registry. Field verification is still recommended before finalizing Section 404 determinations."
      )
    }

    if (ipac.summary.migratoryBirds.length > 0) {
      lines.push(
        "Cauldron Proximity Index: Sensitive magical resources were identified. Coordinate construction schedules and ward emissions planning to minimize indirect impacts alongside Cauldron Proximity Index conformity reviews."
      )
    } else {
      lines.push(
        "Cauldron Proximity Index: No migratory creature hotspots were highlighted. Continue with standard conformity analyses for the petition area."
      )
    }
  } else if (ipac.status === "error") {
    lines.push(
      `Endangered Creatures Accord: Ley Line Registry data was unavailable (${ipac.error ?? "unknown error"}). Document the outage and contact the Suriel Sightings Archive directly.`
    )
    lines.push("Sacred Waters Accord: Ley Line Registry wetlands were unavailable; coordinate wetland delineations manually and consult the Court of Tides as needed.")
    lines.push("Cauldron Proximity Index: Proceed with regular conformity analysis; no magical screening results were returned to adjust the approach.")
  } else {
    lines.push("Endangered Creatures Accord: Screening results are pending.")
    lines.push("Sacred Waters Accord: Screening results are pending.")
    lines.push("Cauldron Proximity Index: Screening results are pending.")
  }

  lines.push(
    "Ancient Wards Preservation Accord: Use these geospatial findings to inform the Area of Potential Effects and coordinate early with the Court Historian; additional magical resource surveys may still be required."
  )
  lines.push(
    "Fae consultation: Share the screening summary with allied Fae courts and incorporate their knowledge of resources before scoping petition alternatives."
  )

  return lines
}

function formatImplicationsForCopilot(results: GeospatialResultsState) {
  const lines = buildImplicationLines(results)
  if (!results.lastRunAt || lines.length === 0) {
    return "No augury screening has been completed yet."
  }

  return [
    "Resource implications summary:",
    `Last run: ${formatTimestamp(results.lastRunAt) ?? "unknown"}`,
    ...lines.map((line) => `- ${line}`)
  ].join("\n")
}

const defaultRuntimeUrl = getRuntimeUrl()

export function ResourceCheckContent() {
  const [geometry, setGeometry] = useState<string | undefined>(undefined)
  const [arcgisJson, setArcgisJson] = useState<string | undefined>(undefined)
  const [uploadedGisFile, setUploadedGisFile] = useState<UploadedGisFile | null>(null)
  const [locationNotes, setLocationNotes] = useState("")
  const [bufferInput, setBufferInput] = useState<string>(DEFAULT_BUFFER_MILES.toString())
  const [geospatialResults, setGeospatialResults] = useState<GeospatialResultsState>(
    () => createInitialGeospatialResults()
  )

  const instructions = useMemo(
    () =>
      [
        "You interpret augury screenings (Ley Line Registry and Ward Assessment) and suggest next steps for Weave Review in Prythian.",
        "Stay in-universe: treat the map as a Prythian canvas and the results as fictional decrees and accords.",
        "Highlight implications for the Weave Review, Endangered Creatures Accord, the Sacred Waters Accord, Cauldron Proximity Index, Ancient Wards Preservation Accord, and Fae consultation.",
        "Use the latest geospatial results and summaries to tailor your guidance."
      ].join("\n"),
    []
  )

  const hasGeometry = Boolean(geometry)
  const lastRunLabel = formatTimestamp(geospatialResults.lastRunAt)
  const implicationLines = useMemo(() => buildImplicationLines(geospatialResults), [geospatialResults])

  useCopilotReadable(
    {
      description: "Latest augury screening results for Augury Check",
      value: geospatialResults,
      convert: (arg1, arg2) => {
        const resolvedValue =
          (typeof arg1 === "string" ? arg2 : arg1) ?? createInitialGeospatialResults()
        return formatGeospatialResultsSummary(resolvedValue as GeospatialResultsState)
      }
    },
    [geospatialResults]
  )

  useCopilotReadable(
    {
      description: "Resource implications derived from the current screening",
      value: geospatialResults,
      convert: (arg1, arg2) => {
        const resolvedValue =
          (typeof arg1 === "string" ? arg2 : arg1) ?? createInitialGeospatialResults()
        return formatImplicationsForCopilot(resolvedValue as GeospatialResultsState)
      }
    },
    [geospatialResults]
  )

  useCopilotReadable(
    {
      description: "Field notes captured during the Augury Check session",
      value: locationNotes,
      convert: (arg1, arg2) => {
        const resolvedValue = (typeof arg1 === "string" ? arg2 : arg1) ?? ""
        return String(resolvedValue) || "No notes provided."
      }
    },
    [locationNotes]
  )

  const handleGeometryChange = useCallback((change: GeometryChange) => {
    const { geoJson, arcgisJson: arcgisString, source, uploadedFile } = change
    setGeometry(geoJson)
    setArcgisJson(arcgisString)
    if (source === "upload") {
      setUploadedGisFile(uploadedFile ?? null)
    } else if (uploadedFile === null || source) {
      setUploadedGisFile(null)
    }
  }, [])

  const handleClearGeometry = useCallback(() => {
    setGeometry(undefined)
    setArcgisJson(undefined)
    setUploadedGisFile(null)
  }, [])

  const handleBufferChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setBufferInput(event.target.value)
  }, [])

  const handleRunGeospatial = useCallback(async () => {
    if (!geometry) {
      setGeospatialResults({
        nepassist: { status: "error", error: "No geometry available. Draw a shape on the map first." },
        ipac: { status: "error", error: "No geometry available. Draw a shape on the map first." },
        lastRunAt: new Date().toISOString(),
        messages: ["No geometry available. Draw a shape on the map first."]
      })
      return
    }

    setGeospatialResults({
      nepassist: { status: "loading" },
      ipac: { status: "loading" },
      lastRunAt: new Date().toISOString(),
      messages: undefined
    })

    try {
      const polygon = fromGeoJson(geometry)
      if (!polygon || polygon.length < 3) {
        throw new Error("The drawn geometry could not be interpreted. Please redraw your shape.")
      }

      const bbox = computeBBox(polygon)
      const center = bboxCenter(bbox)
      const area = polygonArea(polygon)

      const screeningInput: ScreeningInput = { bboxCenter: center, area }
      const results = runAllScreenings(screeningInput)

      setGeospatialResults({
        nepassist: {
          status: "success",
          summary: screeningResultsToNepassistSummary(results)
        },
        ipac: {
          status: "success",
          summary: screeningResultsToIpacSummary(results)
        },
        lastRunAt: new Date().toISOString(),
        messages: undefined
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Screening failed."
      setGeospatialResults({
        nepassist: { status: "error", error: message },
        ipac: { status: "error", error: message },
        lastRunAt: new Date().toISOString(),
        messages: [message]
      })
    }
  }, [geometry])

  const isRunning =
    geospatialResults.nepassist.status === "loading" || geospatialResults.ipac.status === "loading"

  return (
    <CopilotSidebar
      instructions={instructions}
      defaultOpen
      clickOutsideToClose={false}
      labels={{ title: "Augury Copilot" }}
    >
      <main className="app">
        <div className="app__inner">
          <header className="app-header">
            <div>
              <h1>Augury Check</h1>
              <p>
                Draw your petition footprint, set an optional analysis buffer, and run the built-in screening tools. The
                Copilot summarizes the implications for key Weave Reviews.
              </p>
            </div>
          </header>

          <section className="content">
            <div className="location-card">
              <div className="location-card__header">
                <div>
                  <h2>Petition footprint</h2>
                  <p className="help-block">
                    Search for a location or navigate the map, then draw a point, line, or polygon to capture the petition
                    area. Use the clear option to start over.
                  </p>
                </div>
                <button type="button" className="link-button" onClick={handleClearGeometry}>
                  Clear shape
                </button>
              </div>
              <textarea
                className="location-card__textarea"
                placeholder="Add optional notes about the location or constraints revealed during screening."
                value={locationNotes}
                onChange={(event) => setLocationNotes(event.target.value)}
                rows={3}
              />
              <div className="location-card__map">
                <ImageMapCanvas
                  geometry={geometry}
                  onGeometryChange={handleGeometryChange}
                  enableFileUpload
                  activeUploadFileName={uploadedGisFile?.fileName}
                />
                <input type="hidden" name="location_object" value={geometry ?? ""} readOnly aria-hidden="true" />
                <input type="hidden" name="location_arcgis_json" value={arcgisJson ?? ""} readOnly aria-hidden="true" />
              </div>
            </div>

            <div className="form-panel">
              <div className="form-panel__header">
                <h2>Screening controls</h2>
                <p className="help-block">
                  Choose the analysis buffer for the Ward Assessment (leagues) and run the combined Ward Assessment and Ley Line Registry screening.
                </p>
              </div>
              <div className="form-panel__body">
                <label className="form-field">
                  <span>Buffer distance (leagues)</span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={bufferInput}
                    onChange={handleBufferChange}
                  />
                </label>
                <button
                  type="button"
                  className="usa-button primary"
                  onClick={handleRunGeospatial}
                  disabled={!hasGeometry || isRunning}
                >
                  {isRunning ? "Running augury screen..." : "Run augury screen"}
                </button>
                {!hasGeometry ? (
                  <p className="help-block geospatial-footer__hint">
                    Draw a petition geometry to enable the screening tools.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="form-panel">
              <div className="form-panel__header">
                <h2>Latest screening results</h2>
                <p className="help-block">
                  Review system messages and summaries, then check the resource implications below to inform next steps.
                </p>
              </div>
              <div className="form-panel__body">
                <div className="geospatial-results">
                  <div className="geospatial-results__header">
                    <h3>Augury services</h3>
                    <span className="geospatial-results__timestamp" aria-live="polite">
                      {lastRunLabel ? `Last run ${lastRunLabel}` : "Not yet run"}
                    </span>
                  </div>
                  {geospatialResults.messages && geospatialResults.messages.length > 0 ? (
                    <ul className="geospatial-results__messages">
                      {geospatialResults.messages.map((message, index) => (
                        <li key={`resource-message-${index}`}>{message}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="geospatial-results__cards">
                    <div className="geospatial-results__card" aria-live="polite">
                      <h4>Ward Assessment</h4>
                      {geospatialResults.nepassist.status === "loading" ? (
                        <p className="geospatial-results__status">Running augury query...</p>
                      ) : geospatialResults.nepassist.status === "error" ? (
                        <p className="geospatial-results__status error">
                          {geospatialResults.nepassist.error ?? "The screening request failed."}
                        </p>
                      ) : geospatialResults.nepassist.status === "success" &&
                        geospatialResults.nepassist.summary ? (
                        <div className="geospatial-results__table-wrapper">
                          <table className="geospatial-results__table">
                            <thead>
                              <tr>
                                <th scope="col">Question</th>
                                <th scope="col">Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              {geospatialResults.nepassist.summary.map((item, index) => (
                                <tr key={`${item.question}-${index}`}>
                                  <td>{item.question}</td>
                                  <td>{item.displayAnswer}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="geospatial-results__status muted">
                          Run the augury screen to request Ward Assessment data.
                        </p>
                      )}
                    </div>
                    <div className="geospatial-results__card" aria-live="polite">
                      <h4>Ley Line Registry</h4>
                      {geospatialResults.ipac.status === "loading" ? (
                        <p className="geospatial-results__status">Running augury query...</p>
                      ) : geospatialResults.ipac.status === "error" ? (
                        <p className="geospatial-results__status error">
                          {geospatialResults.ipac.error ?? "The screening request failed."}
                        </p>
                      ) : geospatialResults.ipac.status === "success" && geospatialResults.ipac.summary ? (
                        <div className="geospatial-results__ipac">
                          <ul>
                            <li>
                              <strong>Location</strong>: {geospatialResults.ipac.summary.locationDescription || "Not provided"}
                            </li>
                            <li>
                              <strong>Listed creatures</strong>:
                              {geospatialResults.ipac.summary.listedSpecies.length ? (
                                <ul>
                                  {geospatialResults.ipac.summary.listedSpecies.map((item, index) => (
                                    <li key={`${item}-${index}`}>{item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="geospatial-results__status muted">None returned</span>
                              )}
                            </li>
                            <li>
                              <strong>Protected territory</strong>:
                              {geospatialResults.ipac.summary.criticalHabitats.length ? (
                                <ul>
                                  {geospatialResults.ipac.summary.criticalHabitats.map((item, index) => (
                                    <li key={`${item}-${index}`}>{item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="geospatial-results__status muted">None returned</span>
                              )}
                            </li>
                            <li>
                              <strong>Migratory creatures of concern</strong>:
                              {geospatialResults.ipac.summary.migratoryBirds.length ? (
                                <ul>
                                  {geospatialResults.ipac.summary.migratoryBirds.map((item, index) => (
                                    <li key={`${item}-${index}`}>{item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="geospatial-results__status muted">None returned</span>
                              )}
                            </li>
                            <li>
                              <strong>Wetlands</strong>:
                              {geospatialResults.ipac.summary.wetlands.length ? (
                                <ul>
                                  {geospatialResults.ipac.summary.wetlands.map((wetland, index) => (
                                    <li key={`${wetland.name}-${index}`}>
                                      {wetland.name}
                                      {wetland.acres ? ` \u2013 ${wetland.acres} ac` : null}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="geospatial-results__status muted">None returned</span>
                              )}
                            </li>
                          </ul>
                        </div>
                      ) : (
                        <p className="geospatial-results__status muted">
                          Run the augury screen to request Ley Line Registry data.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="resource-implications" aria-live="polite">
                    <h4>Resource implications</h4>
                    {implicationLines.length > 0 ? (
                      <ul>
                        {implicationLines.map((line, index) => (
                          <li key={`implication-${index}`}>{line}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="geospatial-results__status muted">
                        Run the augury screen to generate resource implications.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </CopilotSidebar>
  )
}

export default function ResourceCheckPage() {
  const effectiveRuntimeUrl = defaultRuntimeUrl
  return (
    <CopilotKit runtimeUrl={effectiveRuntimeUrl || undefined} useSingleEndpoint>
      <ResourceCheckContent />
    </CopilotKit>
  )
}
