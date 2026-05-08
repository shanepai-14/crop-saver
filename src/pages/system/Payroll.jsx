import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { formatPHP, periodLabel, getWorkingDaysBetween, getWorkingDaysSixDayBetween } from '../../utils/payroll'

// ── Semi-monthly periods ──────────────────────────────────
function buildPeriod(year, month, cutoff) {
  const lastDay = new Date(year, month, 0).getDate()
  const m   = String(month).padStart(2, '0')
  const nm  = month === 12 ? '01' : String(month + 1).padStart(2, '0')
  const ny  = month === 12 ? year + 1 : year
  const mName = new Date(year, month - 1, 1).toLocaleDateString('en-PH', { month: 'short' })
  return {
    key: `${year}-${m}-${cutoff}`,
    year, month, cutoff,
    label: cutoff === 'A' ? `${mName} 1–15, ${year}` : `${mName} 16–${lastDay}, ${year}`,
    coverageStart: cutoff === 'A' ? `${year}-${m}-01`             : `${year}-${m}-16`,
    coverageEnd:   cutoff === 'A' ? `${year}-${m}-15`             : `${year}-${m}-${String(lastDay).padStart(2,'0')}`,
    payrollDate:   cutoff === 'A' ? `${year}-${m}-20`             : `${ny}-${nm}-05`,
  }
}

const PERIODS = [
  buildPeriod(2026, 5, 'B'),
  buildPeriod(2026, 5, 'A'),
  buildPeriod(2026, 4, 'B'),
  buildPeriod(2026, 4, 'A'),
  buildPeriod(2026, 3, 'B'),
  buildPeriod(2026, 3, 'A'),
]

// ── Weekly periods (Mon–Sat, 6 days) ─────────────────────
function buildWeeklyPeriod(startISO, cutoff) {
  const start = new Date(startISO + 'T00:00:00')
  const end   = new Date(start); end.setDate(end.getDate() + 5)
  const pay   = new Date(end);   pay.setDate(pay.getDate() + 2)
  const fmt   = d => d.toISOString().slice(0, 10)
  const sMon  = start.toLocaleDateString('en-PH', { month: 'short' })
  const eMon  = end.toLocaleDateString('en-PH', { month: 'short' })
  const label = sMon !== eMon
    ? `${sMon} ${start.getDate()}–${eMon} ${end.getDate()}, ${start.getFullYear()}`
    : `${sMon} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`
  return {
    key: `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${cutoff}`,
    year: start.getFullYear(), month: start.getMonth() + 1, cutoff,
    label, isWeekly: true,
    coverageStart: startISO, coverageEnd: fmt(end), payrollDate: fmt(pay),
  }
}

const WEEKLY_PERIODS = [
  buildWeeklyPeriod('2026-05-11', 'W3'),
  buildWeeklyPeriod('2026-05-04', 'W2'),
  buildWeeklyPeriod('2026-04-27', 'W4'),
  buildWeeklyPeriod('2026-04-20', 'W3'),
  buildWeeklyPeriod('2026-04-13', 'W2'),
  buildWeeklyPeriod('2026-04-06', 'W1'),
]

