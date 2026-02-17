/**
 * Prythian domain terminology dictionary.
 * Maps real-world permitting concepts to ACOTAR equivalents.
 * Use these labels throughout the UI for consistency.
 */

export const TERMS = {
  // Entity labels
  agency: "Court",
  agencies: "Courts",
  applicant: "Petitioner",
  applicants: "Petitioners",
  permit: "Decree",
  permits: "Decrees",
  project: "Petition",
  projects: "Petitions",
  sponsor: "Patron",
  sponsors: "Patrons",

  // Process labels
  environmentalReview: "Weave Review",
  nepa: "The Weave",
  preScreening: "Augury",
  processModel: "Rite Model",
  caseEvent: "Chronicle Entry",
  caseEvents: "Chronicle Entries",
  decisionElement: "Ruling Criterion",
  decisionElements: "Ruling Criteria",
  legalStructure: "Edict",
  legalStructures: "Edicts",

  // Role labels
  office: "Court Steward",
  offices: "Court Stewards",
  bureau: "Magistrate",
  bureaus: "Magistrates",
  leadAgency: "Presiding Court",
  participatingAgencies: "Allied Courts",

  // Workflow labels
  basicPermit: "Court Registry",
  complexReview: "Weave Review Board",
  permittingChecklist: "Decree Checklist",
  resourceCheck: "Augury Check",

  // App branding
  appName: "Prythian Permits",
  appTagline: "A Court of Permits and Reviews",
  portalName: "Petition Portal",
} as const

export type TermKey = keyof typeof TERMS

/**
 * Sector options for the petition form (replacing real-world sectors)
 */
export const SECTORS = [
  "Ley Line Infrastructure",
  "Ward Construction",
  "Cauldron Research",
  "Forest Management",
  "River & Coastal Works",
  "Mountain Passage",
  "Glamour Architecture",
  "Trade Route Development",
  "Illyrian Training Grounds",
  "Temple Restoration",
] as const

/**
 * Status labels
 */
export const STATUS_LABELS = {
  pending: "Awaiting Review",
  in_progress: "Under Deliberation",
  complete: "Decreed",
  rejected: "Denied by Court",
  data_needed: "Further Augury Required",
} as const
