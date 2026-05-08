import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { today, fmtTime } from '../../utils/payroll'

export default function Attendance() {
  const { state, dispatch } = useApp()

  // View mode
  const [viewMode, setViewMode] = useState('list') // 'list' | 'sheet'

  // List-view state
  const [date, setDate]   = useState(today())
  const [modal, setModal] = useState(null)

  // Sheet-view state
  const todayStr = today()
  const [sheetMonth, setSheetMonth] = useState(todayStr.slice(0, 7)) // 'YYYY-MM'

  // Shared sort + filter
  const [sortField, setSortField]       = useState('lastName')
  const [sortDir, setSortDir]           = useState('asc')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType]     = useState('')

  const cid       = state.selectedCompanyId
  const activeEmp = state.employees.filter(e => e.status === 'active' && (!cid || e.companyId === cid))

  // List-view derived
  const dayRecs  = state.attendance.filter(r => r.date === date)
  const recByEmp = Object.fromEntries(dayRecs.map(r => [r.employeeId, r]))

  const present = dayRecs.filter(r => r.status === 'present').length
  const late    = dayRecs.filter(r => r.status === 'late').length
  const absent  = dayRecs.filter(r => r.status === 'absent').length

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  // List-view sorted+filtered employees
  const displayEmp = useMemo(() => {
    const list = activeEmp.filter(emp => {
      const rec = recByEmp[emp.id]
      if (filterType   && emp.salaryType !== filterType) return false
      if (filterStatus) {
        if (filterStatus === 'none' && rec)              return false
        if (filterStatus !== 'none' && (!rec || rec.status !== filterStatus)) return false
      }
      return true
    })
    return list.slice().sort((a, b) => {
      const ra = recByEmp[a.id], rb = recByEmp[b.id]
      let va, vb
      if      (sortField === 'lastName')    { va = a.lastName;               vb = b.lastName }
      else if (sortField === 'status')      { va = ra?.status ?? 'zzz';      vb = rb?.status ?? 'zzz' }
      else if (sortField === 'hoursWorked') { va = ra?.hoursWorked ?? -1;    vb = rb?.hoursWorked ?? -1 }
      else if (sortField === 'lateMinutes') { va = ra?.lateMinutes ?? 0;     vb = rb?.lateMinutes ?? 0 }
      else                                  { va = a.lastName;               vb = b.lastName }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })
  }, [activeEmp, recByEmp, filterStatus, filterType, sortField, sortDir])

  // ── Sheet-view data ───────────────────────────────────────
  const [sheetYear, sheetMonthNum] = sheetMonth.split('-').map(Number)
  const daysInMonth = new Date(sheetYear, sheetMonthNum, 0).getDate()

  const monthDays = useMemo(() => {
    const days = []
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(sheetYear, sheetMonthNum - 1, d))
    }
    return days
  }, [sheetYear, sheetMonthNum, daysInMonth])

  // attendance lookup for sheet view: empId → dateStr → record
  const sheetRecs = useMemo(() => {
    const prefix = sheetMonth + '-'
    const map = {}
    state.attendance.filter(r => r.date.startsWith(prefix)).forEach(r => {
      if (!map[r.employeeId]) map[r.employeeId] = {}
      map[r.employeeId][r.date] = r
    })
    return map
  }, [state.attendance, sheetMonth])

  // Sheet employees: name-sorted, filtered by pay type
  const sheetEmp = useMemo(() => {
    return activeEmp
      .filter(e => !filterType || e.salaryType === filterType)
      .slice()
      .sort((a, b) => a.lastName.localeCompare(b.lastName))
  }, [activeEmp, filterType])

  function isRestDayForEmp(emp, dateObj) {
    const dow = dateObj.getDay() // 0=Sun,6=Sat
    return dow === 0 || (emp.payFrequency !== 'weekly' && dow === 6)
  }

  function cellCode(rec, isRest, isFuture) {
    if (isRest)   return 'W'
    if (isFuture) return ''
    if (!rec)     return ''
    if (rec.status === 'absent')  return 'A'
    if (rec.status === 'late')    return 'L'
    if (rec.status === 'present') return 'P'
    return rec.status.slice(0, 2).toUpperCase()
  }

  function cellClass(rec, isRest, isFuture, dateStr) {
    if (isRest)   return 'bg-gray-100 text-gray-400'
    if (isFuture || dateStr > todayStr) return 'bg-white text-gray-200'
    if (!rec)     return 'bg-white text-gray-300'
    if (rec.status === 'absent')  return 'bg-red-50 text-red-500 font-bold'
    if (rec.status === 'late')    return 'bg-amber-50 text-amber-600 font-bold'
    if (rec.status === 'present') return 'bg-green-50 text-green-600 font-bold'
    return 'bg-blue-50 text-blue-500 font-bold'
  }

  // Per-day totals for sheet footer
  const dayTotals = useMemo(() => monthDays.map(d => {
    const ds = d.toISOString().slice(0, 10)
    let p = 0, l = 0, a = 0
    sheetEmp.forEach(emp => {
      const rec = sheetRecs[emp.id]?.[ds]
      if (!rec) return
      if (rec.status === 'present') p++
      else if (rec.status === 'late') l++
      else if (rec.status === 'absent') a++
    })
    return { p, l, a }
  }), [monthDays, sheetEmp, sheetRecs])

  const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const monthName = new Date(sheetYear, sheetMonthNum - 1, 1)
    .toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Date / Month picker */}
        <div className="flex items-center gap-3">
          {viewMode === 'list' ? (
            <>
              <label className="text-sm font-medium text-gray-700">Date:</label>
              <input
                type="date" value={date}
                onChange={e => setDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </>
          ) : (
            <>
              <label className="text-sm font-medium text-gray-700">Month:</label>
              <input
                type="month" value={sheetMonth}
                onChange={e => setSheetMonth(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Summary pills (list view only) */}
          {viewMode === 'list' && (
            <div className="flex gap-4 text-sm">
              <span className="text-green-700 font-medium">{present} Present</span>
              <span className="text-amber-600 font-medium">{late} Late</span>
              <span className="text-red-600 font-medium">{absent} Absent</span>
              <span className="text-gray-400">{activeEmp.length - dayRecs.length} No record</span>
            </div>
          )}

          {/* View toggle */}
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {[
              { mode: 'list',  label: 'List',  icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
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
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-400 font-medium">Filter:</span>

        {viewMode === 'list' && (
          <select
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-400"
          >
            <option value="">All statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="none">No record</option>
          </select>
        )}

        <select
          value={filterType} onChange={e => setFilterType(e.target.value)}
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-400"
        >
          <option value="">All pay types</option>
          <option value="monthly">Monthly</option>
          <option value="daily">Daily</option>
          <option value="hourly">Hourly</option>
        </select>

        {(filterStatus || filterType) && (
          <button onClick={() => { setFilterStatus(''); setFilterType('') }}
            className="text-xs text-red-400 hover:text-red-600 hover:underline">
            Clear
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400">
          {viewMode === 'list' ? `${displayEmp.length} of ${activeEmp.length}` : `${sheetEmp.length}`} employees
        </span>
      </div>

      {/* ── List view ── */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <Th field="lastName"    sort={sortField} dir={sortDir} onSort={toggleSort} className="px-4 py-3">Employee</Th>
                <th className="text-left px-4 py-3 font-medium">Pay Type</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Time In</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Time Out</th>
                <Th field="hoursWorked" sort={sortField} dir={sortDir} onSort={toggleSort} className="px-4 py-3 whitespace-nowrap">Hours</Th>
                <Th field="lateMinutes" sort={sortField} dir={sortDir} onSort={toggleSort} className="px-4 py-3 whitespace-nowrap">Late (min)</Th>
                <Th field="status"      sort={sortField} dir={sortDir} onSort={toggleSort} className="px-4 py-3">Status</Th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayEmp.map(emp => {
                const rec      = recByEmp[emp.id]
                const isHourly = emp.salaryType === 'hourly'
                return (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</div>
                      <div className="text-xs text-gray-400">{emp.position}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        emp.salaryType === 'monthly' ? 'bg-blue-50 text-blue-600' :
                        emp.salaryType === 'daily'   ? 'bg-amber-50 text-amber-600' :
                                                       'bg-purple-50 text-purple-600'
                      }`}>
                        {emp.salaryType === 'monthly' ? 'Monthly' : emp.salaryType === 'daily' ? 'Daily' : 'Hourly'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-gray-600">{rec?.timeIn  ? fmtTime(rec.timeIn)  : '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-gray-600">{rec?.timeOut ? fmtTime(rec.timeOut) : '—'}</td>
                    <td className="px-4 py-2.5 text-gray-600">
                      {isHourly && rec?.hoursWorked != null
                        ? <span className="font-medium text-purple-700">{rec.hoursWorked}h</span>
                        : rec?.hoursWorked != null ? <span className="text-gray-400">{rec.hoursWorked}h</span>
                        : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{rec?.lateMinutes || '—'}</td>
                    <td className="px-4 py-2.5">
                      {rec ? <StatusBadge status={rec.status} /> : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => setModal({ employee: emp, existing: rec ?? null })}
                        className="text-xs text-brand-700 hover:underline">
                        {rec ? 'Edit' : 'Log'}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {displayEmp.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No employees match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Sheet view ── */}
      {viewMode === 'sheet' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          {/* Month title */}
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">
              Attendance Sheet — {monthName}
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-100 inline-block"/>P = Present</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-100 inline-block"/>L = Late</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-100 inline-block"/>A = Absent</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-100 inline-block"/>W = Rest</span>
            </div>
          </div>

          <table className="text-xs border-collapse w-max min-w-full">
            <thead>
              {/* Day numbers row */}
              <tr className="bg-brand-800 text-white">
                <th className="sticky left-0 z-20 bg-brand-800 px-4 py-2 text-left font-semibold border-r border-brand-700 min-w-[180px] whitespace-nowrap">
                  Employee
                </th>
                {monthDays.map(d => {
                  const dow    = d.getDay()
                  const isWeek = dow === 0 || dow === 6
                  return (
                    <th
                      key={d.getDate()}
                      className={`w-8 min-w-[32px] py-2 text-center font-bold border-r border-brand-700 ${
                        isWeek ? 'bg-brand-900/60' : ''
                      }`}
                    >
                      {d.getDate()}
                    </th>
                  )
                })}
                <th className="px-3 py-2 text-center font-semibold border-l border-brand-700 whitespace-nowrap bg-brand-800 min-w-[80px]">Summary</th>
              </tr>
              {/* Day-of-week row */}
              <tr className="bg-brand-700/90 text-brand-100 text-[10px]">
                <th className="sticky left-0 z-20 bg-brand-700 px-4 py-1 text-left border-r border-brand-600 font-medium">
                  {sheetEmp.length} employee{sheetEmp.length !== 1 ? 's' : ''}
                </th>
                {monthDays.map(d => {
                  const dow    = d.getDay()
                  const isWeek = dow === 0 || dow === 6
                  return (
                    <th
                      key={d.getDate()}
                      className={`w-8 py-1 text-center border-r border-brand-600 font-normal ${
                        isWeek ? 'bg-brand-800/60 text-brand-300' : ''
                      }`}
                    >
                      {DOW[dow]}
                    </th>
                  )
                })}
                <th className="px-3 py-1 border-l border-brand-600 bg-brand-700" />
              </tr>
            </thead>

            <tbody>
              {sheetEmp.map((emp, ri) => {
                const empRecs    = sheetRecs[emp.id] ?? {}
                let pCount = 0, lCount = 0, aCount = 0
                monthDays.forEach(d => {
                  const ds  = d.toISOString().slice(0, 10)
                  const rec = empRecs[ds]
                  if (!rec) return
                  if (rec.status === 'present') pCount++
                  else if (rec.status === 'late') lCount++
                  else if (rec.status === 'absent') aCount++
                })
                return (
                  <tr key={emp.id} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                    <td className={`sticky left-0 z-10 px-4 py-2 border-r border-b border-gray-200 whitespace-nowrap ${
                      ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}>
                      <div className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</div>
                      <div className="text-[10px] text-gray-400">{emp.position}</div>
                    </td>

                    {monthDays.map(d => {
                      const ds     = d.toISOString().slice(0, 10)
                      const rec    = empRecs[ds]
                      const isRest = isRestDayForEmp(emp, d)
                      const code   = cellCode(rec, isRest, ds > todayStr)
                      return (
                        <td
                          key={ds}
                          title={ds + (rec ? ` · ${rec.status}${rec.timeIn ? ` · ${rec.timeIn}–${rec.timeOut}` : ''}` : isRest ? ' · Rest day' : ' · No record')}
                          onClick={() => !isRest && setModal({ employee: emp, existing: rec ?? null, overrideDate: ds })}
                          className={`w-8 min-w-[32px] py-2 text-center border-r border-b border-gray-100 cursor-pointer hover:brightness-95 transition-all text-[11px] leading-none ${cellClass(rec, isRest, false, ds)}`}
                        >
                          {code}
                        </td>
                      )
                    })}

                    {/* Row summary */}
                    <td className="px-3 py-2 border-l border-b border-gray-200 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[10px]">
                        {pCount > 0 && <span className="text-green-600 font-semibold">{pCount}P</span>}
                        {lCount > 0 && <span className="text-amber-600 font-semibold">{lCount}L</span>}
                        {aCount > 0 && <span className="text-red-500 font-semibold">{aCount}A</span>}
                        {pCount === 0 && lCount === 0 && aCount === 0 && <span className="text-gray-300">—</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {sheetEmp.length === 0 && (
                <tr>
                  <td colSpan={daysInMonth + 2} className="px-4 py-10 text-center text-gray-400">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Per-day totals footer */}
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200 text-[10px]">
                <td className="sticky left-0 z-10 bg-gray-50 px-4 py-2 border-r border-gray-200 font-semibold text-gray-600">
                  Daily Totals
                </td>
                {dayTotals.map((t, i) => {
                  const d      = monthDays[i]
                  const dow    = d.getDay()
                  const isWeek = dow === 0 || dow === 6
                  return (
                    <td key={i} className={`w-8 py-2 text-center border-r border-gray-200 ${isWeek ? 'bg-gray-100' : ''}`}>
                      {!isWeek && (t.p + t.l + t.a > 0) ? (
                        <div className="flex flex-col items-center leading-tight gap-px">
                          {t.p > 0 && <span className="text-green-600 font-semibold">{t.p}</span>}
                          {t.l > 0 && <span className="text-amber-600">{t.l}</span>}
                          {t.a > 0 && <span className="text-red-500">{t.a}</span>}
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                  )
                })}
                <td className="border-l border-gray-200 px-3 py-2" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Attendance log modal — works for both views */}
      {modal && (
        <AttendanceModal
          date={modal.overrideDate ?? date}
          employee={modal.employee}
          existing={modal.existing}
          onSave={record => {
            dispatch({ type: 'UPSERT_ATTENDANCE', records: [record] })
            setModal(null)
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────
function Th({ field, sort, dir, onSort, children, className = '' }) {
  const active = sort === field
  return (
    <th
      className={`text-left font-medium whitespace-nowrap cursor-pointer select-none ${
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

function AttendanceModal({ date, employee, existing, onSave, onClose }) {
  const isHourly = employee.salaryType === 'hourly'
  const isDaily  = employee.salaryType === 'daily'
  const [status, setStatus]     = useState(existing?.status ?? 'present')
  const [timeIn, setTimeIn]     = useState(existing?.timeIn ?? '08:00')
  const [timeOut, setTimeOut]   = useState(existing?.timeOut ?? '17:00')
  const [lateMin, setLateMin]   = useState(existing?.lateMinutes ?? 0)
  const [utMin, setUtMin]       = useState(existing?.undertimeMinutes ?? 0)
  const [hoursWorked, setHours] = useState(existing?.hoursWorked ?? 8)
  const [otHours, setOTHours]   = useState(existing?.otHours ?? 0)

  function handleSave() {
    onSave({
      employeeId: employee.id,
      date,
      status,
      timeIn:           status === 'absent' ? null : timeIn,
      timeOut:          status === 'absent' ? null : timeOut,
      lateMinutes:      status === 'late'   ? Number(lateMin) : 0,
      undertimeMinutes: status !== 'absent' ? Number(utMin)   : 0,
      hoursWorked:      status === 'absent' ? 0 : Number(hoursWorked),
      otHours:          status === 'absent' ? 0 : Number(otHours),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Log Attendance</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <div className="font-medium text-gray-800">{employee.firstName} {employee.lastName}</div>
            <div className="text-xs text-gray-400">{employee.position} · {date}</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
            <div className="flex gap-2">
              {['present', 'late', 'absent'].map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    status === s
                      ? s === 'present' ? 'bg-green-600 text-white'
                        : s === 'late'  ? 'bg-amber-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          {status !== 'absent' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Time In</label>
                <input type="time" value={timeIn} onChange={e => setTimeIn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Time Out</label>
                <input type="time" value={timeOut} onChange={e => setTimeOut(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className={isHourly ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Hours Worked {isHourly && <span className="text-purple-600 font-semibold">(used for pay)</span>}
                </label>
                <input type="number" value={hoursWorked} min={0.5} max={12} step={0.5}
                  onChange={e => setHours(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              {!isHourly && status === 'late' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Late (minutes)</label>
                  <input type="number" value={lateMin} min={1} onChange={e => setLateMin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              )}
              {!isHourly && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Undertime (min)</label>
                  <input type="number" value={utMin} min={0} onChange={e => setUtMin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              )}
              {isDaily && (
                <div>
                  <label className="block text-xs font-medium text-amber-700 mb-1">
                    OT Hours <span className="font-normal text-gray-400">(1.25× rate)</span>
                  </label>
                  <input type="number" value={otHours} min={0} max={4} step={0.5}
                    onChange={e => setOTHours(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 bg-amber-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-brand-700 hover:bg-brand-600 text-white rounded-lg transition-colors">Save</button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = { present: 'bg-green-100 text-green-700', late: 'bg-amber-100 text-amber-700', absent: 'bg-red-100 text-red-700' }
  return <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${map[status] ?? ''}`}>{status}</span>
}
