import type { RJSFSchema, UiSchema } from "@rjsf/utils"

export interface ProjectContact {
  name?: string
  organization?: string
  email?: string
  phone?: string
}

export interface ProjectFormData {
  id?: string
  title?: string
  description?: string
  sector?: string
  lead_agency?: string
  participating_agencies?: string
  sponsor?: string
  sponsor_contact?: ProjectContact
  funding?: string
  location_text?: string
  location_lat?: number
  location_lon?: number
  location_object?: string
  nepa_categorical_exclusion_code?: string
  nepa_conformance_conditions?: string
  nepa_extraordinary_circumstances?: string
  other?: string
}

export type SimpleProjectField = Exclude<keyof ProjectFormData, "sponsor_contact">

type FieldJsonType = "string" | "number"

interface FieldDetail {
  key: SimpleProjectField
  title: string
  description: string
  jsonType: FieldJsonType
  format?: "date" | "date-time"
  placeholder?: string
  widget?: "textarea"
  rows?: number
  includeInForm?: boolean
}

export const projectFieldDetails: ReadonlyArray<FieldDetail> = [
  {
    key: "title",
    title: "Petition Title",
    description:
      "Plain-language name used by the Courts and petitioners to refer to this venture.",
    jsonType: "string",
    placeholder: "Velaris Ley Line Extension"
  },
  {
    key: "sector",
    title: "Sector",
    description: "Category of the venture from the Prythian decree standards.",
    jsonType: "string",
    placeholder: "Ley Line Infrastructure"
  },
  {
    key: "lead_agency",
    title: "Presiding Court",
    description: "Court responsible for leading the Weave Review.",
    jsonType: "string",
    placeholder: "Night Court"
  },
  {
    key: "participating_agencies",
    title: "Allied Courts",
    description: "Additional Courts contributing to the review (comma-separated).",
    jsonType: "string",
    placeholder: "Day Court, Dawn Court"
  },
  {
    key: "sponsor",
    title: "Petition Patron",
    description: "Individual or organization sponsoring this venture.",
    jsonType: "string",
    placeholder: "Velaris Infrastructure Guild"
  },
  {
    key: "description",
    title: "Petition Description",
    description: "Concise summary of the venture's purpose, scope, and major components.",
    jsonType: "string",
    widget: "textarea",
    rows: 5,
    placeholder: "Extend the primary ley line conduit from Velaris to..."
  },
  {
    key: "funding",
    title: "Funding & Tithe Summary",
    description: "Key funding sources or Court tithes supporting the venture.",
    jsonType: "string",
    widget: "textarea",
    rows: 3,
    placeholder: "Night Court treasury; Velaris merchant guild contributions"
  },
  {
    key: "location_text",
    title: "Location Description",
    description: "Narrative description of the venture location (court territory, landmarks, regions).",
    jsonType: "string",
    widget: "textarea",
    rows: 3,
    placeholder: "Northern reaches of the Night Court, along the Sidra River",
    includeInForm: false
  },
  {
    key: "location_lat",
    title: "Map Position Y",
    description: "Normalized Y position on the Prythian map (0-1).",
    jsonType: "number",
    placeholder: "0.35",
    includeInForm: false
  },
  {
    key: "location_lon",
    title: "Map Position X",
    description: "Normalized X position on the Prythian map (0-1).",
    jsonType: "number",
    placeholder: "0.52",
    includeInForm: false
  },
  {
    key: "location_object",
    title: "Location Geometry (GeoJSON)",
    description: "GeoJSON geometry describing the venture footprint on the map.",
    jsonType: "string",
    widget: "textarea",
    rows: 4,
    placeholder: '{"type":"Polygon","coordinates":[[[0.3,0.2],[0.5,0.2],[0.5,0.4],[0.3,0.4],[0.3,0.2]]]}',
    includeInForm: false
  },
  {
    key: "nepa_categorical_exclusion_code",
    title: "Weave Exemption Code",
    description: "Describe the Weave exemption category applied to this petition.",
    jsonType: "string",
    widget: "textarea",
    rows: 3,
    placeholder: "Briefly describe the Weave exemption determination.",
    includeInForm: false
  },
  {
    key: "nepa_conformance_conditions",
    title: "Conditions for Conformance",
    description:
      "Document any conditions that must be met for the petition to proceed through decree or Weave Review.",
    jsonType: "string",
    widget: "textarea",
    rows: 4,
    includeInForm: false
  },
  {
    key: "nepa_extraordinary_circumstances",
    title: "Weave Narrative",
    description:
      "Summarize analysis of any ley lines, wards, or magical resources that could be impacted by the venture. If relevant, evaluate extraordinary circumstances for a Weave exemption.",
    jsonType: "string",
    widget: "textarea",
    rows: 5,
    includeInForm: false
  },
  {
    key: "other",
    title: "Other Notes",
    description: "Additional context or notes that do not fit other fields.",
    jsonType: "string",
    widget: "textarea",
    rows: 3
  }
]

