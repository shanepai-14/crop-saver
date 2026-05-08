import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppCTA from './WhatsAppCTA'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-[68px]">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppCTA />
    </div>
  )
}
