import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { formatPHP } from '../../utils/payroll'

const LOAN_TYPES = [
  { value: 'sss',     label: 'SSS Loan' },
  { value: 'pagibig', label: 'Pag-IBIG Loan' },
  { value: 'company', label: 'Company Loan' },
  { value: 'calamity', label: 'Calamity Loan' },
]

const STATUS_TABS = [
  { key: 'active',     label: 'Active' },
  { key: 'fully_paid', label: 'Fully Paid' },
  { key: 'cancelled',  label: 'Cancelled' },
  { key: 'all',        label: 'All' },
]

export default function Loans() {
  const { state, dispatch } = useApp()
  const [tab, setTab]           = useState('active')
  const [modal, setModal]       = useState(null) // null | 'new' | { loan } for edit
  const [confirmId, setConfirmId] = useState(null)

  const cid = state.selectedCompanyId

  const activeEmps = useMemo(() =>
    state.employees.filter(e => e.status === 'active' && (!cid || e.companyId === cid))
  , [state.employees, cid])

  const empMap = useMemo(() =>
    Object.fromEntries(state.employees.map(e => [e.id, e]))
  , [state.employees])

  const allLoans = useMemo(() =>
    (state.loans ?? []).filter(l => !cid || l.companyId === cid)
  , [state.loans, cid])

  const filtered = useMemo(() => {
    if (tab === 'all') return allLoans
    return allLoans.filter(l => l.status === tab)
  }, [allLoans, tab])

  const activeLoans   = allLoans.filter(l => l.status === 'active')
  const totalOutstanding = activeLoans.reduce((s, l) => s + (l.balance ?? 0), 0)
  const monthlyDeductions = activeLoans.reduce((s, l) => s + (l.monthlyDeduction ?? 0), 0)
  const semiMonthly       = monthlyDeductions / 2

  function handleCancel(id) {
    dispatch({ type: 'CANCEL_LOAN', id })
    setConfirmId(null)
  }

  function handleMarkPaid(id) {
    dispatch({ type: 'MARK_LOAN_PAID', id })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Loans</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            SSS, Pag-IBIG, and company loans — deductions applied automatically each payroll run
          </p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Loan
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Loans',       value: activeLoans.length, cls: 'text-gray-900 text-2xl font-bold' },
          { label: 'Total Outstanding',  value: formatPHP(totalOutstanding), cls: 'text-brand-700 text-xl font-bold' },
          { label: 'Monthly Deductions', value: formatPHP(monthlyDeductions), cls: 'text-brand-700 text-xl font-bold' },
          { label: 'Semi-Monthly / Payslip', value: formatPHP(semiMonthly), cls: 'text-gray-900 text-xl font-bold' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
            <p className={card.cls}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2">
        {STATUS_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-gray-800 text-white'
                : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Loan list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Loans</span>
          <span className="text-sm text-gray-400">{filtered.length}</span>
          <span className="text-xs text-gray-400 ml-1">Deductions applied automatically each payroll run</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-14 text-center text-gray-400 text-sm">No loans found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left">Employee</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Loan No.</th>
                <th className="px-5 py-3 text-right">Principal</th>
                <th className="px-5 py-3 text-right">Balance</th>
                <th className="px-5 py-3 text-right">Monthly Ded.</th>
                <th className="px-5 py-3 text-left">Start Date</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(loan => {
                const emp = empMap[loan.employeeId]
                return (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-800">
                        {emp ? `${emp.firstName} ${emp.lastName}` : loan.employeeId}
                      </div>
                      <div className="text-xs text-gray-400">{emp?.position}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${loanTypeCls(loan.type)}`}>
                        {LOAN_TYPES.find(t => t.value === loan.type)?.label ?? loan.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 font-mono text-xs">{loan.loanNo || '—'}</td>
                    <td className="px-5 py-3 text-right text-gray-700">{formatPHP(loan.principal)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatPHP(loan.balance ?? 0)}</td>
                    <td className="px-5 py-3 text-right text-gray-700">{formatPHP(loan.monthlyDeduction)}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{loan.startDate || '—'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={loan.status} />
                    </td>
                    <td className="px-5 py-3">
                      {loan.status === 'active' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMarkPaid(loan.id)}
                            className="text-xs text-green-600 hover:underline font-medium"
                          >
                            Mark Paid
                          </button>
                          {confirmId === loan.id ? (
                            <span className="flex items-center gap-1 text-xs">
                              <button onClick={() => handleCancel(loan.id)}
                                className="text-red-600 hover:underline font-medium">Confirm</button>
                              <button onClick={() => setConfirmId(null)}
                                className="text-gray-400 hover:underline">No</button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setConfirmId(loan.id)}
                              className="text-xs text-gray-400 hover:text-red-500 hover:underline"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* New Loan Modal */}
      {modal === 'new' && (
        <LoanModal
          employees={activeEmps}
          companyId={cid ?? null}
          onSave={loan => {
            dispatch({ type: 'ADD_LOAN', loan })
            setModal(null)
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

function loanTypeCls(type) {
  const map = {
    sss:      'bg-blue-50 text-blue-700',
    pagibig:  'bg-purple-50 text-purple-700',
    company:  'bg-amber-50 text-amber-700',
    calamity: 'bg-red-50 text-red-700',
  }
  return map[type] ?? 'bg-gray-100 text-gray-600'
}

function StatusBadge({ status }) {
  const map = {
    active:     'bg-green-100 text-green-700',
    fully_paid: 'bg-blue-100 text-blue-700',
    cancelled:  'bg-gray-100 text-gray-500',
  }
  const labels = { active: 'Active', fully_paid: 'Fully Paid', cancelled: 'Cancelled' }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function LoanModal({ employees, companyId, onSave, onClose }) {
  const [empSearch, setEmpSearch]     = useState('')
  const [empOpen, setEmpOpen]         = useState(false)
  const [employeeId, setEmployeeId]   = useState('')
  const [type, setType]               = useState('sss')
  const [loanNo, setLoanNo]           = useState('')
  const [principal, setPrincipal]     = useState('')
  const [monthly, setMonthly]         = useState('')
  const [startDate, setStartDate]     = useState(new Date().toISOString().slice(0, 10))
  const [remarks, setRemarks]         = useState('')
  const [error, setError]             = useState('')

  const selectedEmp   = employees.find(e => e.id === employeeId)
  const filteredEmps  = employees.filter(e => {
    const q = empSearch.toLowerCase()
    return !q || `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) || e.position?.toLowerCase().includes(q)
  })

  function handleSave() {
    if (!employeeId) { setError('Please select an employee.'); return }
    if (!principal || isNaN(Number(principal)) || Number(principal) <= 0) {
      setError('Enter a valid principal amount.'); return
    }
    if (!monthly || isNaN(Number(monthly)) || Number(monthly) <= 0) {
      setError('Enter a valid monthly deduction.'); return
    }
    setError('')
    onSave({
      employeeId,
      companyId,
      type,
      loanNo: loanNo.trim() || null,
      principal: Number(principal),
      monthlyDeduction: Number(monthly),
      startDate,
      remarks: remarks.trim() || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-base">New Loan</h3>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          {/* Employee */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-600 mb-1">Employee <span className="text-red-500">*</span></label>
            <div
              onClick={() => setEmpOpen(true)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm cursor-text ${empOpen ? 'border-brand-500 ring-2 ring-brand-500' : 'border-gray-300'}`}
            >
              {empOpen ? (
                <input
                  autoFocus
                  value={empSearch}
                  onChange={e => setEmpSearch(e.target.value)}
                  placeholder="Search name or position..."
                  className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400"
                  onBlur={() => setTimeout(() => setEmpOpen(false), 150)}
                />
              ) : (
                <span className={`flex-1 truncate ${selectedEmp ? 'text-gray-800' : 'text-gray-400'}`}>
                  {selectedEmp ? `${selectedEmp.lastName}, ${selectedEmp.firstName}` : 'Select employee...'}
                </span>
              )}
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </div>
            {empOpen && (
              <ul className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-44 overflow-y-auto">
                {filteredEmps.length === 0
                  ? <li className="px-3 py-2 text-xs text-gray-400">No employees found.</li>
                  : filteredEmps.map(emp => (
                    <li
                      key={emp.id}
                      onMouseDown={() => { setEmployeeId(emp.id); setEmpSearch(''); setEmpOpen(false) }}
                      className={`px-3 py-2 cursor-pointer hover:bg-brand-50 text-sm ${emp.id === employeeId ? 'bg-brand-50 font-medium text-brand-700' : 'text-gray-700'}`}
                    >
                      <div>{emp.lastName}, {emp.firstName}</div>
                      {emp.position && <div className="text-xs text-gray-400">{emp.position}</div>}
                    </li>
                  ))
                }
              </ul>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Loan Type</label>
            <select
              value={type} onChange={e => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {LOAN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Loan No + Start Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Loan / Ref No.</label>
              <input
                type="text" value={loanNo} placeholder="Optional"
                onChange={e => setLoanNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
              <input
                type="date" value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Principal + Monthly */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Principal Amount <span className="text-red-500">*</span></label>
              <input
                type="number" value={principal} min={1} placeholder="0.00"
                onChange={e => setPrincipal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Deduction <span className="text-red-500">*</span></label>
              <input
                type="number" value={monthly} min={1} placeholder="0.00"
                onChange={e => setMonthly(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
            <input
              type="text" value={remarks} placeholder="Optional"
              onChange={e => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold bg-brand-700 hover:bg-brand-600 text-white rounded-lg transition-colors">
            Save Loan
          </button>
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
