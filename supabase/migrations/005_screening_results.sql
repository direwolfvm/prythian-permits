-- ============================================================
-- 005_screening_results.sql
-- Stores pre-screening results linked to projects and courts.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.screening_result (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id bigint REFERENCES public.project(id) ON DELETE CASCADE,
  court_id uuid REFERENCES public.court(id),
  screening_type text NOT NULL,
  result_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.screening_result ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on screening_result" ON public.screening_result FOR ALL USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.screening_result TO anon, authenticated, service_role;
