-- ════════════════════════════════════════════════════
--  SCHÉMA SQL — Mon Agenda DSCG
--  À exécuter dans Supabase > SQL Editor
-- ════════════════════════════════════════════════════

-- ─── TABLE EVENTS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titre       TEXT NOT NULL,
  categorie   TEXT NOT NULL CHECK (categorie IN ('droit','compta','msi','anglais','altern','perso','detente')),
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── TABLE TODOS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS todos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titre       TEXT NOT NULL,
  categorie   TEXT DEFAULT 'perso',
  deadline    DATE,
  completed   BOOLEAN DEFAULT false,
  type        TEXT DEFAULT 'classique' CHECK (type IN ('classique', 'kais')),
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── TABLE OBJECTIVES ────────────────────────────────
CREATE TABLE IF NOT EXISTS objectives (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text        TEXT NOT NULL,
  done        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────
-- Active le RLS (chaque user ne voit que ses données)

ALTER TABLE events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;

-- Policies events
CREATE POLICY "Users can CRUD their own events"
  ON events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies todos
CREATE POLICY "Users can CRUD their own todos"
  ON todos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies objectives
CREATE POLICY "Users can CRUD their own objectives"
  ON objectives FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── INDEX POUR LES PERFS ────────────────────────────
CREATE INDEX IF NOT EXISTS events_user_start ON events(user_id, start_time);
CREATE INDEX IF NOT EXISTS todos_user_type   ON todos(user_id, type);

-- ─── DONNÉES D'EXEMPLE (optionnel) ───────────────────
-- Remplace 'TON-USER-ID' par l'UUID de ton compte Supabase
-- (Tu le trouves dans Authentication > Users après t'être inscrite)

/*
INSERT INTO events (user_id, titre, categorie, start_time, end_time, notes) VALUES
  ('TON-USER-ID', 'Cours Droit des sociétés', 'droit',   now() + interval '1 day 9 hours', now() + interval '1 day 11 hours', 'Chapitre 4 - SAS'),
  ('TON-USER-ID', 'Révision Comptabilité',   'compta',  now() + interval '1 day 14 hours', now() + interval '1 day 16 hours', 'Plan comptable'),
  ('TON-USER-ID', 'Alternance',              'altern',  now() + interval '2 days 8 hours', now() + interval '2 days 18 hours', ''),
  ('TON-USER-ID', 'Yoga / sport',            'detente', now() + interval '3 days 18 hours', now() + interval '3 days 19 hours', '');
*/
