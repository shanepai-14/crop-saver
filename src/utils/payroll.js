// Philippine Payroll Computation — CSPC Internal HR System
// Salary types: 'monthly' | 'daily' | 'hourly'
// Pay frequency: 'monthly' | 'semi-monthly' (15th & 30th)
// Min wage (NCR/Region III): ₱525/day, ₱65.63/hr

export const PH_MIN_WAGE_DAILY  = 525
export const PH_MIN_WAGE_HOURLY = round2(525 / 8)   // 65.63

// Monthly equivalent — basis for government contribution brackets.
// DOLE standard: daily = rate × 26 days/month
function monthlyEquiv(employee) {
  if (employee.salaryType === 'monthly') return employee.basicSalary
  if (employee.salaryType === 'daily')   return employee.basicSalary * 26
  if (employee.salaryType === 'hourly')  return employee.basicSalary * 8 * 26
  return employee.basicSalary
}

// ─── SSS 2024 ─────────────────────────────────────────────
// EE: 4.5% of MSC  |  ER: 9.5% of MSC
// MSC brackets: ₱4,000 – ₱30,000 in ₱500 steps
function getMSC(monthlySalary) {
  if (monthlySalary < 4250) return 4000
  return Math.min(Math.floor((monthlySalary + 250) / 500) * 500, 30000)
}

export function computeSSS(monthlySalary) {
  return round2(getMSC(monthlySalary) * 0.045)
}
export function computeSSSER(monthlySalary) {
  return round2(getMSC(monthlySalary) * 0.095)
}

// ECC — employer only
// MSC ≤ ₱14,750 → ₱10 flat; MSC > ₱14,750 → 1% of MSC
export function computeECC(monthlySalary) {
  const msc = getMSC(monthlySalary)
  return msc <= 14750 ? 10 : round2(msc * 0.01)
}

// ─── PhilHealth 2024 ──────────────────────────────────────
// 5% total premium; EE = ER = 2.5% | Floor ₱10k | Ceiling ₱100k
export function computePhilHealth(monthlySalary) {
  const base = Math.min(Math.max(monthlySalary, 10000), 100000)
  return round2(base * 0.025)
}
export function computePhilHealthER(monthlySalary) {
  return computePhilHealth(monthlySalary)
}

// ─── Pag-IBIG ─────────────────────────────────────────────
// ≤ ₱1,500 → 1%; > ₱1,500 → 2% (EE & ER max ₱100 each)
export function computePagIbig(monthlySalary) {
  if (monthlySalary <= 1500) return round2(monthlySalary * 0.01)
  return Math.min(round2(monthlySalary * 0.02), 100)
}
export function computePagIbigER(monthlySalary) {
  return computePagIbig(monthlySalary)
}

// ─── Withholding Tax — TRAIN Law (monthly taxable) ────────
export function computeWithholdingTax(taxableMonthly) {
  if (taxableMonthly <= 20833) return 0
  if (taxableMonthly <= 33333) return round2((taxableMonthly - 20833) * 0.15)
  if (taxableMonthly <= 66667) return round2(1875 + (taxableMonthly - 33333) * 0.20)
  if (taxableMonthly <= 166667) return round2(8541.80 + (taxableMonthly - 66667) * 0.25)
  if (taxableMonthly <= 666667) return round2(33541.80 + (taxableMonthly - 166667) * 0.30)
  return round2(183541.80 + (taxableMonthly - 666667) * 0.35)
}

// ─── SIL Accrual (per pay period) ─────────────────────────
// DOLE: 5 days SIL/year for employees ≥ 1 year tenure
// Monthly accrual = (daily rate × 5) / 12
// Semi-monthly accrual = monthly / 2
export function computeSILAccrual(employee, cutoff = 'monthly') {
  let dr
  if (employee.salaryType === 'monthly')     dr = employee.basicSalary / 26
  else if (employee.salaryType === 'daily')  dr = employee.basicSalary
  else                                       dr = employee.basicSalary * 8
  const monthly = round2((dr * 5) / 12)
  return cutoff === 'monthly' ? monthly : round2(monthly / 2)
}

