import { createContext, useContext, useReducer, useEffect } from 'react'
import { INITIAL_COMPANIES, INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, INITIAL_PAYROLLS, INITIAL_DEPARTMENTS, INITIAL_POSITIONS } from '../data/mockData'
import { computePayrollItem, getWorkingDays, getWorkingDaysByCutoff, getWorkingDaysBetween, getWorkingDaysSixDayBetween } from '../utils/payroll'

const STORAGE_KEY = 'cspc_hr_state_v4'

const DEMO_USERS = [
  { id: 'U1', email: 'admin@cspc.com.ph', password: 'admin123', name: 'Jose Castillo', role: 'admin' },
  { id: 'U2', email: 'hr@cspc.com.ph',    password: 'hr1234',   name: 'Liza Aquino',   role: 'hr' },
]

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

const INITIAL_LEAVE_TYPES = [
  {
    id: 'LT001', code: 'BL', name: 'Bereavement Leave',
    daysPerYear: 3, isPaid: true, isDole: false,
    genderRestriction: null, requiresDocs: false,
    carryOver: false, carryOverMax: 0,
    description: 'Leave for death of immediate family members.',
  },
  {
    id: 'LT002', code: 'EL', name: 'Emergency Leave',
    daysPerYear: 3, isPaid: false, isDole: false,
    genderRestriction: null, requiresDocs: false,
    carryOver: false, carryOverMax: 0,
    description: 'Emergency leave (without pay).',
  },
  {
    id: 'LT003', code: 'ML', name: 'Maternity Leave',
    daysPerYear: 105, isPaid: true, isDole: true,
    genderRestriction: 'female', requiresDocs: true,
    carryOver: false, carryOverMax: 0,
    description: '105 days paid maternity leave (RA 11210). Additional 15 days for single mothers. C-section: 120 days.',
  },
  {
    id: 'LT004', code: 'PL', name: 'Paternity Leave',
    daysPerYear: 7, isPaid: true, isDole: true,
    genderRestriction: 'male', requiresDocs: true,
    carryOver: false, carryOverMax: 0,
    description: '7 days paternity leave for first 4 deliveries (RA 8187).',
  },
  {
    id: 'LT005', code: 'SIL', name: 'Service Incentive Leave',
    daysPerYear: 5, isPaid: true, isDole: true,
    genderRestriction: null, requiresDocs: false,
    carryOver: false, carryOverMax: 0,
    description: '5 days SIL per year for employees with at least 1 year of service (Art. 95, Labor Code).',
  },
  {
    id: 'LT006', code: 'SL', name: 'Sick Leave',
    daysPerYear: 5, isPaid: true, isDole: false,
    genderRestriction: null, requiresDocs: false,
    carryOver: false, carryOverMax: 0,
    description: 'Company-provided sick leave.',
  },
  {
    id: 'LT007', code: 'SPL', name: 'Solo Parent Leave',
    daysPerYear: 7, isPaid: true, isDole: true,
    genderRestriction: null, requiresDocs: true,
    carryOver: false, carryOverMax: 0,
    description: '7 additional leave days per year for solo parents with Solo Parent ID (RA 8972).',
  },
  {
    id: 'LT008', code: 'VL', name: 'Vacation Leave',
    daysPerYear: 5, isPaid: true, isDole: false,
    genderRestriction: null, requiresDocs: false,
    carryOver: true, carryOverMax: 15,
    description: 'Company-provided vacation leave.',
  },
  {
    id: 'LT009', code: 'VAWC', name: 'VAWC Leave',
    daysPerYear: 10, isPaid: true, isDole: true,
    genderRestriction: 'female', requiresDocs: true,
    carryOver: false, carryOverMax: 0,
    description: '10 days leave for victims of Violence Against Women and Children (RA 9262).',
  },
]

