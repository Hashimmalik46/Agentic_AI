import Home from "./pages/Home"
import Profile from "./pages/Profile"
import Dashboard from "./pages/Dashboard"
import { Routes, Route } from "react-router-dom";



const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile/>} />
      <Route path="/dashboard" element={<Dashboard />} />
      
    </Routes>
  )
}

export default App
