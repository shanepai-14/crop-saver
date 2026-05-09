import { useState, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

// ── Icons ─────────────────────────────────────────────────
const Icon = ({ d }) => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
)

const ICONS = {
  dashboard:    'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  companies:    'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  employees:    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  departments:  'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  positions:    'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  attendance:   'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  payroll:      'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  reports:      'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  leaveReq:     'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 17h.01',
  leaveTypes:   'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  mobile:       'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  chevron:      'M19 9l-7 7-7-7',
  employment:   'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  leaveMgmt:    'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  payrollRuns:  'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  thirteenth:   'M20 12v10H4V12M2 7h20v5H2V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z',
  loans:        'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
}

// ── Nav structure ─────────────────────────────────────────
const NAV = [
  { type: 'link',  to: '/dashboard',  label: 'Dashboard',  icon: 'dashboard' },
  { type: 'link',  to: '/companies',  label: 'Companies',  icon: 'companies' },
  {
    type: 'group', id: 'employment', label: 'Employment', icon: 'employment',
    children: [
      { to: '/employees',                  label: 'Employees',   icon: 'employees',   badge: 'missingGov' },
      { to: '/employees?tab=departments',  label: 'Departments', icon: 'departments', matchTab: 'departments' },
      { to: '/employees?tab=positions',    label: 'Positions',   icon: 'positions',   matchTab: 'positions' },
    ],
  },
  { type: 'link',  to: '/attendance', label: 'Attendance', icon: 'attendance' },
  {
    type: 'group', id: 'payroll', label: 'Payroll', icon: 'payroll',
    children: [
      { to: '/payroll',                  label: 'Payroll Runs',   icon: 'payrollRuns' },
      { to: '/payroll/thirteenth-month', label: '13th Month Pay', icon: 'thirteenth' },
      { to: '/payroll/loans',            label: 'Loans',          icon: 'loans' },
    ],
  },
  { type: 'link',  to: '/reports',    label: 'Reports',    icon: 'reports' },
  {
    type: 'group', id: 'leave', label: 'Leave Management', icon: 'leaveMgmt',
    children: [
      { to: '/leave-requests', label: 'Leave Requests', icon: 'leaveReq' },
      { to: '/leave-types',    label: 'Leave Types',    icon: 'leaveTypes' },
    ],
  },
  { type: 'link',  to: '/mobile-demo', label: 'Mobile App', icon: 'mobile' },
]

export default function Sidebar({ onClose }) {
  const { state, dispatch } = useApp()
  const location = useLocation()

  const selectedCompany = state.companies?.find(c => c.id === state.selectedCompanyId)

  const missingGovCount = useMemo(() =>
    (state.employees ?? []).filter(e =>
      e.status === 'active' && (!e.sssNo || !e.philhealthNo || !e.pagibigNo || !e.tinNo)
    ).length
  , [state.employees])

  // Determine which groups have an active child
  const activeGroups = useMemo(() => {
    const active = new Set()
    NAV.forEach(item => {
      if (item.type !== 'group') return
      const hasActive = item.children.some(child => {
        const [path, qs] = child.to.split('?')
        if (location.pathname !== path) return false
        if (!qs) return !new URLSearchParams(location.search).get('tab') && !child.matchTab
        const tab = new URLSearchParams(qs).get('tab')
        return new URLSearchParams(location.search).get('tab') === tab
      })
      if (hasActive) active.add(item.id)
    })
    return active
  }, [location])

  const [openGroups, setOpenGroups] = useState(() => new Set(['employment', 'leave', 'payroll']))

  function toggleGroup(id) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // A group is open if manually opened OR has an active child
  function isGroupOpen(id) {
    return openGroups.has(id)
  }

  function isChildActive(child) {
    const [path, qs] = child.to.split('?')
    if (location.pathname !== path) return false
    if (!qs && !child.matchTab) return !new URLSearchParams(location.search).get('tab')
    const tab = new URLSearchParams(qs ?? '').get('tab')
    return new URLSearchParams(location.search).get('tab') === tab
  }

  const linkCls = (active) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-brand-700 text-white'
        : 'text-white/70 hover:text-white hover:bg-white/10'
    }`

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-brand-950 text-white shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <img src="/crop_saver_logo.png" alt="Crop Saver" className="h-8 w-auto object-contain shrink-0" />
        <div className="leading-tight">
          <div className="text-sm font-bold">CSPC HR System</div>
          <div className="text-xs text-white/50">Internal Tool</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-white/50 hover:text-white lg:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Company Switcher */}
      <div className="px-3 pt-3 pb-2 border-b border-white/10">
        <div className="text-xs text-white/40 uppercase tracking-wide mb-1.5 px-1">Viewing</div>
        <select
          value={state.selectedCompanyId ?? ''}
          onChange={e => dispatch({ type: 'SET_COMPANY', companyId: e.target.value || null })}
          className="w-full bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-lg px-3 py-2 border border-white/20 focus:outline-none focus:ring-1 focus:ring-brand-400 cursor-pointer appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff80' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px', paddingRight: '28px' }}
        >
          <option value="" className="bg-brand-900 text-white">All Companies</option>
          {(state.companies ?? []).filter(c => c.status === 'active').map(c => (
            <option key={c.id} value={c.id} className="bg-brand-900 text-white">
              {c.shortName} — {c.name}
            </option>
          ))}
        </select>
        {selectedCompany && (
          <div className="mt-1.5 px-1 text-xs text-brand-300 truncate">{selectedCompany.industry}</div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
        {NAV.map(item => {
          if (item.type === 'link') {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => linkCls(isActive)}
              >
                <Icon d={ICONS[item.icon]} />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            )
          }

          // Collapsible group
          const open = isGroupOpen(item.id)
          const groupHasActive = activeGroups.has(item.id)

          return (
            <div key={item.id}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  groupHasActive
                    ? 'text-white bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon d={ICONS[item.icon]} />
                <span className="flex-1 text-left">{item.label}</span>
                <svg
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS.chevron} />
                </svg>
              </button>

              {/* Children */}
              {open && (
                <div className="mt-0.5 ml-3 pl-3 border-l border-white/10 space-y-0.5">
                  {item.children.map(child => {
                    const active = isChildActive(child)
                    return (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onClick={onClose}
                        className={() => linkCls(active)}
                      >
                        <Icon d={ICONS[child.icon]} />
                        <span className="flex-1">{child.label}</span>
                        {child.badge === 'missingGov' && missingGovCount > 0 && (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center">
                            {missingGovCount}
                          </span>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
            {state.currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-sm font-medium text-white truncate">{state.currentUser?.name}</div>
            <div className="text-xs text-white/50 capitalize">{state.currentUser?.role}</div>
          </div>
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            title="Sign out"
            className="text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