// ─── 13th Month Accrual (per pay period) ──────────────────
export function compute13thMonthAccrual(basicPay, cutoff = 'monthly') {
  // Monthly: 1/12 of basicPay; semi-monthly periods already receive basicPay/2
  return round2(basicPay / 12)
}

// ─── Working Days ──────────────────────────────────────────
// Returns all weekdays for the month
export function getWorkingDays(year, month) {
  const days = []
  const d = new Date(year, month - 1, 1)
  while (d.getMonth() === month - 1) {
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return days
}

// cutoff: 'A' = 1st–15th  |  'B' = 16th–end of month
export function getWorkingDaysByCutoff(year, month, cutoff) {
  const all = getWorkingDays(year, month)
  if (cutoff === 'A') return all.filter(d => parseInt(d.slice(8), 10) <= 15)
  if (cutoff === 'B') return all.filter(d => parseInt(d.slice(8), 10) > 15)
  return all
}

// Returns all weekdays between two ISO date strings (inclusive)
export function getWorkingDaysBetween(startDate, endDate) {
  const days = []
  const d = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  while (d <= end) {
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return days
}

// Mon–Sat (6-day) for a full month
export function getWorkingDaysSixDay(year, month) {
  const days = []
  const d = new Date(year, month - 1, 1)
  while (d.getMonth() === month - 1) {
    if (d.getDay() !== 0) days.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return days
}

// Mon–Sat between two ISO date strings (inclusive) — for weekly coverage
export function getWorkingDaysSixDayBetween(startDate, endDate) {
  const days = []
  const d = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  while (d <= end) {
    if (d.getDay() !== 0) days.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return days
}

// Human-readable period label
export function periodLabel(year, month, cutoff) {
  const monthName = new Date(year, month - 1, 1)
    .toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
  if (!cutoff || cutoff === 'monthly') return monthName
  const lastDay = new Date(year, month, 0).getDate()
  return cutoff === 'A'
    ? `${monthName} — 1st half (1–15)`
    : `${monthName} — 2nd half (16–${lastDay})`
}

// ─── Core Payroll Computation ─────────────────────────────
// options: {
//   cutoff: 'monthly' | 'A' | 'B'
//   firstHalfGross: number   (Period A gross — needed for accurate tax on Period B)
//   totalMonthlyWorkingDays: number  (full month count, for monthly-employee daily rate)
// }
export function computePayrollItem(employee, attendanceRecords, workingDays, options = {}) {
  const { cutoff = 'monthly', firstHalfGross = 0, totalMonthlyWorkingDays } = options
  const isSemiMonthly = cutoff === 'A' || cutoff === 'B'
  const isWeekly      = typeof cutoff === 'string' && cutoff.startsWith('W')

  const isMonthly = employee.salaryType === 'monthly'
  const isDaily   = employee.salaryType === 'daily'
  const isHourly  = employee.salaryType === 'hourly'

  // For deduction rate on monthly employees, use the full-month working days
  const fullMonthDays = totalMonthlyWorkingDays ?? workingDays
  const dailyRateEq = isMonthly
    ? employee.basicSalary / fullMonthDays
    : isDaily
      ? employee.basicSalary
      : employee.basicSalary * 8

  let daysPresent = 0, daysAbsent = 0, daysLate = 0
  let totalLateMinutes = 0, totalUndertimeMinutes = 0, totalHoursWorked = 0, totalOTHours = 0

  attendanceRecords.forEach(rec => {
    if (rec.status === 'absent') {
      daysAbsent++
    } else {
      daysPresent++
      if (rec.status === 'late') {
        daysLate++
        totalLateMinutes += rec.lateMinutes || 0
      }
      totalUndertimeMinutes += rec.undertimeMinutes || 0
      totalHoursWorked += rec.hoursWorked ?? 8
      totalOTHours += rec.otHours || 0
    }
  })

  // ── Basic pay per period ─────────────────────────────────
  let basicPay, absenceDeduction, lateDeduction, undertimeDeduction, otPay

  if (isMonthly) {
    const periodBase = isSemiMonthly ? employee.basicSalary / 2 : employee.basicSalary
    absenceDeduction   = round2(daysAbsent * dailyRateEq)
    lateDeduction      = round2((totalLateMinutes / 480) * dailyRateEq)
    undertimeDeduction = round2((totalUndertimeMinutes / 480) * dailyRateEq)
    basicPay = periodBase
    otPay    = 0
  } else if (isDaily) {
    absenceDeduction   = 0
    lateDeduction      = round2((totalLateMinutes / 480) * dailyRateEq)
    undertimeDeduction = round2((totalUndertimeMinutes / 480) * dailyRateEq)
    basicPay = round2(daysPresent * employee.basicSalary)
    otPay    = round2((dailyRateEq / 8) * 1.25 * totalOTHours)
  } else {
    absenceDeduction   = 0
    lateDeduction      = 0
    undertimeDeduction = 0
    basicPay = round2(totalHoursWorked * employee.basicSalary)
    otPay    = round2(employee.basicSalary * 1.25 * totalOTHours)
  }

  const grossPay = round2(basicPay + otPay - lateDeduction - undertimeDeduction)

  // ── Government contributions ─────────────────────────────
  // Semi-monthly: deduct on Period B only.
  // Weekly: deduct on last week of the month (W4 or W5); earlier weeks are gross only.
  const applyGovDeductions = isWeekly ? (cutoff === 'W4' || cutoff === 'W5') : cutoff !== 'A'
  const mEquiv = monthlyEquiv(employee)

  let sss = 0, philhealth = 0, pagibig = 0, tax = 0
  let sssER = 0, phER = 0, piER = 0, ecc = 0

  if (applyGovDeductions) {
    sss       = computeSSS(mEquiv)
    philhealth = computePhilHealth(mEquiv)
    pagibig   = computePagIbig(mEquiv)
    sssER     = computeSSSER(mEquiv)
    phER      = computePhilHealthER(mEquiv)
    piER      = computePagIbigER(mEquiv)
    ecc       = computeECC(mEquiv)

    // Withholding tax: use COMBINED monthly gross (A + B) for BIR-compliant computation
    const monthlyGross  = isSemiMonthly ? round2(firstHalfGross + grossPay) : grossPay
    const taxableBase   = Math.max(monthlyGross - sss - philhealth - pagibig, 0)
    tax = computeWithholdingTax(taxableBase)
  }

  // ── Other deductions ─────────────────────────────────────
  const savings         = round2(employee.savings || 0)
  const insurance       = round2(employee.insurance || 0)
  const bankCharges     = round2(employee.bankCharges || 0)
  const otherDeductions = round2(savings + insurance + bankCharges)

  // ── Employer accruals ────────────────────────────────────
  const silAccrual        = computeSILAccrual(employee, cutoff)
  const thirteenthAccrual = compute13thMonthAccrual(basicPay, cutoff)

  // ── Totals ───────────────────────────────────────────────
  const totalAttDeductions = round2(absenceDeduction + lateDeduction + undertimeDeduction)
  const totalGovDeductions = round2(sss + philhealth + pagibig + tax)
  const netPay             = round2(grossPay - totalGovDeductions - otherDeductions)
  const totalEmployerCost  = round2(grossPay + sssER + phER + piER + ecc + silAccrual + thirteenthAccrual)

  return {
    employeeId: employee.id,
    basicPay,
    otPay,
    daysPresent,
    daysAbsent,
    daysLate,
    totalLateMinutes,
    totalUndertimeMinutes,
    totalHoursWorked,
    totalOTHours,
    dailyRate: round2(dailyRateEq),
    absenceDeduction,
    lateDeduction,
    undertimeDeduction,
    totalAttDeductions,
    grossPay,
    sss,
    philhealth,
    pagibig,
    tax,
    totalGovDeductions,
    savings,
    insurance,
    bankCharges,
    otherDeductions,
    netPay,
    sssER,
    philhealthER: phER,
    pagibigER: piER,
    ecc,
    silAccrual,
    thirteenthAccrual,
    totalEmployerCost,
  }
}

// ─── Helpers ──────────────────────────────────────────────
function round2(n) { return Math.round(n * 100) / 100 }

export function formatPHP(amount) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount ?? 0)
}

export function formatDate(str) {
  if (!str) return '—'
  return new Date(str.length === 10 ? str + 'T00:00:00' : str)
    .toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function fmtTime(t) {
  if (!t) return '—'
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function monthLabel(year, month) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
}
