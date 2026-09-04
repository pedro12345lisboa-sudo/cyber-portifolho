# Cyber Portfolio

Stack: React (Vite) + FastAPI + Supabase (Postgres)

## Estrutura
```
cyber-portfolio/
├── backend/     -> API em FastAPI
└── frontend/    -> Site em React
```

## 1. Configurar o backend

```bash
cd backend
cp .env.example .env
# edite o .env e cole sua SUPABASE_URL e SUPABASE_KEY (Settings > API no Supabase)

pip install -r requirements.txt
uvicorn main:app --reload
```
API sobe em http://localhost:8000

## 2. Configurar o frontend

```bash
cd frontend
cp .env.example .env
# por padrão já aponta pro backend local, não precisa mudar nada

npm install
npm run dev
```
Site sobe em http://localhost:5173

## 3. Banco de dados

Rode o SQL das tabelas `perfil`, `skills` e `projetos` no SQL Editor do Supabase,
e depois rode o arquivo `supabase_skills_and_auth.sql` (popula as skills de
segurança e cria as políticas de escrita para usuários autenticados).

Não esqueça de habilitar RLS com policy de leitura pública em cada tabela:
```sql
alter table perfil enable row level security;
create policy "Permitir leitura publica perfil" on perfil for select using (true);

alter table skills enable row level security;
create policy "Permitir leitura publica skills" on skills for select using (true);

alter table projetos enable row level security;
create policy "Permitir leitura publica projetos" on projetos for select using (true);
```

## 4. Configurar o login do admin

1. No painel do Supabase, vá em **Authentication > Users** e crie um usuário
   (seu email + uma senha) — é esse login que você vai usar em `/login`.
2. No `.env` do frontend, preencha também `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY` (mesmos valores do backend).
3. Acesse `http://localhost:5173/login`, entre com esse usuário, e você será
   redirecionado para `/admin`, onde pode editar/apagar skills e projetos.
   Visitantes comuns não veem nem acessam essa rota sem login.


## Notas
- O avatar e a logo são fixos: trocam direto no campo `avatar_url` / `logo_url`
  da tabela `perfil` no Supabase, não há upload pelo site.
- Nunca commite o arquivo `.env` (já está ignorado no `.gitignore`).
