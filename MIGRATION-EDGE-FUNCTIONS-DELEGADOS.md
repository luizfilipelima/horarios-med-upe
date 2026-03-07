# Migração: Edge Functions criar-delegado e listar-delegados

Este documento descreve o passo a passo completo para implementar as Edge Functions no Supabase.

## Pré-requisitos

1. **Supabase CLI** instalado:
   ```bash
   npm install -g supabase
   # ou
   brew install supabase/tap/supabase
   ```

2. **Projeto Supabase** criado e em execução (hosted ou local)

3. **Schema SaaS** já aplicado (tabelas `turmas`, `perfis`, etc. do `supabase-saas-schema.sql`)

---

## Passo 1: Login no Supabase

```bash
supabase login
```

Siga as instruções para autenticar no navegador.

---

## Passo 2: Vincular o projeto

Na **raiz do projeto** (pasta do app):

```bash
cd /caminho/para/APP-HORÁRIOS-UPE
supabase link --project-ref SEU_PROJECT_REF
```

O `SEU_PROJECT_REF` está no painel do Supabase: **Project Settings > General > Reference ID**.

Se o comando `supabase link` pedir para criar um novo projeto ou escolher um existente, selecione o projeto correto.

---

## Passo 3: Verificar variáveis de ambiente

As Edge Functions usam automaticamente:

- `SUPABASE_URL` – URL do projeto
- `SUPABASE_SERVICE_ROLE_KEY` – chave de serviço (admin)

Essas variáveis **já existem** no ambiente do Supabase ao implantar. Não é necessário configurá-las manualmente.

Para ambiente **local** (se usar `supabase start`), elas são injetadas automaticamente.

---

## Passo 4: Implantar as Edge Functions

```bash
supabase functions deploy criar-delegado
supabase functions deploy listar-delegados
supabase functions deploy aprovar-solicitacao --no-verify-jwt
supabase functions deploy rejeitar-solicitacao --no-verify-jwt
supabase functions deploy listar-solicitacoes-pendentes --no-verify-jwt
```

A função `aprovar-solicitacao` aprova cadastros de delegados e vincula ao perfil/turma. As funções `rejeitar-solicitacao` e `listar-solicitacoes-pendentes` integram a caixa de entrada do painel CEO.

A saída esperada deve indicar o sucesso de cada função, por exemplo:

```
Deploying criar-delegado (project ref: xxxxx)
...
Deployed criar-delegado
```

---

## Passo 5: Configurar JWT (se necessário)

Por padrão, as Edge Functions aceitam requisições autenticadas. O frontend envia o token do usuário logado (CEO) no header `Authorization`. O Supabase repassa o JWT automaticamente quando a chamada é feita via `supabaseClient.functions.invoke()`.

Certifique-se de que o CEO está autenticado antes de abrir o modal "Gerenciar Delegados".

---

## Passo 6: (Opcional) Autorizar chamadas anônimas

Se as funções forem chamadas sem autenticação (não recomendado para produção), você precisaria desabilitar a verificação de JWT. Por padrão, as funções esperam um usuário autenticado quando o projeto tem Auth habilitado.

Para o modal de delegados, o CEO está logado, então o fluxo padrão deve funcionar.

---

## Verificação

1. No painel Supabase: **Edge Functions** → devem aparecer `criar-delegado` e `listar-delegados`.

2. No app: faça login como CEO, abra "Gerenciar Delegados" em uma turma e tente:
   - Listar delegados
   - Criar um novo delegado (e-mail + senha)

---

## URLs das funções após deploy

- `https://SEU_PROJECT_REF.supabase.co/functions/v1/criar-delegado`
- `https://SEU_PROJECT_REF.supabase.co/functions/v1/listar-delegados`

O frontend usa `supabaseClient.functions.invoke('criar-delegado', ...)`, que monta a URL automaticamente.

---

## Solução de problemas

| Problema | Solução |
|----------|---------|
| `Function not found` | Confirme que o deploy foi feito e que o nome está correto |
| `Invalid API key` | O frontend deve usar `VITE_SUPABASE_ANON_KEY` (não a service role no cliente) |
| `JWT expired` | O CEO precisa estar logado; faça login novamente |
| `Permission denied` na tabela `perfis` | As funções usam a service role; confirme que `SUPABASE_SERVICE_ROLE_KEY` está definida no Supabase |
| E-mail já cadastrado | Use "Enviar link de redefinir senha" no modal para usuários existentes |

---

## Resumo dos comandos

```bash
# 1. Login
supabase login

# 2. Vincular projeto (na pasta do app)
supabase link --project-ref SEU_PROJECT_REF

# 3. Deploy
supabase functions deploy criar-delegado
supabase functions deploy listar-delegados
```

Após isso, o modal "Gerenciar Delegados" deve funcionar corretamente.
