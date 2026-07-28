# Guia de Deploy — Organiza IA

Este guia cobre o deploy do backend (Spring Boot + MySQL) no **Railway** e do frontend (Next.js) na **Vercel** — ambos com camada gratuita e sem necessidade de cartão de crédito para o uso descrito aqui (verifique os termos atuais no momento do cadastro, já que planos de provedores mudam com o tempo).

Tudo que dependia só de código já foi preparado no projeto:
- `Dockerfile` na raiz do backend (build multi-stage, testado localmente).
- `application.properties` lendo porta e credenciais do banco via variáveis de ambiente (com fallback pro `localhost` de sempre).
- CORS do backend configurável via `APP_CORS_ALLOWED_ORIGINS`.
- Frontend usando `API_BASE_URL` (em `frontend-voice/src/lib/api.ts`) em vez de `localhost:8080` fixo.

O que falta é o que só você pode fazer: criar as contas e conectar os serviços.

---

## Parte 1 — Backend + banco no Railway

1. Acesse [railway.app](https://railway.app) e crie uma conta (dá pra usar login do GitHub).
2. **New Project → Deploy from GitHub repo** → selecione o repositório `dio-voice-assistant` (ou o nome que você deu ao repositório no seu GitHub).
   - Se o Railway perguntar qual pasta usar (monorepo), aponte pra `05-spring-ai` (onde está o `Dockerfile`).
3. O Railway vai detectar o `Dockerfile` automaticamente e buildar a imagem.
4. **Adicionar o banco**: dentro do mesmo projeto, clique em **New → Database → Add MySQL**. O Railway cria um serviço MySQL e gera as credenciais automaticamente.
5. **Configurar variáveis de ambiente** no serviço do backend (aba *Variables*):

   | Variável | Valor |
   |---|---|
   | `OPENAI_API_KEY` | sua chave da OpenAI |
   | `SPRING_DATASOURCE_URL` | `jdbc:mysql://${{MySQL.MYSQL_URL}}?useUnicode=true&characterEncoding=UTF-8` (o Railway permite referenciar variáveis de outro serviço do mesmo projeto — ajuste conforme o formato exato que o Railway mostrar na aba do serviço MySQL) |
   | `SPRING_DATASOURCE_USERNAME` | usuário gerado pelo MySQL do Railway |
   | `SPRING_DATASOURCE_PASSWORD` | senha gerada pelo MySQL do Railway |
   | `API_SECURITY_TOKEN_SECRET` | **gere uma chave nova e forte** (ex: `openssl rand -base64 48`) — nunca use o valor padrão do código em produção |
   | `APP_CORS_ALLOWED_ORIGINS` | a URL do seu frontend na Vercel (ex: `https://organiza-ia.vercel.app`) — preencha depois de fazer o deploy do frontend na Parte 2 |

   O Railway já injeta `PORT` automaticamente — não precisa configurar isso.
6. Faça o deploy (o Railway costuma fazer isso automaticamente a cada push). Depois de subir, copie a URL pública gerada (algo como `https://seu-projeto.up.railway.app`) — você vai precisar dela na Parte 2.
7. **Teste**: acesse `https://sua-url-do-railway/actuator/health` — se responder (mesmo que seja 403, já que a rota exige autenticação), o backend está no ar.

---

## Parte 2 — Frontend na Vercel

1. Acesse [vercel.com](https://vercel.com) e crie uma conta (login com GitHub facilita).
2. **Add New → Project** → selecione o mesmo repositório do GitHub.
3. Em **Root Directory**, aponte para `05-spring-ai/frontend-voice` (é um monorepo — a Vercel precisa saber que o projeto Next.js não está na raiz).
4. Em **Environment Variables**, adicione:

   | Variável | Valor |
   |---|---|
   | `API_BASE_URL` | a URL do backend que você copiou do Railway na Parte 1 (ex: `https://seu-projeto.up.railway.app`) |

5. Clique em **Deploy**. A Vercel builda e publica automaticamente.
6. Copie a URL final (ex: `https://organiza-ia.vercel.app`) e volte no Railway pra preencher `APP_CORS_ALLOWED_ORIGINS` com essa URL (Parte 1, passo 5) — redeploy o backend depois de mudar essa variável.

---

## Checklist final

- [ ] Backend responde em `https://.../actuator/health` (Railway).
- [ ] Frontend abre em `https://....vercel.app` e mostra a splash screen.
- [ ] Consegue se cadastrar e logar (testa o fluxo completo: cadastro → login → gravação → dashboard).
- [ ] `API_SECURITY_TOKEN_SECRET` foi trocado pro valor gerado (não é o padrão do código).
- [ ] `APP_CORS_ALLOWED_ORIGINS` aponta pra URL real da Vercel (não ficou em `*` por padrão).

## Observações importantes

- **MySQL do Railway em plano gratuito costuma ter um limite de uso/tempo ativo** — se o projeto ficar muito tempo sem tráfego, o banco (ou o serviço) pode hibernar/reiniciar. Isso é normal em camadas gratuitas e não indica bug na aplicação.
- **Custos**: confirme o plano atual do Railway/Vercel no momento do cadastro — políticas de camada gratuita mudam com frequência nesses provedores.
- Se preferir usar AWS/Azure/GCP no lugar do Railway, a mesma imagem Docker (`Dockerfile` na raiz) funciona em qualquer serviço que rode containers (ECS, App Service, Cloud Run) — só muda a forma de configurar as variáveis de ambiente listadas acima.
