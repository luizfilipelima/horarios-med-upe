-- Adiciona coluna ativa em turmas (para pausar/reativar turma no Painel do CEO)
-- Execute no SQL Editor do Supabase. Necessário para o modal "Editar Turma" funcionar.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'turmas' AND column_name = 'ativa'
  ) THEN
    ALTER TABLE turmas ADD COLUMN ativa boolean NOT NULL DEFAULT true;
  END IF;
END $$;
