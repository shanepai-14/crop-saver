// FILE: src/pages/system/LeaveRequests.jsx
import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected']

const STATUS_STYLES = {
  pending:  { badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400',  label: 'Pending' },
  approved: { badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  label: 'Approved' },
  rejected: { badge: 'bg-red-100 text-red-600',      dot: 'bg-red-400',    label: 'Rejected' },
}

const STAT_CHIP_STYLES = {
  pending:  'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-600 border border-red-200',
  total:    'bg-gray-100 text-gray-700 border border-gray-200',
}

const EMPTY_FORM = {
  employeeId: '',
  leaveTypeId: '',
  startDate: '',
  endDate: '',
  reason: '',
}

function calcDays(start, end) {
  if (!start || !end) return 0
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end   + 'T00:00:00')
  const diff = Math.round((e - s) / 86400000) + 1
  return diff > 0 ? diff : 0
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function LeaveRequests() {
  const { state, dispatch } = useApp()

  const cid          = state.selectedCompanyId
  const currentUser  = state.currentUser
  const canReview    = currentUser?.role === 'admin' || currentUser?.role === 'hr'

  const leaveRequests = useMemo(() => state.leaveRequests ?? [], [state.leaveRequests])
  const leaveTypes    = useMemo(() => state.leaveTypes    ?? [], [state.leaveTypes])

  const activeEmployees = useMemo(() =>
    state.employees.filter(e =>
      e.status === 'active' && (!cid || e.companyId === cid)
    )
  , [state.employees, cid])

  const empById = useMemo(
    () => Object.fromEntries(state.employees.map(e => [e.id, e])),
    [state.employees]
  )
  const ltById = useMemo(
    () => Object.fromEntries(leaveTypes.map(lt => [lt.id, lt])),
    [leaveTypes]
  )

  const [statusTab, setStatusTab] = useState('all')
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectRemarks, setRejectRemarks] = useState('')

  const counts = useMemo(() => {
    const base = leaveRequests.filter(r => {
      const emp = empById[r.employeeId]
      return !cid || (emp && emp.companyId === cid)
    })
    return {
      pending:  base.filter(r => r.status === 'pending').length,
      approved: base.filter(r => r.status === 'approved').length,
      rejected: base.filter(r => r.status === 'rejected').length,
      total:    base.length,
    }
  }, [leaveRequests, empById, cid])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return leaveRequests.filter(r => {
      const emp = empById[r.employeeId]
      if (cid && emp && emp.companyId !== cid) return false
      if (statusTab !== 'all' && r.status !== statusTab) return false
      if (q) {
        const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : ''
        if (!name.includes(q)) return false
      }
      return true
    }).slice().sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
  }, [leaveRequests, empById, cid, statusTab, search])

  function openSubmit() {
    setForm({ ...EMPTY_FORM, employeeId: activeEmployees[0]?.id ?? '', leaveTypeId: leaveTypes[0]?.id ?? '' })
    setFormErrors({})
    setModal('submit')
  }

  function closeModal() {
    setModal(null)
    setFormErrors({})
  }

  function handleField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function validateForm() {
    const e = {}
    if (!form.employeeId)  e.employeeId  = 'Select an employee'
    if (!form.leaveTypeId) e.leaveTypeId = 'Select a leave type'
    if (!form.startDate)   e.startDate   = 'Required'
    if (!form.endDate)     e.endDate     = 'Required'
    if (form.startDate && form.endDate && form.endDate < form.startDate) e.endDate = 'End must be after start'
    if (!form.reason.trim()) e.reason    = 'Please provide a reason'
    return e
  }

  function handleSubmit() {
    const e = validateForm()
    if (Object.keys(e).length) { setFormErrors(e); return }

    const days = calcDays(form.startDate, form.endDate)
    dispatch({
      type: 'ADD_LEAVE_REQUEST',
      request: {
        employeeId:  form.employeeId,
        leaveTypeId: form.leaveTypeId,
        startDate:   form.startDate,
        endDate:     form.endDate,
        days,
        reason:      form.reason.trim(),
        status:      'pending',
        submittedAt: new Date().toISOString(),
        reviewedBy:  null,
        reviewedAt:  null,
        remarks:     '',
      },
    })
    closeModal()
  }

  function handleApprove(id) {
    dispatch({
      type: 'REVIEW_LEAVE_REQUEST',
      id,
      status:     'approved',
      reviewedBy: currentUser?.name ?? 'Admin',
      remarks:    '',
    })
  }

  function openReject(id) {
    setRejectModal(id)
    setRejectRemarks('')
  }

  function confirmReject() {
    dispatch({
      type: 'REVIEW_LEAVE_REQUEST',
      id:         rejectModal,
      status:     'rejected',
      reviewedBy: currentUser?.name ?? 'Admin',
      remarks:    rejectRemarks.trim(),
    })
    setRejectModal(null)
    setRejectRemarks('')
  }

  const days = calcDays(form.startDate, form.endDate)

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leave Requests</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {['pending', 'approved', 'rejected'].map(s => (
              <span key={s} className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STAT_CHIP_STYLES[s]}`}>
                {STATUS_STYLES[s].label}: {counts[s]}
              </span>
            ))}
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STAT_CHIP_STYLES.total}`}>
              Total: {counts.total}
            </span>
          </div>
        </div>
        <button
          onClick={openSubmit}
          className="bg-brand-700 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit Request
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                statusTab === tab ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'all' ? 'All' : STATUS_STYLES[tab].label}
              {tab !== 'all' && (
                <span className={`ml-1.5 text-[10px] font-bold ${statusTab === tab ? 'text-gray-500' : 'text-gray-400'}`}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search by employee name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-56 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-sm font-medium text-gray-600 mb-1">No leave requests found</div>
            <div className="text-xs text-gray-400">
              {search || statusTab !== 'all' ? 'Try adjusting your filters.' : 'No requests have been submitted yet.'}
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Employee</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Leave Type</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Period</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Reason</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Submitted</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(req => {
                const emp = empById[req.employeeId]
                const lt  = ltById[req.leaveTypeId]
                const s   = STATUS_STYLES[req.status] ?? STATUS_STYLES.pending
                return (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {emp ? (
                        <>
                          <div className="font-medium text-gray-800">{emp.lastName}, {emp.firstName}</div>
                          <div className="text-xs text-gray-400">{emp.position}</div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">{req.employeeId}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {lt ? (
                        <>
                          <span className="font-mono text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded mr-1.5">{lt.code}</span>
                          <span className="text-gray-700">{lt.name}</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">{req.leaveTypeId}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-gray-800">
                        {fmtDate(req.startDate)}
                        {req.startDate !== req.endDate && <> &rarr; {fmtDate(req.endDate)}</>}
                      </div>
                      <div className="text-xs text-gray-400">{req.days} day{req.days !== 1 ? 's' : ''}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-gray-700 text-xs truncate" title={req.reason}>{req.reason || '—'}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {fmtDateTime(req.submittedAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {req.status === 'pending' && canReview ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => openReject(req.id)}
                            className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      ) : req.status !== 'pending' && req.reviewedAt ? (
                        <span className="text-xs text-gray-400">Reviewed {fmtDateTime(req.reviewedAt)}</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal === 'submit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="font-semibold text-gray-800">Submit Leave Request</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Employee <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.employeeId}
                  onChange={e => handleField('employeeId', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${formErrors.employeeId ? 'border-red-400' : 'border-gray-300'}`}
                >
                  <option value="">Select employee…</option>
                  {activeEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.lastName}, {e.firstName} — {e.position}</option>
                  ))}
                </select>
                {formErrors.employeeId && <p className="text-xs text-red-500 mt-0.5">{formErrors.employeeId}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Leave Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.leaveTypeId}
                  onChange={e => handleField('leaveTypeId', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${formErrors.leaveTypeId ? 'border-red-400' : 'border-gray-300'}`}
                >
                  <option value="">Select leave type…</option>
                  {leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>{lt.code} — {lt.name} ({lt.daysPerYear} days/yr)</option>
                  ))}
                </select>
                {formErrors.leaveTypeId && <p className="text-xs text-red-500 mt-0.5">{formErrors.leaveTypeId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => handleField('startDate', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${formErrors.startDate ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {formErrors.startDate && <p className="text-xs text-red-500 mt-0.5">{formErrors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    End Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate || undefined}
                    onChange={e => handleField('endDate', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${formErrors.endDate ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {formErrors.endDate && <p className="text-xs text-red-500 mt-0.5">{formErrors.endDate}</p>}
                </div>
              </div>

              {days > 0 && (
                <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2 text-xs text-brand-700 font-medium">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {days} calendar day{days !== 1 ? 's' : ''}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.reason}
                  onChange={e => handleField('reason', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none ${formErrors.reason ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Brief reason for leave…"
                />
                {formErrors.reason && <p className="text-xs text-red-500 mt-0.5">{formErrors.reason}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 text-sm font-semibold bg-brand-700 hover:bg-brand-600 text-white rounded-lg transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Reject Leave Request</h3>
              <button onClick={() => setRejectModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5">
              <label className="block text-xs font-medium text-gray-600 mb-1">Remarks (optional)</label>
              <textarea
                rows={3}
                value={rejectRemarks}
                onChange={e => setRejectRemarks(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                placeholder="Reason for rejection…"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
