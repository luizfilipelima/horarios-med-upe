# Meta Pixel e Conversions API (CAPI) — Configuração

## 1. Pixel ID

Pixel configurado: **1294973712453116**

## 2. Variáveis de ambiente

### Supabase Secrets (Conversions API)

O token de acesso e o Pixel ID ficam no servidor (nunca no frontend):

```bash
supabase secrets set META_ACCESS_TOKEN=seu_token_long_lived_aqui
supabase secrets set META_PIXEL_ID=1294973712453116
```

## 3. Deploy da Edge Function

```bash
npx supabase functions deploy meta-conversions --no-verify-jwt
```

## 4. O que foi configurado

- **Pixel**: carregado no `index.html`; dispara `PageView` na carga e `Lead` ao clicar em "Solicitar Acesso"
- **Conversions API**: envia o evento `Lead` via Edge Function quando o usuário clica em "Solicitar Acesso"

Eventos: PageView (automático), Lead (nos dois CTAs de "Solicitar Acesso").
