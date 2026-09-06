import { useEffect, useState } from 'react'
import SiteNav from '../components/SiteNav.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Avaliacao() {
  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [nome, setNome] = useState('')
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  async function carregar() {
    setCarregando(true)
    try {
      const r = await fetch(`${API_URL}/api/avaliacoes`)
      const data = await r.json()
      setAvaliacoes(data || [])
    } catch {
      setAvaliacoes([])
    }
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    setMensagem(null)

    try {
      const r = await fetch(`${API_URL}/api/avaliacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, nota, comentario }),
      })

      if (r.status === 429) {
        const err = await r.json()
        setMensagem({ tipo: 'erro', texto: err.detail || 'Limite de avaliações atingido. Tente novamente mais tarde.' })
        setEnviando(false)
        return
      }

      if (!r.ok) {
        setMensagem({ tipo: 'erro', texto: 'Não foi possível enviar. Tente novamente.' })
        setEnviando(false)
        return
      }

      setMensagem({ tipo: 'sucesso', texto: 'Obrigado pela avaliação!' })
      setNome('')
      setNota(5)
      setComentario('')
      carregar()
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível conectar ao servidor.' })
    }
    setEnviando(false)
  }

  return (
    <>
      <SiteNav />
      <div className="wrap page-content fade-in">
        <h1 className="page-title">Avalie o Portfólio</h1>
        <p className="page-sub">Deixe sua nota e um comentário — limite de 3 avaliações por hora para evitar spam.</p>

        <form className="avaliacao-form" onSubmit={enviar}>
          <label>
            Seu nome
            <input value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={60} />
          </label>

          <label>
            Nota
            <select value={nota} onChange={(e) => setNota(Number(e.target.value))}>
              <option value={5}>5 — Excelente</option>
              <option value={4}>4 — Muito bom</option>
              <option value={3}>3 — Bom</option>
              <option value={2}>2 — Pode melhorar</option>
              <option value={1}>1 — Fraco</option>
            </select>
          </label>

          <label>
            Comentário
            <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3} maxLength={400} />
          </label>

          {mensagem && <p className={mensagem.tipo === 'erro' ? 'login-erro' : 'avaliacao-sucesso'}>{mensagem.texto}</p>}

          <button type="submit" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar avaliação'}</button>
        </form>

        <h2 className="avaliacoes-list-title">O que dizem</h2>

        {carregando && <p className="state-msg">Carregando...</p>}
        {!carregando && avaliacoes.length === 0 && <p className="state-msg">Nenhuma avaliação ainda. Seja o primeiro!</p>}

        <div className="avaliacoes-list">
          {avaliacoes.map((a) => (
            <div className="avaliacao-card" key={a.id}>
              <div className="avaliacao-head">
                <strong>{a.nome}</strong>
                <span className="avaliacao-nota">{'★'.repeat(a.nota)}{'☆'.repeat(5 - a.nota)}</span>
              </div>
              {a.comentario && <p>{a.comentario}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
