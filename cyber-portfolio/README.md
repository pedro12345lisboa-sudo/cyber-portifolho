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

Rode o SQL das tabelas `perfil`, `skills` e `projetos` no SQL Editor do Supabase
(script já enviado anteriormente na conversa) e preencha com seus dados reais.

## Notas
- O avatar e a logo são fixos: trocam direto no campo `avatar_url` / `logo_url`
  da tabela `perfil` no Supabase, não há upload pelo site.
- Nunca commite o arquivo `.env` (já está ignorado no `.gitignore`).
