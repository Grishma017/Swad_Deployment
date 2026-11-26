import { useState, useEffect } from 'react'
import { adminLogin, getMe } from '../services/api'
import './admin.css'

function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If already authenticated as admin, redirect to dashboard directly
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const res = await getMe()
        if (res?.user?.role === 'admin') {
          onLoginSuccess(res.user)
        }
      } catch {
        // Not authenticated yet, stay on login
      }
    }
    checkExistingSession()
  }, [onLoginSuccess])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please provide both email and password.')
      return
    }

    setLoading(true)
    try {
      const data = await adminLogin(email, password)
      // adminLogin saves token; data.user has { id, name, email, role }
      if (data?.user) {
        onLoginSuccess(data.user)
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-split-card">
        <section className="admin-login-visual">
          <div className="admin-login-visual-copy">
            <h2>
              Preserve the authentic{' '}
              <span className="admin-login-highlight">
                taste of Nepal.
                <svg
                  className="admin-login-underline"
                  viewBox="0 0 220 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 10.5C68 3.5 148 2.5 217 8.5"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
            <p>
              Manage recipes, categories, and culinary stories from every corner of Nepal.
            </p>
          </div>

          <div className="admin-login-dish-frame">
            <img
              src="https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Dal_Bhat_Tarkari_Aachar.jpg/960px-Dal_Bhat_Tarkari_Aachar.jpg"
              alt="Traditional Nepali Dal Bhat Tarkari platter"
            />
          </div>
        </section>

        <section className="admin-login-form-pane">
          <div className="admin-login-header">
            <a className="brand" href="/" aria-label="Swad Home">
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

            <span className="admin-badge">Admin Portal</span>
            <h1>Welcome Back</h1>
            <p>Sign in to manage Swad recipes and culinary archives</p>
          </div>

          {error && (
            <div className="admin-alert admin-alert-error admin-login-error" role="alert">
              <span>⚠️ {error}</span>
            </div>
          )}

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="admin-login-field">
              <input
                id="admin-email"
                type="email"
                placeholder="Admin email address"
                aria-label="Admin email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="admin-login-field admin-login-password-field">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="admin-login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              className="admin-login-submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <div className="admin-login-footer">
            <a href="/">← Return to public website</a>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminLogin
