import { useEffect, useState } from 'react'
import Stars from '../components/Stars.jsx'
import SiteNav from '../components/SiteNav.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Skills() {
  const [skills, setSkills] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/skills`)
      .then((r) => r.json())
      .then(setSkills)
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }, [])

  const categorias = [...new Set(skills.map((s) => s.categoria || 'Outros'))]
  const total = skills.length
  const sabidas = skills.filter((s) => s.status !== 'aprendendo').length

  return (
    <>
      <SiteNav />
      <div className="wrap page-content fade-in">
        <h1 className="page-title">Todas as Skills</h1>
        <p className="page-sub">
          {carregando ? 'Carregando...' : `${sabidas} de ${total} skills já dominadas, o resto em estudo ativo.`}
        </p>

        {erro && <p className="state-msg">Não foi possível carregar os dados.</p>}

        {categorias.map((cat) => (
          <div className="skills-detail-group" key={cat}>
            <h2 className="skills-detail-cat">{cat}</h2>
            <div className="skills-detail-grid">
              {skills
                .filter((s) => (s.categoria || 'Outros') === cat)
                .map((s) => (
                  <div className="skill-detail-card" key={s.id}>
                    <div className="skill-detail-head">
                      <p className="skill-name">{s.nome}</p>
                      <span className={`skill-status ${s.status === 'aprendendo' ? 'aprendendo' : 'sei'}`}>
                        {s.status === 'aprendendo' ? 'aprendendo' : 'sei'}
                      </span>
                    </div>
                    <Stars nivel={s.nivel} />
                    {s.descricao && <p className="skill-desc">{s.descricao}</p>}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
