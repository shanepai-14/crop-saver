import { computePayrollItem, getWorkingDays, getWorkingDaysByCutoff, getWorkingDaysBetween, getWorkingDaysSixDay } from '../utils/payroll'

// â”€â”€â”€ Companies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const INITIAL_COMPANIES = [
  {
    id: 'C001', name: 'Mindanao Agri Holdings', shortName: 'MAH',
    industry: 'Agriculture', contactPerson: 'Victor Uy',
    phone: '09181234001', email: 'payroll@mah.com.ph',
    address: 'Davao City, Davao del Sur', status: 'active', createdAt: '2023-01-15',
  },
  {
    id: 'C002', name: 'Davao Fresh Farms Inc.', shortName: 'DFF',
    industry: 'Fresh Produce', contactPerson: 'Lenie Soriano',
    phone: '09181234002', email: 'hr@davaofreshfarms.com.ph',
    address: 'Davao del Norte', status: 'active', createdAt: '2023-06-01',
  },
  {
    id: 'C003', name: 'Santos Banana Corp.', shortName: 'SBC',
    industry: 'Banana Production', contactPerson: 'Roberto Santos',
    phone: '09181234003', email: 'admin@santosbanana.com',
    address: 'Tagum City, Davao del Norte', status: 'active', createdAt: '2024-03-10',
  },
]

