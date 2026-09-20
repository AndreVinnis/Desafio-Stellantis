import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { MenuIcon } from 'lucide-react'
import { tokenStorage } from '../api/client'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const links = [
  { to: '/vehicles', label: 'Veículos' },
  { to: '/dealers', label: 'Concessionárias' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground',
  )

export default function Layout() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    tokenStorage.clear()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <span className="mr-4 font-semibold">Gestão de Veículos</span>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <Button variant="outline" onClick={handleLogout} className="ml-auto hidden md:inline-flex">
            Sair
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto md:hidden"
                  aria-label="Abrir menu"
                />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
              <nav className="flex flex-col gap-1 px-4">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                    {l.label}
                  </NavLink>
                ))}
                <Button variant="outline" onClick={handleLogout} className="mt-2">
                  Sair
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