export default function Payroll() {
  const { state, dispatch } = useApp()

  const [payType, setPayType]       = useState('semi-monthly')  // 'semi-monthly' | 'weekly'

  // Semi-monthly state
  const [selKey, setSelKey]         = useState(PERIODS[1].key)
  const [covStart, setCovStart]     = useState(PERIODS[1].coverageStart)
  const [covEnd, setCovEnd]         = useState(PERIODS[1].coverageEnd)
  const [payDate, setPayDate]       = useState(PERIODS[1].payrollDate)

  // Weekly state
  const [wSelKey, setWSelKey]       = useState(WEEKLY_PERIODS[5].key)  // Apr W1
  const [wCovStart, setWCovStart]   = useState(WEEKLY_PERIODS[5].coverageStart)
  const [wCovEnd, setWCovEnd]       = useState(WEEKLY_PERIODS[5].coverageEnd)
  const [wPayDate, setWPayDate]     = useState(WEEKLY_PERIODS[5].payrollDate)

  const [payslipEmp, setPayslipEmp] = useState(null)
  const [viewMode, setViewMode]     = useState('table') // 'table' | 'sheet'

  // Sort + filter for the payroll table
  const [tableSearch, setTableSearch] = useState('')
  const [filterOT, setFilterOT]       = useState(false)
  const [sortField, setSortField]     = useState('lastName')
  const [sortDir, setSortDir]         = useState('asc')

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const isWeeklyTab    = payType === 'weekly'
  const activePeriods  = isWeeklyTab ? WEEKLY_PERIODS : PERIODS
  const activeSelKey   = isWeeklyTab ? wSelKey   : selKey
  const activeCovStart = isWeeklyTab ? wCovStart : covStart
  const activeCovEnd   = isWeeklyTab ? wCovEnd   : covEnd
  const activePayDate  = isWeeklyTab ? wPayDate  : payDate

  const selected = activePeriods.find(p => p.key === activeSelKey) ?? activePeriods[activePeriods.length - 1]

  function selectPeriod(key) {
    const p = activePeriods.find(x => x.key === key)
    if (!p) return
    if (isWeeklyTab) {
      setWSelKey(key); setWCovStart(p.coverageStart); setWCovEnd(p.coverageEnd); setWPayDate(p.payrollDate)
    } else {
      setSelKey(key);  setCovStart(p.coverageStart);  setCovEnd(p.coverageEnd);  setPayDate(p.payrollDate)
    }
  }

  const cid     = state.selectedCompanyId
  const payroll = state.payrolls.find(p => p.period === activeSelKey && p.companyId === (cid ?? null))

  const periodAKey    = `${selected.year}-${String(selected.month).padStart(2,'0')}-A`
  const periodAExists = !!state.payrolls.find(p => p.period === periodAKey && p.companyId === (cid ?? null))
  const canGenerate   = isWeeklyTab || selected.cutoff !== 'B' || periodAExists

  function handleGenerate() {
    if (!canGenerate) return
    dispatch({ type: 'PAYROLL_LOADING', value: true })
    setTimeout(() => {
      dispatch({
        type: 'GENERATE_PAYROLL',
        year:          selected.year,
        month:         selected.month,
        cutoff:        selected.cutoff,
        coverageStart: activeCovStart,
        coverageEnd:   activeCovEnd,
        payrollDate:   activePayDate,
        companyId:     cid ?? null,
      })
    }, 1200)
  }

  const empById    = Object.fromEntries(state.employees.map(e => [e.id, e]))
  const targetFreq = isWeeklyTab ? 'weekly' : 'semi-monthly'
  const fieldItems = useMemo(() => {
    const q = tableSearch.toLowerCase()
    const base = (payroll?.items ?? []).filter(item => {
      const emp = empById[item.employeeId]
      if (!emp || emp.salaryType !== 'daily' || emp.payFrequency !== targetFreq) return false
      if (filterOT && !(item.totalOTHours > 0)) return false
      if (q) {
        const name = `${emp.firstName} ${emp.lastName}`.toLowerCase()
        if (!name.includes(q)) return false
      }
      return true
    })
    return base.slice().sort((a, b) => {
      const empA = empById[a.employeeId]
      const empB = empById[b.employeeId]
      let va, vb
      if      (sortField === 'lastName')   { va = empA?.lastName ?? '';  vb = empB?.lastName ?? '' }
      else if (sortField === 'grossPay')   { va = a.grossPay;            vb = b.grossPay }
      else if (sortField === 'netPay')     { va = a.netPay;              vb = b.netPay }
      else if (sortField === 'daysPresent'){ va = a.daysPresent;         vb = b.daysPresent }
      else if (sortField === 'otHours')    { va = a.totalOTHours;        vb = b.totalOTHours }
      else                                 { va = empA?.lastName ?? '';  vb = empB?.lastName ?? '' }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })
  }, [payroll, empById, targetFreq, tableSearch, filterOT, sortField, sortDir])

  const showGov     = isWeeklyTab ? (selected.cutoff === 'W4' || selected.cutoff === 'W5') : selected.cutoff !== 'A'
  const workingDays = useMemo(
    () => isWeeklyTab
      ? getWorkingDaysSixDayBetween(activeCovStart, activeCovEnd)
      : getWorkingDaysBetween(activeCovStart, activeCovEnd),
    [isWeeklyTab, activeCovStart, activeCovEnd]
  )

  const totalRegPay  = fieldItems.reduce((s, i) => s + i.basicPay, 0)
  const totalOTPay   = fieldItems.reduce((s, i) => s + (i.otPay || 0), 0)
  const totalGross   = fieldItems.reduce((s, i) => s + i.grossPay, 0)
  const totalSSS     = fieldItems.reduce((s, i) => s + i.sss, 0)
  const totalPH      = fieldItems.reduce((s, i) => s + i.philhealth, 0)
  const totalPI      = fieldItems.reduce((s, i) => s + i.pagibig, 0)
  const totalECC     = fieldItems.reduce((s, i) => s + i.ecc, 0)
  const totalOtherD  = fieldItems.reduce((s, i) => s + i.otherDeductions, 0)
  const totalNet     = fieldItems.reduce((s, i) => s + i.netPay, 0)

  function exportCSV() {
    const govCols  = showGov
    const headers  = [
      'Employee', 'Employee ID', 'Daily Rate',
      'Days Present', 'Days Absent', 'Late (min)', 'OT Hours',
      'Reg Pay', 'OT Pay', 'Gross Pay',
      ...(govCols ? ['SSS (EE)', 'PhilHealth (EE)', 'Pag-IBIG (EE)', 'ECC', 'Total Gov Deductions'] : []),
      'Savings', 'Insurance', 'Bank Charges', 'Other Deductions',
      'Net Pay',
    ]

    // Use the unfiltered payroll items for the export (full period data), but respect current search/OT filter
    const rows = fieldItems.map(item => {
      const emp = empById[item.employeeId]
      return [
        emp ? `${emp.lastName}, ${emp.firstName}` : item.employeeId,
        item.employeeId,
        item.dailyRate,
        item.daysPresent,
        item.daysAbsent,
        item.totalLateMinutes,
        item.totalOTHours,
        item.basicPay,
        item.otPay,
        item.grossPay,
        ...(govCols ? [item.sss, item.philhealth, item.pagibig, item.ecc, item.totalGovDeductions] : []),
        item.savings,
        item.insurance,
        item.bankCharges,
        item.otherDeductions,
        item.netPay,
      ]
    })

    // Totals row
    const sum = k => fieldItems.reduce((s, i) => s + (i[k] ?? 0), 0)
    const totals = [
      `TOTAL (${fieldItems.length})`, '', '',
      sum('daysPresent'), sum('daysAbsent'), sum('totalLateMinutes'), sum('totalOTHours'),
      sum('basicPay'), sum('otPay'), sum('grossPay'),
      ...(govCols ? [sum('sss'), sum('philhealth'), sum('pagibig'), sum('ecc'), sum('totalGovDeductions')] : []),
      sum('savings'), sum('insurance'), sum('bankCharges'), sum('otherDeductions'),
      sum('netPay'),
    ]

    const esc = v => {
      const s = String(v ?? '')
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }

    const meta = [
      [`Period: ${selected.label}`],
      [`Coverage: ${activeCovStart} to ${activeCovEnd}`],
      [`Date Released: ${activePayDate}`],
      [`Working Days: ${workingDays.length}`],
      [],
    ]

    const csvLines = [
      ...meta.map(r => r.map(esc).join(',')),
      headers.map(esc).join(','),
      ...rows.map(r => r.map(esc).join(',')),
      totals.map(esc).join(','),
    ]

    const blob = new Blob([csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `payroll_${activeSelKey}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!cid) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <div className="text-sm font-medium text-gray-600 mb-1">Select a company to run payroll</div>
        <div className="text-xs text-gray-400">Use the company switcher in the sidebar to choose a client company.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Pay-type tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[['semi-monthly', 'Semi-monthly (15/30)'], ['weekly', 'Weekly (Mon–Sat)']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setPayType(val); setPayslipEmp(null) }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              payType === val ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Period + Coverage controls */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Period Start */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Period Start <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={activeCovStart}
                onChange={e => {
                  const val = e.target.value
                  const match = activePeriods.find(p => p.coverageStart === val)
                  if (match) {
                    selectPeriod(match.key)
                  } else {
                    if (isWeeklyTab) setWCovStart(val)
                    else setCovStart(val)
                  }
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Period End */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Period End <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={activeCovEnd}
                onChange={e => {
                  const val = e.target.value
                  if (isWeeklyTab) setWCovEnd(val)
                  else setCovEnd(val)
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date Released</label>
              <input type="date" value={activePayDate}
                onChange={e => isWeeklyTab ? setWPayDate(e.target.value) : setPayDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          {/* Generate / status */}
          <div className="flex items-center gap-3 shrink-0">
            {!isWeeklyTab && selected.cutoff === 'B' && !periodAExists && (
              <span className="text-xs text-amber-600 font-medium">Generate 1st half first</span>
            )}
            {payroll ? (
              <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Finalized
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={state.payrollLoading || !canGenerate}
                className="bg-brand-700 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {state.payrollLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Computing…
                  </>
                ) : 'Generate Payroll'}
              </button>
            )}
          </div>
        </div>

        {/* Deduction notes */}
        {!isWeeklyTab && selected.cutoff === 'A' && (
          <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong>1st half (15th):</strong> SSS, PhilHealth, Pag-IBIG, and ECC are <strong>not deducted</strong> yet — they will be applied in full on the 2nd half (30th) payroll.
            </span>
          </div>
        )}
        {isWeeklyTab && !showGov && (
          <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong>Weekly (Mon–Sat):</strong> Gov't contributions are deducted on the <strong>last week of the month</strong> (W4/W5) only.
            </span>
          </div>
        )}
      </div>

      {/* Summary cards */}
      {fieldItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Field Workers',   val: fieldItems.length, currency: false, color: 'text-gray-800' },
            { label: 'Total Gross',     val: totalGross,        currency: true,  color: 'text-gray-800' },
            { label: 'Gov\'t Deductions', val: totalSSS + totalPH + totalPI + totalECC, currency: true, color: 'text-red-600' },
            { label: 'Net Cash Out',    val: totalNet,          currency: true,  color: 'text-brand-700' },
          ].map(({ label, val, currency, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="text-xs text-gray-400 mb-1">{label}</div>
              <div className={`text-sm font-bold ${color}`}>{currency ? formatPHP(val) : val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Payroll table */}
      {fieldItems.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          {/* Table header: title + export + search/filter + view toggle */}
          <div className="px-5 py-3 border-b border-gray-100">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="font-semibold text-gray-800 text-sm">
                  Field Workers Payroll — {selected.label}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Coverage: {activeCovStart} to {activeCovEnd} · {workingDays.length} working days · Date Released: {activePayDate}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* View toggle */}
                <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
                  {[
                    { mode: 'table', label: 'Table', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
                    { mode: 'sheet', label: 'Sheet', icon: 'M3 10h18M3 14h18M10 3v18M14 3v18M3 6a1 1 0 011-1h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6z' },
                  ].map(({ mode, label, icon }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      title={label}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        viewMode === mode ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={exportCSV}
                  className="text-xs text-brand-700 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>
            {/* Search + filter */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="search" placeholder="Search employee…" value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                className="w-44 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                <input type="checkbox" checked={filterOT} onChange={e => setFilterOT(e.target.checked)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-400" />
                With OT only
              </label>
              {(tableSearch || filterOT) && (
                <button onClick={() => { setTableSearch(''); setFilterOT(false) }}
                  className="text-xs text-red-400 hover:text-red-600 hover:underline">Clear</button>
              )}
              <span className="ml-auto text-xs text-gray-400">
                {fieldItems.length} worker{fieldItems.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* ── Table view ── */}
          {viewMode === 'table' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase bg-gray-50 border-b border-gray-200">
                  <PTh field="lastName"    sort={sortField} dir={sortDir} onSort={toggleSort} className="text-left px-4 py-3">Employee</PTh>
                  <PTh field="daysPresent" sort={sortField} dir={sortDir} onSort={toggleSort} className="text-right px-3 py-3 whitespace-nowrap">Reg Hrs</PTh>
                  <PTh field="otHours"     sort={sortField} dir={sortDir} onSort={toggleSort} className="text-right px-3 py-3 whitespace-nowrap">OT Hrs</PTh>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Reg Pay</th>
                  <th className="text-right px-3 py-3 font-medium text-gray-500 whitespace-nowrap">OT Pay</th>
                  <PTh field="grossPay"    sort={sortField} dir={sortDir} onSort={toggleSort} className="text-right px-4 py-3 whitespace-nowrap">Gross Pay</PTh>
                  {showGov && <>
                    <th className="text-right px-3 py-3 font-medium text-gray-500 whitespace-nowrap">SSS EE</th>
                    <th className="text-right px-3 py-3 font-medium text-gray-500 whitespace-nowrap">PhilHlth</th>
                    <th className="text-right px-3 py-3 font-medium text-gray-500 whitespace-nowrap">Pag-IBIG</th>
                    <th className="text-right px-3 py-3 font-medium text-gray-500 whitespace-nowrap">ECC</th>
                  </>}
                  <th className="text-right px-3 py-3 font-medium text-gray-500 whitespace-nowrap">Other Ded</th>
                  <PTh field="netPay"      sort={sortField} dir={sortDir} onSort={toggleSort} className="text-right px-4 py-3 whitespace-nowrap">Net Pay</PTh>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fieldItems.map(item => {
                  const emp      = empById[item.employeeId]
                  const isHourly = emp?.salaryType === 'hourly'
                  const regHrs   = isHourly ? item.totalHoursWorked : item.daysPresent * 8
                  return (
                    <tr key={item.employeeId} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-gray-800 whitespace-nowrap">{emp?.lastName}, {emp?.firstName}</div>
                        <span className={`text-xs font-medium ${isHourly ? 'text-purple-600' : 'text-amber-600'}`}>
                          {isHourly ? `₱${emp?.basicSalary}/hr` : `₱${emp?.basicSalary}/day`}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-600 font-mono text-xs">{regHrs}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs">
                        {item.totalOTHours > 0 ? <span className="text-amber-600 font-semibold">{item.totalOTHours}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-gray-700">{formatPHP(item.basicPay)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs">
                        {item.otPay > 0 ? <span className="text-amber-600">{formatPHP(item.otPay)}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-medium text-gray-800">{formatPHP(item.grossPay)}</td>
                      {showGov && <>
                        <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-500">{formatPHP(item.sss)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-500">{formatPHP(item.philhealth)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-500">{formatPHP(item.pagibig)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-500">{formatPHP(item.ecc)}</td>
                      </>}
                      <td className="px-3 py-2.5 text-right font-mono text-xs">
                        {item.otherDeductions > 0 ? <span className="text-orange-600">{formatPHP(item.otherDeductions)}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-brand-700">{formatPHP(item.netPay)}</td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => setPayslipEmp(item)} className="text-xs text-brand-700 hover:underline">Payslip</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200 text-xs font-semibold text-gray-700">
                  <td className="px-4 py-2.5" colSpan={3}>TOTAL ({fieldItems.length} employees)</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatPHP(totalRegPay)}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{totalOTPay > 0 ? formatPHP(totalOTPay) : '—'}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatPHP(totalGross)}</td>
                  {showGov && <>
                    <td className="px-3 py-2.5 text-right font-mono">{formatPHP(totalSSS)}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{formatPHP(totalPH)}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{formatPHP(totalPI)}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{formatPHP(totalECC)}</td>
                  </>}
                  <td className="px-3 py-2.5 text-right font-mono">{totalOtherD > 0 ? formatPHP(totalOtherD) : '—'}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-brand-700">{formatPHP(totalNet)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* ── Sheet view ── */}
          {viewMode === 'sheet' && (
            <table className="w-max min-w-full text-xs border-collapse">
              <thead>
                {/* Group header */}
                <tr className="bg-brand-800 text-white">
                  <th rowSpan={2} className="sticky left-0 z-20 bg-brand-800 px-4 py-3 text-left font-semibold border-r border-brand-700 min-w-[180px] whitespace-nowrap align-bottom">
                    Employee
                  </th>
                  <th colSpan={4} className="px-3 py-1.5 text-center font-semibold border-r border-b border-brand-700 text-brand-200 text-[10px] tracking-widest uppercase">
                    Attendance
                  </th>
                  <th colSpan={3} className="px-3 py-1.5 text-center font-semibold border-r border-b border-brand-700 text-brand-200 text-[10px] tracking-widest uppercase">
                    Earnings
                  </th>
                  {showGov && (
                    <th colSpan={5} className="px-3 py-1.5 text-center font-semibold border-r border-b border-brand-700 text-brand-200 text-[10px] tracking-widest uppercase">
                      Gov't Deductions
                    </th>
                  )}
                  <th colSpan={2} className="px-3 py-1.5 text-center font-semibold border-r border-b border-brand-700 text-brand-200 text-[10px] tracking-widest uppercase">
                    Other Ded
                  </th>
                  <th rowSpan={2} className="px-4 py-3 text-center font-bold border-l border-brand-600 min-w-[100px] align-bottom">
                    Net Pay
                  </th>
                  <th rowSpan={2} className="px-3 py-3 border-l border-brand-700 align-bottom" />
                </tr>
                {/* Sub-header */}
                <tr className="bg-brand-700 text-brand-100 text-[10px]">
                  <ShHd>Days</ShHd>
                  <ShHd>Absent</ShHd>
                  <ShHd>Late(m)</ShHd>
                  <ShHd>OT Hrs</ShHd>
                  <ShHd>Reg Pay</ShHd>
                  <ShHd>OT Pay</ShHd>
                  <ShHd>Gross</ShHd>
                  {showGov && <>
                    <ShHd>SSS</ShHd>
                    <ShHd>PhilHlth</ShHd>
                    <ShHd>Pag-IBIG</ShHd>
                    <ShHd>ECC</ShHd>
                    <ShHd>Total Gov</ShHd>
                  </>}
                  <ShHd>Other</ShHd>
                  <ShHd right>Total Ded</ShHd>
                </tr>
              </thead>

              <tbody>
                {fieldItems.map((item, ri) => {
                  const emp      = empById[item.employeeId]
                  const isHourly = emp?.salaryType === 'hourly'
                  const regAmt   = isHourly ? item.totalHoursWorked : item.daysPresent
                  const totalDed = item.totalGovDeductions + item.otherDeductions
                  const even     = ri % 2 === 0
                  return (
                    <tr key={item.employeeId} className={even ? 'bg-white' : 'bg-gray-50/60'}>
                      <td className={`sticky left-0 z-10 px-4 py-2 border-r border-b border-gray-200 whitespace-nowrap ${even ? 'bg-white' : 'bg-gray-50'}`}>
                        <div className="font-medium text-gray-800">{emp?.lastName}, {emp?.firstName}</div>
                        <div className="text-[10px] text-amber-600 font-medium">
                          ₱{emp?.basicSalary}/{isHourly ? 'hr' : 'day'}
                        </div>
                      </td>
                      <ShTd>{regAmt}</ShTd>
                      <ShTd className={item.daysAbsent > 0 ? 'text-red-500 font-semibold' : ''}>{item.daysAbsent || '—'}</ShTd>
                      <ShTd className={item.totalLateMinutes > 0 ? 'text-amber-600' : ''}>{item.totalLateMinutes || '—'}</ShTd>
                      <ShTd className={item.totalOTHours > 0 ? 'text-amber-600 font-semibold' : ''}>{item.totalOTHours || '—'}</ShTd>
                      <ShTd mono>{formatPHP(item.basicPay)}</ShTd>
                      <ShTd mono className={item.otPay > 0 ? 'text-amber-600' : ''}>{item.otPay > 0 ? formatPHP(item.otPay) : '—'}</ShTd>
                      <ShTd mono className="font-semibold text-gray-800">{formatPHP(item.grossPay)}</ShTd>
                      {showGov && <>
                        <ShTd mono className="text-gray-500">{formatPHP(item.sss)}</ShTd>
                        <ShTd mono className="text-gray-500">{formatPHP(item.philhealth)}</ShTd>
                        <ShTd mono className="text-gray-500">{formatPHP(item.pagibig)}</ShTd>
                        <ShTd mono className="text-gray-500">{formatPHP(item.ecc)}</ShTd>
                        <ShTd mono className="text-red-400 font-semibold">{formatPHP(item.totalGovDeductions)}</ShTd>
                      </>}
                      <ShTd mono className={item.otherDeductions > 0 ? 'text-orange-600' : ''}>{item.otherDeductions > 0 ? formatPHP(item.otherDeductions) : '—'}</ShTd>
                      <ShTd mono className="text-red-400">{totalDed > 0 ? formatPHP(totalDed) : '—'}</ShTd>
                      <td className={`px-4 py-2 text-right border-l-2 border-b border-brand-200 font-bold font-mono text-brand-700 whitespace-nowrap ${even ? 'bg-brand-50/30' : 'bg-brand-50/60'}`}>
                        {formatPHP(item.netPay)}
                      </td>
                      <td className={`px-2 py-2 border-l border-b border-gray-100 ${even ? 'bg-white' : 'bg-gray-50'}`}>
                        <button onClick={() => setPayslipEmp(item)} className="text-[10px] text-brand-500 hover:text-brand-700 hover:underline whitespace-nowrap">Payslip</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>

              <tfoot>
                <tr className="bg-brand-800 text-white text-xs font-bold">
                  <td className="sticky left-0 z-10 bg-brand-800 px-4 py-2.5 border-r border-brand-700 whitespace-nowrap">
                    TOTAL ({fieldItems.length})
                  </td>
                  {/* Attendance totals */}
                  <ShFt>{fieldItems.reduce((s,i)=>s+(empById[i.employeeId]?.salaryType==='hourly'?i.totalHoursWorked:i.daysPresent),0)}</ShFt>
                  <ShFt>{fieldItems.reduce((s,i)=>s+i.daysAbsent,0)||'—'}</ShFt>
                  <ShFt>{fieldItems.reduce((s,i)=>s+i.totalLateMinutes,0)||'—'}</ShFt>
                  <ShFt>{fieldItems.reduce((s,i)=>s+i.totalOTHours,0)||'—'}</ShFt>
                  {/* Earnings totals */}
                  <ShFt mono>{formatPHP(totalRegPay)}</ShFt>
                  <ShFt mono>{totalOTPay>0?formatPHP(totalOTPay):'—'}</ShFt>
                  <ShFt mono>{formatPHP(totalGross)}</ShFt>
                  {/* Gov totals */}
                  {showGov && <>
                    <ShFt mono>{formatPHP(totalSSS)}</ShFt>
                    <ShFt mono>{formatPHP(totalPH)}</ShFt>
                    <ShFt mono>{formatPHP(totalPI)}</ShFt>
                    <ShFt mono>{formatPHP(totalECC)}</ShFt>
                    <ShFt mono>{formatPHP(totalSSS+totalPH+totalPI+totalECC)}</ShFt>
                  </>}
                  {/* Other ded totals */}
                  <ShFt mono>{totalOtherD>0?formatPHP(totalOtherD):'—'}</ShFt>
                  <ShFt mono>{formatPHP(totalSSS+totalPH+totalPI+totalECC+totalOtherD)}</ShFt>
                  {/* Net pay total */}
                  <td className="px-4 py-2.5 text-right font-mono border-l-2 border-brand-600 text-brand-200 whitespace-nowrap">
                    {formatPHP(totalNet)}
                  </td>
                  <td className="border-l border-brand-700" />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      ) : !state.payrollLoading && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-sm text-gray-500 font-medium mb-1">
            {selected.label} — Not yet generated
          </div>
          <div className="text-xs text-gray-400">
            {!isWeeklyTab && selected.cutoff === 'B' && !periodAExists
              ? 'Generate the 1st half payroll first, then come back to generate this.'
              : `Adjust coverage dates if needed, then click "Generate Payroll".`}
          </div>
        </div>
      )}

      {payslipEmp && (
        <PayslipModal
          item={payslipEmp}
          employee={empById[payslipEmp.employeeId]}
          period={{ ...selected, covStart: activeCovStart, covEnd: activeCovEnd, payDate: activePayDate }}
          onClose={() => setPayslipEmp(null)}
        />
      )}
    </div>
  )
}

function PTh({ field, sort, dir, onSort, children, className = '' }) {
  const active = sort === field
  return (
    <th
      className={`font-medium cursor-pointer select-none whitespace-nowrap ${
        active ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'
      } ${className}`}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <span className="text-[10px] leading-none">
          {active ? (dir === 'asc' ? '▲' : '▼') : <span className="text-gray-300">⇅</span>}
        </span>
      </span>
    </th>
  )
}

function PayslipModal({ item, employee, period, onClose }) {
  const isHourly = employee?.salaryType === 'hourly'
  const showGov  = period.cutoff !== 'A'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md my-8 shadow-2xl print:shadow-none">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 print:hidden">
          <h3 className="font-semibold text-gray-800">Payslip</h3>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">Print</button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="text-center pb-3 border-b border-gray-100">
            <div className="font-bold text-gray-900">Crop Saver Philippines Corporation</div>
            <div className="text-xs text-gray-500 mt-0.5">PAYSLIP — {period.label?.toUpperCase()}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              Coverage: {period.covStart} to {period.covEnd} · Date Released: {period.payDate}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-1 text-sm">
            <Row label="Employee"  value={`${employee?.lastName}, ${employee?.firstName}`} />
            <Row label="ID"        value={employee?.id} />
            <Row label="Position"  value={employee?.position} />
            <Row label="Pay Type"  value={isHourly ? `Hourly @ ₱${employee?.basicSalary}/hr` : `Daily @ ₱${employee?.basicSalary}/day`} />
          </div>

          <div>
            <SectionHead>Attendance</SectionHead>
            <div className="space-y-1 text-sm">
              {isHourly
                ? <Row label="Regular Hours" value={`${item.totalHoursWorked} hrs`} />
                : <>
                    <Row label="Days Present" value={item.daysPresent} />
                    <Row label="Days Absent"  value={item.daysAbsent} />
                    {item.daysLate > 0 && <Row label="Days Late" value={item.daysLate} />}
                    {item.totalOTHours > 0 && <Row label="OT Hours" value={`${item.totalOTHours} hrs`} />}
                  </>
              }
            </div>
          </div>

          <div>
            <SectionHead>Earnings</SectionHead>
            <div className="space-y-1 text-sm">
              <Row label={isHourly ? 'Regular Hours Pay' : 'Regular Days Pay'} value={formatPHP(item.basicPay)} mono />
              {item.otPay > 0 && <Row label="OT Pay (1.25×)" value={formatPHP(item.otPay)} mono />}
              {item.lateDeduction > 0 && <Row label="Late Deduction" value={`(${formatPHP(item.lateDeduction)})`} mono negative />}
              {item.undertimeDeduction > 0 && <Row label="Undertime Deduction" value={`(${formatPHP(item.undertimeDeduction)})`} mono negative />}
              <div className="flex justify-between pt-1 border-t border-gray-100 font-semibold text-sm">
                <span>Gross Pay</span>
                <span className="font-mono">{formatPHP(item.grossPay)}</span>
              </div>
            </div>
          </div>

          {showGov ? (
            <div>
              <SectionHead>Gov't Contributions (Employee Share)</SectionHead>
              <div className="space-y-1 text-sm">
                <Row label="SSS"         value={formatPHP(item.sss)}        mono negative />
                <Row label="PhilHealth"  value={formatPHP(item.philhealth)} mono negative />
                <Row label="Pag-IBIG"    value={formatPHP(item.pagibig)}    mono negative />
                <Row label="ECC"         value={formatPHP(item.ecc)}        mono negative />
                <div className="flex justify-between pt-1 border-t border-gray-100 text-xs text-gray-500">
                  <span>Total Gov't Deductions</span>
                  <span className="font-mono">{formatPHP(item.totalGovDeductions)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-3 py-2 bg-amber-50 rounded-lg text-xs text-amber-700">
              SSS, PhilHealth, Pag-IBIG, and ECC will be deducted on the <strong>2nd half (30th) payroll</strong>.
            </div>
          )}

          {item.otherDeductions > 0 && (
            <div>
              <SectionHead>Other Deductions</SectionHead>
              <div className="space-y-1 text-sm">
                {item.savings     > 0 && <Row label="Savings"       value={formatPHP(item.savings)}     mono negative />}
                {item.insurance   > 0 && <Row label="Insurance"     value={formatPHP(item.insurance)}   mono negative />}
                {item.bankCharges > 0 && <Row label="Bank Charges"  value={formatPHP(item.bankCharges)} mono negative />}
              </div>
            </div>
          )}

          <div className="bg-brand-950 rounded-xl px-5 py-4 text-white flex justify-between items-center">
            <span className="font-semibold">NET PAY</span>
            <span className="text-xl font-bold font-mono">{formatPHP(item.netPay)}</span>
          </div>

          {showGov && (
            <div className="bg-gray-50 rounded-xl p-4">
              <SectionHead muted>Employer Contributions (reference)</SectionHead>
              <div className="space-y-1 text-sm">
                <Row label="SSS (ER)"        value={formatPHP(item.sssER)}           mono />
                <Row label="PhilHealth (ER)" value={formatPHP(item.philhealthER)}     mono />
                <Row label="Pag-IBIG (ER)"   value={formatPHP(item.pagibigER)}        mono />
                <Row label="13th Month"      value={formatPHP(item.thirteenthAccrual)} mono />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionHead({ children, muted }) {
  return (
    <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${muted ? 'text-gray-400' : 'text-gray-500'}`}>
      {children}
    </div>
  )
}

function Row({ label, value, mono, negative }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-gray-500">{label}</span>
      <span className={`${mono ? 'font-mono' : ''} ${negative ? 'text-red-500' : 'text-gray-800'}`}>{value}</span>
    </div>
  )
}

function ShHd({ children, right }) {
  return (
    <th className={`px-3 py-2 font-medium border-r border-brand-600 whitespace-nowrap ${right ? 'text-right' : 'text-center'}`}>
      {children}
    </th>
  )
}

function ShTd({ children, mono, className = '' }) {
  return (
    <td className={`px-3 py-2 text-right border-r border-b border-gray-100 whitespace-nowrap ${mono ? 'font-mono' : ''} ${className}`}>
      {children}
    </td>
  )
}

function ShFt({ children, mono }) {
  return (
    <td className={`px-3 py-2.5 text-right border-r border-brand-700 whitespace-nowrap text-brand-100 ${mono ? 'font-mono' : ''}`}>
      {children}
    </td>
  )
}
