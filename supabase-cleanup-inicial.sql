-- ============================================================
-- Limpeza: remove aulas, configuracoes e eventos da turma "Turma Inicial"
-- Execute no SQL Editor do Supabase para apagar os dados de exemplo
-- ============================================================

-- Remove aulas da turma inicial (cards de matérias gerais)
DELETE FROM aulas
WHERE turma_id = (SELECT id FROM turmas WHERE slug_url = 'inicial' LIMIT 1);

-- Remove configuração da turma inicial (opcional)
DELETE FROM configuracoes
WHERE turma_id = (SELECT id FROM turmas WHERE slug_url = 'inicial' LIMIT 1);

-- Remove eventos da turma inicial (opcional)
DELETE FROM eventos
WHERE turma_id = (SELECT id FROM turmas WHERE slug_url = 'inicial' LIMIT 1);

-- A turma "Turma Inicial" permanece; apenas os dados (aulas, config, eventos) foram removidos.
