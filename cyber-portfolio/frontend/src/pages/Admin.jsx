import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'

export default function Admin() {
  const [skills, setSkills] = useState([])
  const [projetos, setProjetos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState(null) // { tipo: 'erro'|'sucesso', texto }
  const navigate = useNavigate()

  function avisar(tipo, texto) {
    setMensagem({ tipo, texto })
    setTimeout(() => setMensagem(null), 3500)
  }

  async function carregar() {
    setCarregando(true)
    const { data: s, error: e1 } = await supabase.from('skills').select('*').order('categoria')
    const { data: p, error: e2 } = await supabase.from('projetos').select('*').order('criado_em', { ascending: false })
    if (e1 || e2) avisar('erro', 'Não foi possível carregar os dados do Supabase.')
    setSkills(s || [])
    setProjetos(p || [])
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  async function atualizarSkill(id, campo, valor) {
    const { error } = await supabase.from('skills').update({ [campo]: valor }).eq('id', id)
    if (error) { avisar('erro', 'Falha ao salvar a alteração.'); return }
    carregar()
  }

  async function apagarSkill(id, nome) {
    if (!window.confirm(`Apagar a skill "${nome}"? Essa ação não pode ser desfeita.`)) return
    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) { avisar('erro', 'Falha ao apagar a skill.'); return }
    avisar('sucesso', 'Skill apagada.')
    carregar()
  }

  async function adicionarSkill() {
    const { error } = await supabase.from('skills').insert({ nome: 'Nova skill', categoria: 'Geral', status: 'aprendendo', nivel: 1 })
    if (error) { avisar('erro', 'Falha ao adicionar skill.'); return }
    carregar()
  }

  async function atualizarProjeto(id, campo, valor) {
    const { error } = await supabase.from('projetos').update({ [campo]: valor }).eq('id', id)
    if (error) { avisar('erro', 'Falha ao salvar a alteração.'); return }
    carregar()
  }

  async function apagarProjeto(id, titulo) {
    if (!window.confirm(`Apagar o projeto "${titulo}"? Essa ação não pode ser desfeita.`)) return
    const { error } = await supabase.from('projetos').delete().eq('id', id)
    if (error) { avisar('erro', 'Falha ao apagar o projeto.'); return }
    avisar('sucesso', 'Projeto apagado.')
    carregar()
  }

  async function adicionarProjeto() {
    const { error } = await supabase.from('projetos').insert({ titulo: 'Novo projeto', descricao: '' })
    if (error) { avisar('erro', 'Falha ao adicionar projeto.'); return }
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

      {mensagem && <div className={`admin-toast admin-toast-${mensagem.tipo}`}>{mensagem.texto}</div>}

      {carregando ? (
        <p className="state-msg">Carregando dados...</p>
      ) : (
        <>
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
                <button onClick={() => apagarSkill(s.id, s.nome)} className="admin-delete">Apagar</button>
              </div>
            ))}
            {skills.length === 0 && <p className="state-msg">Nenhuma skill cadastrada ainda.</p>}
          </section>

          <section>
            <div className="admin-section-head">
              <h2>Projetos</h2>
              <button onClick={adicionarProjeto}>+ Adicionar</button>
            </div>
            {projetos.map((p) => (
              <div className="admin-row" key={p.id}>
                <input value={p.titulo} onChange={(e) => atualizarProjeto(p.id, 'titulo', e.target.value)} />
                <input value={p.descricao || ''} placeholder="descrição" onChange={(e) => atualizarProjeto(p.id, 'descricao', e.target.value)} />
                <input value={p.link || ''} placeholder="link" onChange={(e) => atualizarProjeto(p.id, 'link', e.target.value)} />
                <button onClick={() => apagarProjeto(p.id, p.titulo)} className="admin-delete">Apagar</button>
              </div>
            ))}
            {projetos.length === 0 && <p className="state-msg">Nenhum projeto cadastrado ainda.</p>}
          </section>
        </>
      )}
    </div>
  )
}
