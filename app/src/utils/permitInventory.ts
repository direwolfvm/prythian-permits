// Prythian Decree and Authorization Inventory
// Court decrees, consultations, and authorizations for the seven Courts of Prythian

export type IntegrationStatus = "integrated" | "modern-app" | "manual"

export interface PermitInfo {
  id: string
  name: string
  responsibleAgency: string
  responsibleOffice: string
  projectType: string
  activityTrigger: string
  description: string
  statuteRegulation: string
  integrationStatus: IntegrationStatus
}

const MODERN_APP_PERMIT_IDS = new Set([
  "suriel-habitat-consultation",
  "ley-line-construction-clearance"
])

export function getIntegrationStatus(permitId: string): IntegrationStatus {
  if (MODERN_APP_PERMIT_IDS.has(permitId)) {
    return "modern-app"
  }
  return "manual"
}

export const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string> = {
  "integrated": "Integration with Prythian Permits",
  "modern-app": "Modern Court Application",
  "manual": "No Integration / Manual Process"
}

type RawPermitInfo = Omit<PermitInfo, "integrationStatus">

const rawPermitInventory: RawPermitInfo[] = [
  {
    id: "ley-line-construction-clearance",
    name: "Ley Line Construction Clearance",
    responsibleAgency: "Night Court",
    responsibleOffice: "Court Stewards — Ley Line Division",
    projectType: "All construction near ley line conduits",
    activityTrigger: "Any construction activity that intersects, diverts, or modifies an active ley line conduit within Court territory.",
    description: "Authorization from the Presiding Court for any construction activity that intersects, diverts, or modifies an active ley line conduit. The ley line network is the primary magical infrastructure of Prythian, and disruptions can cascade across Court boundaries. Petitioners must submit geological and arcane surveys demonstrating the proposed work will not degrade conduit throughput or create hazardous magical discharge.",
    statuteRegulation: "Prythian Accord on Ley Line Preservation, Article IV; Night Court Edict 12-A"
  },
  {
    id: "ward-modification-license",
    name: "Ward Modification License",
    responsibleAgency: "All Courts",
    responsibleOffice: "Court Stewards — Ward Registry",
    projectType: "Ward alteration, extension, or removal",
    activityTrigger: "Proposed alteration, removal, or extension of existing protective wards within any Court territory.",
    description: "Permit from the Court Stewards to alter, remove, or extend existing protective wards within any Court territory. Wards are critical defensive infrastructure; unauthorized modifications may expose settlements to hostile incursion. Applications require a ward stability assessment and a plan for temporary protection during the modification period.",
    statuteRegulation: "Inter-Court Ward Preservation Treaty, Section 7; Individual Court Ward Codes"
  },
  {
    id: "suriel-habitat-consultation",
    name: "Suriel Habitat Consultation",
    responsibleAgency: "Night Court",
    responsibleOffice: "Night Court Wildlife Registry",
    projectType: "All ventures in forested or wetland areas",
    activityTrigger: "Proposed ventures that may displace Suriel populations or disrupt their feeding grounds.",
    description: "Consultation with the Night Court Wildlife Registry to ensure ventures do not displace Suriel populations or disrupt their feeding grounds. Suriels are protected truth-speakers whose habitats are concentrated in old-growth forests. The Registry maintains population surveys and will issue guidance on seasonal construction windows and buffer distances.",
    statuteRegulation: "Night Court Creature Protection Accord, Title II; Suriel Preservation Order of the Third Age"
  },
  {
    id: "ancient-ruins-preservation-review",
    name: "Ancient Ruins Preservation Review",
    responsibleAgency: "Day Court",
    responsibleOffice: "Day Court Archivists",
    projectType: "All ventures near pre-Wall sites",
    activityTrigger: "Activities that may impact sites of historical or magical significance predating the Wall.",
    description: "Review by the Day Court Archivists to assess impacts on sites of historical or magical significance predating the Wall. These sites often contain residual enchantments, sealed artifacts, or inscriptions vital to understanding Prythian history. A preliminary arcane survey and artifact recovery plan must accompany each petition.",
    statuteRegulation: "Day Court Heritage Preservation Edict; Prythian Antiquities Accord, Chapter 3"
  },
  {
    id: "river-passage-accord",
    name: "River Passage Accord",
    responsibleAgency: "Summer Court",
    responsibleOffice: "Summer Court — Harbor Authority",
    projectType: "Waterway and harbor ventures",
    activityTrigger: "Activities affecting navigable waterways, harbors, or the Sidra River tributaries.",
    description: "Summer Court authorization for activities affecting navigable waterways, harbors, or the Sidra River tributaries. The Summer Court maintains sovereignty over all major waterways in its territory and coordinates passage rights with neighboring Courts. Petitioners must demonstrate that proposed works will not impede navigation, alter tidal patterns, or contaminate aquatic habitats.",
    statuteRegulation: "Summer Court Maritime Code, Sections 14–22; Sidra River Navigation Treaty"
  },
  {
    id: "cauldron-proximity-waiver",
    name: "Cauldron Proximity Waiver",
    responsibleAgency: "Council of High Lords",
    responsibleOffice: "Joint Council Secretariat",
    projectType: "Ventures within the Cauldron's zone of influence",
    activityTrigger: "Any venture within the Cauldron's zone of influence, typically a 50-league radius.",
    description: "Special dispensation required for any venture within the Cauldron's zone of influence, issued jointly by the Council of High Lords. The Cauldron is the primordial source of all magic in Prythian, and activities in its vicinity risk unpredictable magical surges. Petitioners must provide enhanced safety protocols, magical dampening equipment specifications, and emergency evacuation plans.",
    statuteRegulation: "Council of High Lords Emergency Decree 1; Cauldron Exclusion Zone Protocol"
  },
  {
    id: "forest-boundary-dispensation",
    name: "Forest Boundary Dispensation",
    responsibleAgency: "Spring Court",
    responsibleOffice: "Spring Court — Sacred Grove Wardens",
    projectType: "Activities near enchanted forests",
    activityTrigger: "Conduct of activities within or adjacent to enchanted forest boundaries and sacred groves.",
    description: "Spring Court authorization to conduct activities within or adjacent to enchanted forest boundaries and sacred groves. The Spring Court's enchanted forests are living magical ecosystems that respond to disturbance. Petitioners must work with the Grove Wardens to identify sensitive root networks, fairy rings, and seasonal bloom cycles that constrain construction windows.",
    statuteRegulation: "Spring Court Forest Preservation Act; Sacred Grove Covenant, Articles I–VI"
  },
  {
    id: "mountain-airspace-charter",
    name: "Mountain Airspace Charter",
    responsibleAgency: "Night Court",
    responsibleOffice: "Illyrian War Camp Command",
    projectType: "Structures or activities in mountain regions",
    activityTrigger: "Structures or activities that may affect Illyrian flight corridors and training routes.",
    description: "Night Court and Illyrian authorization for structures or activities that may affect Illyrian flight corridors and training routes. The Illyrian mountains contain designated airspace for military training, messenger routes, and civilian flight paths. Any structure exceeding 200 spans in height or emitting magical interference within flight corridors requires clearance.",
    statuteRegulation: "Illyrian Airspace Sovereignty Charter; Night Court Military Operations Edict, Section 9"
  },
  {
    id: "glamour-impact-assessment",
    name: "Glamour Impact Assessment",
    responsibleAgency: "All Courts",
    responsibleOffice: "Court Stewards — Glamour Division",
    projectType: "All ventures near glamour-protected areas",
    activityTrigger: "Ventures that may disrupt or reveal existing glamour protections concealing Court territories.",
    description: "Evaluation by the Court Stewards to determine whether a venture may disrupt or reveal existing glamour protections. Glamours conceal Fae territories from mortal observation and maintain the boundaries between realms. Activities that generate significant magical discharge, light emissions, or structural vibrations within glamour zones require assessment and potential mitigation.",
    statuteRegulation: "Inter-Court Glamour Preservation Protocol; Realm Boundary Security Accord"
  },
  {
    id: "fae-migration-corridor-review",
    name: "Fae Migration Corridor Review",
    responsibleAgency: "All Courts",
    responsibleOffice: "Inter-Court Wildlife Coordination Office",
    projectType: "Infrastructure and construction ventures",
    activityTrigger: "Ventures that may obstruct seasonal migration paths of fae creatures across Court boundaries.",
    description: "Consultation with allied Courts to ensure ventures do not obstruct seasonal migration paths of fae creatures. Many magical species traverse multiple Court territories during annual cycles. The review coordinates with each affected Court to map active corridors and establish construction timing restrictions.",
    statuteRegulation: "Fae Creature Migration Treaty; Inter-Court Wildlife Accord, Chapter 8"
  },
  {
    id: "winnowing-network-interference-check",
    name: "Winnowing Network Interference Check",
    responsibleAgency: "Day Court",
    responsibleOffice: "Day Court — Winnowing Corridor Authority",
    projectType: "Large-scale construction and magical installations",
    activityTrigger: "Construction that may interfere with established winnowing corridors used for teleportation.",
    description: "Assessment by the Day Court to confirm that construction will not interfere with established winnowing corridors. The winnowing network is the primary rapid-transit system for High Fae, and disruptions can strand travelers in the void between spaces. Petitioners must submit magical resonance surveys demonstrating compatibility with nearby corridor anchors.",
    statuteRegulation: "Day Court Winnowing Infrastructure Code; Prythian Transit Authority Regulations"
  },
  {
    id: "enchanted-water-source-protection",
    name: "Enchanted Water Source Protection Decree",
    responsibleAgency: "Summer Court",
    responsibleOffice: "Summer Court — Springs and Wells Authority",
    projectType: "All ventures near enchanted water sources",
    activityTrigger: "Activities that may contaminate or divert water sources with magical properties.",
    description: "Authorization ensuring ventures do not contaminate or divert water sources with magical properties. Enchanted springs, wells, and rivers serve healing, divination, and purification functions throughout Prythian. The decree requires water quality baseline testing and ongoing monitoring during and after construction.",
    statuteRegulation: "Summer Court Water Sovereignty Edict; Enchanted Waters Preservation Order"
  },
  {
    id: "starlight-preservation-order",
    name: "Night Court Starlight Preservation Order",
    responsibleAgency: "Night Court",
    responsibleOffice: "Court Stewards — Velaris Division",
    projectType: "Ventures in Velaris and surrounding territories",
    activityTrigger: "Light pollution and magical emissions that could diminish starlight visibility.",
    description: "Decree limiting light pollution and magical emissions that could diminish starlight visibility in Velaris and surrounding territories. Starlight is both culturally sacred and a practical magical resource for the Night Court. All new structures must comply with luminance limits and may require shielding enchantments on artificial light sources.",
    statuteRegulation: "Night Court Starlight Preservation Act; Velaris Municipal Illumination Code"
  },
  {
    id: "dawn-court-sacred-site-clearance",
    name: "Dawn Court Sacred Site Clearance",
    responsibleAgency: "Dawn Court",
    responsibleOffice: "Dawn Court — Temple Stewards",
    projectType: "Ventures near temples and healing springs",
    activityTrigger: "Activities near temples, prayer sites, or healing springs in Dawn Court territory.",
    description: "Authorization from the Dawn Court for activities near temples, prayer sites, or healing springs. The Dawn Court maintains the oldest continuous sites of worship and healing in Prythian. Construction vibrations and magical interference can disrupt healing rituals and damage sacred architecture. Petitioners must coordinate schedules with temple calendars.",
    statuteRegulation: "Dawn Court Sacred Lands Protection Edict; Temple Stewardship Charter"
  },
  {
    id: "winter-court-ice-formation-permit",
    name: "Winter Court Ice Formation Permit",
    responsibleAgency: "Winter Court",
    responsibleOffice: "Winter Court — Glacial Authority",
    projectType: "Activities in frozen territories",
    activityTrigger: "Alteration of ice formations, frozen waterways, or permafrost within Winter Court territory.",
    description: "Permission from the Winter Court to alter ice formations, frozen waterways, or permafrost within Court territory. The Winter Court's ice structures are both natural features and magically maintained infrastructure. Unauthorized melting or restructuring can trigger avalanches, flood lowland areas, or destabilize the Court's defensive perimeter.",
    statuteRegulation: "Winter Court Glacial Preservation Code; Permafrost Stability Accord"
  },
  {
    id: "autumn-court-harvest-zone-authorization",
    name: "Autumn Court Harvest Zone Authorization",
    responsibleAgency: "Autumn Court",
    responsibleOffice: "Autumn Court — Agricultural Stewards",
    projectType: "Ventures affecting agricultural lands",
    activityTrigger: "Ventures that may affect agricultural lands, orchards, or harvest-critical territories.",
    description: "Dispensation from the Autumn Court for ventures that may affect agricultural lands, orchards, or harvest-critical territories. The Autumn Court's enchanted orchards and fields produce crops essential to Prythian's food supply. Construction during growing seasons or within root zones of enchanted trees requires special mitigation.",
    statuteRegulation: "Autumn Court Agricultural Sovereignty Act; Harvest Protection Edict"
  },
  {
    id: "cross-court-infrastructure-accord",
    name: "Cross-Court Infrastructure Accord",
    responsibleAgency: "Council of High Lords",
    responsibleOffice: "Inter-Court Infrastructure Commission",
    projectType: "Multi-Court boundary ventures",
    activityTrigger: "Ventures that span territorial boundaries, such as ley line extensions or trade routes.",
    description: "Joint authorization from multiple Courts for ventures that span territorial boundaries, such as ley line extensions or trade routes. Cross-boundary projects require coordination between the affected Courts' Stewards and are governed by treaty obligations. Each Court retains authority over the portion within its borders but must agree to unified construction standards.",
    statuteRegulation: "Prythian Inter-Court Commerce Treaty; Cross-Boundary Infrastructure Accord"
  },
  {
    id: "magical-creature-displacement-permit",
    name: "Magical Creature Displacement Permit",
    responsibleAgency: "All Courts",
    responsibleOffice: "Court Stewards — Wildlife Division",
    projectType: "All ventures displacing magical creatures",
    activityTrigger: "Relocation of magical creatures affected by a venture, requiring approved mitigation plans.",
    description: "Authorization to relocate magical creatures affected by a venture, with mitigation plans approved by the relevant Court. Prythian's magical fauna includes sentient and semi-sentient species with territorial bonds. Displacement requires species-specific relocation protocols, new habitat preparation, and post-move monitoring for a minimum of four seasonal cycles.",
    statuteRegulation: "Prythian Creature Welfare Accord; Court Wildlife Stewardship Standards"
  },
  {
    id: "under-the-mountain-exclusion-zone-waiver",
    name: "Under the Mountain Exclusion Zone Waiver",
    responsibleAgency: "Council of High Lords",
    responsibleOffice: "Joint Council Secretariat — Security Division",
    projectType: "Activities near former Under the Mountain territories",
    activityTrigger: "Activities near former Under the Mountain territories, requiring enhanced safety protocols.",
    description: "Special clearance for activities near former Under the Mountain territories, requiring enhanced safety protocols. The lands surrounding Amarantha's former stronghold remain magically unstable, with residual dark enchantments and structural hazards. All personnel must be equipped with protective wards, and activities require continuous magical monitoring.",
    statuteRegulation: "Council Emergency Containment Order; Under the Mountain Remediation Protocol"
  },
  {
    id: "weave-compliance-certification",
    name: "Weave Compliance Certification",
    responsibleAgency: "All Courts",
    responsibleOffice: "Court Stewards — Compliance Division",
    projectType: "All ventures proceeding to construction",
    activityTrigger: "Final certification that a venture meets all Weave Review requirements before construction begins.",
    description: "Final certification that a venture meets all Weave Review requirements and may proceed to construction phase. This certification confirms that all required consultations, impact assessments, and mitigation plans have been completed and approved. It serves as the formal authorization to begin physical construction activities.",
    statuteRegulation: "Prythian Weave Review Standards; Court Construction Authorization Code"
  }
]