const schemaProperties: RJSFSchema["properties"] = projectFieldDetails.reduce(
  (accumulator, field) => {
    if (field.includeInForm === false) {
      return accumulator
    }
    accumulator[field.key] = {
      type: field.jsonType,
      title: field.title,
      description: field.description,
      ...(field.format ? { format: field.format } : {})
    }
    return accumulator
  },
  {} as NonNullable<RJSFSchema["properties"]>
)

schemaProperties.id = {
  type: "string",
  title: "Petition Identifier",
  description: "Auto-generated identifier used to track this petition across Courts.",
  readOnly: true
}

schemaProperties.sponsor_contact = {
  type: "object",
  title: "Patron Point of Contact",
  description: "Primary contact information for the petition patron.",
  properties: {
    name: {
      type: "string",
      title: "Contact Name"
    },
    organization: {
      type: "string",
      title: "Organization"
    },
    email: {
      type: "string",
      title: "Email",
      format: "email"
    },
    phone: {
      type: "string",
      title: "Phone"
    }
  }
}

export const projectSchema: RJSFSchema = {
  title: "Petition Information",
  description:
    "Begin your petition by populating the data fields below and saving the snapshot.",
  type: "object",
  properties: schemaProperties,
  required: ["title", "lead_agency", "description"]
}

const order: Array<SimpleProjectField | "sponsor_contact"> = [
  "id",
  "title",
  "sector",
  "lead_agency",
  "participating_agencies",
  "sponsor",
  "sponsor_contact",
  "description",
  "funding",
  "other"
]

export const projectUiSchema: UiSchema<ProjectFormData> = {
  "ui:order": order,
  id: {
    "ui:widget": "hidden"
  },
  sponsor_contact: {
    name: {
      "ui:placeholder": "Full name"
    },
    organization: {
      "ui:placeholder": "Organization"
    },
    email: {
      "ui:placeholder": "name@court.pry"
    },
    phone: {
      "ui:placeholder": "###-###-####"
    }
  }
}

for (const field of projectFieldDetails) {
  if (field.includeInForm === false) {
    continue
  }
  const uiConfig: Record<string, unknown> = {
    ...(projectUiSchema[field.key] as Record<string, unknown> | undefined)
  }
  if (field.widget) {
    uiConfig["ui:widget"] = field.widget
  }
  if (field.placeholder) {
    uiConfig["ui:placeholder"] = field.placeholder
  }
  if (field.rows) {
    uiConfig["ui:options"] = { rows: field.rows }
  }
  if (Object.keys(uiConfig).length > 0) {
    projectUiSchema[field.key] = uiConfig as UiSchema<ProjectFormData>[string]
  }
}

export function createEmptyProjectData(): ProjectFormData {
  return {
    sponsor_contact: {}
  }
}

const numericFieldArray = projectFieldDetails
  .filter((field) => field.jsonType === "number")
  .map((field) => field.key)

export const numericProjectFields = new Set<SimpleProjectField>(numericFieldArray)

export type NumericProjectField = (typeof numericFieldArray)[number]

export function isNumericProjectField(field: SimpleProjectField): field is NumericProjectField {
  return numericProjectFields.has(field)
}

export function formatProjectSummary(data: ProjectFormData): string {
  const summaryLines: string[] = []
  if (data.title) {
    summaryLines.push(`Title: ${data.title}`)
  }
  if (data.id) {
    summaryLines.push(`Identifier: ${data.id}`)
  }
  if (data.sector) {
    summaryLines.push(`Sector: ${data.sector}`)
  }
  if (data.lead_agency) {
    summaryLines.push(`Presiding Court: ${data.lead_agency}`)
  }
  if (data.participating_agencies) {
    summaryLines.push(`Allied Courts: ${data.participating_agencies}`)
  }
  if (data.sponsor) {
    summaryLines.push(`Patron: ${data.sponsor}`)
  }
  if (data.location_text) {
    summaryLines.push(`Location: ${data.location_text}`)
  }
  if (typeof data.location_lat === "number" && typeof data.location_lon === "number") {
    summaryLines.push(`Map coordinates: ${data.location_lat}, ${data.location_lon}`)
  }
  if (data.description) {
    summaryLines.push(`Summary: ${data.description}`)
  }
  return summaryLines.join("\n") || "No petition details captured yet."
}
