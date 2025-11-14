import React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom';
import { assets, ownerMenuLinks } from './../assets/assets';

const Sidebar = () => {

  const location = useLocation()

  return (
    <div className='w-64 min-h-screen bg-gray-50 border-r border-gray-200 p-4'>
        
      <div className='mb-8'>
        <Link to="/">
          <img src={assets.blockchainLogo} alt="Logo" className='h-8'/>
        </Link>
      </div>

      <nav className='flex flex-col space-y-2'>
        {ownerMenuLinks.map((link) => (
          <NavLink key={link.name} to={link.path} end={link.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-all
              ${isActive 
                ? 'bg-blue-100 text-blue-700 font-semibold' 
                : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <img 
              src={location.pathname.startsWith(link.path) ? link.coloredIcon : link.icon} 
              alt={link.name}
              className="w-5 h-5"
            />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  )
}

export default Sidebar