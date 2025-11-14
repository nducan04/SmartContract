import React from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'

const DashboardLayout = () => {
  return (
    <div className='flex'>

      <Sidebar />
      <main className='grow p-8 bg-white'>
        <Outlet />
      </main>

    </div>
  )
}

export default DashboardLayout