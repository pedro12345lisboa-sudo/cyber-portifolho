import { useEffect, useState } from 'react'
import Stars from '../components/Stars.jsx'
import { SunIcon, MoonIcon } from '../components/ThemeIcons.jsx'
import { GithubIcon, InstagramIcon } from '../components/SocialIcons.jsx'
import SiteNav from '../components/SiteNav.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Home() {
  const [perfil, setPerfil] = useState(null)
  const [skills, setSkills] = useState([])
  const [projetos, setProjetos] = useState([])
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/perfil`).then((r) => r.json()),
      fetch(`${API_URL}/api/skills`).then((r) => r.json()),
      fetch(`${API_URL}/api/projetos`).then((r) => r.json()),
    ])
      .then(([p, s, pr]) => {
        setPerfil(p)
        setSkills(s)
        setProjetos(pr)
      })
      .catch(() => setErro(true))
      .finally(() => setCarregando(false))
  }, [])

  const categorias = [...new Set(skills.map((s) => s.categoria || 'Outros'))]

  if (carregando) {
    return (
      <div className="skeleton-page">
        <div className="wrap">
          <div className="skeleton-block" style={{ width: '84px', height: '84px', borderRadius: '50%', marginBottom: '28px' }} />
          <div className="skeleton-block" style={{ width: '220px', height: '38px', marginBottom: '12px' }} />
          <div className="skeleton-block" style={{ width: '160px', height: '16px', marginBottom: '24px' }} />
          <div className="skeleton-block" style={{ width: '380px', maxWidth: '80%', height: '14px' }} />
        </div>
      </div>
    )
  }

  return (
    <>
      <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Alternar tema">
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>

      <SiteNav />

      <header className="hero fade-in">
        <div className="wrap">
          <div className="hero-top">
            {perfil?.avatar_url && <img className="avatar" src={perfil.avatar_url} alt="Avatar" />}
            {perfil?.logo_url && <img className="logo-mark" src={perfil.logo_url} alt="Logo" />}
          </div>
          <div className="brand-row">// cybersecurity portfolio</div>
          <h1>{perfil?.nome || 'Seu Nome Aqui'}</h1>
          <p className="role">Blue Team &amp; Segurança Ofensiva</p>
          <p className="bio">
            {perfil?.bio || 'Conecte seu banco de dados para carregar sua bio real aqui.'}
          </p>
          <div className="links">
            {perfil?.github && (
              <a className="link-btn icon-btn" href={perfil.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <GithubIcon />
              </a>
            )}
            {perfil?.linkedin && <a className="link-btn" href={perfil.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
            {perfil?.instagram && (
              <a className="link-btn icon-btn" href={perfil.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <InstagramIcon />
              </a>
            )}
          </div>
        </div>
      </header>

      <section className="block fade-in fade-in-delay-1" id="skills">
        <div className="wrap">
          <div className="block-head">
            <h2>Áreas &amp; Skills</h2>
            <span className="count">{skills.length} registradas</span>
          </div>

          {erro && <p className="state-msg">Não foi possível carregar os dados. Verifique se o backend está rodando.</p>}
          {!erro && skills.length === 0 && <p className="state-msg">Nenhuma skill cadastrada ainda no Supabase.</p>}

          {categorias.map((cat, ci) => (
            <div className="category-group fade-in" style={{ animationDelay: `${0.15 + ci * 0.06}s` }} key={cat}>
              <p className="category-title">{cat}</p>
              {skills
                .filter((s) => (s.categoria || 'Outros') === cat)
                .map((s) => (
                  <div className="skill-row" key={s.id}>
                    <div className="skill-info">
                      <p className="skill-name">{s.nome}</p>
                      {s.descricao && <p className="skill-desc">{s.descricao}</p>}
                    </div>
                    <span className={`skill-status ${s.status === 'aprendendo' ? 'aprendendo' : 'sei'}`}>
                      {s.status === 'aprendendo' ? 'aprendendo' : 'sei'}
                    </span>
                    <Stars nivel={s.nivel} />
                  </div>
                ))}
            </div>
          ))}
        </div>
      </section>

      <section className="block fade-in fade-in-delay-2" id="projetos">
        <div className="wrap">
          <div className="block-head">
            <h2>Projetos</h2>
            <span className="count">{projetos.length}</span>
          </div>

          {!erro && projetos.length === 0 && <p className="state-msg">Nenhum projeto cadastrado ainda no Supabase.</p>}

          <div className="projects-grid">
            {projetos.map((p, i) => (
              <a
                className="project-card fade-in"
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                href={p.link || '#'}
                target="_blank"
                rel="noreferrer"
                key={p.id}
              >
                <h3>{p.titulo}</h3>
                <p>{p.descricao}</p>
                {p.link && <span className="project-link">ver projeto →</span>}
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer>
        {perfil?.nome || 'Cyber Portfolio'} · construído com React + FastAPI + Supabase
      </footer>
    </>
  )
}
