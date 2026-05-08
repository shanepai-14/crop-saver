import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Sidebar from './Sidebar'

const PAGE_TITLES = {
  '/dashboard':   'Dashboard',
  '/companies':   'Companies',
  '/employees':   'Employees',
  '/attendance':  'Attendance',
  '/payroll':     'Payroll',
  '/reports':     'Reports',
  '/leave-requests': 'Leave Requests',
  '/leave-types':    'Leave Types',
  '/mobile-demo':    'Mobile App Demo',
}

export default function SystemLayout() {
  const { state } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  if (!state.currentUser) return <Navigate to="/login" replace />

  const title = PAGE_TITLES[location.pathname]
    ?? (location.pathname.startsWith('/employees/') ? 'Employee Profile' : 'HR System')
  const selectedCompany = state.companies?.find(c => c.id === state.selectedCompanyId)

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-semibold text-gray-800">{title}</h1>
            {selectedCompany && (
              <span className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                {selectedCompany.shortName}
              </span>
            )}
          </div>
          <div className="ml-auto text-xs text-gray-400">
            CSPC Internal HR — v1.0
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