// â”€â”€â”€ Employees â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// salaryType:   'monthly' | 'daily' | 'hourly'
// payFrequency: 'monthly' (paid once, end of month)
//             | 'semi-monthly' (paid 15th and 30th)
export const INITIAL_EMPLOYEES = [
  // â”€â”€ Monthly payroll â€” 3 senior executives only â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'EMP001', companyId: 'C001',
    firstName: 'Marco', lastName: 'Villanueva',
    position: 'Chief Executive Officer', department: 'Executive',
    salaryType: 'monthly', basicSalary: 65000, payFrequency: 'monthly',
    email: 'marco.villanueva@cspc.com.ph', phone: '09171234001',
    hireDate: '2018-03-01', status: 'active',
    sssNo: '03-4567890-1', philhealthNo: '19-345678901-2',
    pagibigNo: '1234-5678-9012', tinNo: '123-456-789-000',
    savings: 0, insurance: 0, bankCharges: 0,
  },
  {
    id: 'EMP002', companyId: 'C001',
    firstName: 'Ana', lastName: 'Reyes',
    position: 'Chief Agronomist', department: 'Agronomy',
    salaryType: 'monthly', basicSalary: 55000, payFrequency: 'monthly',
    email: 'ana.reyes@cspc.com.ph', phone: '09171234002',
    hireDate: '2018-06-15', status: 'active',
    sssNo: '03-4567890-2', philhealthNo: '19-345678901-3',
    pagibigNo: '1234-5678-9013', tinNo: '123-456-789-001',
    savings: 0, insurance: 0, bankCharges: 0,
  },
  {
    id: 'EMP003', companyId: 'C001',
    firstName: 'Benjamin', lastName: 'Santos',
    position: 'Head of Sales', department: 'Sales',
    salaryType: 'monthly', basicSalary: 48000, payFrequency: 'monthly',
    email: 'benjamin.santos@cspc.com.ph', phone: '09171234003',
    hireDate: '2019-01-10', status: 'active',
    sssNo: '03-4567890-3', philhealthNo: '19-345678901-4',
    pagibigNo: '1234-5678-9014', tinNo: '123-456-789-002',
    savings: 0, insurance: 0, bankCharges: 0,
  },

  // â”€â”€ Semi-monthly payroll â€” all others â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'EMP004', companyId: 'C001',
    firstName: 'Carla', lastName: 'Mendoza',
    position: 'Manpower Division Manager', department: 'Manpower',
    salaryType: 'monthly', basicSalary: 45000, payFrequency: 'semi-monthly',
    email: 'carla.mendoza@cspc.com.ph', phone: '09171234004',
    hireDate: '2019-04-01', status: 'active',
    sssNo: '03-4567890-4', philhealthNo: '19-345678901-5',
    pagibigNo: '1234-5678-9015', tinNo: '123-456-789-003',
    savings: 0, insurance: 0, bankCharges: 0,
  },
  {
    id: 'EMP005', companyId: 'C001',
    firstName: 'Rico', lastName: 'delos Santos',
    position: 'Field Supervisor', department: 'Operations',
    salaryType: 'monthly', basicSalary: 38000, payFrequency: 'semi-monthly',
    email: 'rico.delossantos@cspc.com.ph', phone: '09171234005',
    hireDate: '2019-08-20', status: 'active',
    sssNo: '03-4567890-5', philhealthNo: '19-345678901-6',
    pagibigNo: '1234-5678-9016', tinNo: '123-456-789-004',
    savings: 0, insurance: 0, bankCharges: 0,
  },
  // â”€â”€ C002 Davao Fresh Farms â€” daily wage field workers â”€â”€â”€â”€
  {
    id: 'EMP006', companyId: 'C002',
    firstName: 'Ramon', lastName: 'Dagdag',
    position: 'Harvest Worker', department: 'Operations',
    salaryType: 'daily', basicSalary: 550, payFrequency: 'semi-monthly',
    email: '', phone: '09201235001',
    hireDate: '2022-01-10', status: 'active',
    sssNo: '03-4567890-6', philhealthNo: '19-345678901-7',
    pagibigNo: '1234-5678-9017', tinNo: '',
    savings: 75, insurance: 0, bankCharges: 18,
  },
  {
    id: 'EMP007', companyId: 'C002',
    firstName: 'Nenita', lastName: 'Flores',
    position: 'Packer', department: 'Operations',
    salaryType: 'daily', basicSalary: 550, payFrequency: 'semi-monthly',
    email: '', phone: '09201235002',
    hireDate: '2022-03-15', status: 'active',
    sssNo: '03-4567890-7', philhealthNo: '19-345678901-8',
    pagibigNo: '1234-5678-9018', tinNo: '',
    savings: 75, insurance: 0, bankCharges: 18,
  },
  {
    id: 'EMP008', companyId: 'C002',
    firstName: 'Danilo', lastName: 'IbaÃ±ez',
    position: 'Farm Hand', department: 'Operations',
    salaryType: 'daily', basicSalary: 525, payFrequency: 'semi-monthly',
    email: '', phone: '09201235003',
    hireDate: '2022-06-01', status: 'active',
    sssNo: '03-4567890-8', philhealthNo: '19-345678901-9',
    pagibigNo: '1234-5678-9019', tinNo: '',
    savings: 0, insurance: 0, bankCharges: 18,
  },
  {
    id: 'EMP009', companyId: 'C002',
    firstName: 'Lourdes', lastName: 'Macaraeg',
    position: 'Quality Checker', department: 'Operations',
    salaryType: 'daily', basicSalary: 575, payFrequency: 'semi-monthly',
    email: '', phone: '09201235004',
    hireDate: '2023-02-14', status: 'active',
    sssNo: '03-4567890-9', philhealthNo: '19-345678901-0',
    pagibigNo: '1234-5678-9020', tinNo: '',
    savings: 75, insurance: 12.5, bankCharges: 18,
  },
  {
    id: 'EMP010', companyId: 'C002',
    firstName: 'Arnel', lastName: 'Tacas',
    position: 'Loader', department: 'Operations',
    salaryType: 'daily', basicSalary: 550, payFrequency: 'semi-monthly',
    email: '', phone: '09201235005',
    hireDate: '2023-05-10', status: 'active',
    sssNo: '03-4567890-0', philhealthNo: '19-345678902-1',
    pagibigNo: '1234-5678-9021', tinNo: '',
    savings: 0, insurance: 0, bankCharges: 18,
  },
  {
    id: 'EMP011', companyId: 'C002',
    firstName: 'Elvie', lastName: 'Panes',
    position: 'Farm Hand', department: 'Operations',
    salaryType: 'daily', basicSalary: 525, payFrequency: 'semi-monthly',
    email: '', phone: '09201235006',
    hireDate: '2024-01-20', status: 'active',
    sssNo: '03-4567891-1', philhealthNo: '19-345678902-2',
    pagibigNo: '1234-5678-9022', tinNo: '',
    savings: 0, insurance: 0, bankCharges: 18,
  },
  {
    id: 'EMP018', companyId: 'C002',
    firstName: 'Jonard', lastName: 'Sularte',
    position: 'Irrigation Worker', department: 'Operations',
    salaryType: 'daily', basicSalary: 550, payFrequency: 'semi-monthly',
    email: '', phone: '09201235007',
    hireDate: '2024-03-05', status: 'active',
    sssNo: '03-4567892-1', philhealthNo: '19-345678903-1',
    pagibigNo: '1234-5678-9029', tinNo: '',
    savings: 75, insurance: 0, bankCharges: 18,
  },
  {
    id: 'EMP019', companyId: 'C002',
    firstName: 'Marianne', lastName: 'Abalos',
    position: 'Harvest Worker', department: 'Operations',
    salaryType: 'daily', basicSalary: 550, payFrequency: 'semi-monthly',
    email: '', phone: '09201235008',
    hireDate: '2024-07-12', status: 'active',
    sssNo: '03-4567892-2', philhealthNo: '19-345678903-2',
    pagibigNo: '1234-5678-9030', tinNo: '',
    savings: 0, insurance: 0, bankCharges: 18,
  },

  // â”€â”€ C003 Santos Banana Corp. â€” daily wage field workers â”€â”€
  {
    id: 'EMP012', companyId: 'C003',
    firstName: 'Ronaldo', lastName: 'Nunal',
    position: 'Banana Harvester', department: 'Operations',
    salaryType: 'daily', basicSalary: 550, payFrequency: 'semi-monthly',
    email: '', phone: '09201234001',
    hireDate: '2023-01-10', status: 'active',
    sssNo: '03-4567891-2', philhealthNo: '19-345678902-3',
    pagibigNo: '1234-5678-9023', tinNo: '',
    savings: 75, insurance: 12.5, bankCharges: 18,
  },
  {
    id: 'EMP013', companyId: 'C003',
    firstName: 'Jutey', lastName: 'Alsado',
    position: 'Field Worker', department: 'Operations',
    salaryType: 'daily', basicSalary: 525, payFrequency: 'semi-monthly',
    email: '', phone: '09201234002',
    hireDate: '2023-03-01', status: 'active',
    sssNo: '03-4567891-3', philhealthNo: '19-345678902-4',
    pagibigNo: '1234-5678-9024', tinNo: '',
    savings: 75, insurance: 12.5, bankCharges: 18,
  },
  {
    id: 'EMP014', companyId: 'C003',
    firstName: 'Alfredo', lastName: 'Adolfo',
    position: 'Farm Technician', department: 'Operations',
    salaryType: 'daily', basicSalary: 580, payFrequency: 'semi-monthly',
    email: '', phone: '09201234003',
    hireDate: '2022-11-15', status: 'active',
    sssNo: '03-4567891-4', philhealthNo: '19-345678902-5',
    pagibigNo: '1234-5678-9025', tinNo: '',
    savings: 75, insurance: 12.5, bankCharges: 18,
  },
  {
    id: 'EMP015', companyId: 'C003',
    firstName: 'Maricel', lastName: 'Bautista',
    position: 'Field Worker', department: 'Operations',
    salaryType: 'daily', basicSalary: 525, payFrequency: 'semi-monthly',
    email: '', phone: '09201234004',
    hireDate: '2024-01-08', status: 'active',
    sssNo: '03-4567891-5', philhealthNo: '19-345678902-6',
    pagibigNo: '1234-5678-9026', tinNo: '',
    savings: 0, insurance: 0, bankCharges: 18,
  },
  {
    id: 'EMP016', companyId: 'C003',
    firstName: 'Joel', lastName: 'Manalo',
    position: 'Pesticide Applicator', department: 'Operations',
    salaryType: 'daily', basicSalary: 550, payFrequency: 'semi-monthly',
    email: '', phone: '09201234005',
    hireDate: '2023-08-05', status: 'active',
    sssNo: '03-4567891-6', philhealthNo: '19-345678902-7',
    pagibigNo: '1234-5678-9027', tinNo: '',
    savings: 75, insurance: 0, bankCharges: 18,
  },
  {
    id: 'EMP017', companyId: 'C003',
    firstName: 'Nena', lastName: 'Soriano',
    position: 'Field Worker', department: 'Operations',
    salaryType: 'daily', basicSalary: 525, payFrequency: 'semi-monthly',
    email: '', phone: '09201234006',
    hireDate: '2023-10-10', status: 'active',
    sssNo: '03-4567891-7', philhealthNo: '19-345678902-8',
    pagibigNo: '1234-5678-9028', tinNo: '',
    savings: 0, insurance: 0, bankCharges: 18,
  },
  {
    id: 'EMP020', companyId: 'C003',
    firstName: 'Renato', lastName: 'Cabatingan',
    position: 'Banana Harvester', department: 'Operations',
    salaryType: 'daily', basicSalary: 550, payFrequency: 'semi-monthly',
    email: '', phone: '09201234007',
    hireDate: '2024-02-19', status: 'active',
    sssNo: '03-4567892-3', philhealthNo: '19-345678903-3',
    pagibigNo: '1234-5678-9031', tinNo: '',
    savings: 0, insurance: 0, bankCharges: 18,
  },
  {
    id: 'EMP021', companyId: 'C003',
    firstName: 'Glenda', lastName: 'CaÃ±ete',
    position: 'Packer', department: 'Operations',
    salaryType: 'daily', basicSalary: 525, payFrequency: 'semi-monthly',
    email: '', phone: '09201234008',
    hireDate: '2024-05-03', status: 'active',
    sssNo: '03-4567892-4', philhealthNo: '19-345678903-4',
    pagibigNo: '1234-5678-9032', tinNo: '',
    savings: 75, insurance: 0, bankCharges: 18,
  },
]

