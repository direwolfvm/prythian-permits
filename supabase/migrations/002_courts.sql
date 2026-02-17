-- ============================================================
-- 002_courts.sql
-- Court reference table for the seven Courts of Prythian.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.court (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  emblem_icon text,
  theme_key text NOT NULL,
  capital_name text,
  steward_title text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.court ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on court" ON public.court FOR SELECT USING (true);

GRANT SELECT ON public.court TO anon, authenticated, service_role;

INSERT INTO public.court (name, slug, description, emblem_icon, theme_key, capital_name, steward_title) VALUES
  ('Night Court', 'night', 'The Court of Dreams, ruled from Velaris, the City of Starlight.', 'moon', 'night', 'Velaris', 'High Lord Rhysand'),
  ('Spring Court', 'spring', 'The Court of renewal and growth, bordered by the Wall.', 'flower', 'spring', 'Rosehall', 'High Lord Tamlin'),
  ('Summer Court', 'summer', 'The Court of ocean and sun, centered on the coastal city of Adriata.', 'sun', 'summer', 'Adriata', 'High Lord Tarquin'),
  ('Autumn Court', 'autumn', 'The Court of harvest and flame, deep within the Forest House.', 'leaf', 'autumn', 'The Forest House', 'High Lord Beron'),
  ('Winter Court', 'winter', 'The Court of ice and stillness, in the frozen northern reaches.', 'snowflake', 'winter', 'The Palace of Ice', 'High Lord Kallias'),
  ('Day Court', 'day', 'The Court of knowledge and light, home to the Great Library.', 'eye', 'day', 'The Library', 'High Lord Helion'),
  ('Dawn Court', 'dawn', 'The Court of new beginnings and healing, in the eastern mountains.', 'sunrise', 'dawn', 'The Palace of Prayer', 'High Lord Thesan')
ON CONFLICT (slug) DO NOTHING;
