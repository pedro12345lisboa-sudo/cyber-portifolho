import { useEffect, useState } from 'react'
import SiteNav from '../components/SiteNav.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Historia() {
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/perfil`)
      .then((r) => r.json())
      .then(setPerfil)
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  return (
    <>
      <SiteNav />
      <div className="wrap page-content fade-in">
        <h1 className="page-title">Minha História</h1>

        {carregando && <p className="state-msg">Carregando...</p>}

        {!carregando && (
          <div className="historia-text">
            {perfil?.historia
              ? perfil.historia.split('\n').filter(Boolean).map((par, i) => <p key={i}>{par}</p>)
              : <p className="state-msg">Ainda não escrevi minha história aqui. Volte em breve.</p>}
          </div>
        )}
      </div>
    </>
  )
}
