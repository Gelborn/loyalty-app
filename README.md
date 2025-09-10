# Loyalty App (Frontend)

Aplicativo simples em **React + Vite**, mobile-first, com tema escuro e gradientes roxos no estilo web3. O objetivo é testar o fluxo de fidelidade integrado ao Supabase.

## ✨ Funcionalidades

* **Login por e-mail (OTP)**: usuário insere o e-mail, recebe um código e acessa se já tiver pontos.
* **Dashboard**: mostra saldo atual, histórico de entradas/saídas de pontos e botão de resgate.
* **Resgate de recompensas**: lista recompensas disponíveis e permite resgatar cupons se houver saldo suficiente.

## 🔧 Configuração

1. Clonar o projeto e instalar dependências:

   ```bash
   pnpm install
   pnpm dev
   ```

   > ou use npm/yarn

2. Criar arquivo `.env.local` com as chaves do Supabase:

   ```bash
   VITE_SUPABASE_URL=https://<PROJECT>.supabase.co
   VITE_SUPABASE_ANON_KEY=<ANON_KEY>
   VITE_REDEEM_ENDPOINT=https://<PROJECT>.supabase.co/functions/v1/app/redeem
   ```

## 🚪 Fluxo de uso

* **Login**: se o e-mail não existir, erro “Email não tem pontos ainda”.
* **Dashboard**: mostra saldo, histórico de pontos e botão “Troque seus pontos”.
* **Resgate**: escolhe recompensa → chama endpoint de resgate → retorna código de desconto ou erro.

## 🛡️ Confiabilidade

* Toda lógica crítica de pontos e resgates é feita no backend (Supabase + Edge Function).
* Regras de idempotência garantem que nenhuma operação é duplicada.

## 🚀 Deploy

Deploy simples em qualquer host de React/Vite (ex: Vercel ou Netlify). Configure as mesmas variáveis de ambiente do `.env.local`.

---

**Loyalty App** → uma experiência simples, moderna e confiável para testar o programa de fidelidade.
