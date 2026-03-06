-- ============================================================
-- Schema para APP Horários UPE — copie e execute no SQL Editor
-- do painel Supabase (Dashboard > SQL Editor).
-- ============================================================

-- Tabela: configuracoes (uma única linha, id = 1)
CREATE TABLE IF NOT EXISTS configuracoes (
  id integer PRIMARY KEY DEFAULT 1,
  titulo text NOT NULL DEFAULT 'Horários Medicina',
  subtitulo text NOT NULL DEFAULT '4º Año — Grupo C.1',
  link_drive text NOT NULL DEFAULT 'https://drive.google.com',
  link_plataforma text NOT NULL DEFAULT 'https://campus.upe.edu.py:86/moodle/my/courses.php',
  ativar_sabado boolean NOT NULL DEFAULT false,
  ativar_domingo boolean NOT NULL DEFAULT false,
  array_de_grupos text[] NOT NULL DEFAULT ARRAY['Grupo C.1']
);

-- Inserir linha padrão (ignora se já existir)
INSERT INTO configuracoes (id, titulo, subtitulo, link_drive, link_plataforma, ativar_sabado, ativar_domingo, array_de_grupos)
VALUES (1, 'Horários Medicina', '4º Año — Grupo C.1', 'https://drive.google.com', 'https://campus.upe.edu.py:86/moodle/my/courses.php', false, false, ARRAY['Grupo C.1'])
ON CONFLICT (id) DO NOTHING;

-- Tabela: aulas (uma linha por aula; dia_semana: lunes, martes, miercoles, jueves, viernes, sabado, domingo)
CREATE TABLE IF NOT EXISTS aulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana text NOT NULL,
  materia text NOT NULL DEFAULT '',
  horario text NOT NULL DEFAULT '',
  sala text NOT NULL DEFAULT '',
  professor text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'teoria',
  grupo_alvo text NOT NULL DEFAULT 'Todos'
);

-- Tabela: eventos
CREATE TABLE IF NOT EXISTS eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL DEFAULT '',
  materia text NOT NULL DEFAULT '',
  data timestamptz NOT NULL DEFAULT now(),
  pontuacao text NOT NULL DEFAULT '',
  descricao text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'Prova'
);

-- ============================================================
-- RLS (Row Level Security)
-- Alunos (não autenticados) podem apenas ler. Delegado (autenticado) pode ler e escrever.
-- ============================================================

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Configuracoes: SELECT para todos; INSERT/UPDATE/DELETE só autenticados
CREATE POLICY "configuracoes_select_all" ON configuracoes FOR SELECT USING (true);
CREATE POLICY "configuracoes_insert_auth" ON configuracoes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "configuracoes_update_auth" ON configuracoes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "configuracoes_delete_auth" ON configuracoes FOR DELETE USING (auth.role() = 'authenticated');

-- Aulas: SELECT para todos; INSERT/UPDATE/DELETE só autenticados
CREATE POLICY "aulas_select_all" ON aulas FOR SELECT USING (true);
CREATE POLICY "aulas_insert_auth" ON aulas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "aulas_update_auth" ON aulas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "aulas_delete_auth" ON aulas FOR DELETE USING (auth.role() = 'authenticated');

-- Eventos: SELECT para todos; INSERT/UPDATE/DELETE só autenticados
CREATE POLICY "eventos_select_all" ON eventos FOR SELECT USING (true);
CREATE POLICY "eventos_insert_auth" ON eventos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "eventos_update_auth" ON eventos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "eventos_delete_auth" ON eventos FOR DELETE USING (auth.role() = 'authenticated');
