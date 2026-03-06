-- Adiciona coluna ordem em aulas para garantir a mesma ordem na tela do delegado e do aluno.
-- Execute no SQL Editor do Supabase. Necessário para a ordem das matérias ser consistente.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'aulas' AND column_name = 'ordem'
  ) THEN
    ALTER TABLE aulas ADD COLUMN ordem integer NOT NULL DEFAULT 0;
    -- Backfill: define ordem sequencial por (turma_id, dia_semana)
    WITH numbered AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY turma_id, dia_semana ORDER BY id) - 1 AS rn
      FROM aulas
    )
    UPDATE aulas SET ordem = numbered.rn FROM numbered WHERE aulas.id = numbered.id;
  END IF;
END $$;
