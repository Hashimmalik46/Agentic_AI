import Home from "./pages/Home"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import Profile from "./pages/Profile"
import Dashboard from "./pages/Dashboard"
import { Routes, Route } from "react-router-dom";



const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/" element={<Login />} /> */}
      {/* <Route path="/signup" element={<SignUp />} /> */}
      <Route path="/profile" element={<Profile/>} />
      <Route path="/dashboard" element={<Dashboard />} />     
    </Routes>
  )
}

export default App
