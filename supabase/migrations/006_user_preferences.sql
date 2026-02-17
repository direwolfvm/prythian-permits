-- ============================================================
-- 006_user_preferences.sql
-- Lightweight user preferences (theme selection, etc.).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_preference (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_key text NOT NULL UNIQUE,
  theme_key text DEFAULT 'night',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_preference ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on user_preference" ON public.user_preference FOR ALL USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preference TO anon, authenticated, service_role;
