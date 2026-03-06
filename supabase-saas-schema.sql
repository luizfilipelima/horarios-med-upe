-- ============================================================
-- Schema SaaS Multi-tenant — Gradly
-- Execute no SQL Editor do Supabase DEPOIS do supabase-schema.sql
-- (ou em projeto que já tenha as tabelas configuracoes, aulas, eventos)
-- ============================================================

-- Tabela: turmas
CREATE TABLE IF NOT EXISTS turmas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  faculdade text NOT NULL DEFAULT '',
  slug_url text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela: perfis (vincula auth.users a role e turma)
CREATE TABLE IF NOT EXISTS perfis (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('ceo', 'delegado')),
  turma_id uuid REFERENCES turmas(id) ON DELETE SET NULL
);

-- Permitir turma_id NULL para CEO; delegado deve ter turma_id
CREATE INDEX IF NOT EXISTS idx_perfis_turma ON perfis(turma_id);
CREATE INDEX IF NOT EXISTS idx_perfis_role ON perfis(role);

-- Turma padrão para migração (se não existir)
INSERT INTO turmas (id, nome, faculdade, slug_url)
SELECT gen_random_uuid(), 'Turma Inicial', 'UPE', 'inicial'
WHERE NOT EXISTS (SELECT 1 FROM turmas WHERE slug_url = 'inicial');

-- Sequência para id de configuracoes (permitir múltiplas linhas)
CREATE SEQUENCE IF NOT EXISTS configuracoes_id_seq;
SELECT setval('configuracoes_id_seq', (SELECT COALESCE(MAX(id), 1) + 1 FROM configuracoes));
ALTER TABLE configuracoes ALTER COLUMN id SET DEFAULT nextval('configuracoes_id_seq');

-- Adicionar turma_id nas tabelas existentes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'configuracoes' AND column_name = 'turma_id'
  ) THEN
    ALTER TABLE configuracoes ADD COLUMN turma_id uuid REFERENCES turmas(id) ON DELETE CASCADE;
    -- Atribuir turmas existentes à turma padrão
    UPDATE configuracoes SET turma_id = (SELECT id FROM turmas WHERE slug_url = 'inicial' LIMIT 1) WHERE turma_id IS NULL;
    ALTER TABLE configuracoes ALTER COLUMN turma_id SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'aulas' AND column_name = 'turma_id'
  ) THEN
    ALTER TABLE aulas ADD COLUMN turma_id uuid REFERENCES turmas(id) ON DELETE CASCADE;
    UPDATE aulas SET turma_id = (SELECT id FROM turmas WHERE slug_url = 'inicial' LIMIT 1) WHERE turma_id IS NULL;
    ALTER TABLE aulas ALTER COLUMN turma_id SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'eventos' AND column_name = 'turma_id'
  ) THEN
    ALTER TABLE eventos ADD COLUMN turma_id uuid REFERENCES turmas(id) ON DELETE CASCADE;
    UPDATE eventos SET turma_id = (SELECT id FROM turmas WHERE slug_url = 'inicial' LIMIT 1) WHERE turma_id IS NULL;
    ALTER TABLE eventos ALTER COLUMN turma_id SET NOT NULL;
  END IF;
END $$;

-- Unique: uma configuração por turma (configuracoes antiga tinha id=1; agora usa turma_id)
-- Se configuracoes ainda usa id integer, adicionamos unique em turma_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'configuracoes_turma_id_key'
  ) THEN
    ALTER TABLE configuracoes ADD CONSTRAINT configuracoes_turma_id_key UNIQUE (turma_id);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; -- ignora se já existir
END $$;

-- ============================================================
-- RLS Multi-tenant
-- ============================================================

ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- Turmas: anon pode ler (para lookup por slug)
DROP POLICY IF EXISTS "turmas_select_anon" ON turmas;
CREATE POLICY "turmas_select_anon" ON turmas FOR SELECT USING (true);

