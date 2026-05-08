import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { PH_MIN_WAGE_DAILY, PH_MIN_WAGE_HOURLY } from '../../utils/payroll'

const GOV_ID_FIELDS = [
  { key: 'sssNo',        label: 'SSS No.' },
  { key: 'philhealthNo', label: 'PhilHealth No.' },
  { key: 'pagibigNo',    label: 'Pag-IBIG No.' },
  { key: 'tinNo',        label: 'TIN' },
]

function missingGovIds(emp) {
  return GOV_ID_FIELDS.filter(f => !emp[f.key]).map(f => f.label)
}

const EMPTY = {
  firstName: '', lastName: '', position: '', department: 'Sales',
  salaryType: 'monthly', basicSalary: '', payFrequency: 'semi-monthly',
  email: '', phone: '', hireDate: '', status: 'active',
  sssNo: '', philhealthNo: '', pagibigNo: '', tinNo: '',
  savings: 0, insurance: 0, bankCharges: 0,
}

export default function Employees() {
  const { state, dispatch } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const empTab = searchParams.get('tab') ?? 'employees'
  function setEmpTab(tab) {
    setSearchParams(tab === 'employees' ? {} : { tab })
  }
  const [search, setSearch]             = useState('')
  const [modal, setModal]               = useState(null)
  const [errors, setErrors]             = useState({})
  const [viewMode, setViewMode]         = useState('table')

  // Dept/position inline editing
  const [deptModal, setDeptModal]       = useState(null) // null | { mode:'add'|'edit', id?, name }
  const [posModal, setPosModal]         = useState(null) // null | { mode:'add'|'edit', id?, name }

  const depts    = state.departments ?? []
  const positions = state.positions ?? []

  // Sort
  const [sortField, setSortField]       = useState('lastName')
  const [sortDir, setSortDir]           = useState('asc')

  // Filters
  const [filterStatus, setFilterStatus]       = useState('active')
  const [filterDept, setFilterDept]           = useState('')
  const [filterFreq, setFilterFreq]           = useState('')
  const [filterType, setFilterType]           = useState('')
  const [filterMissingGov, setFilterMissingGov] = useState(false)
  const [bannerOpen, setBannerOpen]           = useState(true)

  const cid = state.selectedCompanyId
  const companyById = Object.fromEntries((state.companies ?? []).map(c => [c.id, c]))

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const incompleteEmps = useMemo(() =>
    state.employees.filter(e =>
      e.status === 'active' &&
      (!cid || e.companyId === cid) &&
      missingGovIds(e).length > 0
    )
  , [state.employees, cid])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const list = state.employees.filter(e => {
      if (cid && e.companyId !== cid)              return false
      if (filterStatus && e.status !== filterStatus)            return false
      if (filterDept   && e.department !== filterDept)          return false
      if (filterFreq   && e.payFrequency !== filterFreq)        return false
      if (filterType   && e.salaryType !== filterType)          return false
      if (filterMissingGov && missingGovIds(e).length === 0)    return false
      if (!q) return true
      return (
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q)  ||
        e.position.toLowerCase().includes(q)  ||
        e.department.toLowerCase().includes(q)
      )
    })
    return list.slice().sort((a, b) => {
      let va, vb
      if      (sortField === 'lastName')    { va = a.lastName;    vb = b.lastName }
      else if (sortField === 'department')  { va = a.department;  vb = b.department }
      else if (sortField === 'position')    { va = a.position;    vb = b.position }
      else if (sortField === 'basicSalary') { va = a.basicSalary; vb = b.basicSalary }
      else if (sortField === 'hireDate')    { va = a.hireDate;    vb = b.hireDate }
      else                                  { va = a.lastName;    vb = b.lastName }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })
  }, [state.employees, cid, search, filterStatus, filterDept, filterFreq, filterType, filterMissingGov, sortField, sortDir])

  function openAdd()      { setErrors({}); setModal({ mode: 'add',  data: { ...EMPTY, companyId: cid ?? '' } }) }
  function openEdit(emp)  { setErrors({}); setModal({ mode: 'edit', data: { ...emp } }) }
  function closeModal()   { setModal(null); setErrors({}) }

  function validate(d) {
    const e = {}
    if (!d.firstName.trim()) e.firstName = 'Required'
    if (!d.lastName.trim())  e.lastName  = 'Required'
    if (!d.position.trim())  e.position  = 'Required'
    if (!d.hireDate)         e.hireDate  = 'Required'
    if (!cid && !d.companyId) e.companyId = 'Required'
    const sal = Number(d.basicSalary)
    if (!sal || sal < 1) e.basicSalary = 'Must be > 0'
    return e
  }

  function handleSave() {
    const e = validate(modal.data)
    if (Object.keys(e).length) { setErrors(e); return }
    const data = { ...modal.data, basicSalary: Number(modal.data.basicSalary) }
    dispatch({ type: modal.mode === 'add' ? 'ADD_EMPLOYEE' : 'UPDATE_EMPLOYEE', employee: data })
    closeModal()
  }

  function set(field, value) {
    setModal(m => ({ ...m, data: { ...m.data, [field]: value } }))
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  const activeFilters = [filterStatus !== 'active', filterDept, filterFreq, filterType, filterMissingGov].filter(Boolean).length
  const d = modal?.data

  // ── Dept handlers ─────────────────────────────────────────
  function saveDept() {
    const name = deptModal?.name?.trim()
    if (!name) return
    if (deptModal.mode === 'add') dispatch({ type: 'ADD_DEPARTMENT', name })
    else dispatch({ type: 'UPDATE_DEPARTMENT', id: deptModal.id, name })
    setDeptModal(null)
  }
  function deleteDept(id) {
    if (window.confirm('Delete this department? Employees assigned to it will keep their current value.'))
      dispatch({ type: 'DELETE_DEPARTMENT', id })
  }

  // ── Position handlers ──────────────────────────────────────
  function savePos() {
    const name = posModal?.name?.trim()
    if (!name) return
    if (posModal.mode === 'add') dispatch({ type: 'ADD_POSITION', name })
    else dispatch({ type: 'UPDATE_POSITION', id: posModal.id, name })
    setPosModal(null)
  }
  function deletePos(id) {
    if (window.confirm('Delete this position? Employees assigned to it will keep their current value.'))
      dispatch({ type: 'DELETE_POSITION', id })
  }

  return (
    <div className="space-y-3">
      {/* Sub-tab navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 self-start w-fit">
        {[
          { id: 'employees',   label: 'All Employees', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
          { id: 'departments', label: 'Departments',   icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
          { id: 'positions',   label: 'Positions',     icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        ].map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setEmpTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              empTab === id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
            {label}
            {id === 'departments' && <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{depts.length}</span>}
            {id === 'positions'   && <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{positions.length}</span>}
          </button>
        ))}
      </div>

      {/* ── Departments tab ── */}
      {empTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{depts.length} department{depts.length !== 1 ? 's' : ''}</p>
            <button
              onClick={() => setDeptModal({ mode: 'add', name: '' })}
              className="bg-brand-700 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              + Add Department
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {depts.map(dept => {
              const count = state.employees.filter(e => e.status === 'active' && e.department === dept.name).length
              return (
                <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-3 hover:border-brand-300 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-800 text-sm truncate">{dept.name}</div>
                      <div className="text-xs text-gray-400">{count} employee{count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setDeptModal({ mode: 'edit', id: dept.id, name: dept.name })} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => deleteDept(dept.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              )
            })}
            {depts.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400 text-sm">No departments yet. Add one to get started.</div>
            )}
          </div>
          {/* Dept modal */}
          {deptModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="text-base font-bold text-gray-800 mb-4">{deptModal.mode === 'add' ? 'Add Department' : 'Edit Department'}</h3>
                <label className="block text-xs font-medium text-gray-600 mb-1">Department Name</label>
                <input
                  autoFocus
                  value={deptModal.name}
                  onChange={e => setDeptModal(m => ({ ...m, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && saveDept()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-5"
                  placeholder="e.g. Operations"
                />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setDeptModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button onClick={saveDept} disabled={!deptModal.name.trim()} className="px-5 py-2 text-sm font-semibold bg-brand-700 hover:bg-brand-600 disabled:opacity-40 text-white rounded-lg transition-colors">
                    {deptModal.mode === 'add' ? 'Add' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Positions tab ── */}
      {empTab === 'positions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{positions.length} position{positions.length !== 1 ? 's' : ''}</p>
            <button
              onClick={() => setPosModal({ mode: 'add', name: '' })}
              className="bg-brand-700 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              + Add Position
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {positions.map(pos => {
              const count = state.employees.filter(e => e.status === 'active' && e.position === pos.name).length
              return (
                <div key={pos.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-3 hover:border-brand-300 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-800 text-sm truncate">{pos.name}</div>
                      <div className="text-xs text-gray-400">{count} employee{count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setPosModal({ mode: 'edit', id: pos.id, name: pos.name })} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => deletePos(pos.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              )
            })}
            {positions.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400 text-sm">No positions yet. Add one to get started.</div>
            )}
          </div>
          {/* Position modal */}
          {posModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="text-base font-bold text-gray-800 mb-4">{posModal.mode === 'add' ? 'Add Position' : 'Edit Position'}</h3>
                <label className="block text-xs font-medium text-gray-600 mb-1">Position Title</label>
                <input
                  autoFocus
                  value={posModal.name}
                  onChange={e => setPosModal(m => ({ ...m, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && savePos()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-5"
                  placeholder="e.g. Farm Technician"
                />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setPosModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button onClick={savePos} disabled={!posModal.name.trim()} className="px-5 py-2 text-sm font-semibold bg-brand-700 hover:bg-brand-600 disabled:opacity-40 text-white rounded-lg transition-colors">
                    {posModal.mode === 'add' ? 'Add' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Employees tab ── */}
      {empTab !== 'employees' ? null : <>
      {/* Toolbar row 1 */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input
          type="search"
          placeholder="Search by name, position, department…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex items-center gap-2 shrink-0">
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
            onClick={openAdd}
            className="bg-brand-700 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {/* Toolbar row 2 — filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-400 font-medium">Filter:</span>

        <FilterSelect value={filterStatus} onChange={setFilterStatus}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </FilterSelect>

        <FilterSelect value={filterDept} onChange={setFilterDept}>
          <option value="">All departments</option>
          {depts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </FilterSelect>

        <FilterSelect value={filterFreq} onChange={setFilterFreq}>
          <option value="">All frequencies</option>
          <option value="semi-monthly">Semi-monthly</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </FilterSelect>

        <FilterSelect value={filterType} onChange={setFilterType}>
          <option value="">All pay types</option>
          <option value="monthly">Monthly salary</option>
          <option value="daily">Daily rate</option>
          <option value="hourly">Hourly rate</option>
        </FilterSelect>

        <button
          onClick={() => setFilterMissingGov(v => !v)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border font-medium transition-colors ${
            filterMissingGov
              ? 'bg-amber-100 border-amber-300 text-amber-800'
              : 'border-amber-200 text-amber-700 hover:bg-amber-50'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          Missing Gov't IDs
          {incompleteEmps.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {incompleteEmps.length}
            </span>
          )}
        </button>

        {activeFilters > 0 && (
          <button
            onClick={() => { setFilterStatus('active'); setFilterDept(''); setFilterFreq(''); setFilterType(''); setFilterMissingGov(false) }}
            className="text-xs text-red-400 hover:text-red-600 hover:underline"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400">{filtered.length} employee{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Gov't ID warning banner ── */}
      {incompleteEmps.length > 0 && bannerOpen && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-amber-800">
                  {incompleteEmps.length} active employee{incompleteEmps.length !== 1 ? 's' : ''} with incomplete government requirements
                </p>
                <div className="mt-2 space-y-1">
                  {incompleteEmps.map(emp => {
                    const missing = missingGovIds(emp)
                    return (
                      <div key={emp.id} className="flex items-center gap-2 text-xs text-amber-700">
                        <Link
                          to={`/employees/${emp.id}`}
                          className="font-medium hover:underline"
                        >
                          {emp.firstName} {emp.lastName}
                        </Link>
                        <span className="text-amber-400">·</span>
                        <span className="text-amber-600">Missing: {missing.join(', ')}</span>
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={() => { setFilterMissingGov(true); setBannerOpen(false) }}
                  className="mt-2 text-xs text-amber-700 font-medium hover:underline"
                >
                  Filter to show only these employees →
                </button>
              </div>
            </div>
            <button
              onClick={() => setBannerOpen(false)}
              className="text-amber-400 hover:text-amber-600 shrink-0 mt-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Table view ── */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <Th field="lastName"    sort={sortField} dir={sortDir} onSort={toggleSort} className="px-4 py-3">Employee</Th>
                {!cid && <th className="text-left px-4 py-3 font-medium">Company</th>}
                <Th field="department"  sort={sortField} dir={sortDir} onSort={toggleSort} className="px-4 py-3">Department</Th>
                <Th field="position"    sort={sortField} dir={sortDir} onSort={toggleSort} className="px-4 py-3">Position</Th>
                <Th field="basicSalary" sort={sortField} dir={sortDir} onSort={toggleSort} className="px-4 py-3">Basic Salary</Th>
                <Th field="hireDate"    sort={sortField} dir={sortDir} onSort={toggleSort} className="px-4 py-3">Hire Date</Th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(emp => {
                const missing = missingGovIds(emp)
                return (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</span>
                      {missing.length > 0 && (
                        <span title={`Missing: ${missing.join(', ')}`} className="group relative inline-flex">
                          <svg className="w-3.5 h-3.5 text-amber-500 cursor-default" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="absolute left-5 top-0 z-50 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-lg">
                            Missing: {missing.join(', ')}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{emp.id}</div>
                  </td>
                  {!cid && (
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {companyById[emp.companyId]?.shortName ?? '—'}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{emp.department}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.position}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-mono text-gray-800">₱{Number(emp.basicSalary).toLocaleString()}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-xs ${
                        emp.salaryType === 'monthly' ? 'text-blue-600' :
                        emp.salaryType === 'daily'   ? 'text-amber-600' : 'text-purple-600'
                      }`}>
                        {emp.salaryType === 'monthly' ? '/mo' : emp.salaryType === 'daily' ? '/day' : '/hr'}
                      </span>
                      <span className={`text-xs px-1 rounded font-medium ${
                        emp.payFrequency === 'monthly' ? 'bg-indigo-50 text-indigo-600' :
                        emp.payFrequency === 'weekly'  ? 'bg-emerald-50 text-emerald-600' :
                                                         'bg-gray-100 text-gray-500'
                      }`}>
                        {emp.payFrequency === 'monthly' ? 'EOM' : emp.payFrequency === 'weekly' ? 'Wkly' : '15/30'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{emp.hireDate}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => dispatch({ type: 'TOGGLE_EMPLOYEE_STATUS', id: emp.id })}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {emp.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link to={`/employees/${emp.id}`} className="text-xs text-gray-400 hover:text-gray-700 hover:underline">
                        View
                      </Link>
                      <button onClick={() => openEdit(emp)} className="text-xs text-brand-700 hover:underline">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={cid ? 7 : 8} className="px-4 py-10 text-center text-gray-400 text-sm">
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
          <table className="w-max min-w-full text-xs border-collapse">
            <thead>
              {/* Group header */}
              <tr className="bg-brand-800 text-white">
                <th rowSpan={2} className="sticky left-0 z-20 bg-brand-800 px-4 py-3 text-left font-semibold border-r border-brand-700 min-w-[200px] whitespace-nowrap align-bottom">
                  Employee
                </th>
                {!cid && (
                  <th rowSpan={2} className="px-3 py-3 font-semibold border-r border-brand-700 whitespace-nowrap align-bottom text-left text-[10px] uppercase tracking-widest text-brand-200">
                    Co.
                  </th>
                )}
                <th colSpan={3} className="px-3 py-1.5 text-center font-semibold border-r border-b border-brand-700 text-brand-200 text-[10px] tracking-widest uppercase">
                  Personal
                </th>
                <th colSpan={3} className="px-3 py-1.5 text-center font-semibold border-r border-b border-brand-700 text-brand-200 text-[10px] tracking-widest uppercase">
                  Compensation
                </th>
                <th colSpan={4} className="px-3 py-1.5 text-center font-semibold border-r border-b border-brand-700 text-brand-200 text-[10px] tracking-widest uppercase">
                  Gov't IDs
                </th>
                <th colSpan={3} className="px-3 py-1.5 text-center font-semibold border-r border-b border-brand-700 text-brand-200 text-[10px] tracking-widest uppercase">
                  Per-period Deductions
                </th>
                <th rowSpan={2} className="px-3 py-3 border-l border-brand-700 align-bottom" />
              </tr>
              {/* Sub-header */}
              <tr className="bg-brand-700 text-brand-100 text-[10px]">
                <ESHd>Department</ESHd>
                <ESHd>Position</ESHd>
                <ESHd>Hire Date</ESHd>
                <ESHd>Pay Type</ESHd>
                <ESHd>Rate</ESHd>
                <ESHd>Frequency</ESHd>
                <ESHd>SSS No.</ESHd>
                <ESHd>PhilHealth</ESHd>
                <ESHd>Pag-IBIG</ESHd>
                <ESHd>TIN</ESHd>
                <ESHd>Savings</ESHd>
                <ESHd>Insurance</ESHd>
                <ESHd>Bank Chg.</ESHd>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, ri) => {
                const even = ri % 2 === 0
                const sheetMissing = missingGovIds(emp)
                const deptColor =
                  emp.department === 'Executive'       ? 'text-purple-600' :
                  emp.department === 'Agronomy'        ? 'text-green-700'  :
                  emp.department === 'Sales'           ? 'text-blue-600'   :
                  emp.department === 'Finance'         ? 'text-amber-700'  :
                  emp.department === 'Human Resources' ? 'text-pink-600'   :
                  emp.department === 'Operations'      ? 'text-teal-600'   : 'text-gray-600'
                const rateColor =
                  emp.salaryType === 'monthly' ? 'text-blue-700'   :
                  emp.salaryType === 'daily'   ? 'text-amber-700'  : 'text-purple-700'
                return (
                  <tr key={emp.id} className={even ? 'bg-white' : 'bg-gray-50/60'}>
                    <td className={`sticky left-0 z-10 px-4 py-2 border-r border-b border-gray-200 whitespace-nowrap ${even ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-800">{emp.lastName}, {emp.firstName}</span>
                        {sheetMissing.length > 0 && (
                          <svg className="w-3 h-3 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400">{emp.id}</div>
                    </td>
                    {!cid && (
                      <td className={`px-3 py-2 border-r border-b border-gray-100 ${even ? 'bg-white' : 'bg-gray-50'}`}>
                        <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                          {companyById[emp.companyId]?.shortName ?? '—'}
                        </span>
                      </td>
                    )}
                    <ESTd className={`font-medium ${deptColor}`}>{emp.department}</ESTd>
                    <ESTd className="text-gray-600">{emp.position}</ESTd>
                    <ESTd className="text-gray-500">{emp.hireDate || '—'}</ESTd>
                    <ESTd>
                      <span className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${
                        emp.salaryType === 'monthly' ? 'bg-blue-50 text-blue-700' :
                        emp.salaryType === 'daily'   ? 'bg-amber-50 text-amber-700' :
                                                       'bg-purple-50 text-purple-700'
                      }`}>
                        {emp.salaryType === 'monthly' ? 'Monthly' : emp.salaryType === 'daily' ? 'Daily' : 'Hourly'}
                      </span>
                    </ESTd>
                    <ESTd className={`font-mono font-semibold ${rateColor}`}>
                      ₱{Number(emp.basicSalary).toLocaleString()}
                    </ESTd>
                    <ESTd>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        emp.payFrequency === 'monthly' ? 'bg-indigo-50 text-indigo-600' :
                        emp.payFrequency === 'weekly'  ? 'bg-emerald-50 text-emerald-600' :
                                                         'bg-gray-100 text-gray-500'
                      }`}>
                        {emp.payFrequency === 'monthly' ? 'EOM' : emp.payFrequency === 'weekly' ? 'Weekly' : '15th/30th'}
                      </span>
                    </ESTd>
                    <ESTd className={`font-mono ${emp.sssNo ? 'text-gray-500' : 'bg-amber-50 text-amber-500 font-semibold'}`}>{emp.sssNo || 'Missing'}</ESTd>
                    <ESTd className={`font-mono ${emp.philhealthNo ? 'text-gray-500' : 'bg-amber-50 text-amber-500 font-semibold'}`}>{emp.philhealthNo || 'Missing'}</ESTd>
                    <ESTd className={`font-mono ${emp.pagibigNo ? 'text-gray-500' : 'bg-amber-50 text-amber-500 font-semibold'}`}>{emp.pagibigNo || 'Missing'}</ESTd>
                    <ESTd className={`font-mono ${emp.tinNo ? 'text-gray-500' : 'bg-amber-50 text-amber-500 font-semibold'}`}>{emp.tinNo || 'Missing'}</ESTd>
                    <ESTd className={`font-mono ${emp.savings > 0 ? 'text-teal-600' : 'text-gray-300'}`}>
                      {emp.savings > 0 ? `₱${Number(emp.savings).toLocaleString()}` : '—'}
                    </ESTd>
                    <ESTd className={`font-mono ${emp.insurance > 0 ? 'text-indigo-600' : 'text-gray-300'}`}>
                      {emp.insurance > 0 ? `₱${Number(emp.insurance).toLocaleString()}` : '—'}
                    </ESTd>
                    <ESTd className={`font-mono ${emp.bankCharges > 0 ? 'text-red-400' : 'text-gray-300'}`}>
                      {emp.bankCharges > 0 ? `₱${Number(emp.bankCharges).toLocaleString()}` : '—'}
                    </ESTd>
                    <td className={`px-3 py-2 border-l border-b border-gray-100 ${even ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dispatch({ type: 'TOGGLE_EMPLOYEE_STATUS', id: emp.id })}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {emp.status}
                        </button>
                        <Link to={`/employees/${emp.id}`} className="text-[10px] text-gray-400 hover:text-gray-700 hover:underline whitespace-nowrap">View</Link>
                        <button onClick={() => openEdit(emp)} className="text-[10px] text-brand-700 hover:underline">Edit</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={cid ? 15 : 16} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No employees match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      </> /* end employees tab */}

      {/* Add / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">
                {modal.mode === 'add' ? 'Add Employee' : 'Edit Employee'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              <section>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Basic Info</h4>
                <div className="grid grid-cols-2 gap-3">
                  {!cid && (
                    <Field label="Company" error={errors.companyId} className="col-span-2">
                      <select value={d.companyId ?? ''} onChange={e => set('companyId', e.target.value)} className={input(errors.companyId)}>
                        <option value="">— Select company —</option>
                        {(state.companies ?? []).filter(c => c.status === 'active').map(c => (
                          <option key={c.id} value={c.id}>{c.shortName} — {c.name}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                  <Field label="First Name" error={errors.firstName}>
                    <input value={d.firstName} onChange={e => set('firstName', e.target.value)} className={input(errors.firstName)} />
                  </Field>
                  <Field label="Last Name" error={errors.lastName}>
                    <input value={d.lastName} onChange={e => set('lastName', e.target.value)} className={input(errors.lastName)} />
                  </Field>
                  <Field label="Position" error={errors.position} className="col-span-2">
                    <input
                      list="emp-positions-list"
                      value={d.position}
                      onChange={e => set('position', e.target.value)}
                      className={input(errors.position)}
                      placeholder="Type or select a position"
                    />
                    <datalist id="emp-positions-list">
                      {positions.map(p => <option key={p.id} value={p.name} />)}
                    </datalist>
                  </Field>
                  <Field label="Department">
                    <select value={d.department} onChange={e => set('department', e.target.value)} className={input()}>
                      {depts.map(dep => <option key={dep.id} value={dep.name}>{dep.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Hire Date" error={errors.hireDate}>
                    <input type="date" value={d.hireDate} onChange={e => set('hireDate', e.target.value)} className={input(errors.hireDate)} />
                  </Field>
                  <Field label="Email" className="col-span-2">
                    <input type="email" value={d.email} onChange={e => set('email', e.target.value)} className={input()} />
                  </Field>
                  <Field label="Phone">
                    <input value={d.phone} onChange={e => set('phone', e.target.value)} className={input()} />
                  </Field>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Compensation</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pay Type">
                    <select value={d.salaryType} onChange={e => set('salaryType', e.target.value)} className={input()}>
                      <option value="monthly">Monthly (fixed salary)</option>
                      <option value="daily">Daily rate (days × rate)</option>
                      <option value="hourly">Hourly rate (hours × rate)</option>
                    </select>
                  </Field>
                  <Field label="Pay Frequency">
                    <select value={d.payFrequency ?? 'semi-monthly'} onChange={e => set('payFrequency', e.target.value)} className={input()}>
                      <option value="semi-monthly">Semi-monthly (15th &amp; 30th)</option>
                      <option value="weekly">Weekly (Mon–Sat, 6 days)</option>
                      <option value="monthly">Monthly (end of month)</option>
                    </select>
                  </Field>
                  <Field
                    label={
                      d.salaryType === 'monthly' ? 'Monthly Rate (₱)' :
                      d.salaryType === 'daily'   ? `Daily Rate (₱) — min ₱${PH_MIN_WAGE_DAILY}` :
                                                   `Hourly Rate (₱) — min ₱${PH_MIN_WAGE_HOURLY}`
                    }
                    error={errors.basicSalary}
                  >
                    <input
                      type="number" value={d.basicSalary}
                      onChange={e => set('basicSalary', e.target.value)}
                      className={input(errors.basicSalary)}
                      min={d.salaryType === 'hourly' ? PH_MIN_WAGE_HOURLY : d.salaryType === 'daily' ? PH_MIN_WAGE_DAILY : 1}
                      step={d.salaryType === 'hourly' ? '0.01' : '1'}
                    />
                  </Field>
                </div>
              </section>

              <section>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Per-period Deductions</h4>
                <p className="text-xs text-gray-400 mb-3">Deducted every payroll run. Update before generating payroll.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Savings (₱)',      'savings'],
                    ['Insurance (₱)',    'insurance'],
                    ['Bank Charges (₱)', 'bankCharges'],
                  ].map(([label, field]) => (
                    <Field key={field} label={label}>
                      <input type="number" value={d[field] ?? 0} min={0} step="0.01"
                        onChange={e => set(field, e.target.value)} className={input()} />
                    </Field>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Government IDs</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['SSS No.', 'sssNo'], ['PhilHealth No.', 'philhealthNo'],
                    ['Pag-IBIG No.', 'pagibigNo'], ['TIN', 'tinNo'],
                  ].map(([label, field]) => (
                    <Field key={field} label={label}>
                      <input value={d[field]} onChange={e => set(field, e.target.value)} className={input()} />
                    </Field>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-brand-700 hover:bg-brand-600 text-white rounded-lg transition-colors">
                {modal.mode === 'add' ? 'Add Employee' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shared sort header ────────────────────────────────────
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

function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-400"
    >
      {children}
    </select>
  )
}

function Field({ label, error, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}

function input(error) {
  return `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
    error ? 'border-red-400' : 'border-gray-300'
  }`
}

function ESHd({ children }) {
  return (
    <th className="px-3 py-2 font-medium border-r border-brand-600 whitespace-nowrap text-center">
      {children}
    </th>
  )
}

function ESTd({ children, className = '' }) {
  return (
    <td className={`px-3 py-2 border-r border-b border-gray-100 whitespace-nowrap ${className}`}>
      {children}
    </td>
  )
}
