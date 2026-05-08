import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { formatPHP, today } from '../../utils/payroll'

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm font-medium text-gray-700 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { state } = useApp()
  const todayStr = today()
  const cid = state.selectedCompanyId

  const allActive = state.employees.filter(e => e.status === 'active')
  const activeEmp = cid ? allActive.filter(e => e.companyId === cid) : allActive

  const todayRecs = state.attendance.filter(r => {
    if (r.date !== todayStr) return false
    if (!cid) return true
    const emp = state.employees.find(e => e.id === r.employeeId)
    return emp?.companyId === cid
  })

  const present = todayRecs.filter(r => r.status === 'present').length
  const late    = todayRecs.filter(r => r.status === 'late').length
  const absent  = todayRecs.filter(r => r.status === 'absent').length

  const relevantPayrolls = cid
    ? state.payrolls.filter(p => p.companyId === cid)
    : state.payrolls
  const latestPayroll = [...relevantPayrolls].sort((a, b) => b.period.localeCompare(a.period))[0]
  const totalNetPay = latestPayroll?.items.reduce((s, i) => s + i.netPay, 0) ?? 0

  const empById  = Object.fromEntries(state.employees.map(e => [e.id, e]))
  const recByEmp = Object.fromEntries(todayRecs.map(r => [r.employeeId, r]))

  // All-companies overview rows
  const companyRows = !cid ? (state.companies ?? []).map(co => {
    const coEmps = allActive.filter(e => e.companyId === co.id)
    const coPayrolls = state.payrolls.filter(p => p.companyId === co.id)
    const latestCoPay = [...coPayrolls].sort((a, b) => b.period.localeCompare(a.period))[0]
    const netPay = latestCoPay?.items.reduce((s, i) => s + i.netPay, 0) ?? 0
    return { co, empCount: coEmps.length, latestPayroll: latestCoPay, netPay }
  }) : []

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Employees" value={activeEmp.length} sub="Total headcount" color="text-gray-800" />
        <StatCard label="Present Today"    value={present} sub={`${todayStr}`} color="text-green-600" />
        <StatCard label="Late / Absent"    value={`${late} / ${absent}`} sub="As of today" color="text-amber-600" />
        <StatCard
          label="Last Payroll"
          value={formatPHP(totalNetPay)}
          sub={latestPayroll ? `${latestPayroll.period} · ${latestPayroll.status}` : '—'}
          color="text-brand-700"
        />
      </div>

      {/* Company overview (all-companies mode) */}
      {!cid && companyRows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Client Companies</h2>
            <Link to="/companies" className="text-xs text-brand-700 hover:underline">Manage →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {companyRows.map(({ co, empCount, latestPayroll: lp, netPay }) => (
              <div key={co.id} className="px-5 py-3 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                  {co.shortName}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{co.name}</div>
                  <div className="text-xs text-gray-400">{co.industry} · {empCount} employees</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-brand-700">{formatPHP(netPay)}</div>
                  <div className="text-xs text-gray-400">{lp ? lp.period : 'No payroll'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Attendance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Today's Attendance — {todayStr}</h2>
            <Link to="/attendance" className="text-xs text-brand-700 hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase bg-gray-50">
                  <th className="text-left px-5 py-2.5 font-medium">Employee</th>
                  <th className="text-left px-4 py-2.5 font-medium">Time In</th>
                  <th className="text-left px-4 py-2.5 font-medium">Time Out</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeEmp.slice(0, 8).map(emp => {
                  const rec = recByEmp[emp.id]
                  const status = rec?.status ?? 'no record'
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-5 py-2.5">
                        <div className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</div>
                        <div className="text-xs text-gray-400">{emp.position}</div>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{rec?.timeIn ?? '—'}</td>
                      <td className="px-4 py-2.5 text-gray-600">{rec?.timeOut ?? '—'}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {activeEmp.length > 8 && (
              <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">
                +{activeEmp.length - 8} more employees
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: '/attendance', label: 'Enter Attendance', desc: "Log today's time in/out" },
                { to: '/payroll',    label: 'Run Payroll',      desc: 'Generate monthly payslips' },
                { to: '/employees',  label: 'Add Employee',     desc: 'Register new team member' },
                { to: '/reports',    label: 'View Reports',     desc: 'Attendance & payroll summaries' },
              ].map(({ to, label, desc }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{label}</div>
                    <div className="text-xs text-gray-400">{desc}</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {latestPayroll && (
            <div className="bg-brand-950 rounded-xl p-5 text-white">
              <div className="text-xs text-white/50 uppercase tracking-wide mb-1">Latest Payroll</div>
              <div className="text-lg font-bold">{formatPHP(totalNetPay)}</div>
              <div className="text-sm text-white/60 mt-0.5">
                {latestPayroll.period} · {latestPayroll.items.length} employees
              </div>
              <Link to="/payroll" className="mt-3 block text-xs text-white/60 hover:text-white underline">
                View payslips →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    present:   'bg-green-100 text-green-700',
    late:      'bg-amber-100 text-amber-700',
    absent:    'bg-red-100 text-red-700',
    'no record': 'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${map[status] ?? map['no record']}`}>
      {status}
    </span>
  )
}
