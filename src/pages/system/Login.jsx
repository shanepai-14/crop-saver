import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function Login() {
  const { state, dispatch } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (state.currentUser) return <Navigate to="/dashboard" replace />

  function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: 'LOGIN', email, password })
  }

  return (
    <div className="min-h-screen bg-brand-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/crop_saver_logo.png" alt="Crop Saver Philippines" className="h-16 w-auto object-contain mb-4" />
          <h1 className="text-white text-xl font-bold">CSPC HR System</h1>
          <p className="text-white/50 text-sm mt-1">Crop Saver Philippines Corporation</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-gray-800 text-lg font-semibold mb-6">Sign in to your account</h2>

          {state.loginError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {state.loginError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="your@email.com"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand-700 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
            >
              Sign In
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Demo Credentials</p>
            <div className="space-y-2">
              {[
                { role: 'Admin', email: 'admin@cspc.com.ph', pass: 'admin123' },
                { role: 'HR',    email: 'hr@cspc.com.ph',    pass: 'hr1234' },
              ].map(({ role, email: e, pass }) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => { setEmail(e); setPassword(pass) }}
                  className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-xs font-semibold text-brand-700">{role}</span>
                  <span className="text-xs text-gray-500 ml-2">{e}</span>
                  <span className="text-xs text-gray-400 ml-1">/ {pass}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