DROP POLICY IF EXISTS "turmas_select_auth" ON turmas;
CREATE POLICY "turmas_select_auth" ON turmas FOR SELECT USING (true);

-- CEO: CRUD completo em turmas
DROP POLICY IF EXISTS "turmas_ceo_all" ON turmas;
CREATE POLICY "turmas_ceo_all" ON turmas FOR ALL
  USING (
    EXISTS (SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.role = 'ceo')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.role = 'ceo')
  );

-- Perfis: usuário autenticado vê apenas o próprio perfil; CEO vê todos
DROP POLICY IF EXISTS "perfis_select_own" ON perfis;
CREATE POLICY "perfis_select_own" ON perfis FOR SELECT
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.role = 'ceo'));

DROP POLICY IF EXISTS "perfis_ceo_all" ON perfis;
CREATE POLICY "perfis_ceo_all" ON perfis FOR ALL
  USING (EXISTS (SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.role = 'ceo'))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.role = 'ceo'));

-- Remover políticas antigas de configuracoes, aulas, eventos
DROP POLICY IF EXISTS "configuracoes_select_all" ON configuracoes;
DROP POLICY IF EXISTS "configuracoes_insert_auth" ON configuracoes;
DROP POLICY IF EXISTS "configuracoes_update_auth" ON configuracoes;
DROP POLICY IF EXISTS "configuracoes_delete_auth" ON configuracoes;
DROP POLICY IF EXISTS "aulas_select_all" ON aulas;
DROP POLICY IF EXISTS "aulas_insert_auth" ON aulas;
DROP POLICY IF EXISTS "aulas_update_auth" ON aulas;
DROP POLICY IF EXISTS "aulas_delete_auth" ON aulas;
DROP POLICY IF EXISTS "eventos_select_all" ON eventos;
DROP POLICY IF EXISTS "eventos_insert_auth" ON eventos;
DROP POLICY IF EXISTS "eventos_update_auth" ON eventos;
DROP POLICY IF EXISTS "eventos_delete_auth" ON eventos;

-- Configuracoes: anon pode ler (app filtra por turma_id após lookup do slug)
CREATE POLICY "configuracoes_select_anon" ON configuracoes FOR SELECT USING (true);

-- Configuracoes: delegado CRUD apenas na sua turma
CREATE POLICY "configuracoes_delegado" ON configuracoes FOR ALL
  USING (
    turma_id = (SELECT turma_id FROM perfis WHERE id = auth.uid() AND role = 'delegado')
  )
  WITH CHECK (
    turma_id = (SELECT turma_id FROM perfis WHERE id = auth.uid() AND role = 'delegado')
  );

-- Configuracoes: CEO CRUD em tudo
CREATE POLICY "configuracoes_ceo" ON configuracoes FOR ALL
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'ceo'))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'ceo'));

-- Aulas: mesma lógica
CREATE POLICY "aulas_select_anon" ON aulas FOR SELECT USING (true);
CREATE POLICY "aulas_delegado" ON aulas FOR ALL
  USING (turma_id = (SELECT turma_id FROM perfis WHERE id = auth.uid() AND role = 'delegado'))
  WITH CHECK (turma_id = (SELECT turma_id FROM perfis WHERE id = auth.uid() AND role = 'delegado'));
CREATE POLICY "aulas_ceo" ON aulas FOR ALL
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'ceo'))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'ceo'));

-- Eventos: mesma lógica
CREATE POLICY "eventos_select_anon" ON eventos FOR SELECT USING (true);
CREATE POLICY "eventos_delegado" ON eventos FOR ALL
  USING (turma_id = (SELECT turma_id FROM perfis WHERE id = auth.uid() AND role = 'delegado'))
  WITH CHECK (turma_id = (SELECT turma_id FROM perfis WHERE id = auth.uid() AND role = 'delegado'));
CREATE POLICY "eventos_ceo" ON eventos FOR ALL
  USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'ceo'))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND role = 'ceo'));
