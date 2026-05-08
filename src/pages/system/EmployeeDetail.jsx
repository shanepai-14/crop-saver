import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { formatPHP } from '../../utils/payroll'

const TABS = [
  { id: 'activity',  label: 'Attendance Activity' },
  { id: 'details',   label: 'Details' },
  { id: 'documents', label: 'Documents' },
]

export default function EmployeeDetail() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState('activity')
  const [hovered, setHovered] = useState(null)
  const photoRef = useRef(null)
  const docRef   = useRef(null)

  const employee = state.employees.find(e => e.id === id)
  const companyById = Object.fromEntries((state.companies ?? []).map(c => [c.id, c]))

  if (!employee) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm">Employee not found.</p>
        <Link to="/employees" className="mt-3 inline-block text-brand-700 text-sm hover:underline">
          ← Back to Employees
        </Link>
      </div>
    )
  }

  const company = companyById[employee.companyId]
  const isAdmin = ['admin', 'hr'].includes(state.currentUser?.role)
  const initials = `${employee.firstName?.[0] ?? '?'}${employee.lastName?.[0] ?? ''}`.toUpperCase()

  // ── Photo upload ──────────────────────────────────────────
  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => dispatch({ type: 'SET_EMPLOYEE_PHOTO', id: employee.id, photo: ev.target.result })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ── Document upload ───────────────────────────────────────
  function handleDocUpload(e) {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => dispatch({
        type: 'ADD_EMPLOYEE_ATTACHMENT',
        id: employee.id,
        attachment: {
          id: `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          data: ev.target.result,
        },
      })
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  // ── Heatmap data ──────────────────────────────────────────
  const todayStr = new Date().toISOString().slice(0, 10)
  const today    = new Date(todayStr + 'T00:00:00')
  const sixMonthsAgo = new Date(today)
  sixMonthsAgo.setMonth(today.getMonth() - 6)
  const hireDate   = employee.hireDate ? new Date(employee.hireDate + 'T00:00:00') : sixMonthsAgo
  const rangeStart = hireDate > sixMonthsAgo ? hireDate : sixMonthsAgo
  const startMonday = new Date(rangeStart)
  const dow0 = startMonday.getDay()
  startMonday.setDate(startMonday.getDate() - (dow0 === 0 ? 6 : dow0 - 1))

  const attByDate = {}
  state.attendance.filter(r => r.employeeId === id).forEach(r => { attByDate[r.date] = r })

  const isSixDay = employee.payFrequency === 'weekly'
  const weeks = []
  const cursor = new Date(startMonday)
  while (cursor <= today) {
    const week = []
    for (let i = 0; i < 7; i++) {
      const dateStr = cursor.toISOString().slice(0, 10)
      const dayOfWeek = cursor.getDay()
      week.push({
        dateStr,
        dayOfWeek,
        isRestDay: dayOfWeek === 0 || (!isSixDay && dayOfWeek === 6),
        isBeforeHire: employee.hireDate && dateStr < employee.hireDate,
        isFuture: dateStr > todayStr,
        rec: attByDate[dateStr],
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  const monthLabels = {}
  weeks.forEach((week, wi) => {
    const m    = new Date(week[0].dateStr + 'T00:00:00')
    const prev = wi > 0 ? new Date(weeks[wi - 1][0].dateStr + 'T00:00:00') : null
    if (!prev || m.getMonth() !== prev.getMonth() || wi === 0)
      monthLabels[wi] = m.toLocaleDateString('en-PH', { month: 'short' })
  })

  function cellColor(day) {
    if (day.isFuture || day.isBeforeHire) return 'bg-transparent'
    if (day.isRestDay) return 'bg-gray-100'
    if (!day.rec) return 'bg-gray-100'
    if (day.rec.status === 'absent') return 'bg-red-400'
    if (day.rec.status === 'leave')  return 'bg-blue-400'
    return (day.rec.hoursWorked ?? 8) < 5 ? 'bg-lime-400' : 'bg-green-500'
  }

  const empAtt    = state.attendance.filter(r => r.employeeId === id)
  const presentCt = empAtt.filter(r => r.status !== 'absent').length
  const absentCt  = empAtt.filter(r => r.status === 'absent').length
  const lateCt    = empAtt.filter(r => r.status === 'late').length
  const attachments = employee.attachments ?? []

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const GOV_ID_FIELDS = [
    { key: 'sssNo',        label: 'SSS No.' },
    { key: 'philhealthNo', label: 'PhilHealth No.' },
    { key: 'pagibigNo',    label: 'Pag-IBIG No.' },
    { key: 'tinNo',        label: 'TIN' },
  ]
  const missingIds = GOV_ID_FIELDS.filter(f => !employee[f.key])

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Breadcrumb */}
      <Link
        to="/employees"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Employees
      </Link>

      {/* Missing gov't IDs banner */}
      {missingIds.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-800">Government requirements incomplete</p>
            <p className="text-xs text-amber-700 mt-0.5">
              The following IDs have not been submitted yet:
              {' '}<span className="font-medium">{missingIds.map(f => f.label).join(', ')}</span>
            </p>
            {isAdmin && (
              <button
                onClick={() => setTab('details')}
                className="mt-1.5 text-xs font-medium text-amber-700 hover:underline"
              >
                Go to Details tab to update →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Photo */}
          <div className="relative group shrink-0">
            {employee.photo ? (
              <img
                src={employee.photo}
                alt={`${employee.firstName} ${employee.lastName}`}
                className="w-24 h-24 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-100 ring-2 ring-brand-200 flex items-center justify-center text-brand-700 text-3xl font-bold select-none">
                {initials}
              </div>
            )}
            {isAdmin && (
              <>
                <button
                  onClick={() => photoRef.current?.click()}
                  title="Change photo"
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </>
            )}
          </div>

          {/* Name + summary */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {employee.firstName} {employee.lastName}
                </h2>
                <p className="text-gray-500 mt-0.5">{employee.position} · {employee.department}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {employee.id} · Hired {employee.hireDate ?? '—'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {company && (
                  <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                    {company.shortName}
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {employee.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 mt-4">
              {[
                ['Basic Rate', `${formatPHP(employee.basicSalary)} /${employee.salaryType === 'monthly' ? 'mo' : employee.salaryType === 'daily' ? 'day' : 'hr'}`],
                ['Pay Frequency', employee.payFrequency === 'semi-monthly' ? 'Semi-monthly' : employee.payFrequency === 'weekly' ? 'Weekly' : 'Monthly'],
                ['Email', employee.email || '—'],
                ['Phone', employee.phone || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-700 truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.id === 'documents' && attachments.length > 0 && (
              <span className="ml-1.5 bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full">
                {attachments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Attendance Activity tab ── */}
      {tab === 'activity' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-5">
            Attendance — last 6 months
          </h3>

          {/* Stats */}
          <div className="flex gap-8 mb-6">
            {[
              { label: 'Tracked', value: empAtt.length, color: 'text-gray-700' },
              { label: 'Present', value: presentCt,     color: 'text-green-600' },
              { label: 'Absent',  value: absentCt,      color: 'text-red-500'   },
              { label: 'Late',    value: lateCt,         color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-2 min-w-0">
            <div className="flex flex-col gap-[3px] pt-[22px] shrink-0">
              {DAY_LABELS.map(label => (
                <div key={label} className="h-[14px] text-[10px] text-gray-400 leading-[14px] text-right pr-2 w-7">
                  {label}
                </div>
              ))}
            </div>
            <div className="overflow-x-auto flex-1">
              <div className="flex gap-[3px] mb-1 h-[18px]">
                {weeks.map((_, wi) => (
                  <div key={wi} className="w-[14px] shrink-0 text-[10px] text-gray-500 font-medium overflow-visible whitespace-nowrap" style={{ minWidth: 14 }}>
                    {monthLabels[wi] ?? ''}
                  </div>
                ))}
              </div>
              {[0, 1, 2, 3, 4, 5, 6].map(rowIdx => (
                <div key={rowIdx} className="flex gap-[3px] mb-[3px]">
                  {weeks.map((week, wi) => {
                    const day = week[rowIdx]
                    return (
                      <div
                        key={wi}
                        className={`w-[14px] h-[14px] rounded-sm shrink-0 cursor-default hover:opacity-70 transition-opacity ${cellColor(day)}`}
                        onMouseEnter={() => setHovered(day)}
                        onMouseLeave={() => setHovered(null)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Hover detail */}
          <div className="mt-3 h-8 flex items-center">
            {hovered && !hovered.isFuture && !hovered.isBeforeHire ? (
              <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <span className="font-semibold text-gray-800">{hovered.dateStr}</span>
                {hovered.isRestDay ? (
                  <span className="text-gray-400">Rest day</span>
                ) : !hovered.rec ? (
                  <span className="text-gray-400">No record</span>
                ) : hovered.rec.status === 'absent' ? (
                  <span className="text-red-500 font-medium">Absent</span>
                ) : hovered.rec.status === 'leave' ? (
                  <span className="text-blue-500 font-medium">On Leave</span>
                ) : (
                  <span className="text-green-700 flex items-center gap-1.5">
                    <span className="font-medium">{hovered.rec.status === 'late' ? 'Late' : 'Present'}</span>
                    {hovered.rec.timeIn && hovered.rec.timeOut && (
                      <span className="text-gray-500">{hovered.rec.timeIn} – {hovered.rec.timeOut}</span>
                    )}
                    {hovered.rec.hoursWorked != null && (
                      <span className="text-gray-500">{hovered.rec.hoursWorked}h</span>
                    )}
                    {hovered.rec.lateMinutes > 0 && (
                      <span className="text-amber-600">{hovered.rec.lateMinutes}min late</span>
                    )}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-300">Hover a square for details</span>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-gray-500">
            {[
              { color: 'bg-green-500', label: 'Present' },
              { color: 'bg-lime-400',  label: 'Half day' },
              { color: 'bg-red-400',   label: 'Absent' },
              { color: 'bg-blue-400',  label: 'On leave' },
              { color: 'bg-gray-100 border border-gray-200', label: 'Rest / no record' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm shrink-0 ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Details tab ── */}
      {tab === 'details' && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[
            {
              title: 'Compensation',
              rows: [
                ['Pay Type',      employee.salaryType === 'monthly' ? 'Monthly fixed salary' : employee.salaryType === 'daily' ? 'Daily rate' : 'Hourly rate'],
                ['Basic Rate',    formatPHP(employee.basicSalary)],
                ['Pay Frequency', employee.payFrequency === 'semi-monthly' ? 'Semi-monthly (15th & 30th)' : employee.payFrequency === 'weekly' ? 'Weekly (Mon–Sat)' : 'Monthly (EOM)'],
              ],
            },
            {
              title: 'Per-Period Deductions',
              rows: [
                ['Savings',      formatPHP(employee.savings     || 0)],
                ['Insurance',    formatPHP(employee.insurance   || 0)],
                ['Bank Charges', formatPHP(employee.bankCharges || 0)],
              ],
            },
            {
              title: 'Government IDs',
              rows: [
                ['SSS No.',         employee.sssNo        || '—'],
                ['PhilHealth No.',  employee.philhealthNo || '—'],
                ['Pag-IBIG No.',    employee.pagibigNo    || '—'],
                ['TIN',             employee.tinNo        || '—'],
              ],
            },
            {
              title: 'Contact',
              rows: [
                ['Email', employee.email || '—'],
                ['Phone', employee.phone || '—'],
              ],
            },
          ].map(section => (
            <div key={section.title} className="p-5">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {section.title}
              </h4>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                {section.rows.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-gray-400">{label}</dt>
                    <dd className="text-sm font-medium text-gray-700 mt-0.5">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}

      {/* ── Documents tab ── */}
      {tab === 'documents' && (
        <div className="space-y-4">
          {isAdmin && (
            <div
              onClick={() => docRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/40 transition-colors group"
            >
              <svg className="w-9 h-9 text-gray-300 group-hover:text-brand-400 mx-auto mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                Click to upload documents
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Contracts, government IDs, certificates, or any file
              </p>
              <input ref={docRef} type="file" multiple className="hidden" onChange={handleDocUpload} />
            </div>
          )}

          {attachments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-14 text-center">
              <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-400">No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {attachments.map(doc => (
                <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${fileColor(doc.mimeType)}`}>
                    {fileExt(doc.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {fmtSize(doc.size)} · Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={doc.data}
                      download={doc.name}
                      className="text-xs text-brand-700 hover:underline"
                    >
                      Download
                    </a>
                    {isAdmin && (
                      <button
                        onClick={() => dispatch({ type: 'DELETE_EMPLOYEE_ATTACHMENT', id: employee.id, attachmentId: doc.id })}
                        className="text-xs text-red-400 hover:text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function fileColor(mimeType = '') {
  if (mimeType.includes('pdf'))                                          return 'bg-red-100 text-red-600'
  if (mimeType.includes('word') || mimeType.includes('doc'))            return 'bg-blue-100 text-blue-600'
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'bg-green-100 text-green-600'
  if (mimeType.includes('image'))                                        return 'bg-purple-100 text-purple-600'
  if (mimeType.includes('zip') || mimeType.includes('rar'))             return 'bg-amber-100 text-amber-600'
  return 'bg-gray-100 text-gray-500'
}

function fileExt(name = '') {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop().toUpperCase().slice(0, 4) : 'FILE'
}

function fmtSize(bytes = 0) {
  if (bytes < 1024)           return `${bytes} B`
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
