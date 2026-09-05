import { Link, useLocation } from 'react-router-dom'

export default function SiteNav() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Início' },
    { to: '/skills', label: 'Skills' },
    { to: '/historia', label: 'Minha História' },
    { to: '/avaliacao', label: 'Avaliação' },
  ]

  return (
    <nav className="site-nav">
      <div className="wrap site-nav-inner">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={`site-nav-link ${pathname === l.to ? 'active' : ''}`}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
