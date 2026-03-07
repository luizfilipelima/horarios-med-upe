-- ============================================================
-- Adiciona horario_inicio e horario_fim em aulas.
-- NECESSÁRIO: Execute no SQL Editor do Supabase antes de usar
-- o novo Gerenciador de Horários no painel do Delegado.
-- ============================================================
-- Migra dados existentes de horario (ex: "09:00 - 13:00") para horario_inicio e horario_fim.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'aulas' AND column_name = 'horario_inicio'
  ) THEN
    ALTER TABLE aulas ADD COLUMN horario_inicio text;
    ALTER TABLE aulas ADD COLUMN horario_fim text;
    -- Migrar horario existente (formato "09:00 - 13:00")
    UPDATE aulas
    SET
      horario_inicio = TRIM(SPLIT_PART(horario, '-', 1)),
      horario_fim = TRIM(SPLIT_PART(horario, '-', 2))
    WHERE horario IS NOT NULL AND horario != '' AND horario LIKE '%-%';
    -- Padrão para registros sem horário válido
    UPDATE aulas SET horario_inicio = COALESCE(horario_inicio, '08:00'), horario_fim = COALESCE(horario_fim, '10:00')
    WHERE horario_inicio IS NULL OR horario_fim IS NULL;
    ALTER TABLE aulas ALTER COLUMN horario_inicio SET DEFAULT '08:00';
    ALTER TABLE aulas ALTER COLUMN horario_fim SET DEFAULT '10:00';
  END IF;
END $$;