// â”€â”€â”€ Deterministic Attendance Generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0
  }
  return Math.abs(h)
}

const LATE_MINUTES_TABLE = [5, 8, 10, 12, 15, 20, 25, 30]
const HOURS_TABLE = [8, 8, 8, 8, 8, 8, 6, 4]
const OT_HOURS_TABLE = [0, 0, 0, 0, 0, 1, 1, 2] // most days no OT; occasional 1-2h

function generateAttendanceRecord(employee, date) {
  const seed = hash(employee.id + date)
  const roll = seed % 100
  const isHourly = employee.salaryType === 'hourly'
  const isDaily  = employee.salaryType === 'daily'

  const absentThreshold = (isDaily || isHourly) ? 10 : 5

  if (roll < absentThreshold) {
    return {
      employeeId: employee.id, date, status: 'absent',
      timeIn: null, timeOut: null,
      lateMinutes: 0, undertimeMinutes: 0, hoursWorked: 0, otHours: 0,
    }
  }

  if (isHourly) {
    const hours = HOURS_TABLE[seed % HOURS_TABLE.length]
    const timeOutH = 8 + hours
    return {
      employeeId: employee.id, date, status: 'present',
      timeIn: '08:00',
      timeOut: `${String(timeOutH).padStart(2, '0')}:00`,
      lateMinutes: 0, undertimeMinutes: 0, hoursWorked: hours, otHours: 0,
    }
  }

  // OT only for daily workers (~25% chance on present days)
  const otHours = isDaily ? OT_HOURS_TABLE[(seed >> 2) % OT_HOURS_TABLE.length] : 0

  if (roll < absentThreshold + 12) {
    const lateMin = LATE_MINUTES_TABLE[seed % LATE_MINUTES_TABLE.length]
    const undertime = (seed >> 4) % 20
    return {
      employeeId: employee.id, date, status: 'late',
      timeIn: `08:${String(lateMin).padStart(2, '0')}`,
      timeOut: `17:${String(undertime).padStart(2, '0')}`,
      lateMinutes: lateMin, undertimeMinutes: undertime, hoursWorked: 8, otHours: 0,
    }
  }

  const timeOutH = otHours > 0 ? 17 + otHours : 17
  return {
    employeeId: employee.id, date, status: 'present',
    timeIn: '08:00', timeOut: `${String(timeOutH).padStart(2, '0')}:00`,
    lateMinutes: 0, undertimeMinutes: 0, hoursWorked: 8, otHours,
  }
}

