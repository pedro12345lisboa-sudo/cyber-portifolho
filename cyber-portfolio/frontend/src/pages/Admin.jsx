import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'

export default function Admin() {
  const [skills, setSkills] = useState([])
  const [projetos, setProjetos] = useState([])
  const navigate = useNavigate()

  async function carregar() {
    const { data: s } = await supabase.from('skills').select('*').order('categoria')
    const { data: p } = await supabase.from('projetos').select('*').order('criado_em', { ascending: false })
    setSkills(s || [])
    setProjetos(p || [])
  }

  useEffect(() => { carregar() }, [])

  async function atualizarSkill(id, campo, valor) {
    await supabase.from('skills').update({ [campo]: valor }).eq('id', id)
    carregar()
  }

  async function apagarSkill(id) {
    await supabase.from('skills').delete().eq('id', id)
    carregar()
  }

  async function adicionarSkill() {
    await supabase.from('skills').insert({ nome: 'Nova skill', categoria: 'Geral', status: 'aprendendo', nivel: 1 })
    carregar()
  }

  async function apagarProjeto(id) {
    await supabase.from('projetos').delete().eq('id', id)
    carregar()
  }

  async function adicionarProjeto() {
    await supabase.from('projetos').insert({ titulo: 'Novo projeto', descricao: '' })
    carregar()
  }

  async function sair() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="wrap admin-page">
      <div className="admin-head">
        <h1>Painel admin</h1>
        <button onClick={sair} className="admin-logout">Sair</button>
      </div>

      <section>
        <div className="admin-section-head">
          <h2>Skills</h2>
          <button onClick={adicionarSkill}>+ Adicionar</button>
        </div>
        {skills.map((s) => (
          <div className="admin-row" key={s.id}>
            <input value={s.nome} onChange={(e) => atualizarSkill(s.id, 'nome', e.target.value)} />
            <input value={s.categoria || ''} onChange={(e) => atualizarSkill(s.id, 'categoria', e.target.value)} placeholder="categoria" />
            <select value={s.status || 'aprendendo'} onChange={(e) => atualizarSkill(s.id, 'status', e.target.value)}>
              <option value="sei">sei</option>
              <option value="aprendendo">aprendendo</option>
            </select>
            <input type="number" min="1" max="5" value={s.nivel || 1} onChange={(e) => atualizarSkill(s.id, 'nivel', Number(e.target.value))} />
            <button onClick={() => apagarSkill(s.id)} className="admin-delete">Apagar</button>
          </div>
        ))}
      </section>

      <section>
        <div className="admin-section-head">
          <h2>Projetos</h2>
          <button onClick={adicionarProjeto}>+ Adicionar</button>
        </div>
        {projetos.map((p) => (
          <div className="admin-row" key={p.id}>
            <input
              value={p.titulo}
              onChange={async (e) => { await supabase.from('projetos').update({ titulo: e.target.value }).eq('id', p.id); carregar() }}
            />
            <input
              value={p.descricao || ''}
              placeholder="descrição"
              onChange={async (e) => { await supabase.from('projetos').update({ descricao: e.target.value }).eq('id', p.id); carregar() }}
            />
            <input
              value={p.link || ''}
              placeholder="link"
              onChange={async (e) => { await supabase.from('projetos').update({ link: e.target.value }).eq('id', p.id); carregar() }}
            />
            <button onClick={() => apagarProjeto(p.id)} className="admin-delete">Apagar</button>
          </div>
        ))}
      </section>
    </div>
  )
}
