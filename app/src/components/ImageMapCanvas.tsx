import { useCallback, useEffect, useRef, useState } from "react"
import type { ChangeEvent, MouseEvent as ReactMouseEvent } from "react"
import type { GeometryChange, GeometrySource, UploadedGisFile } from "../types/gis"
import {
  denormalizeCoords,
  toGeoJson,
  fromGeoJson,
} from "../utils/mapGeometry"
import type { NormalizedPolygon } from "../utils/mapGeometry"
import { parseUploadedGisFile } from "../utils/kmlConversion"

type DrawMode = "rectangle" | "polygon" | "edit"

type ImageMapCanvasProps = {
  geometry?: string // GeoJSON string
  onGeometryChange: (change: GeometryChange) => void
  isVisible?: boolean
  enableFileUpload?: boolean
  activeUploadFileName?: string
  mapImageUrl?: string
}

const DEFAULT_MAP_IMAGE = "/sample-maps/prythian-mainland.svg"

const VERTEX_RADIUS = 6
const VERTEX_HIT_RADIUS = 12

/* ------------------------------------------------------------------ */
/*  Inline styles — scoped to the image-map component                 */
/* ------------------------------------------------------------------ */

const containerStyle: React.CSSProperties = {
  position: "relative",
  userSelect: "none",
  lineHeight: 0,
}

const imageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "auto",
  pointerEvents: "none",
  borderRadius: "14px",
}

const svgStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
}

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.35rem",
  padding: "0.5rem 0.65rem",
  position: "absolute",
  top: "0.5rem",
  left: "0.5rem",
  zIndex: 10,
  background: "var(--card)",
  borderRadius: "10px",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-subtle)",
}

const toolbarButtonBase: React.CSSProperties = {
  padding: "0.3rem 0.65rem",
  fontSize: "0.78rem",
  fontWeight: 500,
  borderRadius: "6px",
  border: "1px solid var(--border)",
  background: "var(--secondary)",
  color: "var(--foreground)",
  cursor: "pointer",
  transition: "background 0.15s, border-color 0.15s",
}

const toolbarButtonActive: React.CSSProperties = {
  ...toolbarButtonBase,
  background: "var(--primary)",
  color: "var(--primary-foreground)",
  borderColor: "var(--primary)",
}

const hintStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "0.5rem",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "0.75rem",
  padding: "0.3rem 0.7rem",
  background: "var(--card)",
  color: "var(--muted-foreground)",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  pointerEvents: "none",
  whiteSpace: "nowrap",
  zIndex: 10,
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function ImageMapCanvas({
  geometry,
  onGeometryChange,
  isVisible = true,
  enableFileUpload = false,
  activeUploadFileName,
  mapImageUrl,
}: ImageMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const [drawMode, setDrawMode] = useState<DrawMode>("rectangle")
  const [polygon, setPolygon] = useState<NormalizedPolygon>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [rectStart, setRectStart] = useState<[number, number] | null>(null)
  const [rectEnd, setRectEnd] = useState<[number, number] | null>(null)
  const [draggingVertex, setDraggingVertex] = useState<number | null>(null)
  const [displaySize, setDisplaySize] = useState<{ w: number; h: number }>({ w: 0, h: 0 })
  const [uploadStatus, setUploadStatus] = useState<{ message?: string; error?: string }>({})
  const [isUploading, setIsUploading] = useState(false)

  // Track whether the polygon came from the geometry prop to avoid re-emitting
  const externalGeometryRef = useRef<string | undefined>(undefined)

  /* ---- Measure the displayed image size ---- */

  const measureImage = useCallback(() => {
    const img = imgRef.current
    if (!img) return
    const rect = img.getBoundingClientRect()
    setDisplaySize({ w: rect.width, h: rect.height })
  }, [])

  useEffect(() => {
    measureImage()
    window.addEventListener("resize", measureImage)
    return () => window.removeEventListener("resize", measureImage)
  }, [measureImage])

  useEffect(() => {
    if (isVisible) {
      // Re-measure after becoming visible (e.g. collapsible card opened)
      requestAnimationFrame(measureImage)
    }
  }, [isVisible, measureImage])

  /* ---- Sync incoming geometry prop ---- */

  useEffect(() => {
    if (geometry === externalGeometryRef.current) return

    externalGeometryRef.current = geometry

    if (!geometry) {
      setPolygon([])
      return
    }

    const parsed = fromGeoJson(geometry)
    if (parsed && parsed.length > 0) {
      // Remove the closing duplicate if the ring was closed
      const last = parsed[parsed.length - 1]
      const first = parsed[0]
      if (parsed.length > 1 && first[0] === last[0] && first[1] === last[1]) {
        parsed.pop()
      }
      setPolygon(parsed)
    }
  }, [geometry])

  /* ---- Emit geometry changes ---- */

  const emitGeometry = useCallback(
    (poly: NormalizedPolygon, source: GeometrySource, uploadedFile?: UploadedGisFile | null) => {
      if (poly.length < 3) {
        const change: GeometryChange = {
          geoJson: undefined,
          arcgisJson: undefined,
          latitude: undefined,
          longitude: undefined,
          source,
          uploadedFile: source === "upload" ? uploadedFile ?? null : null,
        }
        externalGeometryRef.current = undefined
        onGeometryChange(change)
        return
      }
      const geoJsonStr = toGeoJson(poly)
      externalGeometryRef.current = geoJsonStr

      // Compute centroid from normalized coords
      let cx = 0
      let cy = 0
      for (const [x, y] of poly) {
        cx += x
        cy += y
      }
      cx /= poly.length
      cy /= poly.length
      const longitude = cx * 360 - 180
      const latitude = 90 - cy * 180

      onGeometryChange({
        geoJson: geoJsonStr,
        arcgisJson: undefined,
        latitude,
        longitude,
        source,
        uploadedFile: source === "upload" ? uploadedFile ?? null : null,
      })
    },
    [onGeometryChange],
  )

  /* ---- Coordinate helpers ---- */

  const svgCoords = useCallback(
    (e: ReactMouseEvent | globalThis.MouseEvent): [number, number] | null => {
      const container = containerRef.current
      if (!container || displaySize.w === 0 || displaySize.h === 0) return null
      const rect = container.getBoundingClientRect()
      return [e.clientX - rect.left, e.clientY - rect.top]
    },
    [displaySize],
  )

  const pixelToNorm = useCallback(
    (px: [number, number]): [number, number] => {
      if (displaySize.w === 0 || displaySize.h === 0) return [0, 0]
      return [px[0] / displaySize.w, px[1] / displaySize.h]
    },
    [displaySize],
  )

  /* ---- Drawing handlers ---- */

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      const coords = svgCoords(e)
      if (!coords) return

      if (drawMode === "edit") {
        // Check if near a vertex
        const denorm = denormalizeCoords(polygon, displaySize.w, displaySize.h)
        for (let i = 0; i < denorm.length; i++) {
          const dx = denorm[i][0] - coords[0]
          const dy = denorm[i][1] - coords[1]
          if (Math.sqrt(dx * dx + dy * dy) <= VERTEX_HIT_RADIUS) {
            setDraggingVertex(i)
            e.preventDefault()
            return
          }
        }
        return
      }

      if (drawMode === "rectangle") {
        // Start rectangle drag
        setIsDrawing(true)
        setRectStart(coords)
        setRectEnd(coords)
        e.preventDefault()
      }
      // polygon mode: clicks handled in handleClick / handleDoubleClick
    },
    [drawMode, svgCoords, polygon, displaySize],
  )

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const coords = svgCoords(e)
      if (!coords) return

      if (drawMode === "edit" && draggingVertex !== null) {
        const norm = pixelToNorm(coords)
        setPolygon((prev) => {
          const next = [...prev]
          next[draggingVertex] = [
            Math.max(0, Math.min(1, norm[0])),
            Math.max(0, Math.min(1, norm[1])),
          ]
          return next
        })
        e.preventDefault()
        return
      }

      if (drawMode === "rectangle" && isDrawing && rectStart) {
        setRectEnd(coords)
        e.preventDefault()
      }
    },
    [drawMode, draggingVertex, isDrawing, rectStart, svgCoords, pixelToNorm],
  )

  const handleMouseUp = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (drawMode === "edit" && draggingVertex !== null) {
        setDraggingVertex(null)
        emitGeometry(polygon, "draw")
        e.preventDefault()
        return
      }

      if (drawMode === "rectangle" && isDrawing && rectStart && rectEnd) {
        setIsDrawing(false)
        const n1 = pixelToNorm(rectStart)
        const n2 = pixelToNorm(rectEnd)
        const minX = Math.max(0, Math.min(n1[0], n2[0]))
        const minY = Math.max(0, Math.min(n1[1], n2[1]))
        const maxX = Math.min(1, Math.max(n1[0], n2[0]))
        const maxY = Math.min(1, Math.max(n1[1], n2[1]))

        // Only create rectangle if it has some area
        if (Math.abs(maxX - minX) > 0.005 && Math.abs(maxY - minY) > 0.005) {
          const rectPoly: NormalizedPolygon = [
            [minX, minY],
            [maxX, minY],
            [maxX, maxY],
            [minX, maxY],
          ]
          setPolygon(rectPoly)
          emitGeometry(rectPoly, "draw")
        }
        setRectStart(null)
        setRectEnd(null)
        e.preventDefault()
      }
    },
    [drawMode, draggingVertex, isDrawing, rectStart, rectEnd, pixelToNorm, polygon, emitGeometry],
  )

  const handleClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (drawMode !== "polygon") return
      // Ignore double-click events (they fire a click first)
      if (e.detail >= 2) return
      const coords = svgCoords(e)
      if (!coords) return

      const norm = pixelToNorm(coords)
      setPolygon((prev) => [...prev, [Math.max(0, Math.min(1, norm[0])), Math.max(0, Math.min(1, norm[1]))]])
      setIsDrawing(true)
      e.preventDefault()
    },
    [drawMode, svgCoords, pixelToNorm],
  )

  const handleDoubleClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (drawMode !== "polygon") return
      e.preventDefault()
      // Close the polygon
      setIsDrawing(false)
      setPolygon((prev) => {
        // Remove the last point that was added by the preceding click event
        const cleaned = prev.length > 3 ? prev.slice(0, -1) : prev
        if (cleaned.length >= 3) {
          emitGeometry(cleaned, "draw")
        }
        return cleaned
      })
    },
    [drawMode, emitGeometry],
  )

  /* ---- Clear ---- */

  const handleClear = useCallback(() => {
    setPolygon([])
    setIsDrawing(false)
    setRectStart(null)
    setRectEnd(null)
    setDraggingVertex(null)
    emitGeometry([], "draw")
  }, [emitGeometry])

  /* ---- File upload ---- */

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target
      const file = input.files?.[0]
      input.value = ""

      if (!file || !enableFileUpload) return

      setIsUploading(true)
      setUploadStatus({})

      try {
        const parsed = await parseUploadedGisFile(file)
        const geoJsonStr = parsed.geoJson

        // Try to parse the returned GeoJSON as a polygon we can render
        const parsedPoly = fromGeoJson(geoJsonStr)
        if (parsedPoly && parsedPoly.length > 0) {
          // Remove closing duplicate
          const last = parsedPoly[parsedPoly.length - 1]
          const first = parsedPoly[0]
          if (parsedPoly.length > 1 && first[0] === last[0] && first[1] === last[1]) {
            parsedPoly.pop()
          }
          setPolygon(parsedPoly)
          emitGeometry(parsedPoly, "upload", parsed.uploadedFile)
        } else {
          // Non-polygon geometry from the upload -- still emit the raw GeoJSON
          externalGeometryRef.current = geoJsonStr
          onGeometryChange({
            geoJson: geoJsonStr,
            arcgisJson: undefined,
            latitude: undefined,
            longitude: undefined,
            source: "upload",
            uploadedFile: parsed.uploadedFile,
          })
        }
        setUploadStatus({ message: `Uploaded ${file.name}` })
      } catch (error) {
        console.error("ImageMapCanvas: Failed to process uploaded file", error)
        const message = error instanceof Error ? error.message : "Unable to process the uploaded file."
        setUploadStatus({ error: message })
      } finally {
        setIsUploading(false)
      }
    },
    [enableFileUpload, emitGeometry, onGeometryChange],
  )

  /* ---- Render helpers ---- */

  const drawingPolygonPixels = polygon.length > 0
    ? denormalizeCoords(polygon, displaySize.w, displaySize.h)
    : []

  // Build the polygon/rect SVG path
  let shapePath = ""
  if (drawMode === "rectangle" && isDrawing && rectStart && rectEnd) {
    // Live rectangle preview
    const x = Math.min(rectStart[0], rectEnd[0])
    const y = Math.min(rectStart[1], rectEnd[1])
    const w = Math.abs(rectEnd[0] - rectStart[0])
    const h = Math.abs(rectEnd[1] - rectStart[1])
    shapePath = `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`
  } else if (drawingPolygonPixels.length >= 2) {
    const parts = drawingPolygonPixels.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    // Close the path if we have enough points and are not mid-draw
    if (drawingPolygonPixels.length >= 3 && !isDrawing) {
      parts.push("Z")
    }
    shapePath = parts.join(" ")
  }

  // Cursor style
  let cursorStyle: React.CSSProperties["cursor"] = "crosshair"
  if (drawMode === "edit") {
    cursorStyle = draggingVertex !== null ? "grabbing" : "default"
  }

  const modeHints: Record<DrawMode, string> = {
    rectangle: "Click and drag to draw a rectangle",
    polygon: polygon.length === 0
      ? "Click to place points, double-click to close"
      : isDrawing
        ? "Click to add points, double-click to close"
        : "Shape drawn. Switch to Edit to adjust vertices.",
    edit: polygon.length === 0 ? "Draw a shape first" : "Drag vertices to adjust",
  }

  const src = mapImageUrl || DEFAULT_MAP_IMAGE

  return (
    <div className="location-map">
      <div
        ref={containerRef}
        style={{ ...containerStyle, cursor: cursorStyle }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <img
          ref={imgRef}
          src={src}
          alt="Map of Prythian"
          style={imageStyle}
          onLoad={measureImage}
          draggable={false}
        />

        {displaySize.w > 0 && displaySize.h > 0 ? (
          <svg
            style={svgStyle}
            viewBox={`0 0 ${displaySize.w} ${displaySize.h}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Drawn shape */}
            {shapePath ? (
              <path
                d={shapePath}
                fill="var(--alpha-accent-20)"
                stroke="var(--primary)"
                strokeWidth={2}
                strokeLinejoin="round"
              />
            ) : null}

            {/* Vertices (edit mode, or after a shape is complete) */}
            {(!isDrawing || drawMode === "edit") &&
              drawingPolygonPixels.map(([x, y], i) => (
                <circle
                  key={`vertex-${i}`}
                  cx={x}
                  cy={y}
                  r={VERTEX_RADIUS}
                  fill="var(--primary-foreground)"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  style={{ cursor: drawMode === "edit" ? "grab" : undefined }}
                />
              ))}

            {/* In-progress polygon vertices while drawing */}
            {isDrawing &&
              drawMode === "polygon" &&
              drawingPolygonPixels.map(([x, y], i) => (
                <circle
                  key={`active-vertex-${i}`}
                  cx={x}
                  cy={y}
                  r={4}
                  fill="var(--primary)"
                  stroke="var(--primary-foreground)"
                  strokeWidth={1.5}
                />
              ))}
          </svg>
        ) : null}

        {/* Mode toolbar */}
        <div style={toolbarStyle}>
          <button
            type="button"
            style={drawMode === "rectangle" ? toolbarButtonActive : toolbarButtonBase}
            onClick={(e) => {
              e.stopPropagation()
              setDrawMode("rectangle")
              setIsDrawing(false)
            }}
          >
            Rectangle
          </button>
          <button
            type="button"
            style={drawMode === "polygon" ? toolbarButtonActive : toolbarButtonBase}
            onClick={(e) => {
              e.stopPropagation()
              setDrawMode("polygon")
              setIsDrawing(false)
            }}
          >
            Polygon
          </button>
          <button
            type="button"
            style={drawMode === "edit" ? toolbarButtonActive : toolbarButtonBase}
            onClick={(e) => {
              e.stopPropagation()
              setDrawMode("edit")
              setIsDrawing(false)
            }}
            disabled={polygon.length === 0}
          >
            Edit
          </button>
          <button
            type="button"
            style={toolbarButtonBase}
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
          >
            Clear
          </button>
        </div>

        {/* Hint text */}
        <div style={hintStyle}>{modeHints[drawMode]}</div>
      </div>

      {/* File upload controls */}
      {enableFileUpload ? (
        <div className="location-map__controls" aria-live="polite">
          <label
            className={`location-map__upload-button${isUploading ? " location-map__upload-button--loading" : ""}`}
          >
            <span>{isUploading ? "Processing..." : "Upload KML/KMZ/GeoJSON"}</span>
            <input
              type="file"
              accept=".kml,.kmz,.geojson,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz,application/geo+json,application/json"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          {(() => {
            const statusText = uploadStatus.error
              ? uploadStatus.error
              : isUploading
                ? "Processing upload..."
                : uploadStatus.message
                  ? uploadStatus.message
                  : activeUploadFileName
                    ? `Active upload: ${activeUploadFileName}`
                    : undefined
            if (!statusText) return null
            const statusClass = uploadStatus.error
              ? "location-map__status location-map__status--error"
              : "location-map__status"
            return <div className={statusClass}>{statusText}</div>
          })()}
        </div>
      ) : null}
    </div>
  )
}

export type { GeometryChange } from "../types/gis"
