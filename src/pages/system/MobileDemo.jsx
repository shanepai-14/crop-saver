import { useState, useEffect, useMemo, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useApp } from '../../context/AppContext'
import { formatPHP } from '../../utils/payroll'

const DEMO_LOCATION = 'CSPC Main Farm, Davao del Sur'
const DEMO_COORDS   = '6.9214° N, 125.1344° E'

const LEAVE_TYPES = [
  { value: 'vacation',    label: 'Vacation Leave',  balance: 5 },
  { value: 'sick',        label: 'Sick Leave',       balance: 3 },
  { value: 'emergency',   label: 'Emergency Leave',  balance: 2 },
  { value: 'bereavement', label: 'Bereavement',      balance: 1 },
  { value: 'maternity',   label: 'Maternity Leave',  balance: 0 },
]

const TABS = [
  { id: 'home',       label: 'Home',       icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'attendance', label: 'Records',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { id: 'profile',    label: 'Profile',    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'payslip',    label: 'Payslip',    icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { id: 'leave',      label: 'Leave',      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
]

export default function MobileDemo() {
  const { state } = useApp()

  // ── Demo employee picker ─────────────────────────────────
  const activeEmps = useMemo(() =>
    (state.employees ?? []).filter(e => e.status === 'active')
  , [state.employees])
  const [empId, setEmpId] = useState(() => activeEmps[0]?.id ?? '')
  const emp = activeEmps.find(e => e.id === empId) ?? activeEmps[0]
  const companyById = useMemo(() => Object.fromEntries((state.companies ?? []).map(c => [c.id, c])), [state.companies])
  const company = emp ? companyById[emp.companyId] : null
  const initials = emp ? `${emp.firstName?.[0] ?? ''}${emp.lastName?.[0] ?? ''}`.toUpperCase() : '??'

  // ── App state ─────────────────────────────────────────────
  const [tab, setTab]             = useState('home')
  const [clockFlow, setClockFlow] = useState(null)
  // null | 'method' | 'photo' | 'photo-preview' | 'qr' | 'done-in' | 'done-out'
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [todayIn, setTodayIn]         = useState(null)
  const [clockLog, setClockLog]       = useState([])
  const [photoData, setPhotoData]     = useState(null)
  const [gpsInside, setGpsInside]     = useState(true)
  const [now, setNow]                 = useState(new Date())
  const [cameraError, setCameraError] = useState(false)
  const videoRef  = useRef(null)
  const streamRef = useRef(null)

  // Leave form
  const [leaveType, setLeaveType]       = useState('vacation')
  const [leaveStart, setLeaveStart]     = useState('')
  const [leaveEnd, setLeaveEnd]         = useState('')
  const [leaveReason, setLeaveReason]   = useState('')
  const [leaveSubmitted, setLeaveSubmitted] = useState(false)

  // ── Live clock ───────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ── Camera lifecycle ──────────────────────────────────────
  useEffect(() => {
    if (clockFlow !== 'photo') {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      return
    }
    setCameraError(false)
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => setCameraError(true))
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    }
  }, [clockFlow])

  // ── Clock actions ─────────────────────────────────────────
  function commitClock(method = 'photo') {
    const goingIn = !isClockedIn
    const t = new Date()
    if (goingIn) setTodayIn(t)
    const event = { type: goingIn ? 'in' : 'out', method, time: t }
    setClockLog(prev => [event, ...prev])
    setIsClockedIn(goingIn)
    setClockFlow(goingIn ? 'done-in' : 'done-out')
    setTimeout(() => setClockFlow(null), 3000)
  }

  function capturePhoto() {
    const video = videoRef.current
    const t = new Date()
    let dataUrl = null

    if (video && !cameraError && video.videoWidth > 0) {
      const canvas = document.createElement('canvas')
      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    }

    setPhotoData({ time: t, dataUrl })
    setClockFlow('photo-preview')
  }

  function confirmPhoto() {
    commitClock('photo')
    setPhotoData(null)
  }

  // ── Helpers ───────────────────────────────────────────────
  function fmtTime(d) {
    return d ? d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'
  }

  const hoursToday = useMemo(() => {
    if (isClockedIn && todayIn) return ((now - todayIn) / 3600000).toFixed(1)
    const inE  = clockLog.find(e => e.type === 'in')
    const outE = clockLog.find(e => e.type === 'out')
    if (inE && outE) return ((outE.time - inE.time) / 3600000).toFixed(1)
    return null
  }, [isClockedIn, todayIn, now, clockLog])

  // ── Attendance data ───────────────────────────────────────
  const empAtt = useMemo(() =>
    (state.attendance ?? [])
      .filter(r => r.employeeId === emp?.id)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 20)
  , [state.attendance, emp?.id])

  // ── Payslip data ──────────────────────────────────────────
  const latestPayItem = useMemo(() => {
    if (!emp) return null
    return (state.payrolls ?? [])
      .flatMap(p => (p.items ?? []).map(i => ({ ...i, period: p.period })))
      .filter(i => i.employeeId === emp.id)
      .sort((a, b) => b.period.localeCompare(a.period))[0] ?? null
  }, [state.payrolls, emp?.id])

  const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  // ═══════════════════════════════════════════════════════════
  // SCREENS
  // ═══════════════════════════════════════════════════════════

  function renderHome() {
    return (
      <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-b from-brand-800 to-brand-700 px-5 pt-3 pb-10 text-white shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/60 text-[11px]">{greeting},</p>
              <h2 className="text-base font-bold leading-tight">{emp?.firstName ?? 'Employee'} {emp?.lastName ?? ''}</h2>
              <p className="text-white/40 text-[10px]">{emp?.position} · {company?.shortName}</p>
            </div>
            {emp?.photo ? (
              <img src={emp.photo} className="w-10 h-10 rounded-full ring-2 ring-white/30 object-cover shrink-0" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-500 ring-2 ring-white/30 flex items-center justify-center text-sm font-bold shrink-0">
                {initials}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold tracking-tight font-mono tabular-nums">
              {now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
            <div className="text-white/50 text-[11px] mt-0.5">
              {now.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* GPS chip */}
        <div className="mx-4 -mt-5 bg-white rounded-2xl shadow-md px-3 py-2.5 border border-gray-100 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${gpsInside ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <div>
              <div className={`text-[11px] font-semibold ${gpsInside ? 'text-green-700' : 'text-red-600'}`}>
                {gpsInside ? 'Inside Geofence ✓' : 'Outside Geofence ✗'}
              </div>
              <div className="text-[10px] text-gray-400 truncate max-w-[160px]">{DEMO_LOCATION}</div>
            </div>
          </div>
          <button
            onClick={() => setGpsInside(v => !v)}
            className="text-[10px] text-brand-600 border border-brand-200 px-2 py-0.5 rounded-full hover:bg-brand-50 shrink-0"
          >
            Toggle
          </button>
        </div>

        {/* GPS Map */}
        <div className="mx-4 mt-2.5 bg-white rounded-xl border border-gray-100 overflow-hidden shrink-0">
          <div className="relative h-20 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(#10b98180 1px, transparent 1px), linear-gradient(90deg, #10b98180 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }} />
            <div className={`absolute w-16 h-16 rounded-full border-2 ${gpsInside ? 'border-green-500 bg-green-500/10' : 'border-red-400 bg-red-400/10'}`} />
            <div
              className={`relative z-10 w-3 h-3 rounded-full ${gpsInside ? 'bg-brand-600' : 'bg-red-500'} ring-2 ring-white shadow transition-transform duration-700`}
              style={gpsInside ? {} : { transform: 'translate(32px, 18px)' }}
            />
            <div className="absolute bottom-1 right-2 text-[9px] text-gray-400 font-mono">{DEMO_COORDS}</div>
          </div>
        </div>

        {/* Clock button */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 pb-2">
          {isClockedIn && todayIn && (
            <div className="text-center">
              <div className="text-[10px] text-gray-400">Clocked in at</div>
              <div className="text-xs font-bold text-green-600">{fmtTime(todayIn)}</div>
              {hoursToday && <div className="text-[10px] text-gray-400">{hoursToday} hrs worked</div>}
            </div>
          )}

          <button
            disabled={!gpsInside}
            onClick={() => setClockFlow('method')}
            className={`w-24 h-24 rounded-full shadow-xl text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
              !gpsInside
                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                : isClockedIn
                  ? 'bg-gradient-to-br from-red-400 to-red-600 ring-4 ring-red-200 shadow-red-300'
                  : 'bg-gradient-to-br from-green-400 to-green-600 ring-4 ring-green-200 shadow-green-300'
            }`}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={isClockedIn
                  ? 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  : 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
                }
              />
            </svg>
            <span>{isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}</span>
          </button>

          {!gpsInside && (
            <p className="text-[10px] text-red-500 text-center px-4">Must be inside the geofence</p>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 w-full px-4">
            {[
              { label: 'Today',   val: hoursToday ? hoursToday + 'h' : '—' },
              { label: 'Present', val: empAtt.filter(r => r.status !== 'absent').length },
              { label: 'Absent',  val: empAtt.filter(r => r.status === 'absent').length },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-2 text-center shadow-sm">
                <div className="text-sm font-bold text-gray-800">{val}</div>
                <div className="text-[10px] text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function renderAttendance() {
    const presentCt = empAtt.filter(r => r.status !== 'absent').length
    const absentCt  = empAtt.filter(r => r.status === 'absent').length
    const lateCt    = empAtt.filter(r => r.status === 'late').length
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-brand-700 px-5 pt-3 pb-8 text-white shrink-0">
          <h2 className="text-sm font-bold">Attendance Records</h2>
          <p className="text-white/50 text-[10px]">{emp?.firstName} {emp?.lastName}</p>
        </div>

        <div className="mx-4 -mt-4 grid grid-cols-3 gap-2 mb-3 shrink-0">
          {[
            { label: 'Present', val: presentCt, cls: 'text-green-700 bg-green-50' },
            { label: 'Absent',  val: absentCt,  cls: 'text-red-600 bg-red-50' },
            { label: 'Late',    val: lateCt,    cls: 'text-amber-700 bg-amber-50' },
          ].map(({ label, val, cls }) => (
            <div key={label} className={`${cls} rounded-xl p-2.5 text-center shadow-sm`}>
              <div className="text-lg font-bold text-gray-800">{val}</div>
              <div className="text-[10px] text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Today's live log */}
        {clockLog.length > 0 && (
          <div className="mx-4 mb-3 bg-white rounded-xl border border-gray-100 shadow-sm shrink-0 overflow-hidden">
            <div className="px-3 py-1.5 border-b border-gray-50 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              Today's Activity
            </div>
            {clockLog.map((e, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 border-b border-gray-50 last:border-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${e.type === 'in' ? 'bg-green-500' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-gray-700">
                    Clock {e.type === 'in' ? 'In' : 'Out'}
                    <span className="text-gray-400 ml-1 font-normal">via {e.method}</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 font-mono shrink-0">{fmtTime(e.time)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-3">
          {empAtt.length === 0 && clockLog.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-xs">No attendance records found.</div>
          )}
          {empAtt.map(r => (
            <div key={r.date} className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 px-3 py-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                r.status === 'absent' ? 'bg-red-50 text-red-500' :
                r.status === 'late'   ? 'bg-amber-50 text-amber-600' :
                r.status === 'leave'  ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
              }`}>
                {r.status === 'absent' ? 'AB' : r.status === 'late' ? 'LT' : r.status === 'leave' ? 'LV' : 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-gray-700">{r.date}</div>
                <div className="text-[9px] text-gray-400">
                  {r.timeIn && `In: ${r.timeIn}`}{r.timeOut && ` · Out: ${r.timeOut}`}
                  {r.hoursWorked ? ` · ${r.hoursWorked}h` : ''}
                </div>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                r.status === 'absent' ? 'bg-red-100 text-red-600' :
                r.status === 'late'   ? 'bg-amber-100 text-amber-700' :
                r.status === 'leave'  ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function renderProfile() {
    const govIds = [
      { label: 'SSS No.',        val: emp?.sssNo },
      { label: 'PhilHealth No.', val: emp?.philhealthNo },
      { label: 'Pag-IBIG No.',   val: emp?.pagibigNo },
      { label: 'TIN',            val: emp?.tinNo },
    ]
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-brand-700 px-5 pt-3 pb-10 text-white shrink-0">
          <h2 className="text-sm font-bold">My Profile</h2>
        </div>
        <div className="mx-4 -mt-6 bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex items-center gap-3 shrink-0 z-10">
          {emp?.photo ? (
            <img src={emp.photo} className="w-14 h-14 rounded-full object-cover ring-2 ring-brand-200 shrink-0" alt="" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-xl font-bold text-brand-700 shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-bold text-gray-800 text-sm truncate">{emp?.firstName} {emp?.lastName}</div>
            <div className="text-[11px] text-gray-500 truncate">{emp?.position}</div>
            <div className="text-[10px] text-brand-600 font-medium">{emp?.department} · {company?.shortName}</div>
            <div className="text-[9px] text-gray-400 mt-0.5">{emp?.id}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 mt-3 space-y-2.5 pb-4">
          <AppSection title="Contact Information">
            <AppRow icon="✉" label="Email"  value={emp?.email || '—'} />
            <AppRow icon="📞" label="Phone"  value={emp?.phone || '—'} />
          </AppSection>
          <AppSection title="Employment">
            <AppRow icon="📅" label="Hired"     value={emp?.hireDate || '—'} />
            <AppRow icon="💰" label="Pay Type"  value={
              emp?.salaryType === 'monthly' ? 'Monthly fixed' :
              emp?.salaryType === 'daily'   ? `₱${emp?.basicSalary}/day` : `₱${emp?.basicSalary}/hr`
            } />
            <AppRow icon="🗓" label="Frequency" value={
              emp?.payFrequency === 'semi-monthly' ? '15th & 30th' :
              emp?.payFrequency === 'weekly'       ? 'Weekly (Mon–Sat)' : 'End of month'
            } />
          </AppSection>
          <AppSection title="Government IDs">
            {govIds.map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-[11px] text-gray-500">{label}</span>
                {val
                  ? <span className="text-[11px] font-mono text-gray-700">{val}</span>
                  : <span className="text-[9px] bg-amber-50 text-amber-600 font-semibold px-1.5 py-0.5 rounded">Not submitted</span>
                }
              </div>
            ))}
          </AppSection>
        </div>
      </div>
    )
  }

  function renderPayslip() {
    const item = latestPayItem
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-brand-700 px-5 pt-3 pb-6 text-white shrink-0">
          <h2 className="text-sm font-bold">My Payslip</h2>
          <p className="text-white/50 text-[10px]">Latest payroll period</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 mt-2 pb-4 space-y-2.5">
          {!item ? (
            <div className="text-center py-16 text-gray-400 text-xs">No payslip available yet.<br />Generate payroll first.</div>
          ) : (
            <>
              <div className="bg-brand-700 rounded-2xl p-4 text-white text-center shadow-lg">
                <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Net Pay</div>
                <div className="text-3xl font-bold font-mono">{formatPHP(item.netPay)}</div>
                <div className="text-[10px] text-white/40 mt-1">{emp?.firstName} {emp?.lastName}</div>
              </div>

              <AppSection title="Attendance">
                <AppPayRow label={emp?.salaryType === 'hourly' ? 'Regular Hours' : 'Days Present'} value={emp?.salaryType === 'hourly' ? `${item.totalHoursWorked} hrs` : `${item.daysPresent} days`} />
                {item.daysAbsent > 0 && <AppPayRow label="Days Absent" value={item.daysAbsent} neg />}
                {item.totalOTHours > 0 && <AppPayRow label="OT Hours" value={`${item.totalOTHours} hrs`} />}
              </AppSection>

              <AppSection title="Earnings">
                <AppPayRow label="Regular Pay" value={formatPHP(item.basicPay)} mono />
                {item.otPay > 0 && <AppPayRow label="OT Pay (1.25×)" value={formatPHP(item.otPay)} mono />}
                <AppPayRow label="Gross Pay" value={formatPHP(item.grossPay)} mono bold />
              </AppSection>

              {item.totalGovDeductions > 0 && (
                <AppSection title="Gov't Deductions">
                  <AppPayRow label="SSS"        value={`(${formatPHP(item.sss)})`}        mono neg />
                  <AppPayRow label="PhilHealth" value={`(${formatPHP(item.philhealth)})`} mono neg />
                  <AppPayRow label="Pag-IBIG"   value={`(${formatPHP(item.pagibig)})`}    mono neg />
                  <AppPayRow label="ECC"        value={`(${formatPHP(item.ecc)})`}        mono neg />
                </AppSection>
              )}

              {item.otherDeductions > 0 && (
                <AppSection title="Other Deductions">
                  {item.savings     > 0 && <AppPayRow label="Savings"       value={`(${formatPHP(item.savings)})`}     mono neg />}
                  {item.insurance   > 0 && <AppPayRow label="Insurance"     value={`(${formatPHP(item.insurance)})`}   mono neg />}
                  {item.bankCharges > 0 && <AppPayRow label="Bank Charges"  value={`(${formatPHP(item.bankCharges)})`} mono neg />}
                </AppSection>
              )}

              <div className="bg-brand-50 border-2 border-brand-200 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-bold text-brand-800">NET PAY</span>
                <span className="text-xl font-bold font-mono text-brand-700">{formatPHP(item.netPay)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  function renderLeave() {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-brand-700 px-5 pt-3 pb-6 text-white shrink-0">
          <h2 className="text-sm font-bold">Leave Request</h2>
          <p className="text-white/50 text-[10px]">Submit and track leave</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 mt-3 pb-4 space-y-3">
          {/* Balances */}
          <div className="grid grid-cols-3 gap-2">
            {LEAVE_TYPES.slice(0, 3).map(lt => (
              <div key={lt.value} className="bg-white rounded-xl border border-gray-100 p-2.5 text-center shadow-sm">
                <div className={`text-xl font-bold ${lt.balance > 0 ? 'text-gray-800' : 'text-gray-300'}`}>{lt.balance}</div>
                <div className="text-[9px] text-gray-400 leading-tight">{lt.label.replace(' Leave', '')}</div>
              </div>
            ))}
          </div>

          {leaveSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-sm font-bold text-green-700">Leave Request Submitted!</div>
              <div className="text-[11px] text-green-600 mt-1">Pending HR approval</div>
              <button
                onClick={() => { setLeaveSubmitted(false); setLeaveStart(''); setLeaveEnd(''); setLeaveReason('') }}
                className="mt-3 text-[11px] text-green-700 underline"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <AppSection title="New Request">
              <div className="space-y-3 py-1">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={e => setLeaveType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-400"
                  >
                    {LEAVE_TYPES.map(lt => (
                      <option key={lt.value} value={lt.value}>
                        {lt.label} — {lt.balance} day{lt.balance !== 1 ? 's' : ''} left
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Start Date</label>
                    <input type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">End Date</label>
                    <input type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-400" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Reason</label>
                  <textarea
                    value={leaveReason}
                    onChange={e => setLeaveReason(e.target.value)}
                    rows={3}
                    placeholder="Brief reason for your leave request..."
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-400 resize-none"
                  />
                </div>
                <button
                  onClick={() => { if (leaveStart && leaveEnd && leaveReason) setLeaveSubmitted(true) }}
                  disabled={!leaveStart || !leaveEnd || !leaveReason}
                  className="w-full bg-brand-700 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </AppSection>
          )}
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // CLOCK FLOW OVERLAYS
  // ═══════════════════════════════════════════════════════════

  function renderClockFlow() {
    if (!clockFlow) return null

    // ── Method selector ───────────────────────────────────────
    if (clockFlow === 'method') return (
      <div className="absolute inset-0 z-50 bg-gray-950 flex flex-col">
        <div className="px-5 pt-14 pb-4 flex items-center gap-3 border-b border-white/10">
          <button onClick={() => setClockFlow(null)} className="text-white/60 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="text-white font-bold text-sm">{isClockedIn ? 'Clock Out' : 'Clock In'}</div>
            <div className="text-white/40 text-[10px]">Choose attendance method</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 px-5 justify-center pb-12">
          <button
            onClick={() => setClockFlow('photo')}
            className="flex items-center gap-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl px-5 py-4 transition-colors active:scale-95 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Photo Attendance</div>
              <div className="text-white/40 text-[10px]">GPS + timestamp watermark</div>
            </div>
          </button>
          <button
            onClick={() => setClockFlow('qr')}
            className="flex items-center gap-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl px-5 py-4 transition-colors active:scale-95 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 4h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">QR Code Scan</div>
              <div className="text-white/40 text-[10px]">Show QR at attendance terminal</div>
            </div>
          </button>
        </div>
      </div>
    )

    // ── QR Code ───────────────────────────────────────────────
    if (clockFlow === 'qr') return (
      <div className="absolute inset-0 z-50 bg-white flex flex-col">
        <div className="bg-gray-50 px-5 pt-14 pb-4 flex items-center gap-3 border-b border-gray-100">
          <button onClick={() => setClockFlow('method')} className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="text-gray-800 font-bold text-sm">My QR Code</div>
            <div className="text-gray-400 text-[10px]">Show at the attendance terminal</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 pb-6">
          <div className="text-center">
            <div className="font-bold text-gray-800">{emp?.firstName} {emp?.lastName}</div>
            <div className="text-xs text-gray-400 mt-0.5">{emp?.id} · {emp?.position}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200">
            <QRCodeSVG value={emp?.id ?? 'EMPLOYEE'} size={172} level="M" />
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Ready to scan — {isClockedIn ? 'Clock Out' : 'Clock In'}
          </div>
          <button
            onClick={() => commitClock('qr')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-3 rounded-xl transition-colors active:scale-95"
          >
            ▶ Simulate Terminal Scan
          </button>
          <p className="text-[9px] text-gray-300 text-center -mt-1">Demo only — tap to simulate QR scan at terminal</p>
        </div>
      </div>
    )

    // ── Photo capture ─────────────────────────────────────────
    if (clockFlow === 'photo') return (
      <div className="absolute inset-0 z-50 bg-black flex flex-col">
        <button onClick={() => setClockFlow('method')} className="absolute top-14 left-5 z-10 text-white/60 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {/* Camera viewfinder */}
        <div className="flex-1 relative bg-gray-900 flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />
              <div className="relative z-10 text-center px-6">
                <div className="text-white/30 text-4xl mb-2">📷</div>
                <div className="text-white/50 text-xs">Camera unavailable</div>
                <div className="text-white/30 text-[10px] mt-1">Allow camera access to use this feature</div>
              </div>
            </>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
          )}
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          {/* Face guide */}
          <div className="relative z-10 w-32 h-40 rounded-[50%] border-2 border-dashed border-white/50" />
          {/* GPS indicator */}
          <div className="absolute top-16 right-3 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-full z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/70 text-[9px]">GPS locked</span>
          </div>
          {/* Location + timestamp bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-2 z-10 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-white/90 text-[10px] font-semibold">{emp?.firstName} {emp?.lastName}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isClockedIn ? 'bg-red-600' : 'bg-green-600'} text-white`}>
                {isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
              </span>
            </div>
            <div className="text-white/75 text-[9px] font-mono">
              {now.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'medium' })}
            </div>
            <div className="text-white/55 text-[9px]">📍 {DEMO_LOCATION}</div>
            <div className="text-white/35 text-[9px] font-mono">{DEMO_COORDS}</div>
          </div>
        </div>
        {/* Shutter */}
        <div className="h-24 bg-black flex items-center justify-center gap-8">
          <div className="w-10" />
          <button onClick={capturePhoto} className="w-16 h-16 rounded-full bg-white flex items-center justify-center ring-4 ring-white/30 active:scale-90 transition-transform">
            <div className="w-full h-full rounded-full bg-white border-4 border-gray-200" />
          </button>
          <div className="w-10" />
        </div>
      </div>
    )

    // ── Photo preview ─────────────────────────────────────────
    if (clockFlow === 'photo-preview' && photoData) return (
      <div className="absolute inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-black">
          <button onClick={() => setClockFlow('photo')} className="text-white/60 text-xs">Retake</button>
          <span className="text-white text-sm font-semibold">Review Photo</span>
          <button onClick={confirmPhoto} className="text-green-400 text-xs font-bold">Use Photo</button>
        </div>
        <div className="flex-1 relative bg-gray-800 overflow-hidden">
          {/* Photo — real capture or employee placeholder */}
          {photoData.dataUrl
            ? <img src={photoData.dataUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
            : emp?.photo
              ? <img src={emp.photo} className="absolute inset-0 w-full h-full object-cover" alt="" />
              : <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-800 flex items-center justify-center text-7xl opacity-20">👤</div>
          }
          {/* Watermark overlay — always rendered on top so it's always visible */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 pb-2 pt-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-white font-bold text-[11px]">{emp?.firstName} {emp?.lastName}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isClockedIn ? 'bg-red-600' : 'bg-green-600'} text-white`}>
                {isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
              </span>
            </div>
            <div className="text-white text-[10px] font-mono mb-0.5">
              {photoData.time.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'medium' })}
            </div>
            <div className="text-white/70 text-[9px]">📍 {DEMO_LOCATION}</div>
            <div className="text-white/45 text-[9px] font-mono">{DEMO_COORDS}</div>
          </div>
        </div>
      </div>
    )

    // ── Success state ─────────────────────────────────────────
    if (clockFlow === 'done-in' || clockFlow === 'done-out') {
      const goIn = clockFlow === 'done-in'
      const ev   = clockLog[0]
      return (
        <div className="absolute inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center gap-3">
          <div className={`w-20 h-20 rounded-full ${goIn ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center shadow-[0_0_40px_10px_rgba(34,197,94,0.3)]`}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-white text-xl font-bold">{goIn ? 'Clocked In!' : 'Clocked Out!'}</div>
          <div className="text-white/50 text-sm">{fmtTime(ev?.time)}</div>
          <div className="flex flex-col items-center gap-1.5 mt-1">
            <div className="px-4 py-1.5 bg-white/10 rounded-full text-white/60 text-xs">
              {ev?.method === 'qr' ? 'QR Code scan' : 'Photo attendance'}
            </div>
            <div className="text-white/30 text-[10px]">📍 {DEMO_LOCATION}</div>
          </div>
        </div>
      )
    }

    return null
  }

  // ═══════════════════════════════════════════════════════════
  // PAGE RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-full bg-gradient-to-br from-gray-900 via-brand-950 to-slate-900 -m-4 sm:-m-6 p-6 flex flex-col items-center gap-5">

      {/* Page header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-2">
          <span>📱</span> Mobile App Mockup
        </div>
        <h1 className="text-white text-lg font-bold">Field Worker Attendance App</h1>
        <p className="text-white/40 text-xs mt-0.5">Interactive demo — click through the clock-in flows</p>
      </div>

      {/* Employee selector */}
      {activeEmps.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-white/50 text-xs shrink-0">View as:</span>
          <select
            value={empId}
            onChange={e => { setEmpId(e.target.value); setClockFlow(null); setIsClockedIn(false); setTodayIn(null); setClockLog([]) }}
            className="bg-white/10 text-white text-xs border border-white/20 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-400 max-w-xs truncate"
          >
            {activeEmps.map(e => (
              <option key={e.id} value={e.id} className="bg-gray-900">
                {e.firstName} {e.lastName} — {e.position}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Phone frame */}
      <div
        className="relative bg-gray-950 rounded-[44px] overflow-hidden shadow-2xl"
        style={{ width: 375, height: 780, border: '5px solid #374151', boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-gray-950 rounded-b-3xl z-50 flex items-end justify-center pb-1 gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
          <div className="w-5 h-5 rounded-full bg-gray-800" />
        </div>

        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-5 pt-1 z-40 pointer-events-none">
          <span className="text-white text-[11px] font-bold">{timeStr}</span>
          <div className="w-28" />
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-2.5 text-white" viewBox="0 0 18 12" fill="none">
              <rect x="0"  y="6" width="3" height="6" rx="0.5" fill="currentColor" />
              <rect x="4"  y="4" width="3" height="8" rx="0.5" fill="currentColor" />
              <rect x="8"  y="2" width="3" height="10" rx="0.5" fill="currentColor" />
              <rect x="12" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
            </svg>
            <svg className="w-6 h-3 text-white" viewBox="0 0 25 12" fill="none">
              <rect x="0" y="0.5" width="21" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
              <rect x="21.5" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" />
              <rect x="1.5" y="2" width="17" height="8" rx="1" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Screen content */}
        <div className="absolute inset-0 pt-10 pb-[72px] overflow-hidden bg-gray-50">
          {tab === 'home'       && renderHome()}
          {tab === 'attendance' && renderAttendance()}
          {tab === 'profile'    && renderProfile()}
          {tab === 'payslip'    && renderPayslip()}
          {tab === 'leave'      && renderLeave()}
        </div>

        {/* Clock flow overlays (fullscreen within phone) */}
        {renderClockFlow()}

        {/* Bottom tab bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[72px] bg-white border-t border-gray-100 flex items-center justify-around px-1 z-30">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => { if (!clockFlow || clockFlow === null) setTab(id) }}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors relative ${
                tab === id ? 'text-brand-700' : 'text-gray-400'
              }`}
            >
              {id === 'home' && isClockedIn && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
              <svg className={`w-5 h-5 transition-all ${tab === id ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={tab === id ? 2.5 : 1.5} d={icon} />
              </svg>
              <span className="text-[9px] font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Home indicator bar */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-700/60 rounded-full z-40" />
      </div>

      {/* Feature callout chips */}
      <div className="grid grid-cols-3 gap-2.5 max-w-sm w-full">
        {[
          { icon: '📍', label: 'GPS Geofencing',    desc: 'Location-locked clock-in' },
          { icon: '📷', label: 'Photo + Stamp',     desc: 'Timestamp watermark' },
          { icon: '🔲', label: 'QR Code Scan',      desc: 'Show at terminal' },
        ].map(({ icon, label, desc }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center hover:bg-white/10 transition-colors">
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-white text-[11px] font-semibold">{label}</div>
            <div className="text-white/40 text-[9px] mt-0.5">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Reusable sub-components ──────────────────────────────────

function AppSection({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-3 py-1.5 border-b border-gray-50 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
        {title}
      </div>
      <div className="px-3 py-1">{children}</div>
    </div>
  )
}

function AppRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm w-5 text-center shrink-0">{icon}</span>
      <span className="text-[10px] text-gray-400 w-14 shrink-0">{label}</span>
      <span className="text-[11px] text-gray-700 flex-1 truncate">{value}</span>
    </div>
  )
}

function AppPayRow({ label, value, mono, neg, bold }) {
  return (
    <div className={`flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0 ${bold ? 'border-t border-gray-100 pt-2 mt-1' : ''}`}>
      <span className={`text-[11px] ${bold ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>{label}</span>
      <span className={`text-[11px] ${mono ? 'font-mono' : ''} ${bold ? 'font-bold text-gray-800' : neg ? 'text-red-500' : 'text-gray-700'}`}>
        {value}
      </span>
    </div>
  )
}
