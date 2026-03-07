-- ============================================================
-- Onboarding de Delegados - Schema e Trigger
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Adicionar colunas na tabela perfis
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'aprovado';
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS nome_turma text;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS slug_desejado text;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS nome_completo text;

-- Constraint: status deve ser um dos valores válidos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'perfis_status_check'
  ) THEN
    ALTER TABLE perfis ADD CONSTRAINT perfis_status_check
      CHECK (status IN ('pendente', 'aprovado', 'rejeitado'));
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2. Trigger: ao criar usuário com metadata de onboarding, inserir/atualizar perfil pendente
-- IMPORTANTE: turma_id = NULL — delegado só recebe turma ao ser aprovado (sua própria turma/slug)
-- ON CONFLICT garante que, se outro trigger criou o perfil antes, sobrescrevemos com dados corretos
CREATE OR REPLACE FUNCTION public.handle_new_user_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Apenas para signup via cadastro (tem onboarding = true no metadata)
  IF COALESCE(NEW.raw_user_meta_data->>'onboarding', '') = 'true' THEN
    INSERT INTO perfis (id, role, turma_id, status, whatsapp, nome_turma, slug_desejado, nome_completo)
    VALUES (
      NEW.id,
      'delegado',
      NULL,
      'pendente',
      NEW.raw_user_meta_data->>'whatsapp',
      NEW.raw_user_meta_data->>'nome_turma',
      NEW.raw_user_meta_data->>'slug_desejado',
      NEW.raw_user_meta_data->>'nome_completo'
    )
    ON CONFLICT (id) DO UPDATE SET
      turma_id = NULL,
      status = 'pendente',
      whatsapp = EXCLUDED.whatsapp,
      nome_turma = EXCLUDED.nome_turma,
      slug_desejado = EXCLUDED.slug_desejado,
      nome_completo = EXCLUDED.nome_completo;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_onboarding ON auth.users;
CREATE TRIGGER on_auth_user_created_onboarding
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_onboarding();
