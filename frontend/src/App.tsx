import { Route, Routes } from 'react-router-dom'
import Home from '@/pages/(root)/Home'
import Chat from '@/pages/(root)/Chat'
import Login from '@/pages/(auth)/Login'
import Register from '@/pages/(auth)/Register'
import AuthLayout from '@/layouts/AuthLayout'
import RootLayout from '@/layouts/RootLayout'

const App = () => {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:id" element={<Chat />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
    </Routes>
  )
}

export default App