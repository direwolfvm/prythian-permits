-- ============================================================
-- 004_project_geometries.sql
-- Stores GeoJSON geometries linked to projects and map layers.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.project_geometry (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id bigint REFERENCES public.project(id) ON DELETE CASCADE,
  geometry_geojson jsonb NOT NULL,
  bbox jsonb,
  map_layer_id uuid REFERENCES public.map_layer(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.project_geometry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on project_geometry" ON public.project_geometry FOR ALL USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_geometry TO anon, authenticated, service_role;
