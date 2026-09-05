import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function SiteNav() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: '/', label: 'Início' },
    { to: '/skills', label: 'Skills' },
    { to: '/historia', label: 'Minha História' },
    { to: '/avaliacao', label: 'Avaliação' },
  ]

  return (
    <nav className={`site-nav ${scrolled ? 'site-nav-scrolled' : ''}`}>
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
