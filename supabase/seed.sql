-- ============================================================
-- seed.sql
-- Sample Prythian data for the demo environment.
--
-- Courts are already seeded via 002_courts.sql migration.
-- This file populates process models, legal structures,
-- decision elements, and sample project petitions.
-- ============================================================

-- ---------------------------------------------------------
-- Process model: Weave Review Pre-Screening
-- ---------------------------------------------------------
INSERT INTO public.process_model (title, description, notes, screening_description, agency) VALUES
  (
    'Weave Review Pre-Screening',
    'Standard pre-screening rite for evaluating petitions that may affect the magical weave.',
    'Applies to all seven Courts under the Prythian Accord on Ley Line Preservation.',
    'A petition triggers Weave Review if it intersects ley line corridors, ward structures, or Cauldron resonance zones.',
    'High Council of Prythian'
  );

-- ---------------------------------------------------------
-- Legal structure: Prythian Accord on Ley Line Preservation
-- ---------------------------------------------------------
INSERT INTO public.legal_structure (title, citation, description, context, issuing_authority) VALUES
  (
    'Prythian Accord on Ley Line Preservation',
    'Accord III-247',
    'Inter-Court agreement governing the protection and responsible use of ley line networks across all seven Courts.',
    'Enacted following the disruption of the northern ley nexus during the War Against Hybern. The Accord requires any construction or arcane undertaking within 500 spans of a mapped ley line to undergo Weave Review pre-screening.',
    'High Lords Council'
  );

-- ---------------------------------------------------------
-- Decision elements (ruling criteria for Weave Review)
-- The process_model column references the Weave Review (id = 1).
-- ---------------------------------------------------------
INSERT INTO public.decision_element (process_model, title, description, category, form_text, form_response_desc, evaluation_method) VALUES
  (1, 'Ley Line Proximity',
   'Evaluate whether the petition footprint intersects or is adjacent to known ley line corridors.',
   'arcane',
   'Is the proposed site within 500 spans of a mapped ley line?',
   'Yes / No / Unknown',
   'Spatial intersection against the Ley Line Registry maintained by the Day Court.'),

  (1, 'Ward Integrity',
   'Assess potential impact on existing ward structures and glamour networks.',
   'arcane',
   'Could the proposed activity weaken, displace, or interfere with existing ward boundaries?',
   'Yes / No / Uncertain',
   'Overlay analysis with the Ward Atlas; threshold is any overlap with a Tier-1 ward.'),

  (1, 'Habitat Displacement',
   'Review potential displacement of magical creatures including Suriel, bogge, and naga.',
   'ecological',
   'Does the site overlap with known habitats of protected magical creatures?',
   'Yes / No / Under survey',
   'Cross-reference with the Bestiary Census (updated annually by the Dawn Court).'),

  (1, 'Airspace Conflict',
   'Check for conflicts with Illyrian training routes and winnowing corridors.',
   'transport',
   'Will the structure or activity intrude upon registered flight paths or winnowing lanes?',
   'Yes / No',
   'Vertical clearance check against Illyrian Command airspace registry.'),

  (1, 'Cauldron Resonance',
   'Measure proximity to Cauldron resonance zones and assess disturbance risk.',
   'arcane',
   'Is the site within a Cauldron resonance buffer zone?',
   'Yes / No / Pending measurement',
   'Resonance sensor reading at site boundary; threshold is > 0.3 thaums.'),

  (1, 'Cultural Heritage',
   'Evaluate impact on sites of historical or cultural significance to the Courts.',
   'heritage',
   'Does the project area contain or adjoin a registered heritage site?',
   'Yes / No',
   'Lookup in the Pan-Court Heritage Register.'),

  (1, 'Water Table Impact',
   'Assess effects on underground waterways and the Sidra river system.',
   'ecological',
   'Could excavation or construction affect the water table or Sidra tributaries?',
   'Yes / No / Requires hydrological study',
   'Depth-to-water analysis using Night Court hydrological survey data.'),

  (1, 'Community Consultation',
   'Verify that adjacent Court communities have been notified and consulted.',
   'procedural',
   'Have neighboring communities within a two-league radius been formally notified?',
   'Yes / No / In progress',
   'Verification of published notice in the Court Gazette and receipt of acknowledgment.'),

  (1, 'Seasonal Sensitivity',
   'Determine whether construction timing conflicts with seasonal Court ceremonies.',
   'procedural',
   'Does the proposed schedule overlap with Starfall, Calanmai, or other seasonal rites?',
   'Yes / No',
   'Calendar cross-check with the Pan-Court Ceremonial Schedule.'),

  (1, 'Wall Proximity',
   'Evaluate distance from the Wall and potential effects on boundary magic.',
   'arcane',
   'Is the proposed site within one league of the Wall or its former footprint?',
   'Yes / No',
   'Distance calculation from the Wall survey baseline; threshold is < 1 league.');

-- ---------------------------------------------------------
-- Sample petitions (projects) across the seven Courts
-- ---------------------------------------------------------
INSERT INTO public.project (title, description, lead_agency, current_status, location_text) VALUES
  (
    'Velaris Bridge Expansion',
    'Proposal to widen the Rainbow Bridge spanning the Sidra to accommodate increased foot traffic from the artist quarter.',
    'Night Court',
    'In Review',
    'Rainbow district, spanning the Sidra River, Velaris'
  ),
  (
    'Rosehall Garden Terraces',
    'Construction of terraced gardens along the southern approach to Rosehall manor for public enjoyment.',
    'Spring Court',
    'Draft',
    'Southern approach road, Rosehall, Spring Court'
  ),
  (
    'Adriata Harbor Deepening',
    'Dredging and expansion of the main harbor channel to accommodate larger trading vessels.',
    'Summer Court',
    'In Review',
    'Main harbor channel, Adriata, Summer Court'
  ),
  (
    'Forest House Fire Tower',
    'Erection of a fire observation tower at the northern edge of the Forest House estate.',
    'Autumn Court',
    'Submitted',
    'Northern perimeter, Forest House estate, Autumn Court'
  ),
  (
    'Ice Palace Solar Array',
    'Installation of enchanted solar collectors on the south-facing walls of the Palace of Ice.',
    'Winter Court',
    'Draft',
    'South wall, Palace of Ice, Winter Court'
  ),
  (
    'Library Wing Addition',
    'Addition of a new wing to the Great Library for housing recently recovered texts from Under the Mountain.',
    'Day Court',
    'Approved',
    'East wing, The Great Library, Day Court'
  ),
  (
    'Dawn Healing Springs Access Road',
    'Construction of an all-weather road to the natural healing springs east of the Palace of Prayer.',
    'Dawn Court',
    'In Review',
    'Eastern foothills, near the Palace of Prayer, Dawn Court'
  );
