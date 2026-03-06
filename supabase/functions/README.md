# Edge Functions — Gradly

Para o modal "Gerenciar Delegados" funcionar, é necessário implantar as Edge Functions no Supabase.

**→ Migração completa:** veja `MIGRATION-EDGE-FUNCTIONS-DELEGADOS.md` na raiz do projeto.

## Resumo rápido

```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase functions deploy criar-delegado
supabase functions deploy listar-delegados
```

## Funções

- **criar-delegado**: Cria usuário no Auth com email e senha padrão, e adiciona ao perfil como delegado da turma.
- **listar-delegados**: Lista delegados de uma turma com seus e-mails.

As funções usam `SUPABASE_SERVICE_ROLE_KEY` (já disponível no ambiente do Supabase ao implantar).
