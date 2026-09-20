import { NavLink, Outlet, useNavigate } from 'react-router'
import { tokenStorage } from '../api/client'

export default function Layout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    tokenStorage.clear()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16 }}>
        <NavLink to="/vehicles">Veículos</NavLink>
        <NavLink to="/dealers">Concessionárias</NavLink>
        <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>
          Sair
        </button>
      </header>
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </>
  )
}
