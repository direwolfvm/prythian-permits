-- ============================================================
-- 001_core_schema.sql
-- Core tables for the Prythian Permits project.
-- Mirrors the NEPA-derived data model from the original schema
-- with columns adapted for the Prythian (ACOTAR) demo context.
-- ============================================================

-- ===================
-- project
-- ===================
CREATE TABLE IF NOT EXISTS public.project (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_updated timestamptz DEFAULT now(),
  title text,
  description text,
  sector text,
  lead_agency text,
  participating_agencies text,
  location_lat double precision,
  location_lon double precision,
  location_object text,
  location_text text,
  type text,
  funding text,
  start_date date,
  current_status text,
  sponsor text,
  sponsor_contact json,
  parent_project_id bigint,
  other jsonb,
  data_source_system text,
  data_source_agency text,
  data_record_version text,
  record_owner_agency text,
  retrieved_timestamp timestamptz
);

COMMENT ON TABLE public.project IS
  'A project (petition) represents an activity or decision requiring a review process within Prythian.';

ALTER TABLE public.project ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access on project"
  ON public.project FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project TO anon, authenticated, service_role;


-- ===================
-- process_model
-- ===================
CREATE TABLE IF NOT EXISTS public.process_model (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_updated timestamptz DEFAULT now(),
  title text,
  description text,
  notes text,
  bpmn_model json,
  legal_structure_id bigint,
  legal_structure_text text,
  screening_description text,
  screening_desc_json json,
  agency text,
  parent_model bigint,
  "DMN_model" jsonb,
  other jsonb,
  data_source_system text,
  data_source_agency text,
  data_record_version text,
  record_owner_agency text,
  retrieved_timestamp timestamptz
);

COMMENT ON TABLE public.process_model IS
  'A process model is a coded representation of a review rite, including screening criteria.';

ALTER TABLE public.process_model ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access on process_model"
  ON public.process_model FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.process_model TO anon, authenticated, service_role;


