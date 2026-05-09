import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { formatPHP } from '../../utils/payroll'

export default function ThirteenthMonth() {
  const { state, dispatch } = useApp()

  const thisYear = new Date().getFullYear()
  const [year, setYear] = useState(thisYear)

  const [pendingStart, setPendingStart] = useState(`${thisYear}-01-01`)
  const [pendingEnd,   setPendingEnd]   = useState(`${thisYear}-12-31`)
  const [coverageStart, setCoverageStart] = useState(`${thisYear}-01-01`)
  const [coverageEnd,   setCoverageEnd]   = useState(`${thisYear}-12-31`)

  const cid = state.selectedCompanyId

  // Sync coverage dates when year changes
  function changeYear(delta) {
    const y = year + delta
    setYear(y)
    const s = `${y}-01-01`
    const e = `${y}-12-31`
    setPendingStart(s); setPendingEnd(e)
    setCoverageStart(s); setCoverageEnd(e)
  }

  function saveCoverage() {
    setCoverageStart(pendingStart)
    setCoverageEnd(pendingEnd)
  }

  const computed = useMemo(() =>
    (state.thirteenthMonth ?? []).find(
      t => t.year === year && t.companyId === (cid ?? null)
    )
  , [state.thirteenthMonth, year, cid])

  const empMap = useMemo(() =>
    Object.fromEntries(state.employees.map(e => [e.id, e]))
  , [state.employees])

  const deptMap = useMemo(() =>
    Object.fromEntries((state.departments ?? []).map(d => [d.id, d.name]))
  , [state.departments])

  const items = computed?.items ?? []
  const totalLiability = items.reduce((s, i) => s + i.amount, 0)
  const paidCount      = items.filter(i => i.paid).length
  const deadline       = `December 24, ${year}`

  function handleCompute() {
    dispatch({
      type: 'COMPUTE_13TH_MONTH',
      year, coverageStart, coverageEnd,
      companyId: cid ?? null,
    })
  }

  function handleMarkPaid(employeeId) {
    dispatch({ type: 'MARK_13TH_PAID', year, employeeId, companyId: cid ?? null })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 12v10H4V12M2 7h20v5H2V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
            </svg>
            <h1 className="text-xl font-bold text-gray-900">13th Month Pay</h1>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            PD 851 — Must be paid on or before December 24. Non-taxable up to PHP 90,000.
          </p>
          <p className="text-xs text-gray-400">
            Coverage: {fmtDate(coverageStart)} to {fmtDate(coverageEnd)}
          </p>
        </div>

        {/* Year nav + Compute */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden text-sm">
            <button onClick={() => changeYear(-1)}
              className="px-2.5 py-2 hover:bg-gray-100 text-gray-600 transition-colors">
              ‹
            </button>
            <span className="px-3 py-2 font-semibold text-gray-800 border-x border-gray-300">{year}</span>
            <button onClick={() => changeYear(1)}
              className="px-2.5 py-2 hover:bg-gray-100 text-gray-600 transition-colors">
              ›
            </button>
          </div>
          <button
            onClick={handleCompute}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 12v10H4V12M2 7h20v5H2V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
            </svg>
            Compute {year}
          </button>
        </div>
      </div>

      {/* Coverage date picker */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Computation Coverage
        </p>
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start</label>
            <input type="date" value={pendingStart}
              onChange={e => setPendingStart(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End</label>
            <input type="date" value={pendingEnd}
              onChange={e => setPendingEnd(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <button onClick={saveCoverage}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Save Coverage
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL EMPLOYEES', value: items.length, cls: 'text-gray-900' },
          { label: 'TOTAL LIABILITY', value: formatPHP(totalLiability), cls: 'text-green-600 font-bold' },
          { label: 'PAID', value: `${paidCount} / ${items.length}`, cls: 'text-gray-900' },
          { label: 'DEADLINE', value: deadline, cls: 'text-gray-900 font-bold' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-lg ${card.cls}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
              <th className="px-5 py-3 text-left">Employee</th>
              <th className="px-5 py-3 text-left">Department</th>
              <th className="px-5 py-3 text-right">Months</th>
              <th className="px-5 py-3 text-right">Total Basic Paid</th>
              <th className="px-5 py-3 text-right">13th Month</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M20 12v10H4V12M2 7h20v5H2V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
                    </svg>
                    <span className="text-sm">No data. Click "Compute" to calculate 13th month for {year}.</span>
                  </div>
                </td>
              </tr>
            ) : items.map(item => {
              const emp = empMap[item.employeeId]
              if (!emp) return null
              return (
                <tr key={item.employeeId} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</div>
                    <div className="text-xs text-gray-400">{emp.position}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {deptMap[emp.department] ?? emp.department ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-700 font-medium">{item.months}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{formatPHP(item.totalBasicPaid)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-green-700">{formatPHP(item.amount)}</td>
                  <td className="px-5 py-3">
                    {item.paid ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Paid
                        </span>
                        {item.paidAt && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(item.paidAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkPaid(item.employeeId)}
                        className="px-3 py-1 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-gray-600 text-right">
                  Total ({items.length} employees)
                </td>
                <td className="px-5 py-3 text-right font-bold text-green-700">{formatPHP(totalLiability)}</td>
                <td className="px-5 py-3 text-xs text-gray-400">{paidCount}/{items.length} paid</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}
