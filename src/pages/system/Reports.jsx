import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { formatPHP, monthLabel, periodLabel, getWorkingDays, getWorkingDaysByCutoff } from '../../utils/payroll'

const PERIODS = [
  { year: 2026, month: 5, cutoff: 'A' },
  { year: 2026, month: 4, cutoff: 'B' },
  { year: 2026, month: 4, cutoff: 'A' },
  { year: 2026, month: 3, cutoff: 'B' },
]

export default function Reports() {
  const { state } = useApp()
  const [tab, setTab] = useState('attendance')
  const [selected, setSelected] = useState(PERIODS[1]) // April B default

  const { year, month, cutoff } = selected
  const periodKey = `${year}-${String(month).padStart(2, '0')}-${cutoff}`
  const workingDays = getWorkingDaysByCutoff(year, month, cutoff)
  const activeEmp = state.employees.filter(e => e.status === 'active')

  // Attendance summary per employee for selected period
  const workingDaySet = new Set(workingDays)
  const attSummary = activeEmp.map(emp => {
    const recs = state.attendance.filter(r => r.employeeId === emp.id && workingDaySet.has(r.date))
    const present = recs.filter(r => r.status === 'present').length
    const late    = recs.filter(r => r.status === 'late').length
    const absent  = recs.filter(r => r.status === 'absent').length
    const totalLate = recs.reduce((s, r) => s + (r.lateMinutes || 0), 0)
    const rate = workingDays.length ? Math.round(((present + late) / workingDays.length) * 100) : 0
    return { emp, present, late, absent, totalLate, rate, recorded: recs.length }
  })

  const payroll = state.payrolls.find(p => p.period === periodKey)
  const empById = Object.fromEntries(state.employees.map(e => [e.id, e]))

  return (
    <div className="space-y-4">
      {/* Period picker */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Period:</label>
        <select
          value={periodKey}
          onChange={e => {
            const p = PERIODS.find(x => `${x.year}-${String(x.month).padStart(2,'0')}-${x.cutoff}` === e.target.value)
            if (p) setSelected(p)
          }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {PERIODS.map(p => {
            const key = `${p.year}-${String(p.month).padStart(2,'0')}-${p.cutoff}`
            const lastDay = new Date(p.year, p.month, 0).getDate()
            const mName   = new Date(p.year, p.month - 1, 1).toLocaleDateString('en-PH', { month: 'short' })
            const range   = p.cutoff === 'A' ? `${mName} 1–15` : `${mName} 16–${lastDay}`
            return <option key={key} value={key}>{periodLabel(p.year, p.month, p.cutoff)} — {range}</option>
          })}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[['attendance', 'Attendance Summary'], ['payroll', 'Payroll Summary']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'attendance' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">
              Attendance Report — {periodLabel(year, month, cutoff)} ({workingDays.length} working days)
            </h2>
            <button className="text-xs text-brand-700 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50">
              Export CSV
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                {['Employee', 'Department', 'Present', 'Late', 'Absent', 'Late (min)', 'Attendance Rate', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attSummary.map(({ emp, present, late, absent, totalLate, rate }) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</div>
                    <div className="text-xs text-gray-400">{emp.id}</div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{emp.department}</td>
                  <td className="px-4 py-2.5 text-green-700 font-medium">{present}</td>
                  <td className="px-4 py-2.5 text-amber-600 font-medium">{late}</td>
                  <td className="px-4 py-2.5 text-red-600 font-medium">{absent}</td>
                  <td className="px-4 py-2.5 text-gray-600">{totalLate || '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${rate >= 95 ? 'bg-green-500' : rate >= 85 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{rate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-300">
                    {`${present + late + absent}/${workingDays.length} logged`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'payroll' && (
        payroll ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 text-sm">
                Payroll Report — {periodLabel(year, month, cutoff)}
              </h2>
              <button className="text-xs text-brand-700 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50">
                Export CSV
              </button>
            </div>

            {/* Totals row */}
            <div className="grid grid-cols-4 gap-px bg-gray-100 border-b border-gray-200">
              {[
                ['Employees', payroll.items.length],
                ['Total Gross', formatPHP(payroll.items.reduce((s, i) => s + i.grossPay, 0))],
                ['Total Deductions', formatPHP(payroll.items.reduce((s, i) => s + i.totalGovDeductions, 0))],
                ['Total Net Pay', formatPHP(payroll.items.reduce((s, i) => s + i.netPay, 0))],
              ].map(([label, val]) => (
                <div key={label} className="bg-brand-50 px-5 py-3">
                  <div className="text-xs text-gray-400">{label}</div>
                  <div className="font-semibold text-brand-800 mt-0.5">{val}</div>
                </div>
              ))}
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                  {['Employee', 'Gross Pay', 'SSS', 'PhilHealth', 'Pag-IBIG', 'Tax', 'Net Pay'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payroll.items.map(item => {
                  const emp = empById[item.employeeId]
                  return (
                    <tr key={item.employeeId} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-gray-800">{emp?.firstName} {emp?.lastName}</div>
                        <div className="text-xs text-gray-400">{emp?.department}</div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-gray-700">{formatPHP(item.grossPay)}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-500 text-xs">{formatPHP(item.sss)}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-500 text-xs">{formatPHP(item.philhealth)}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-500 text-xs">{formatPHP(item.pagibig)}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-500 text-xs">{formatPHP(item.tax)}</td>
                      <td className="px-4 py-2.5 font-mono font-semibold text-brand-700">{formatPHP(item.netPay)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400 text-sm">
            No payroll generated for {periodLabel(year, month, cutoff)}. Go to Payroll to generate it first.
          </div>
        )
      )}
    </div>
  )
}
