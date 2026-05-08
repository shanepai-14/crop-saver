// FILE: src/pages/system/LeaveTypes.jsx
import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'

const EMPTY_FORM = {
  code: '',
  name: '',
  daysPerYear: 5,
  isPaid: true,
  isDole: false,
  genderRestriction: null,
  requiresDocs: false,
  carryOver: false,
  carryOverMax: 0,
  description: '',
}

function InfoDot({ color }) {
  const colors = {
    green:  'bg-green-500',
    red:    'bg-red-400',
    amber:  'bg-amber-400',
    gray:   'bg-gray-400',
  }
  return <span className={`w-2 h-2 rounded-full inline-block mr-1 shrink-0 ${colors[color] ?? 'bg-gray-400'}`} />
}

export default function LeaveTypes() {
  const { state, dispatch } = useApp()

  const leaveTypes = useMemo(() => state.leaveTypes ?? [], [state.leaveTypes])

  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  function openAdd() {
    setForm(EMPTY_FORM)
    setErrors({})
    setModal('add')
  }

  function openEdit(lt) {
    setForm({ ...lt })
    setErrors({})
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setErrors({})
  }

  function handleField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function validate() {
    const e = {}
    if (!form.code.trim())             e.code = 'Code is required'
    if (form.code.trim().length > 6)   e.code = 'Max 6 characters'
    if (!form.name.trim())             e.name = 'Name is required'
    if (!form.daysPerYear || form.daysPerYear < 1) e.daysPerYear = 'Must be at least 1'
    if (form.carryOver && (form.carryOverMax == null || form.carryOverMax < 0)) e.carryOverMax = 'Enter a valid number'
    return e
  }

  function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const leaveType = {
      ...form,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      daysPerYear: Number(form.daysPerYear),
      carryOverMax: form.carryOver ? Number(form.carryOverMax) : 0,
      genderRestriction: form.genderRestriction || null,
    }

    if (modal === 'add') {
      dispatch({ type: 'ADD_LEAVE_TYPE', leaveType })
    } else {
      dispatch({ type: 'UPDATE_LEAVE_TYPE', leaveType })
    }
    closeModal()
  }

  function handleDelete(id, name) {
    if (!window.confirm(`Delete leave type "${name}"? This cannot be undone.`)) return
    dispatch({ type: 'DELETE_LEAVE_TYPE', id })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leave Types</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure DOLE-mandated and company leave policies</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-brand-700 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Leave Type
        </button>
      </div>

      {leaveTypes.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-sm font-medium text-gray-600 mb-1">No leave types configured yet</div>
          <div className="text-xs text-gray-400">Click "+ Add Leave Type" to create your first policy.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {leaveTypes.map(lt => (
            <LeaveTypeCard
              key={lt.id}
              lt={lt}
              onEdit={() => openEdit(lt)}
              onDelete={() => handleDelete(lt.id, lt.name)}
            />
          ))}
        </div>
      )}

      {modal && (
        <LeaveTypeModal
          mode={modal}
          form={form}
          errors={errors}
          onChange={handleField}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

function LeaveTypeCard({ lt, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow relative group">
      <div className="flex items-start justify-between mb-2">
        <span className="font-mono text-xs uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
          {lt.code}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {lt.isDole && (
            <span className="text-[10px] font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">DOLE</span>
          )}
          {lt.genderRestriction === 'female' && (
            <span className="text-[10px] font-semibold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">Female only</span>
          )}
          {lt.genderRestriction === 'male' && (
            <span className="text-[10px] font-semibold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">Male only</span>
          )}
        </div>
      </div>

      <div className="font-bold text-gray-800 text-sm mb-1.5">{lt.name}</div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
        <span>{lt.daysPerYear} days/yr</span>
        <span className="text-gray-300">·</span>
        <span className="flex items-center">
          <InfoDot color={lt.isPaid ? 'green' : 'red'} />
          {lt.isPaid ? 'With Pay' : 'No Pay'}
        </span>
        {lt.requiresDocs && (
          <>
            <span className="text-gray-300">·</span>
            <span className="flex items-center">
              <InfoDot color="amber" />
              Docs Required
            </span>
          </>
        )}
        {lt.carryOver && (
          <>
            <span className="text-gray-300">·</span>
            <span className="flex items-center">
              <InfoDot color="gray" />
              Carry Over (max {lt.carryOverMax}d)
            </span>
          </>
        )}
      </div>

      {lt.description && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{lt.description}</p>
      )}

      <div className="absolute top-3 right-3 hidden group-hover:flex items-center gap-1">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-700 transition-colors"
          title="Edit"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function LeaveTypeModal({ mode, form, errors, onChange, onSave, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-semibold text-gray-800">
            {mode === 'add' ? 'Add Leave Type' : 'Edit Leave Type'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Code <span className="text-red-400">*</span>
                <span className="text-gray-400 font-normal ml-1">(max 6)</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={e => onChange('code', e.target.value.toUpperCase().slice(0, 6))}
                maxLength={6}
                className={`w-full border rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.code ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="VL"
              />
              {errors.code && <p className="text-xs text-red-500 mt-0.5">{errors.code}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Days per Year <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.daysPerYear}
                onChange={e => onChange('daysPerYear', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.daysPerYear ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.daysPerYear && <p className="text-xs text-red-500 mt-0.5">{errors.daysPerYear}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => onChange('name', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="Vacation Leave"
            />
            {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Gender Restriction</label>
            <select
              value={form.genderRestriction ?? ''}
              onChange={e => onChange('genderRestriction', e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">None (all employees)</option>
              <option value="female">Female only</option>
              <option value="male">Male only</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isPaid}
                onChange={e => onChange('isPaid', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">With Pay</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isDole}
                onChange={e => onChange('isDole', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">DOLE Mandated</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.requiresDocs}
                onChange={e => onChange('requiresDocs', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">Requires Documents</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.carryOver}
                onChange={e => onChange('carryOver', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">Carry Over</span>
            </label>
          </div>

          {form.carryOver && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Max Carry Over Days <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.carryOverMax}
                onChange={e => onChange('carryOverMax', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.carryOverMax ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.carryOverMax && <p className="text-xs text-red-500 mt-0.5">{errors.carryOverMax}</p>}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => onChange('description', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              placeholder="Optional description or policy notes…"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 text-sm font-semibold bg-brand-700 hover:bg-brand-600 text-white rounded-lg transition-colors"
          >
            {mode === 'add' ? 'Add Leave Type' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
