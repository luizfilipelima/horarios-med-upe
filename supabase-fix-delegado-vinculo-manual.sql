-- ============================================================
-- Script para vincular manualmente um delegado à turma
-- Use quando o fluxo de aprovação não vinculou corretamente.
-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor).
-- ============================================================
-- ATENÇÃO: substitua 'joao@teste.com' pelo e-mail real (ex: joao@teste, joao@teste.com)
--          e 'joaoturma' pelo slug da turma dele.
-- ============================================================

-- 1. Verificar: usuário existe em auth.users?
-- SELECT id, email FROM auth.users WHERE email = 'joao@teste.com';

-- 2. Verificar: turma existe?
-- SELECT id, nome, slug_url FROM turmas WHERE slug_url = 'joaoturma';

-- 3. Vincular delegado à turma (substitua os valores)
DO $$
DECLARE
  v_user_id uuid;
  v_turma_id uuid;
BEGIN
  -- Obter id do usuário por e-mail
  SELECT id INTO v_user_id FROM auth.users WHERE email ILIKE 'joao@teste%' LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado. Verifique o e-mail.';
  END IF;

  -- Obter id da turma por slug
  SELECT id INTO v_turma_id FROM turmas WHERE slug_url = 'joaoturma' LIMIT 1;
  IF v_turma_id IS NULL THEN
    RAISE EXCEPTION 'Turma não encontrada. Verifique o slug.';
  END IF;

  -- Atualizar perfil
  UPDATE perfis
  SET turma_id = v_turma_id, status = 'aprovado'
  WHERE id = v_user_id AND role = 'delegado';

  IF NOT FOUND THEN
    -- Se não existe perfil, criar
    INSERT INTO perfis (id, role, turma_id, status)
    VALUES (v_user_id, 'delegado', v_turma_id, 'aprovado')
    ON CONFLICT (id) DO UPDATE SET turma_id = v_turma_id, status = 'aprovado';
  END IF;

  RAISE NOTICE 'Delegado vinculado à turma com sucesso. Peça para o usuário fazer logout e login novamente.';
END $$;
