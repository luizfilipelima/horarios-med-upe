-- Adiciona coluna idioma_dias em configuracoes (pt = Português, es = Espanhol)
-- Execute no SQL Editor do Supabase

ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS idioma_dias text DEFAULT 'es';