function generateAttendance(employees, year, month, cutoffDate = null) {
  const fiveDayDays = getWorkingDays(year, month)
  const sixDayDays  = getWorkingDaysSixDay(year, month)
  const records = []
  for (const emp of employees) {
    const workingDays = emp.payFrequency === 'weekly' ? sixDayDays : fiveDayDays
    for (const date of workingDays) {
      if (cutoffDate && date > cutoffDate) break
      records.push(generateAttendanceRecord(emp, date))
    }
  }
  return records
}

const apr2026Records = generateAttendance(INITIAL_EMPLOYEES, 2026, 4)
const may2026Records = generateAttendance(INITIAL_EMPLOYEES, 2026, 5, '2026-05-07')

export const INITIAL_ATTENDANCE = [...apr2026Records, ...may2026Records]

// â”€â”€â”€ Semi-monthly Payroll Builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// cutoff: 'A' = 1stâ€“15th (no gov deductions)
//         'B' = 16thâ€“end (full gov deductions, tax on combined gross)
// Only processes employees with payFrequency === 'semi-monthly'
function buildSemiMonthlyPayroll(employees, attendanceAll, year, month, cutoff, prevItems = [], companyId = null) {
  const yStr = String(year)
  const mStr = String(month).padStart(2, '0')
  const period = `${yStr}-${mStr}-${cutoff}`
  const monthPrefix = `${yStr}-${mStr}`

  const allMonthDays = getWorkingDays(year, month)
  const periodDays   = getWorkingDaysByCutoff(year, month, cutoff)

  const prevGrossById = Object.fromEntries((prevItems ?? []).map(i => [i.employeeId, i.grossPay]))

  const items = employees
    .filter(e => e.payFrequency === 'semi-monthly' && (!companyId || e.companyId === companyId))
    .map(emp => {
      const records = attendanceAll.filter(r =>
        r.employeeId === emp.id &&
        r.date.startsWith(monthPrefix) &&
        periodDays.includes(r.date)
      )
      return computePayrollItem(emp, records, periodDays.length, {
        cutoff,
        firstHalfGross: prevGrossById[emp.id] ?? 0,
        totalMonthlyWorkingDays: allMonthDays.length,
      })
    })

  const genDay = cutoff === 'A' ? '15' : String(new Date(year, month, 0).getDate())
  return {
    id: companyId ? `PAY-${companyId}-${period}` : `PAY-${period}`,
    period,
    companyId,
    year,
    month,
    cutoff,
    status: 'finalized',
    generatedAt: `${yStr}-${mStr}-${genDay}T18:00:00`,
    items,
  }
}

