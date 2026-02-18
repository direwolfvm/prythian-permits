-- ============================================================
-- seed.sql
-- Seed data for the Prythian Permits demo environment.
--
-- IMPORTANT:
-- - The decision_element set (IDs/structure/count/JSON shape) is part of application logic.
-- - Only titles/descriptions are themed for Prythian; all other fields match the original
--   copilotkit-forms seed rows.
-- - Safe to re-run: uses UPSERT by primary key (id) and checks by title for sample projects.
-- ============================================================

BEGIN;

-- ===== legal_structure =====
INSERT INTO public.legal_structure
  (id, created_at, title, citation, description, context, issuing_authority, effective_date,
   compliance_data, url, other, data_record_version, data_source_agency, data_source_system,
   last_updated, record_owner_agency, retrieved_timestamp)
OVERRIDING SYSTEM VALUE
VALUES
  (1, '2025-10-12 17:16:55.43967+00'::timestamptz,
   'Prythian Accord: Decree Petition Review Guidance',
   NULL,
   'Guidance for petitioners and Court stewards on how decree petitions are submitted, reviewed, and recorded across the Courts.',
   NULL,
   'High Lords Council',
   '2025-09-29'::date,
   NULL,
   NULL,
   NULL,
   'https://example.invalid/prythian-accord/decree-guidance',
   'High Lords Council',
   'prythian.gov',
   '2025-10-12 17:16:42+00'::timestamptz,
   'High Lords Council',
   '2025-10-12 17:16:47+00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
  created_at = EXCLUDED.created_at,
  title = EXCLUDED.title,
  citation = EXCLUDED.citation,
  description = EXCLUDED.description,
  context = EXCLUDED.context,
  issuing_authority = EXCLUDED.issuing_authority,
  effective_date = EXCLUDED.effective_date,
  compliance_data = EXCLUDED.compliance_data,
  url = EXCLUDED.url,
  other = EXCLUDED.other,
  data_record_version = EXCLUDED.data_record_version,
  data_source_agency = EXCLUDED.data_source_agency,
  data_source_system = EXCLUDED.data_source_system,
  last_updated = EXCLUDED.last_updated,
  record_owner_agency = EXCLUDED.record_owner_agency,
  retrieved_timestamp = EXCLUDED.retrieved_timestamp;

-- Keep identity sequences in sync with seeded IDs
SELECT setval('public.legal_structure_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.legal_structure), true);


-- ===== process_model =====
INSERT INTO public.process_model
  (id, created_at, title, description, notes, bpmn_model, legal_structure_id, legal_structure_text,
   screening_description, screening_desc_json, agency, parent_model, "DMN_model", other,
   data_record_version, data_source_agency, data_source_system, last_updated, record_owner_agency, retrieved_timestamp)
OVERRIDING SYSTEM VALUE
VALUES
  (1, '2025-10-06 17:16:54.257077+00'::timestamptz,
   'Decree Petition Pre-screening',
   'Pre-application triage capturing petition details, running scrying screenings, and organizing Court approvals and decree logic.',
   NULL,
   NULL,
   1,
   NULL,
   'Collect inputs for a pre-screening process that initiates a decree petition and starts related Court review processes.',
   NULL,
   'High Council of Prythian',
   NULL,
   NULL,
   NULL,
   '1',
   NULL,
   NULL,
   '2025-10-06 17:16:54.257077+00'::timestamptz,
   'High Lords Council',
   '2025-10-06 17:16:54.257077+00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
  created_at = EXCLUDED.created_at,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  notes = EXCLUDED.notes,
  bpmn_model = EXCLUDED.bpmn_model,
  legal_structure_id = EXCLUDED.legal_structure_id,
  legal_structure_text = EXCLUDED.legal_structure_text,
  screening_description = EXCLUDED.screening_description,
  screening_desc_json = EXCLUDED.screening_desc_json,
  agency = EXCLUDED.agency,
  parent_model = EXCLUDED.parent_model,
  "DMN_model" = EXCLUDED."DMN_model",
  other = EXCLUDED.other,
  data_record_version = EXCLUDED.data_record_version,
  data_source_agency = EXCLUDED.data_source_agency,
  data_source_system = EXCLUDED.data_source_system,
  last_updated = EXCLUDED.last_updated,
  record_owner_agency = EXCLUDED.record_owner_agency,
  retrieved_timestamp = EXCLUDED.retrieved_timestamp;

-- Keep identity sequences in sync with seeded IDs
SELECT setval('public.process_model_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.process_model), true);


-- ===== decision_element =====
-- NOTE: Only title/description are themed. All other fields intentionally mirror the original seed.
INSERT INTO public.decision_element
  (id, created_at, process_model, legal_structure_id, title, description, measure, threshold, spatial, "intersect",
   spatial_reference, form_text, form_response_desc, form_data, evaluation_method, evaluation_dmn, category,
   process_model_internal_reference_id, parent_decision_element_id, other, data_record_version,
   data_source_agency, data_source_system, expected_evaluation_data, last_updated, record_owner_agency,
   response_data, retrieved_timestamp)
OVERRIDING SYSTEM VALUE
VALUES
  (1, '2025-10-06 17:16:54.257077+00'::timestamptz, 1, 1,
   'Complete petition dossier',
   'Capture the full decree petition as a JSON object to support downstream screenings and Court review.',
   'complete', 1.0, NULL, NULL, NULL,
   'Provide complete project details',
   NULL, NULL,
   'complete information', NULL,
   'input', NULL, NULL, NULL, '1', NULL, NULL,
   '{"project":{}}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz,
   'High Lords Council',
   '{"complete":false}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
  created_at = EXCLUDED.created_at,
  process_model = EXCLUDED.process_model,
  legal_structure_id = EXCLUDED.legal_structure_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  measure = EXCLUDED.measure,
  threshold = EXCLUDED.threshold,
  spatial = EXCLUDED.spatial,
  "intersect" = EXCLUDED."intersect",
  spatial_reference = EXCLUDED.spatial_reference,
  form_text = EXCLUDED.form_text,
  form_response_desc = EXCLUDED.form_response_desc,
  form_data = EXCLUDED.form_data,
  evaluation_method = EXCLUDED.evaluation_method,
  evaluation_dmn = EXCLUDED.evaluation_dmn,
  category = EXCLUDED.category,
  process_model_internal_reference_id = EXCLUDED.process_model_internal_reference_id,
  parent_decision_element_id = EXCLUDED.parent_decision_element_id,
  other = EXCLUDED.other,
  data_record_version = EXCLUDED.data_record_version,
  data_source_agency = EXCLUDED.data_source_agency,
  data_source_system = EXCLUDED.data_source_system,
  expected_evaluation_data = EXCLUDED.expected_evaluation_data,
  last_updated = EXCLUDED.last_updated,
  record_owner_agency = EXCLUDED.record_owner_agency,
  response_data = EXCLUDED.response_data,
  retrieved_timestamp = EXCLUDED.retrieved_timestamp;

INSERT INTO public.decision_element
  (id, created_at, process_model, legal_structure_id, title, description, measure, threshold, spatial, "intersect",
   spatial_reference, form_text, form_response_desc, form_data, evaluation_method, evaluation_dmn, category,
   process_model_internal_reference_id, parent_decision_element_id, other, data_record_version,
   data_source_agency, data_source_system, expected_evaluation_data, last_updated, record_owner_agency,
   response_data, retrieved_timestamp)
OVERRIDING SYSTEM VALUE
VALUES
  (2, '2025-10-06 17:16:54.257077+00'::timestamptz, 1, 1,
   'Geospatial screening results: Scrying (Weave)',
   'Store raw and summarized scrying results relevant to the petition footprint.',
   'complete', 1.0, NULL, true, NULL,
   'Confirm or upload NEPA Assist results if auto fetch fails',
   NULL, NULL,
   'complete information', NULL,
   'screening', NULL, NULL, NULL, '1', NULL, NULL,
   '{"nepa_assist_raw":{},"nepa_assist_summary":{}}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz,
   'High Lords Council',
   '{"complete":false}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
  created_at = EXCLUDED.created_at,
  process_model = EXCLUDED.process_model,
  legal_structure_id = EXCLUDED.legal_structure_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  measure = EXCLUDED.measure,
  threshold = EXCLUDED.threshold,
  spatial = EXCLUDED.spatial,
  "intersect" = EXCLUDED."intersect",
  spatial_reference = EXCLUDED.spatial_reference,
  form_text = EXCLUDED.form_text,
  form_response_desc = EXCLUDED.form_response_desc,
  form_data = EXCLUDED.form_data,
  evaluation_method = EXCLUDED.evaluation_method,
  evaluation_dmn = EXCLUDED.evaluation_dmn,
  category = EXCLUDED.category,
  process_model_internal_reference_id = EXCLUDED.process_model_internal_reference_id,
  parent_decision_element_id = EXCLUDED.parent_decision_element_id,
  other = EXCLUDED.other,
  data_record_version = EXCLUDED.data_record_version,
  data_source_agency = EXCLUDED.data_source_agency,
  data_source_system = EXCLUDED.data_source_system,
  expected_evaluation_data = EXCLUDED.expected_evaluation_data,
  last_updated = EXCLUDED.last_updated,
  record_owner_agency = EXCLUDED.record_owner_agency,
  response_data = EXCLUDED.response_data,
  retrieved_timestamp = EXCLUDED.retrieved_timestamp;

INSERT INTO public.decision_element
  (id, created_at, process_model, legal_structure_id, title, description, measure, threshold, spatial, "intersect",
   spatial_reference, form_text, form_response_desc, form_data, evaluation_method, evaluation_dmn, category,
   process_model_internal_reference_id, parent_decision_element_id, other, data_record_version,
   data_source_agency, data_source_system, expected_evaluation_data, last_updated, record_owner_agency,
   response_data, retrieved_timestamp)
OVERRIDING SYSTEM VALUE
VALUES
  (3, '2025-10-06 17:16:54.257077+00'::timestamptz, 1, 1,
   'Geospatial screening results: Bestiary (IPaC)',
   'Store raw and summarized results for protected creatures and sensitive habitats near the petition footprint.',
   'complete', 1.0, NULL, true, NULL,
   'Confirm or upload IPaC results if auto fetch fails',
   NULL, NULL,
   'complete information', NULL,
   'screening', NULL, NULL, NULL, '1', NULL, NULL,
   '{"ipac_raw":{},"ipac_summary":{}}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz,
   'High Lords Council',
   '{"complete":false}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
  created_at = EXCLUDED.created_at,
  process_model = EXCLUDED.process_model,
  legal_structure_id = EXCLUDED.legal_structure_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  measure = EXCLUDED.measure,
  threshold = EXCLUDED.threshold,
  spatial = EXCLUDED.spatial,
  "intersect" = EXCLUDED."intersect",
  spatial_reference = EXCLUDED.spatial_reference,
  form_text = EXCLUDED.form_text,
  form_response_desc = EXCLUDED.form_response_desc,
  form_data = EXCLUDED.form_data,
  evaluation_method = EXCLUDED.evaluation_method,
  evaluation_dmn = EXCLUDED.evaluation_dmn,
  category = EXCLUDED.category,
  process_model_internal_reference_id = EXCLUDED.process_model_internal_reference_id,
  parent_decision_element_id = EXCLUDED.parent_decision_element_id,
  other = EXCLUDED.other,
  data_record_version = EXCLUDED.data_record_version,
  data_source_agency = EXCLUDED.data_source_agency,
  data_source_system = EXCLUDED.data_source_system,
  expected_evaluation_data = EXCLUDED.expected_evaluation_data,
  last_updated = EXCLUDED.last_updated,
  record_owner_agency = EXCLUDED.record_owner_agency,
  response_data = EXCLUDED.response_data,
  retrieved_timestamp = EXCLUDED.retrieved_timestamp;

INSERT INTO public.decision_element
  (id, created_at, process_model, legal_structure_id, title, description, measure, threshold, spatial, "intersect",
   spatial_reference, form_text, form_response_desc, form_data, evaluation_method, evaluation_dmn, category,
   process_model_internal_reference_id, parent_decision_element_id, other, data_record_version,
   data_source_agency, data_source_system, expected_evaluation_data, last_updated, record_owner_agency,
   response_data, retrieved_timestamp)
OVERRIDING SYSTEM VALUE
VALUES
  (4, '2025-10-06 17:16:54.257077+00'::timestamptz, 1, 1,
   'Court approvals checklist',
   'Track candidate Court decrees, permissions, and steward sign-offs as a structured checklist with optional narrative.',
   'complete', 1.0, NULL, NULL, NULL,
   'Provide permit applicability notes',
   NULL, NULL,
   'complete information', NULL,
   'checklist', NULL, NULL, NULL, '1', NULL, NULL,
   '{"notes":"","permits":[]}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz,
   'High Lords Council',
   '{"complete":false}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
  created_at = EXCLUDED.created_at,
  process_model = EXCLUDED.process_model,
  legal_structure_id = EXCLUDED.legal_structure_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  measure = EXCLUDED.measure,
  threshold = EXCLUDED.threshold,
  spatial = EXCLUDED.spatial,
  "intersect" = EXCLUDED."intersect",
  spatial_reference = EXCLUDED.spatial_reference,
  form_text = EXCLUDED.form_text,
  form_response_desc = EXCLUDED.form_response_desc,
  form_data = EXCLUDED.form_data,
  evaluation_method = EXCLUDED.evaluation_method,
  evaluation_dmn = EXCLUDED.evaluation_dmn,
  category = EXCLUDED.category,
  process_model_internal_reference_id = EXCLUDED.process_model_internal_reference_id,
  parent_decision_element_id = EXCLUDED.parent_decision_element_id,
  other = EXCLUDED.other,
  data_record_version = EXCLUDED.data_record_version,
  data_source_agency = EXCLUDED.data_source_agency,
  data_source_system = EXCLUDED.data_source_system,
  expected_evaluation_data = EXCLUDED.expected_evaluation_data,
  last_updated = EXCLUDED.last_updated,
  record_owner_agency = EXCLUDED.record_owner_agency,
  response_data = EXCLUDED.response_data,
  retrieved_timestamp = EXCLUDED.retrieved_timestamp;

INSERT INTO public.decision_element
  (id, created_at, process_model, legal_structure_id, title, description, measure, threshold, spatial, "intersect",
   spatial_reference, form_text, form_response_desc, form_data, evaluation_method, evaluation_dmn, category,
   process_model_internal_reference_id, parent_decision_element_id, other, data_record_version,
   data_source_agency, data_source_system, expected_evaluation_data, last_updated, record_owner_agency,
   response_data, retrieved_timestamp)
OVERRIDING SYSTEM VALUE
VALUES
  (5, '2025-10-06 17:16:54.257077+00'::timestamptz, 1, 1,
   'Minor decree exemption',
   'Capture candidate minor-exemption citations and rationale for petitions that qualify for streamlined handling.',
   'complete', 1.0, NULL, NULL, NULL,
   'Enter CE references and rationale',
   NULL, NULL,
   'complete information', NULL,
   'ce', NULL, NULL, NULL, '1', NULL, NULL,
   '{"rationale":"","ce_candidates":[]}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz,
   'High Lords Council',
   '{"complete":false}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
  created_at = EXCLUDED.created_at,
  process_model = EXCLUDED.process_model,
  legal_structure_id = EXCLUDED.legal_structure_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  measure = EXCLUDED.measure,
  threshold = EXCLUDED.threshold,
  spatial = EXCLUDED.spatial,
  "intersect" = EXCLUDED."intersect",
  spatial_reference = EXCLUDED.spatial_reference,
  form_text = EXCLUDED.form_text,
  form_response_desc = EXCLUDED.form_response_desc,
  form_data = EXCLUDED.form_data,
  evaluation_method = EXCLUDED.evaluation_method,
  evaluation_dmn = EXCLUDED.evaluation_dmn,
  category = EXCLUDED.category,
  process_model_internal_reference_id = EXCLUDED.process_model_internal_reference_id,
  parent_decision_element_id = EXCLUDED.parent_decision_element_id,
  other = EXCLUDED.other,
  data_record_version = EXCLUDED.data_record_version,
  data_source_agency = EXCLUDED.data_source_agency,
  data_source_system = EXCLUDED.data_source_system,
  expected_evaluation_data = EXCLUDED.expected_evaluation_data,
  last_updated = EXCLUDED.last_updated,
  record_owner_agency = EXCLUDED.record_owner_agency,
  response_data = EXCLUDED.response_data,
  retrieved_timestamp = EXCLUDED.retrieved_timestamp;

INSERT INTO public.decision_element
  (id, created_at, process_model, legal_structure_id, title, description, measure, threshold, spatial, "intersect",
   spatial_reference, form_text, form_response_desc, form_data, evaluation_method, evaluation_dmn, category,
   process_model_internal_reference_id, parent_decision_element_id, other, data_record_version,
   data_source_agency, data_source_system, expected_evaluation_data, last_updated, record_owner_agency,
   response_data, retrieved_timestamp)
OVERRIDING SYSTEM VALUE
VALUES
  (6, '2025-10-06 17:16:54.257077+00'::timestamptz, 1, 1,
   'Conditions and wards',
   'Capture mitigation, wards, or standard conditions expected to apply to the petition.',
   'complete', 1.0, NULL, NULL, NULL,
   'List applicable conditions and notes',
   NULL, NULL,
   'complete information', NULL,
   'conditions', NULL, NULL, NULL, '1', NULL, NULL,
   '{"notes":"","conditions":[]}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz,
   'High Lords Council',
   '{"complete":false}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
  created_at = EXCLUDED.created_at,
  process_model = EXCLUDED.process_model,
  legal_structure_id = EXCLUDED.legal_structure_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  measure = EXCLUDED.measure,
  threshold = EXCLUDED.threshold,
  spatial = EXCLUDED.spatial,
  "intersect" = EXCLUDED."intersect",
  spatial_reference = EXCLUDED.spatial_reference,
  form_text = EXCLUDED.form_text,
  form_response_desc = EXCLUDED.form_response_desc,
  form_data = EXCLUDED.form_data,
  evaluation_method = EXCLUDED.evaluation_method,
  evaluation_dmn = EXCLUDED.evaluation_dmn,
  category = EXCLUDED.category,
  process_model_internal_reference_id = EXCLUDED.process_model_internal_reference_id,
  parent_decision_element_id = EXCLUDED.parent_decision_element_id,
  other = EXCLUDED.other,
  data_record_version = EXCLUDED.data_record_version,
  data_source_agency = EXCLUDED.data_source_agency,
  data_source_system = EXCLUDED.data_source_system,
  expected_evaluation_data = EXCLUDED.expected_evaluation_data,
  last_updated = EXCLUDED.last_updated,
  record_owner_agency = EXCLUDED.record_owner_agency,
  response_data = EXCLUDED.response_data,
  retrieved_timestamp = EXCLUDED.retrieved_timestamp;

INSERT INTO public.decision_element
  (id, created_at, process_model, legal_structure_id, title, description, measure, threshold, spatial, "intersect",
   spatial_reference, form_text, form_response_desc, form_data, evaluation_method, evaluation_dmn, category,
   process_model_internal_reference_id, parent_decision_element_id, other, data_record_version,
   data_source_agency, data_source_system, expected_evaluation_data, last_updated, record_owner_agency,
   response_data, retrieved_timestamp)
OVERRIDING SYSTEM VALUE
VALUES
  (7, '2025-10-06 17:16:54.257077+00'::timestamptz, 1, 1,
   'Resource domain analysis',
   'Structured findings by domain (weave, water, creatures, heritage, community) with narrative.',
   'complete', 1.0, NULL, NULL, NULL,
   'Provide resource-by-resource notes',
   NULL, NULL,
   'complete information', NULL,
   'analysis', NULL, NULL, NULL, '1', NULL, NULL,
   '{"summary":"","resources":[]}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz,
   'High Lords Council',
   '{"complete":false}'::jsonb,
   '2025-10-06 17:24:01.521792+00'::timestamptz)
ON CONFLICT (id) DO UPDATE SET
  created_at = EXCLUDED.created_at,
  process_model = EXCLUDED.process_model,
  legal_structure_id = EXCLUDED.legal_structure_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  measure = EXCLUDED.measure,
  threshold = EXCLUDED.threshold,
  spatial = EXCLUDED.spatial,
  "intersect" = EXCLUDED."intersect",
  spatial_reference = EXCLUDED.spatial_reference,
  form_text = EXCLUDED.form_text,
  form_response_desc = EXCLUDED.form_response_desc,
  form_data = EXCLUDED.form_data,
  evaluation_method = EXCLUDED.evaluation_method,
  evaluation_dmn = EXCLUDED.evaluation_dmn,
  category = EXCLUDED.category,
  process_model_internal_reference_id = EXCLUDED.process_model_internal_reference_id,
  parent_decision_element_id = EXCLUDED.parent_decision_element_id,
  other = EXCLUDED.other,
  data_record_version = EXCLUDED.data_record_version,
  data_source_agency = EXCLUDED.data_source_agency,
  data_source_system = EXCLUDED.data_source_system,
  expected_evaluation_data = EXCLUDED.expected_evaluation_data,
  last_updated = EXCLUDED.last_updated,
  record_owner_agency = EXCLUDED.record_owner_agency,
  response_data = EXCLUDED.response_data,
  retrieved_timestamp = EXCLUDED.retrieved_timestamp;

-- Keep identity sequences in sync with seeded IDs
SELECT setval('public.decision_element_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.decision_element), true);

COMMIT;


-- ===== sample projects (petitions) =====
-- These are lightweight demo rows; they are not part of the decision_element structure.
INSERT INTO public.project (title, description, lead_agency, current_status, location_text)
SELECT *
FROM (
  VALUES
    ('Velaris Bridge Expansion',
     'Proposal to widen the Rainbow Bridge spanning the Sidra to accommodate increased foot traffic from the artist quarter.',
     'Night Court',
     'In Review',
     'Rainbow district, spanning the Sidra River, Velaris'),
    ('Rosehall Garden Terraces',
     'Construction of terraced gardens along the southern approach to Rosehall manor for public enjoyment.',
     'Spring Court',
     'Draft',
     'Southern approach road, Rosehall, Spring Court'),
    ('Adriata Harbor Deepening',
     'Dredging and expansion of the main harbor channel to accommodate larger trading vessels.',
     'Summer Court',
     'In Review',
     'Main harbor channel, Adriata, Summer Court'),
    ('Forest House Fire Tower',
     'Erection of a fire observation tower at the northern edge of the Forest House estate.',
     'Autumn Court',
     'Submitted',
     'Northern perimeter, Forest House estate, Autumn Court'),
    ('Ice Palace Solar Array',
     'Installation of enchanted solar collectors on the south-facing walls of the Palace of Ice.',
     'Winter Court',
     'Draft',
     'South wall, Palace of Ice, Winter Court'),
    ('Library Wing Addition',
     'Addition of a new wing to the Great Library for housing recently recovered texts from Under the Mountain.',
     'Day Court',
     'Approved',
     'East wing, The Great Library, Day Court'),
    ('Dawn Healing Springs Access Road',
     'Construction of an all-weather road to the natural healing springs east of the Palace of Prayer.',
     'Dawn Court',
     'In Review',
     'Eastern foothills, near the Palace of Prayer, Dawn Court')
) AS v(title, description, lead_agency, current_status, location_text)
WHERE NOT EXISTS (
  SELECT 1 FROM public.project p WHERE p.title = v.title
);

