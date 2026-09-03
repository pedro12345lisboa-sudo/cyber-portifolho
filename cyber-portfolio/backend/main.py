import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Cyber Portfolio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # em produção, troque pelo domínio do seu front
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/perfil")
def get_perfil():
    res = supabase.table("perfil").select("*").limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    return res.data[0]


@app.get("/api/skills")
def get_skills():
    res = supabase.table("skills").select("*").order("categoria").execute()
    return res.data


@app.get("/api/projetos")
def get_projetos():
    res = supabase.table("projetos").select("*").order("criado_em", desc=True).execute()
    return res.data
