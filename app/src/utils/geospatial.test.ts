import { describe, expect, it } from 'vitest'

import { prepareGeospatialPayload, formatGeospatialResultsSummary, summarizeIpac } from './geospatial'
import type { GeospatialResultsState } from '../types/geospatial'

describe('prepareGeospatialPayload', () => {
  it('extracts polygon coordinates and builds WKT for IPaC', () => {
    const polygonGeometry = JSON.stringify({
      type: 'Polygon',
      coordinates: [
        [
          [-77.03, 38.9],
          [-77.02, 38.91],
          [-77.01, 38.92]
        ]
      ]
    })

    const result = prepareGeospatialPayload(polygonGeometry)

    expect(result.errors).toEqual([])
    expect(result.nepassist).toEqual({
      coords: [
        [-77.03, 38.9],
        [-77.02, 38.91],
        [-77.01, 38.92]
      ],
      coordsString: '-77.03,38.9,-77.02,38.91,-77.01,38.92',
      type: 'polygon'
    })
    expect(result.ipac).toEqual({
      wkt: 'POLYGON((-77.03 38.9, -77.02 38.91, -77.01 38.92, -77.03 38.9))',
      geometryType: 'polygon'
    })
  })

  it('returns an error when the geometry cannot be parsed', () => {
    const result = prepareGeospatialPayload('not-json')

    expect(result.errors).toContain('The stored geometry is not valid JSON.')
    expect(result.nepassist).toBeUndefined()
    expect(result.ipac).toBeUndefined()
  })

  it('warns when only a point geometry is available', () => {
    const pointGeometry = JSON.stringify({
      type: 'Point',
      coordinates: [-77.04, 38.91]
    })

    const result = prepareGeospatialPayload(pointGeometry)

    expect(result.errors).toContain(
      'Ley Line Registry only supports polygon or line geometries. Draw a line or polygon to include Ley Line Registry results.'
    )
    expect(result.nepassist).toEqual({
      coords: [[-77.04, 38.91]],
      coordsString: '-77.04,38.91',
      type: 'point'
    })
    expect(result.ipac).toBeUndefined()
  })
})

describe('formatGeospatialResultsSummary', () => {
  it('summarizes messages and findings for Copilot', () => {
    const results: GeospatialResultsState = {
      nepassist: {
        status: 'success',
        summary: [
          { question: 'Floodplains', displayAnswer: '⚠️ Yes', severity: 'yes' },
          { question: 'Section 4(f) resources', displayAnswer: '✅ No', severity: 'no' }
        ]
      },
      ipac: {
        status: 'success',
        summary: {
          locationDescription: 'Project corridor',
          listedSpecies: ['Bald eagle (Threatened)'],
          criticalHabitats: ['Habitat A'],
          migratoryBirds: [],
          wetlands: [{ name: 'Wetland 12', acres: '2' }]
        }
      },
      lastRunAt: undefined,
      messages: ['Latest run succeeded']
    }

    const summary = formatGeospatialResultsSummary(results)

    expect(summary).toContain('Augury screening results:')
    expect(summary).toContain('Last run: not yet run')
    expect(summary).toContain('- Latest run succeeded')
    expect(summary).toContain('Ward Assessment status: success')
    expect(summary).toContain('  - ⚠️ Yes: Floodplains')
    expect(summary).toContain('Ley Line Registry status: success')
    expect(summary).toContain('  - Location: Project corridor')
    expect(summary).toContain('  - Listed species: Bald eagle (Threatened)')
    expect(summary).toContain('  - Critical habitats: Habitat A')
    expect(summary).toContain('  - Wetlands: Wetland 12 (2 acres)')
  })
})

describe('summarizeIpac', () => {
  it('parses pretend Ley Line Registry proxy payloads', () => {
    const payload = {
      ipac_report: {
        body: {
          resources: {
            location: { description: 'Prythian canvas region: Night Court at X=0.60, Y=0.20' },
            populationsBySid: {
              'SID-1': { population: { optionalCommonName: 'Suriel (Protected)', listingStatusName: 'Protected' } }
            },
            crithabs: [{ criticalHabitatName: 'Ancient grove ward lattice' }],
            migbirds: [{ phenologySpecies: { commonName: 'Nightjar of Velaris' } }],
            wetlands: [{ wetlandType: 'Sidra backwater wetland', wetlandAcres: 2.4 }]
          }
        }
      }
    }

    const summary = summarizeIpac(payload)

    expect(summary.locationDescription).toContain('Prythian canvas region')
    expect(summary.listedSpecies.length).toBeGreaterThan(0)
    expect(summary.criticalHabitats.length).toBeGreaterThan(0)
    expect(summary.migratoryBirds.length).toBeGreaterThan(0)
    expect(summary.wetlands.length).toBeGreaterThan(0)
  })
})
