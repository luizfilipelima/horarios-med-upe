-- ============================================================
-- CORREÇÃO URGENTE: Delegados pendentes vinculados à turma errada
-- Execute no SQL Editor do Supabase
-- ============================================================
-- Novos delegados devem ter turma_id = NULL até serem aprovados.
-- Ao aprovar, o CEO cria a turma do slug definido pelo delegado e vincula.
-- Este script corrige perfis pendentes que foram vinculados a outra turma.
-- ============================================================

-- 1. Limpar turma_id de delegados pendentes (serão vinculados à turma correta na aprovação)
UPDATE perfis
SET turma_id = NULL
WHERE role = 'delegado'
  AND status = 'pendente'
  AND turma_id IS NOT NULL;