function initialState() {
  const saved = loadState()
  return {
    currentUser:       saved?.currentUser       ?? null,
    companies:         saved?.companies         ?? INITIAL_COMPANIES,
    selectedCompanyId: saved?.selectedCompanyId ?? null,
    employees:         saved?.employees         ?? INITIAL_EMPLOYEES,
    attendance:        saved?.attendance        ?? INITIAL_ATTENDANCE,
    payrolls:          saved?.payrolls          ?? INITIAL_PAYROLLS,
    departments:       saved?.departments       ?? INITIAL_DEPARTMENTS,
    positions:         saved?.positions         ?? INITIAL_POSITIONS,
    leaveTypes:        (saved?.leaveTypes?.length >= INITIAL_LEAVE_TYPES.length) ? saved.leaveTypes : INITIAL_LEAVE_TYPES,
    leaveRequests:     saved?.leaveRequests     ?? [],
    payrollLoading: false,
  }
}

function reducer(state, action) {
  switch (action.type) {

    case 'LOGIN': {
      const user = DEMO_USERS.find(u => u.email === action.email && u.password === action.password)
      if (!user) return { ...state, loginError: 'Invalid email or password.' }
      return { ...state, currentUser: user, loginError: null }
    }

    case 'LOGOUT':
      return { ...state, currentUser: null }

    case 'SET_COMPANY':
      return { ...state, selectedCompanyId: action.companyId }

    case 'ADD_COMPANY': {
      const company = {
        ...action.company,
        id: `C${String(state.companies.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString().slice(0, 10),
        status: 'active',
      }
      return { ...state, companies: [...state.companies, company] }
    }

    case 'UPDATE_COMPANY': {
      const companies = state.companies.map(c => c.id === action.company.id ? action.company : c)
      return { ...state, companies }
    }

    case 'CLEAR_LOGIN_ERROR':
      return { ...state, loginError: null }

    case 'ADD_EMPLOYEE': {
      const emp = { ...action.employee, id: `EMP${String(state.employees.length + 1).padStart(3, '0')}` }
      return { ...state, employees: [...state.employees, emp] }
    }

    case 'UPDATE_EMPLOYEE': {
      const employees = state.employees.map(e => e.id === action.employee.id ? action.employee : e)
      return { ...state, employees }
    }

    case 'SET_EMPLOYEE_PHOTO': {
      const employees = state.employees.map(e => e.id === action.id ? { ...e, photo: action.photo } : e)
      return { ...state, employees }
    }

    case 'ADD_EMPLOYEE_ATTACHMENT': {
      const employees = state.employees.map(e =>
        e.id === action.id ? { ...e, attachments: [...(e.attachments ?? []), action.attachment] } : e
      )
      return { ...state, employees }
    }

    case 'DELETE_EMPLOYEE_ATTACHMENT': {
      const employees = state.employees.map(e =>
        e.id === action.id ? { ...e, attachments: (e.attachments ?? []).filter(a => a.id !== action.attachmentId) } : e
      )
      return { ...state, employees }
    }

    case 'ADD_DEPARTMENT': {
      const dept = { id: `DEP${Date.now()}`, name: action.name.trim() }
      return { ...state, departments: [...state.departments, dept] }
    }
    case 'UPDATE_DEPARTMENT': {
      return { ...state, departments: state.departments.map(d => d.id === action.id ? { ...d, name: action.name.trim() } : d) }
    }
    case 'DELETE_DEPARTMENT': {
      return { ...state, departments: state.departments.filter(d => d.id !== action.id) }
    }

    case 'ADD_POSITION': {
      const pos = { id: `POS${Date.now()}`, name: action.name.trim() }
      return { ...state, positions: [...state.positions, pos] }
    }
    case 'UPDATE_POSITION': {
      return { ...state, positions: state.positions.map(p => p.id === action.id ? { ...p, name: action.name.trim() } : p) }
    }
    case 'DELETE_POSITION': {
      return { ...state, positions: state.positions.filter(p => p.id !== action.id) }
    }

    case 'ADD_LEAVE_TYPE': {
      const leaveType = { ...action.leaveType, id: `LT${Date.now()}` }
      return { ...state, leaveTypes: [...state.leaveTypes, leaveType] }
    }

    case 'UPDATE_LEAVE_TYPE': {
      const leaveTypes = state.leaveTypes.map(lt => lt.id === action.leaveType.id ? action.leaveType : lt)
      return { ...state, leaveTypes }
    }

    case 'DELETE_LEAVE_TYPE': {
      return { ...state, leaveTypes: state.leaveTypes.filter(lt => lt.id !== action.id) }
    }

    case 'ADD_LEAVE_REQUEST': {
      const request = { ...action.request, id: `LR${Date.now()}` }
      return { ...state, leaveRequests: [...state.leaveRequests, request] }
    }

    case 'REVIEW_LEAVE_REQUEST': {
      const leaveRequests = state.leaveRequests.map(r =>
        r.id === action.id
          ? { ...r, status: action.status, reviewedBy: action.reviewedBy, reviewedAt: new Date().toISOString(), remarks: action.remarks ?? '' }
          : r
      )
      return { ...state, leaveRequests }
    }

    case 'TOGGLE_EMPLOYEE_STATUS': {
      const employees = state.employees.map(e =>
        e.id === action.id ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' } : e
      )
      return { ...state, employees }
    }

    case 'UPSERT_ATTENDANCE': {
      const key = r => r.employeeId + '|' + r.date
      const incoming = action.records
      const incomingKeys = new Set(incoming.map(key))
      const filtered = state.attendance.filter(r => !incomingKeys.has(key(r)))
      return { ...state, attendance: [...filtered, ...incoming] }
    }

    case 'PAYROLL_LOADING':
      return { ...state, payrollLoading: action.value }

    case 'GENERATE_PAYROLL': {
      const { year, month, cutoff, coverageStart, coverageEnd, payrollDate, companyId } = action
      const yStr = String(year)
      const mStr = String(month).padStart(2, '0')
      const monthPrefix  = `${yStr}-${mStr}`
      const period       = `${monthPrefix}-${cutoff}`

      const isSemiMonthly = cutoff === 'A' || cutoff === 'B'
      const isWeekly      = typeof cutoff === 'string' && cutoff.startsWith('W')
      const allMonthDays  = getWorkingDays(year, month)

      // Use custom coverage range if provided; weekly uses 6-day range
      const periodDays = (coverageStart && coverageEnd)
        ? (isWeekly ? getWorkingDaysSixDayBetween(coverageStart, coverageEnd) : getWorkingDaysBetween(coverageStart, coverageEnd))
        : isSemiMonthly ? getWorkingDaysByCutoff(year, month, cutoff) : allMonthDays

      // For period B: get period A payroll to compute combined monthly tax correctly
      const periodAKey     = `${monthPrefix}-A`
      const periodAPayroll = state.payrolls.find(p =>
        p.period === periodAKey && p.companyId === (companyId ?? null)
      )
      const prevGrossById  = Object.fromEntries(
        (periodAPayroll?.items ?? []).map(i => [i.employeeId, i.grossPay])
      )

      const targetFrequency = isWeekly ? 'weekly' : isSemiMonthly ? 'semi-monthly' : 'monthly'

      const items = state.employees
        .filter(e =>
          e.status === 'active' &&
          e.payFrequency === targetFrequency &&
          (!companyId || e.companyId === companyId)
        )
        .map(emp => {
          const periodDaySet = new Set(periodDays)
          const records = state.attendance.filter(
            r => r.employeeId === emp.id && periodDaySet.has(r.date)
          )
          return computePayrollItem(emp, records, periodDays.length, {
            cutoff,
            firstHalfGross: prevGrossById[emp.id] ?? 0,
            totalMonthlyWorkingDays: allMonthDays.length,
          })
        })

      const payroll = {
        id: companyId ? `PAY-${companyId}-${period}` : `PAY-${period}`,
        period,
        companyId: companyId ?? null,
        year,
        month,
        cutoff,
        coverageStart: coverageStart ?? null,
        coverageEnd:   coverageEnd   ?? null,
        payrollDate:   payrollDate   ?? null,
        status: 'finalized',
        generatedAt: new Date().toISOString(),
        items,
      }
      const payrolls = [
        ...state.payrolls.filter(p => !(p.period === period && p.companyId === (companyId ?? null))),
        payroll,
      ]
      return { ...state, payrolls, payrollLoading: false }
    }

    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  useEffect(() => {
    const { payrollLoading, loginError, ...persist } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist))
  }, [state])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