-- ===================
-- process_instance
-- ===================
CREATE TABLE IF NOT EXISTS public.process_instance (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_project_id bigint REFERENCES public.project(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_updated timestamptz DEFAULT now(),
  parent_process_id bigint,
  agency_id text,
  federal_id text,
  type text,
  status text,
  stage text,
  start_date date,
  complete_date date,
  outcome text,
  comment_start date,
  comment_end date,
  lead_agency text,
  joint_lead_agency text,
  cooperating_agencies text,
  participating_agencies text,
  notes text,
  process_model bigint REFERENCES public.process_model(id),
  purpose_need text,
  description text,
  process_code text,
  other jsonb,
  data_source_system text,
  data_source_agency text,
  data_record_version text,
  record_owner_agency text,
  retrieved_timestamp timestamptz
);

COMMENT ON TABLE public.process_instance IS
  'A specific instance of a review process associated with a project (petition).';

ALTER TABLE public.process_instance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access on process_instance"
  ON public.process_instance FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.process_instance TO anon, authenticated, service_role;


-- ===================
-- case_event
-- ===================
CREATE TABLE IF NOT EXISTS public.case_event (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_updated timestamptz DEFAULT now(),
  parent_process_id bigint,
  parent_event_id bigint,
  related_document_id bigint,
  name text,
  description text,
  source text,
  type text,
  public_access boolean,
  tier bigint,
  status text,
  outcome text,
  assigned_entity text,
  datetime timestamptz,
  following_segment_name text,
  related_engagement_id bigint,
  other jsonb,
  data_source_system text,
  data_source_agency text,
  data_record_version text,
  record_owner_agency text,
  retrieved_timestamp timestamptz
);

COMMENT ON TABLE public.case_event IS
  'Milestones or steps within a review process, tracked as case events.';

ALTER TABLE public.case_event ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access on case_event"
  ON public.case_event FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_event TO anon, authenticated, service_role;


-- ===================
-- legal_structure
-- ===================
CREATE TABLE IF NOT EXISTS public.legal_structure (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_updated timestamptz DEFAULT now(),
  title text,
  citation text,
  description text,
  context text,
  issuing_authority text,
  effective_date date,
  compliance_data json,
  url text,
  other jsonb,
  data_source_system text,
  data_source_agency text,
  data_record_version text,
  record_owner_agency text,
  retrieved_timestamp timestamptz
);

COMMENT ON TABLE public.legal_structure IS
  'Legal, policy, or process data guiding the review process, including thresholds and conditions.';

ALTER TABLE public.legal_structure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access on legal_structure"
  ON public.legal_structure FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_structure TO anon, authenticated, service_role;


-- ===================
-- decision_element
-- ===================
CREATE TABLE IF NOT EXISTS public.decision_element (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_updated timestamptz DEFAULT now(),
  process_model bigint REFERENCES public.process_model(id),
  legal_structure_id bigint REFERENCES public.legal_structure(id),
  title text,
  description text,
  measure text,
  threshold double precision,
  spatial boolean,
  "intersect" boolean,
  spatial_reference json,
  form_text text,
  form_response_desc text,
  form_data json,
  evaluation_method text,
  evaluation_dmn json,
  category text,
  process_model_internal_reference_id text,
  parent_decision_element_id bigint,
  other jsonb,
  expected_evaluation_data jsonb,
  response_data jsonb,
  data_source_system text,
  data_source_agency text,
  data_record_version text,
  record_owner_agency text,
  retrieved_timestamp timestamptz
);

COMMENT ON TABLE public.decision_element IS
  'Criteria for starting a process or resolving a decision tree, including GIS screening elements.';

ALTER TABLE public.decision_element ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access on decision_element"
  ON public.decision_element FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_element TO anon, authenticated, service_role;


-- ===================
-- document
-- ===================
CREATE TABLE IF NOT EXISTS public.document (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_updated timestamptz DEFAULT now(),
  parent_process_id bigint,
  related_document_id bigint,
  title text,
  volume_title text,
  document_revision text,
  revision_no bigint,
  supplement_no bigint,
  publish_date date,
  prepared_by text,
  status text,
  public_access boolean,
  url text,
  notes text,
  document_summary jsonb,
  document_toc jsonb,
  document_type text,
  document_files jsonb,
  project_id bigint REFERENCES public.project(id) ON DELETE SET NULL,
  project_title text,
  other jsonb,
  data_source_system text,
  data_source_agency text,
  data_record_version text,
  record_owner_agency text,
  retrieved_timestamp timestamptz
);

COMMENT ON TABLE public.document IS
  'Documents associated with review processes, including reports and supporting materials.';

ALTER TABLE public.document ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access on document"
  ON public.document FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.document TO anon, authenticated, service_role;


-- ===================
-- process_decision_payload
-- ===================
CREATE TABLE IF NOT EXISTS public.process_decision_payload (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_updated timestamptz DEFAULT now(),
  process_decision_element bigint REFERENCES public.decision_element(id),
  process bigint REFERENCES public.process_instance(id),
  project bigint REFERENCES public.project(id),
  data_description text,
  evaluation_data jsonb,
  response text,
  result text,
  result_bool boolean,
  result_notes text,
  result_data jsonb,
  result_source text,
  parent_payload bigint,
  data_annotation text,
  evaluation_data_annotation jsonb,
  project_id bigint,
  project_title text,
  project_snapshot jsonb,
  other jsonb,
  data_source_system text,
  data_source_agency text,
  data_record_version text,
  record_owner_agency text,
  retrieved_timestamp timestamptz
);

COMMENT ON TABLE public.process_decision_payload IS
  'Responses and results of the evaluation criteria in the process decision elements.';

ALTER TABLE public.process_decision_payload ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access on process_decision_payload"
  ON public.process_decision_payload FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.process_decision_payload TO anon, authenticated, service_role;


-- ===================
-- comment
-- ===================
CREATE TABLE IF NOT EXISTS public.comment (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_updated timestamptz DEFAULT now(),
  parent_document_id bigint,
  commenter_entity text,
  date_submitted date,
  submission_method text,
  content_text text,
  content_json json,
  response_text text,
  response_json json,
  public_source boolean,
  public_acess boolean,
  other jsonb,
  data_source_system text,
  data_source_agency text,
  data_record_version text,
  record_owner_agency text,
  retrieved_timestamp timestamptz
);

COMMENT ON TABLE public.comment IS
  'Feedback submitted by individuals or organizations regarding a review process.';

ALTER TABLE public.comment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access on comment"
  ON public.comment FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.comment TO anon, authenticated, service_role;


-- ===================
-- engagement
-- ===================
CREATE TABLE IF NOT EXISTS public.engagement (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_updated timestamptz DEFAULT now(),
  parent_process_id bigint,
  type text,
  location text,
  related_document_id bigint,
  attendance bigint,
  participation json,
  notes text,
  start_datetime timestamptz,
  end_datetime timestamptz,
  other jsonb,
  data_source_system text,
  data_source_agency text,
  data_record_version text,
  record_owner_agency text,
  retrieved_timestamp timestamptz
);

COMMENT ON TABLE public.engagement IS
  'Opportunities for interaction in the review process, including formal consultation.';

ALTER TABLE public.engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access on engagement"
  ON public.engagement FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.engagement TO anon, authenticated, service_role;


-- ===================
-- gis_data
-- ===================
CREATE TABLE IF NOT EXISTS public.gis_data (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_updated timestamptz DEFAULT now(),
  parent_project_id bigint REFERENCES public.project(id) ON DELETE SET NULL,
  parent_process_id bigint,
  parent_document_id bigint,
  parent_case_event_id bigint,
  parent_comment_id bigint,
  parent_engagement_id bigint,
  description text,
  extent text,
  centroid_lat double precision,
  centroid_lon double precision,
  creator text,
  creator_contact jsonb,
  notes text,
  container_inventory jsonb,
  map_image jsonb,
  data_container jsonb,
  address text,
  updated_last timestamptz,
  other jsonb,
  data_source_system text,
  data_source_agency text,
  data_record_version text,
  record_owner_agency text,
  retrieved_timestamp timestamptz
);

COMMENT ON TABLE public.gis_data IS
  'Container for location-based information, ranging from simple points to complex polygons.';

ALTER TABLE public.gis_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access on gis_data"
  ON public.gis_data FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gis_data TO anon, authenticated, service_role;


-- ===================
-- gis_data_element
-- ===================
CREATE TABLE IF NOT EXISTS public.gis_data_element (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_updated timestamptz DEFAULT now(),
  parent_gis bigint REFERENCES public.gis_data(id) ON DELETE CASCADE,
  container_reference text,
  format text,
  access_method text,
  coordinate_system text,
  top_left_lat double precision,
  top_left_lon double precision,
  bot_right_lat double precision,
  bot_right_lon double precision,
  purpose text,
  data_match text,
  access_info json,
  other jsonb,
  data_source_system text,
  data_source_agency text,
  data_record_version text,
  record_owner_agency text,
  retrieved_timestamp timestamptz
);

COMMENT ON TABLE public.gis_data_element IS
  'Inventory description for individual GIS data elements within a gis_data container.';

ALTER TABLE public.gis_data_element ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access on gis_data_element"
  ON public.gis_data_element FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gis_data_element TO anon, authenticated, service_role;


-- ===================
-- user_role
-- ===================
CREATE TABLE IF NOT EXISTS public.user_role (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_updated timestamptz DEFAULT now(),
  name text,
  description text,
  access_policy json,
  permission_descriptions text,
  public boolean,
  other jsonb,
  data_source_system text,
  data_source_agency text,
  data_record_version text,
  record_owner_agency text,
  retrieved_timestamp timestamptz
);

COMMENT ON TABLE public.user_role IS
  'Defines stakeholders interacting with the Prythian Permits system.';

ALTER TABLE public.user_role ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access on user_role"
  ON public.user_role FOR ALL
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_role TO anon, authenticated, service_role;
