import { useAuth } from '@/context/AuthContext'
import React from 'react'

const Home = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  }

  return (
    <div>
      Home
      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}

export default Home