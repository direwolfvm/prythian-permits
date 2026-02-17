-- ============================================================
-- 003_map_layers.sql
-- Map layer reference table for Prythian cartography overlays.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.map_layer (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  image_path text NOT NULL,
  width integer,
  height integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.map_layer ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on map_layer" ON public.map_layer FOR SELECT USING (true);
GRANT SELECT ON public.map_layer TO anon, authenticated, service_role;

INSERT INTO public.map_layer (name, image_path, width, height) VALUES
  ('Prythian Mainland', '/sample-maps/prythian-mainland.jpg', 1200, 900),
  ('Velaris and Environs', '/sample-maps/velaris-environs.jpg', 1200, 900)
ON CONFLICT DO NOTHING;
