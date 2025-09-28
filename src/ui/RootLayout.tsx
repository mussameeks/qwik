import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import DateFilter from './components/DateFilter'
import Footer from './components/Footer'
import { useState } from 'react'
import dayjs from 'dayjs'
import { AuthProvider } from '../auth/AuthProvider'

export default function RootLayout(){
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf('day'))
  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <div className="header-spacer" />
        <DateFilter value={selectedDate} onChange={setSelectedDate} />
        <main className="main" style={{padding:'16px 0'}}>
          <Outlet context={{ selectedDate }} />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