export const permitInventory: PermitInfo[] = rawPermitInventory.map((permit) => ({
  ...permit,
  integrationStatus: getIntegrationStatus(permit.id)
}))

// Common keywords for fuzzy matching
function extractKeywords(text: string): string[] {
  const normalized = text.toLowerCase()
    .replace(/[–—-]/g, " ")
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  const stopWords = new Set(["the", "of", "a", "an", "and", "or", "for", "to", "in", "on", "by", "decree", "permit", "authorization", "consultation", "review", "determination", "court"])
  return normalized.split(" ").filter(word => word.length > 2 && !stopWords.has(word))
}

// Calculate keyword overlap score
function keywordOverlapScore(labelKeywords: string[], permitKeywords: string[]): number {
  let matches = 0
  for (const keyword of labelKeywords) {
    if (permitKeywords.some(pk => pk.includes(keyword) || keyword.includes(pk))) {
      matches++
    }
  }
  return matches
}

// Key pattern matchers for common decree naming variations
const PERMIT_ALIASES: Record<string, string[]> = {
  "ley-line-construction-clearance": [
    "ley line clearance",
    "ley line construction",
    "ley line permit",
    "construction clearance"
  ],
  "ward-modification-license": [
    "ward modification",
    "ward license",
    "ward alteration",
    "modify wards"
  ],
  "suriel-habitat-consultation": [
    "suriel consultation",
    "suriel habitat",
    "wildlife consultation",
    "creature habitat"
  ],
  "ancient-ruins-preservation-review": [
    "ancient ruins",
    "ruins preservation",
    "heritage review",
    "historic preservation"
  ],
  "river-passage-accord": [
    "river passage",
    "waterway permit",
    "sidra river",
    "harbor authorization"
  ],
  "cauldron-proximity-waiver": [
    "cauldron waiver",
    "cauldron proximity",
    "cauldron zone"
  ],
  "forest-boundary-dispensation": [
    "forest boundary",
    "sacred grove",
    "enchanted forest",
    "forest dispensation"
  ],
  "mountain-airspace-charter": [
    "airspace charter",
    "illyrian airspace",
    "mountain airspace",
    "flight corridor"
  ],
  "glamour-impact-assessment": [
    "glamour impact",
    "glamour assessment",
    "glamour protection"
  ],
  "starlight-preservation-order": [
    "starlight preservation",
    "light pollution",
    "velaris lighting"
  ],
  "weave-compliance-certification": [
    "weave compliance",
    "weave certification",
    "final certification",
    "construction authorization"
  ]
}

