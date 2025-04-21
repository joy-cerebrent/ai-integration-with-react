import { Route, Routes } from 'react-router-dom'
import Home from '@/pages/(root)/Home'
import Chat from '@/pages/(root)/Chat'
import Login from '@/pages/(auth)/Login'
import Register from '@/pages/(auth)/Register'
import AuthLayout from '@/layouts/AuthLayout'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat/:id" element={<Chat />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
    </Routes>
  )
}

export default App