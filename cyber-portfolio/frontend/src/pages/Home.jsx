import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Stars from '../components/Stars.jsx'
import { GithubIcon, InstagramIcon } from '../components/SocialIcons.jsx'
import SiteNav from '../components/SiteNav.jsx'

gsap.registerPlugin(ScrollTrigger)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Home() {
  const [perfil, setPerfil] = useState(null)
  const [skills, setSkills] = useState([])
  const [projetos, setProjetos] = useState([])
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [theme, setTheme] = useState('dark')

  const rootRef = useRef(null)
  const heroRef = useRef(null)
  const skillsSectionRef = useRef(null)
  const projetosSectionRef = useRef(null)

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

  // Animações GSAP: só rodam depois que o conteúdo real já está na tela
  useLayoutEffect(() => {
    if (carregando) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          reduced: '(prefers-reduced-motion: reduce)',
          normal: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const { reduced } = context.conditions

          if (reduced) {
            // Sem animação: só garante tudo visível
            gsap.set('.gsap-hero-item, .gsap-cat-group, .gsap-project-card', { opacity: 1, y: 0 })
            return
          }

          // 1. HERO — timeline de entrada
          const heroItems = heroRef.current.querySelectorAll('.gsap-hero-item')
          gsap.set(heroItems, { opacity: 0, y: 16 })
          const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
          tl.to(heroItems, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 })

          // 2. SKILLS — scroll reveal com stagger por categoria
          const catGroups = skillsSectionRef.current?.querySelectorAll('.gsap-cat-group')
          if (catGroups && catGroups.length) {
            gsap.set(catGroups, { opacity: 0, y: 20 })
            gsap.to(catGroups, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: skillsSectionRef.current,
                start: 'top 78%',
              },
            })
          }

          // 3. PROJETOS — scroll reveal com stagger nos cards
          const cards = projetosSectionRef.current?.querySelectorAll('.gsap-project-card')
          if (cards && cards.length) {
            gsap.set(cards, { opacity: 0, y: 24 })
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: projetosSectionRef.current,
                start: 'top 80%',
              },
            })
          }
        }
      )
    }, rootRef)

    return () => ctx.revert() // limpa timelines e ScrollTriggers ao desmontar
  }, [carregando, skills.length, projetos.length])

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
    <div ref={rootRef}>
      <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Alternar tema">
        <img
          src={theme === 'dark' ? '/sun-icon.png' : '/moon-icon.png'}
          alt={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          className="theme-icon-img"
        />
      </button>

      <SiteNav />

      <header className="hero" ref={heroRef}>
        <div className="wrap">
          <div className="hero-top gsap-hero-item">
            {perfil?.avatar_url && <img className="avatar" src={perfil.avatar_url} alt="Avatar" />}
            {perfil?.logo_url && <img className="logo-mark" src={perfil.logo_url} alt="Logo" />}
          </div>
          <div className="brand-row gsap-hero-item">// cybersecurity portfolio</div>
          <h1 className="gsap-hero-item">{perfil?.nome || 'Seu Nome Aqui'}</h1>
          <p className="role gsap-hero-item">Blue Team &amp; Segurança Ofensiva</p>
          <p className="bio gsap-hero-item">
            {perfil?.bio || 'Conecte seu banco de dados para carregar sua bio real aqui.'}
          </p>
          <div className="links gsap-hero-item">
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

      <section className="block" id="skills" ref={skillsSectionRef}>
        <div className="wrap">
          <div className="block-head">
            <h2>Áreas &amp; Skills</h2>
            <span className="count">{skills.length} registradas</span>
          </div>

          {erro && <p className="state-msg">Não foi possível carregar os dados. Verifique se o backend está rodando.</p>}
          {!erro && skills.length === 0 && <p className="state-msg">Nenhuma skill cadastrada ainda no Supabase.</p>}

          {categorias.map((cat) => (
            <div className="category-group gsap-cat-group" key={cat}>
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

      <section className="block" id="projetos" ref={projetosSectionRef}>
        <div className="wrap">
          <div className="block-head">
            <h2>Projetos</h2>
            <span className="count">{projetos.length}</span>
          </div>

          {!erro && projetos.length === 0 && <p className="state-msg">Nenhum projeto cadastrado ainda no Supabase.</p>}

          <div className="projects-grid">
            {projetos.map((p) => (
              <a
                className="project-card gsap-project-card"
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
    </div>
  )
}