export function findPermitByLabel(label: string): PermitInfo | undefined {
  const normalized = label.toLowerCase().trim()

  // 1. Exact match
  const exact = permitInventory.find(p => p.name.toLowerCase() === normalized)
  if (exact) return exact

  // 2. Check aliases
  for (const [permitId, aliases] of Object.entries(PERMIT_ALIASES)) {
    if (aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))) {
      const permit = permitInventory.find(p => p.id === permitId)
      if (permit) return permit
    }
  }

  // 3. Substring match
  const substringMatch = permitInventory.find(
    p => normalized.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(normalized)
  )
  if (substringMatch) return substringMatch

  // 4. Keyword overlap scoring
  const labelKeywords = extractKeywords(label)
  if (labelKeywords.length === 0) return undefined

  let bestMatch: PermitInfo | undefined
  let bestScore = 0

  for (const permit of permitInventory) {
    const permitKeywords = extractKeywords(permit.name)
    const score = keywordOverlapScore(labelKeywords, permitKeywords)

    // Require at least 2 keyword matches for a valid match
    if (score > bestScore && score >= 2) {
      bestScore = score
      bestMatch = permit
    }
  }

  return bestMatch
}

export function getPermitInfoUrl(permitId: string): string {
  return "/permit-info/" + permitId
}

// Get permit by ID
export function getPermitById(id: string): PermitInfo | undefined {
  return permitInventory.find(p => p.id === id)
}

// Get all permit names for suggestions
export function getPermitNames(): string[] {
  return permitInventory.map(p => p.name)
}

// Get permit name/id pairs for CopilotKit
export function getPermitOptions(): Array<{ id: string; name: string; agency: string }> {
  return permitInventory.map(p => ({
    id: p.id,
    name: p.name,
    agency: p.responsibleAgency
  }))
}
