import os
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "*")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Cyber Portfolio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN] if FRONTEND_ORIGIN != "*" else ["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

MAX_AVALIACOES_POR_HORA = 3


class AvaliacaoInput(BaseModel):
    nome: str = Field(min_length=1, max_length=60)
    nota: int = Field(ge=1, le=5)
    comentario: str | None = Field(default=None, max_length=400)


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


@app.get("/api/avaliacoes")
def get_avaliacoes():
    # nunca expõe a coluna de IP publicamente
    res = supabase.table("avaliacoes").select("id,nome,nota,comentario,criado_em").order("criado_em", desc=True).execute()
    return res.data


@app.post("/api/avaliacoes")
def criar_avaliacao(dados: AvaliacaoInput, request: Request):
    ip = request.client.host if request.client else "desconhecido"
    uma_hora_atras = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()

    recentes = (
        supabase.table("avaliacoes")
        .select("id")
        .eq("ip", ip)
        .gte("criado_em", uma_hora_atras)
        .execute()
    )

    if len(recentes.data) >= MAX_AVALIACOES_POR_HORA:
        raise HTTPException(
            status_code=429,
            detail="Limite de 3 avaliações por hora atingido. Tente novamente mais tarde.",
        )

    res = (
        supabase.table("avaliacoes")
        .insert({"nome": dados.nome, "nota": dados.nota, "comentario": dados.comentario, "ip": ip})
        .execute()
    )
    return res.data[0] if res.data else {"ok": True}
