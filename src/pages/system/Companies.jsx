import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'

const INDUSTRIES = [
  'Agriculture', 'Fresh Produce', 'Banana Production', 'Livestock',
  'Aquaculture', 'Agro-processing', 'Trading', 'Manufacturing', 'Services', 'Other',
]

const EMPTY = {
  name: '', shortName: '', industry: 'Agriculture',
  contactPerson: '', phone: '', email: '', address: '', status: 'active',
  birTin: '', sssEmployerId: '', philhealthEmployerNo: '', pagibigEmployerMid: '', birCertNo: '',
}

export default function Companies() {
  const { state, dispatch } = useApp()
  const [modal, setModal]   = useState(null)
  const [errors, setErrors] = useState({})
  const [search, setSearch] = useState('')

  // Sort
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir]     = useState('asc')

  // Filters
  const [filterStatus, setFilterStatus]     = useState('active')
  const [filterIndustry, setFilterIndustry] = useState('')

  const empByCompany = useMemo(() => {
    const map = {}
    for (const emp of (state.employees ?? [])) {
      map[emp.companyId] = (map[emp.companyId] ?? 0) + 1
    }
    return map
  }, [state.employees])

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const list = (state.companies ?? []).filter(c => {
      if (filterStatus   && c.status   !== filterStatus)   return false
      if (filterIndustry && c.industry !== filterIndustry) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q)        ||
        c.shortName?.toLowerCase().includes(q)  ||
        c.industry?.toLowerCase().includes(q)   ||
        c.contactPerson?.toLowerCase().includes(q)
      )
    })
    return list.slice().sort((a, b) => {
      let va, vb
      if      (sortField === 'name')       { va = a.name;                      vb = b.name }
      else if (sortField === 'employees')  { va = empByCompany[a.id] ?? 0;     vb = empByCompany[b.id] ?? 0 }
      else if (sortField === 'industry')   { va = a.industry ?? '';             vb = b.industry ?? '' }
      else if (sortField === 'createdAt')  { va = a.createdAt ?? '';            vb = b.createdAt ?? '' }
      else                                 { va = a.name;                      vb = b.name }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })
  }, [state.companies, empByCompany, search, filterStatus, filterIndustry, sortField, sortDir])

  function openAdd()    { setErrors({}); setModal({ mode: 'add',  data: { ...EMPTY } }) }
  function openEdit(co) { setErrors({}); setModal({ mode: 'edit', data: { ...co } }) }
  function closeModal() { setModal(null); setErrors({}) }

  function validate(d) {
    const e = {}
    if (!d.name.trim())          e.name          = 'Required'
    if (!d.shortName.trim())     e.shortName     = 'Required'
    if (!d.contactPerson.trim()) e.contactPerson = 'Required'
    return e
  }

  function handleSave() {
    const e = validate(modal.data)
    if (Object.keys(e).length) { setErrors(e); return }
    dispatch({ type: modal.mode === 'add' ? 'ADD_COMPANY' : 'UPDATE_COMPANY', company: modal.data })
    closeModal()
  }

  function set(field, value) {
    setModal(m => ({ ...m, data: { ...m.data, [field]: value } }))
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  const SORT_OPTIONS = [
    { value: 'name',      label: 'Name A–Z' },
    { value: 'employees', label: 'Most employees' },
    { value: 'industry',  label: 'Industry' },
    { value: 'createdAt', label: 'Date added' },
  ]

  const d = modal?.data

  return (
    <div className="space-y-3">
      {/* Toolbar row 1 */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input
          type="search"
          placeholder="Search companies…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={openAdd}
          className="shrink-0 bg-brand-700 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add Company
        </button>
      </div>

      {/* Toolbar row 2 — filter + sort */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-400 font-medium">Filter:</span>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-400"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={filterIndustry}
          onChange={e => setFilterIndustry(e.target.value)}
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-400"
        >
          <option value="">All industries</option>
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>

        {(filterStatus !== 'active' || filterIndustry) && (
          <button
            onClick={() => { setFilterStatus('active'); setFilterIndustry('') }}
            className="text-xs text-red-400 hover:text-red-600 hover:underline"
          >
            Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">Sort:</span>
          <div className="flex gap-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => toggleSort(opt.value)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  sortField === opt.value
                    ? 'border-brand-300 bg-brand-50 text-brand-700 font-medium'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {opt.label}
                {sortField === opt.value && (
                  <span className="ml-1 text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span>
                )}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">{filtered.length} compan{filtered.length !== 1 ? 'ies' : 'y'}</span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(co => {
          const empCount = empByCompany[co.id] ?? 0
          return (
            <div key={co.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
                  {co.shortName}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  co.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {co.status}
                </span>
              </div>
              <div className="font-semibold text-gray-800 text-sm leading-tight mb-0.5">{co.name}</div>
              <div className="text-xs text-brand-600 mb-3">{co.industry}</div>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {co.contactPerson}
                </div>
                {co.phone && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {co.phone}
                  </div>
                )}
                {co.address && (
                  <div className="flex items-start gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {co.address}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">{empCount} employee{empCount !== 1 ? 's' : ''}</span>
                <button onClick={() => openEdit(co)} className="text-xs text-brand-700 hover:underline">Edit</button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <div className="text-sm text-gray-400">No companies match the current filters.</div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">
                {modal.mode === 'add' ? 'Add Company' : 'Edit Company'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Company Name" error={errors.name} className="col-span-2">
                  <input value={d.name} onChange={e => set('name', e.target.value)}
                    className={inp(errors.name)} placeholder="Full legal name" />
                </Field>
                <Field label="Short Name / Code" error={errors.shortName}>
                  <input value={d.shortName} onChange={e => set('shortName', e.target.value)}
                    className={inp(errors.shortName)} placeholder="e.g. MAH" maxLength={6} />
                </Field>
                <Field label="Industry">
                  <select value={d.industry} onChange={e => set('industry', e.target.value)} className={inp()}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </Field>
                <Field label="Contact Person" error={errors.contactPerson} className="col-span-2">
                  <input value={d.contactPerson} onChange={e => set('contactPerson', e.target.value)}
                    className={inp(errors.contactPerson)} />
                </Field>
                <Field label="Phone">
                  <input value={d.phone} onChange={e => set('phone', e.target.value)} className={inp()} />
                </Field>
                <Field label="Email">
                  <input type="email" value={d.email} onChange={e => set('email', e.target.value)} className={inp()} />
                </Field>
                <Field label="Address" className="col-span-2">
                  <input value={d.address} onChange={e => set('address', e.target.value)} className={inp()} />
                </Field>
                {modal.mode === 'edit' && (
                  <Field label="Status">
                    <select value={d.status} onChange={e => set('status', e.target.value)} className={inp()}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </Field>
                )}
              </div>

              <div className="pt-2">
                <div className="text-xs font-semibold text-gray-700 mb-0.5">Government Registration Numbers</div>
                <div className="text-xs text-gray-400 mb-3">Optional — used for payroll reports and statutory filings.</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="BIR TIN (Employer)">
                    <input value={d.birTin} onChange={e => set('birTin', e.target.value)} className={inp()} placeholder="000-000-000-000" />
                  </Field>
                  <Field label="SSS Employer ID">
                    <input value={d.sssEmployerId} onChange={e => set('sssEmployerId', e.target.value)} className={inp()} placeholder="03-0000000-0" />
                  </Field>
                  <Field label="PhilHealth Employer No.">
                    <input value={d.philhealthEmployerNo} onChange={e => set('philhealthEmployerNo', e.target.value)} className={inp()} placeholder="00-000000000-0" />
                  </Field>
                  <Field label="Pag-IBIG Employer MID">
                    <input value={d.pagibigEmployerMid} onChange={e => set('pagibigEmployerMid', e.target.value)} className={inp()} placeholder="000000000000" />
                  </Field>
                  <Field label="BIR Certificate of Registration No." className="col-span-2">
                    <input value={d.birCertNo} onChange={e => set('birCertNo', e.target.value)} className={inp()} placeholder="e.g. 0000-0000-00-00-0-00000" />
                  </Field>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2 bg-brand-700 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors">
                {modal.mode === 'add' ? 'Add Company' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, error, className = '', children }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{error && <span className="text-red-500 ml-1">— {error}</span>}
      </label>
      {children}
    </div>
  )
}

function inp(err) {
  return `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`
}
