import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/reminders', label: 'Reminders' },
  { to: '/service-logs', label: 'Service logs' },
  { to: '/fuel-logs', label: 'Fuel logs' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/reports', label: 'Reports' },
  { to: '/owners', label: 'Owners' },
  { to: '/service-types', label: 'Service types' },
]

interface NavListProps {
  onNavigate?: () => void
}

// NavLink gives us isActive, so the current page is highlighted
function NavList({ onNavigate }: NavListProps) {
  return (
    <ul className="space-y-1">
      {navLinks.map((link) => (
        <li key={link.to}>
          <NavLink
            to={link.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`
            }
          >
            {link.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

// Every page renders inside <Outlet />. Desktop (md and up): fixed sidebar.
// Mobile: top bar with a menu button that opens the same links.
function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col overflow-y-auto bg-ink p-4 md:flex">
        <Link to="/" className="mb-6 px-3 text-xl font-bold text-white">
          Kilometro
        </Link>
        <nav aria-label="Main">
          <NavList />
        </nav>
      </aside>

      <header className="sticky top-0 z-40 bg-ink md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" onClick={closeMenu} className="text-lg font-bold text-white">
            Kilometro
          </Link>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-white hover:bg-white/10"
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <nav id="mobile-menu" aria-label="Main" className="border-t border-white/10 px-4 pt-2 pb-4">
            <NavList onNavigate={closeMenu} />
          </nav>
        )}
      </header>

      <div className="md:pl-56">
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
