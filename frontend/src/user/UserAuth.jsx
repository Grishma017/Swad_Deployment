import { useState } from 'react'
import { userLogin, userRegister } from '../services/api'
import './user.css'

function UserAuth({ onLoginSuccess }) {
  const [mode, setMode] = useState(
    window.location.pathname.includes('/register') ? 'register' : 'login'
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please fill in all required fields.')
      return
    }

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name.')
      return
    }

    setLoading(true)
    try {
      const data =
        mode === 'register'
          ? await userRegister(name, email, password)
          : await userLogin(email, password)

      if (data?.user) {
        onLoginSuccess(data.user)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="user-auth-wrapper">
      <div className="user-auth-split-card">
        {/* Left Visual Panel */}
        <div className="user-auth-visual">
          <div className="user-auth-visual-copy">
            <h2>
              Share the authentic{' '}
              <span className="user-auth-highlight">
                taste of Nepal.
                <svg
                  className="user-auth-underline"
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
              Preserve family recipes and discover culinary stories from every corner of Nepal.
            </p>
          </div>

          <div className="user-auth-dish-frame">
            <img
              src="https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Dal_Bhat_Tarkari_Aachar.jpg/960px-Dal_Bhat_Tarkari_Aachar.jpg"
              alt="Traditional Nepali Dal Bhat Tarkari platter"
            />
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="user-auth-form-pane">
          <div className="user-auth-header">
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

            <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
            <p>
              {mode === 'login'
                ? 'Please login to your account'
                : 'Sign up to share and save Nepali recipes'}
            </p>
          </div>

          {error && (
            <div className="user-alert user-alert-error" role="alert">
              ⚠️ {error}
            </div>
          )}

          <form className="user-auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="user-auth-field">
                <input
                  id="user-name"
                  type="text"
                  placeholder="Full name"
                  aria-label="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div className="user-auth-field">
              <input
                id="user-email"
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>

            <div className="user-auth-field user-auth-password-field">
              <input
                id="user-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Password (min 6 characters)' : 'Password'}
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="user-auth-eye-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
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
              className="user-auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? mode === 'register'
                  ? 'Creating Account…'
                  : 'Logging in…'
                : mode === 'register'
                ? 'Sign up'
                : 'Login'}
            </button>
          </form>

          <div className="user-auth-switch">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setError('')
                  }}
                >
                  Signup
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError('')
                  }}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserAuth
