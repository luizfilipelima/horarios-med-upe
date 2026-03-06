# Edge Functions — Gradly

Para o modal "Gerenciar Delegados" funcionar, é necessário implantar as Edge Functions no Supabase.

## Implantação

```bash
# Instale o Supabase CLI (se ainda não tiver)
npm i -g supabase

# Login
supabase login

# Vincule ao projeto (na pasta raiz do app)
supabase link

# Implante as funções
supabase functions deploy criar-delegado
supabase functions deploy listar-delegados
```

## Funções

- **criar-delegado**: Cria usuário no Auth com email e senha padrão, e adiciona ao perfil como delegado da turma.
- **listar-delegados**: Lista delegados de uma turma com seus e-mails.

As funções usam `SUPABASE_SERVICE_ROLE_KEY` (já disponível no ambiente do Supabase ao implantar).