// â”€â”€â”€ Monthly (EOM) Payroll Builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Full-month payroll for employees with payFrequency === 'monthly'
function buildMonthlyPayroll(employees, attendanceAll, year, month, companyId = null) {
  const yStr = String(year)
  const mStr = String(month).padStart(2, '0')
  const period = `${yStr}-${mStr}-monthly`
  const monthPrefix = `${yStr}-${mStr}`

  const allMonthDays = getWorkingDays(year, month)

  const items = employees
    .filter(e => e.payFrequency === 'monthly' && (!companyId || e.companyId === companyId))
    .map(emp => {
      const records = attendanceAll.filter(r =>
        r.employeeId === emp.id && r.date.startsWith(monthPrefix)
      )
      return computePayrollItem(emp, records, allMonthDays.length, {
        cutoff: 'monthly',
        totalMonthlyWorkingDays: allMonthDays.length,
      })
    })

  const lastDay = new Date(year, month, 0).getDate()
  return {
    id: companyId ? `PAY-${companyId}-${period}` : `PAY-${period}`,
    period,
    companyId,
    year,
    month,
    cutoff: 'monthly',
    status: 'finalized',
    generatedAt: `${yStr}-${mStr}-${String(lastDay)}T18:00:00`,
    items,
  }
}

// April 2026 â€” per-company payrolls, all finalized
const aprA_C001       = buildSemiMonthlyPayroll(INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, 2026, 4, 'A', [], 'C001')
const aprB_C001       = buildSemiMonthlyPayroll(INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, 2026, 4, 'B', aprA_C001.items, 'C001')
const aprMonthly_C001 = buildMonthlyPayroll(INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, 2026, 4, 'C001')

const aprA_C002 = buildSemiMonthlyPayroll(INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, 2026, 4, 'A', [], 'C002')
const aprB_C002 = buildSemiMonthlyPayroll(INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, 2026, 4, 'B', aprA_C002.items, 'C002')

const aprA_C003 = buildSemiMonthlyPayroll(INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, 2026, 4, 'A', [], 'C003')
const aprB_C003 = buildSemiMonthlyPayroll(INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, 2026, 4, 'B', aprA_C003.items, 'C003')

export const INITIAL_PAYROLLS = [
  aprA_C001, aprB_C001, aprMonthly_C001,
  aprA_C002, aprB_C002,
  aprA_C003, aprB_C003,
]

export const INITIAL_DEPARTMENTS = [
  { id: 'DEP001', name: 'Executive' },
  { id: 'DEP002', name: 'Agronomy' },
  { id: 'DEP003', name: 'Sales' },
  { id: 'DEP004', name: 'Manpower' },
  { id: 'DEP005', name: 'Operations' },
  { id: 'DEP006', name: 'Human Resources' },
  { id: 'DEP007', name: 'Finance' },
  { id: 'DEP008', name: 'Administration' },
]

export const INITIAL_POSITIONS = [
  { id: 'POS001', name: 'Chief Executive Officer' },
  { id: 'POS002', name: 'Chief Agronomist' },
  { id: 'POS003', name: 'Head of Sales' },
  { id: 'POS004', name: 'Manpower Division Manager' },
  { id: 'POS005', name: 'Field Supervisor' },
  { id: 'POS006', name: 'Harvest Worker' },
  { id: 'POS007', name: 'Packer' },
  { id: 'POS008', name: 'Farm Hand' },
  { id: 'POS009', name: 'Quality Checker' },
  { id: 'POS010', name: 'Loader' },
  { id: 'POS011', name: 'Irrigation Worker' },
  { id: 'POS012', name: 'Banana Harvester' },
  { id: 'POS013', name: 'Field Worker' },
  { id: 'POS014', name: 'Farm Technician' },
  { id: 'POS015', name: 'Pesticide Applicator' },
]
