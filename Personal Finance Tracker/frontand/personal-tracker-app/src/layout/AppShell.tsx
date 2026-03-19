import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

const navigationItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Transactions', to: '/transactions' },
  { label: 'Budgets', to: '/budgets' },
  { label: 'Goals', to: '/goals' },
  { label: 'Reports', to: '/reports' },
  { label: 'Recurring', to: '/recurring' },
  { label: 'Accounts', to: '/accounts' },
  { label: 'Settings', to: '/settings' },
]

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const utilityContent = (
    <>
      <button
        type="button"
        className="utility-button utility-button-primary"
        onClick={() => navigate('/transactions/new')}
      >
        Add Transaction
      </button>
      <label className="utility-search">
        <span className="sr-only">Search</span>
        <input type="search" placeholder="Search merchant, note, category" />
      </label>
      <label className="utility-select">
        <span className="sr-only">Date Range</span>
        <select defaultValue="this-month">
          <option value="today">Today</option>
          <option value="this-week">This Week</option>
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
          <option value="custom">Custom Range</option>
        </select>
      </label>
      <button type="button" className="utility-icon-button" aria-label="Notifications">
        Notifications
      </button>
      <button type="button" className="profile-chip">
        Akash
      </button>
    </>
  )

  const navigationContent = navigationItems.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) =>
        isActive ? 'nav-link nav-link-active' : 'nav-link'
      }
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {item.label}
    </NavLink>
  ))

  return (
    <div className="app-shell">
      <header className="top-shell">
        <div className="top-shell-row">
          <div className="brand-lockup">
            <button
              type="button"
              className="mobile-nav-toggle"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="brand-badge">PF</div>
            <div>
              <p className="eyebrow">Personal Finance Tracker</p>
              <h1>Money clarity without clutter.</h1>
            </div>
          </div>

          <div className="utility-bar utility-bar-desktop">{utilityContent}</div>
        </div>

        <nav className="primary-nav primary-nav-desktop" aria-label="Primary">
          {navigationContent}
        </nav>

        <div className={isMobileMenuOpen ? 'mobile-menu-panel mobile-menu-panel-open' : 'mobile-menu-panel'}>
          <div className="utility-bar utility-bar-mobile">{utilityContent}</div>
          <nav className="primary-nav primary-nav-mobile" aria-label="Mobile primary">
            {navigationContent}
          </nav>
        </div>
      </header>

      <main className="main-content shell-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
