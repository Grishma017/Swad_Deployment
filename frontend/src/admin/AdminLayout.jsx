import './admin.css'

function AdminLayout({
  activeTab = 'dashboard',
  onNavigate,
  onLogout,
  searchQuery = '',
  onSearchChange,
  children,
}) {
  return (
    <div className="admin-shell">
      {/* Top Header matching Swad website design */}
      <header className="admin-site-header">
        <div className="admin-nav-container">
          {/* Logo */}
          <a className="brand" href="/" aria-label="Swad home">
            <span className="brand-lockup">
              <span className="brand-wordmark" aria-hidden="true">
                <span className="brand-script">स्वा</span>
                <svg className="brand-fork-d" viewBox="0 -8 32 48" fill="none">
                  <path d="M22 19v27M22 23c-2.5-2.7-5-4-9-4-6.3 0-10.8 5-10.8 13S6.7 44 13 44c4 0 7-1.7 9-4.5" />
                  <path d="M16-6v19m4-19v20m4-20v20m4-20v19m-12 0c0 4.5 2.5 7 6 7s6-2.5 6-7" />
                </svg>
              </span>
            </span>
          </a>

          {/* Right side: search, logout, create */}
          <div className="admin-nav-actions">
            <label className="admin-search-field">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                className="search-icon"
              >
                <circle cx="8.8" cy="8.8" r="5.8" />
                <path d="m13.2 13.2 4 4" />
              </svg>
              <input
                aria-label="Search recipes"
                type="search"
                placeholder="Find a recipe"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="admin-nav-logout"
              onClick={onLogout}
            >
              Log out
            </button>

            <button
              type="button"
              className="admin-create-btn"
              onClick={() => onNavigate('add')}
            >
              Create
            </button>
          </div>
        </div>
      </header>

      {/* Broad, Full-Width Main Content */}
      <main className="admin-content content-width">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
