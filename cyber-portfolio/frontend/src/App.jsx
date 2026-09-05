import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Skills from './pages/Skills.jsx'
import Historia from './pages/Historia.jsx'
import Avaliacao from './pages/Avaliacao.jsx'
import Login from './pages/Login.jsx'
import Admin from './pages/Admin.jsx'
import ProtectedRoute from './pages/ProtectedRoute.jsx'
import useSmoothScroll from './hooks/useSmoothScroll.js'

export default function App() {
  useSmoothScroll()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/historia" element={<Historia />} />
        <Route path="/avaliacao" element={<Avaliacao />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
