import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import SystemLayout from './components/system/SystemLayout'
import Home from './pages/Home'
import About from './pages/About'
import Agrochemicals from './pages/Agrochemicals'
import Manpower from './pages/Manpower'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import Login from './pages/system/Login'
import Dashboard from './pages/system/Dashboard'
import Companies from './pages/system/Companies'
import Employees from './pages/system/Employees'
import EmployeeDetail from './pages/system/EmployeeDetail'
import Attendance from './pages/system/Attendance'
import Payroll from './pages/system/Payroll'
import Reports from './pages/system/Reports'
import LeaveTypes from './pages/system/LeaveTypes'
import LeaveRequests from './pages/system/LeaveRequests'
import MobileDemo from './pages/system/MobileDemo'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* HR System — must come before the Layout catch-all */}
          <Route path="/login" element={<Login />} />
          <Route element={<SystemLayout />}>
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/companies"  element={<Companies />} />
            <Route path="/employees"     element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/payroll"    element={<Payroll />} />
            <Route path="/reports"         element={<Reports />} />
            <Route path="/leave-requests"  element={<LeaveRequests />} />
            <Route path="/leave-types"     element={<LeaveTypes />} />
            <Route path="/mobile-demo"     element={<MobileDemo />} />
          </Route>

          {/* Marketing site */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="agrochemicals" element={<Agrochemicals />} />
            <Route path="manpower" element={<Manpower />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* 404 — top-level catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
